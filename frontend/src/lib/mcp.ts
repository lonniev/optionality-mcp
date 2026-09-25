/**
 * Optionality's own tools, called through @tollbooth-dpyc/web.
 *
 * The client core is the package's: the one MCP connection, the npub/proof
 * envelope (a fresh kind-27235 inline proof when this tab holds a session key,
 * else the cached DM proof), the proof-bounce signal, identity storage and the
 * standard tools (balance, top-up, payment, statement, profile, sign-in). What
 * stays here is Optionality's alone:
 *
 *   - claim-check polling for the slow LLM tools (deal, tip, judge);
 *   - the domain tools — journal, leaderboard, sharing, usage, the patron
 *     profile mirror, nsec escrow and operator-signed DMs, coupons;
 *   - `checkPrice` with `tool_kwargs`, because a deal's fare depends on its
 *     mode and difficulty and the package's `checkPrice(toolId)` sends none;
 *   - the wider result shapes this operator returns for the standard tools.
 */

import {
  callTool,
  debugPush,
  type CheckBalanceResult,
  type ServiceStatus,
} from "@tollbooth-dpyc/web";

import {
  ClaimCheckError,
  claimTerminalOutcome,
  type ClaimCheckStart,
  type ClaimFetch,
} from "./claimCheck";
export { ClaimCheckError };
import type { Evaluation, Scenario, TipExchange } from "../types";


// ─── Claim-check polling ────────────────────────────────────────────────────
//
// The slow LLM tools (deal_scenario, ask_tip, judge_trade) return a claim
// check instead of the end item — generation runs concurrently on the
// server and outlives any single MCP call. Each has a free companion
// tool that redeems the claim. We poll the companion until the work is
// done; every poll is a fast call, so the per-call MCP timeout never
// comes into play. Terminal resolution lives in ./claimCheck (imported above).

// Client-side poll ceiling. Must sit ABOVE the backend's terminal-state time
// on the SLOWEST path — a detached LIVE deal: the Prefect Managed pool
// cold-starts a worker (~40-50s) BEFORE the flow runs, then the web_search LLM
// call takes up to its HTTP timeout (~360s), plus claim offset + state
// propagation. 360s gave up while genuinely-live deals were still composing.
// 600s covers cold-start + a full web_search generation + margin. A long
// ceiling is safe now: the patron isn't blocked — "Scenarios in Preparation"
// lets them wander off, and a settle happens whenever any poll observes
// completion (this one, or a later resume within the result TTL).
const CLAIM_MAX_WAIT_MS = 600_000;

// Poll a companion fetch tool for an already-issued claim until it reaches a
// terminal state. Shared by the initial start-and-poll and by a resumed claim
// (a reload / reconnect), so both settle identically. `firstWaitSeconds` is the
// backend's advised first sleep; `deadlineMs` is the absolute client ceiling.
async function pollClaimToTerminal<T>(
  fetchTool: string,
  claim: string,
  firstWaitSeconds: number,
  deadlineMs: number,
  logLabel: string,
): Promise<T> {
  let waitSeconds = firstWaitSeconds;
  for (;;) {
    await new Promise((r) => setTimeout(r, waitSeconds * 1000));
    const fetched = await callTool<ClaimFetch<T>>(fetchTool, {
      claim_check: claim,
    });
    const outcome = claimTerminalOutcome<T>(fetched);
    if (outcome !== "pending") {
      return outcome.value;
    }
    if (Date.now() > deadlineMs) {
      debugPush(
        "error",
        `${logLabel}: client gave up after ${Math.round(CLAIM_MAX_WAIT_MS / 1000)}s — server never returned a terminal status`,
      );
      throw new Error(
        `optionality_${logLabel}: timed out waiting for the result.`,
      );
    }
    // Honor the backend's next-poll advice (its countdown tightens toward done).
    waitSeconds = fetched.poll_after_seconds ?? 3;
  }
}

async function startAndPoll<T>(
  startTool: string,
  fetchTool: string,
  args: Record<string, unknown>,
): Promise<T> {
  const start = await callTool<ClaimCheckStart<T>>(startTool, args);
  // A synchronous terminal result (deterministic replay, degenerate-input nudge,
  // or a pre-flight rejection) skips polling entirely.
  const startOutcome = claimTerminalOutcome<T>(start);
  if (startOutcome !== "pending") {
    return startOutcome.value;
  }
  const claim = start.claim_check;
  if (!claim) {
    debugPush("error", `${startTool}: no claim check returned — ${start.error ?? "unknown"}`);
    throw new Error(
      start.error ?? `optionality_${startTool}: no claim check returned`,
    );
  }
  debugPush("info", `${startTool}: claim ${claim.slice(0, 8)} accepted — polling for result`);
  // Probe EARLY on the first poll. The backend's budget-sized first wait
  // (~75% of the job's runtime) is right for a job that runs the full budget —
  // but a job that fails fast (the operator's AI provider is unfunded, surfaced
  // only once the job starts) would otherwise sit "loading…" for that whole
  // first wait before the refundable error shows. One quick probe surfaces
  // early failures in seconds; after it we honor the backend's countdown.
  const firstWait = Math.min(start.poll_after_seconds ?? 3, 8);
  return pollClaimToTerminal<T>(
    fetchTool,
    claim,
    firstWait,
    Date.now() + CLAIM_MAX_WAIT_MS,
    startTool,
  );
}

// Resume polling a claim issued on a PRIOR page load (persisted across a reload
// or a dropped connection). `startedAtMs` anchors the same client ceiling the
// original attempt used, so a claim that has already outlived the window fails
// fast to "expired" here rather than polling pointlessly. This is also what
// settles the job server-side and writes its `open` journal entry — the durable
// backing for "you can wander off and claim it later".
export async function resumeDealClaim(
  claim: string,
  startedAtMs: number,
): Promise<DealScenarioResult> {
  debugPush("info", `deal_scenario: resuming claim ${claim.slice(0, 8)} after reload`);
  return pollClaimToTerminal<DealScenarioResult>(
    "fetch_scenario",
    claim,
    2,
    startedAtMs + CLAIM_MAX_WAIT_MS,
    "deal_scenario",
  );
}

// ─── Domain calls ──────────────────────────────────────────────────────────

export interface DealScenarioResult {
  entry_id: string;
  scenario: Scenario;
  error?: string;
}

// A deal in flight: the accepted claim plus the operator's honest time budget.
export interface DealStart {
  claim: string;
  expectedSeconds: number;
}

// Start a deal but DON'T poll it to completion — return the claim so the caller
// can queue it as a "Scenario in Preparation" and let a background poller settle
// it. This is what lets a patron fire several deals at once and wander off; each
// claim is polled independently (see resumeDealClaim) and settles into its own
// `open` journal entry. Throws ProofRequiredError / ClaimCheckError like any
// tool call; a fresh (non-replay) deal is never synchronously terminal.
export async function startDeal(
  mode: string,
  difficulty: string,
  maxLossUsd?: number,
  sector?: string,
): Promise<DealStart> {
  const args: Record<string, unknown> = { mode, difficulty };
  if (typeof maxLossUsd === "number" && maxLossUsd > 0) {
    args.max_loss_usd = maxLossUsd;
  }
  const sectorClean = (sector ?? "").trim();
  if (sectorClean) {
    args.sector = sectorClean;
  }
  const start = await callTool<ClaimCheckStart<DealScenarioResult>>("deal_scenario", args);
  // Surfaces a pre-flight rejection (provider unfunded, bad input) as a thrown,
  // already-refunded ClaimCheckError instead of a silent hang.
  const outcome = claimTerminalOutcome<DealScenarioResult>(start);
  if (outcome !== "pending") {
    throw new Error(start.error ?? "deal_scenario returned no claim to prepare");
  }
  if (!start.claim_check) {
    debugPush("error", `deal_scenario: no claim check returned — ${start.error ?? "unknown"}`);
    throw new Error(start.error ?? "optionality_deal_scenario: no claim check returned");
  }
  debugPush("info", `deal_scenario: claim ${start.claim_check.slice(0, 8)} queued for preparation`);
  return { claim: start.claim_check, expectedSeconds: start.expected_seconds ?? 0 };
}

// A deterministic replay (mulligan) — no LLM, so it settles synchronously and is
// still fine to await start-to-finish. Fresh async deals go through startDeal.
export async function dealScenario(
  mode: string,
  difficulty: string,
  maxLossUsd?: number,
  replayEntryId?: string,
  sector?: string,
): Promise<DealScenarioResult> {
  const args: Record<string, unknown> = { mode, difficulty };
  if (typeof maxLossUsd === "number" && maxLossUsd > 0) {
    args.max_loss_usd = maxLossUsd;
  }
  if (replayEntryId) {
    // BE forces mode="historical", difficulty="mulligan" on this path;
    // we pass them anyway so the wheel's validators see consistent input.
    args.replay_entry_id = replayEntryId;
  }
  const sectorClean = (sector ?? "").trim();
  if (sectorClean) {
    args.sector = sectorClean;
  }
  return startAndPoll<DealScenarioResult>(
    "deal_scenario",
    "fetch_scenario",
    args,
  );
}

export interface JudgeTradeResult {
  entry_id: string;
  evaluation: Evaluation;
  error?: string;
}

export async function judgeTrade(
  entryId: string,
  tradeProposal: string,
): Promise<JudgeTradeResult> {
  return startAndPoll<JudgeTradeResult>("judge_trade", "fetch_judgement", {
    entry_id: entryId,
    trade_proposal: tradeProposal,
  });
}

export interface AskTipResult {
  tip?: string;
  error?: string;
}

export async function askTip(
  entryId: string,
  question: string,
  history: TipExchange[] = [],
): Promise<AskTipResult> {
  // Send only the recent turns so follow-on questions have context;
  // the wheel caps this hard regardless of what we send.
  const recent = history.slice(-6).map((t) => ({
    question: t.question,
    answer: t.answer,
  }));
  return startAndPoll<AskTipResult>("ask_tip", "fetch_tip", {
    entry_id: entryId,
    question,
    history: recent.length ? JSON.stringify(recent) : "",
  });
}

export interface SaveDraftResult {
  entry_id?: string;
  saved_at?: string;
  error?: string;
}

export async function saveDraft(
  entryId: string,
  tradeProposal: string,
): Promise<SaveDraftResult> {
  return callTool<SaveDraftResult>("save_draft", {
    entry_id: entryId,
    trade_proposal: tradeProposal,
  });
}

/// Pull the global leaderboard. `scope` accepts `mode=...` or
/// `difficulty=...`; empty string returns the unscoped global view.
export type LeaderboardSort =
  | "weighted_avg"
  | "weighted_best"
  | "avg"
  | "best"
  | "streak"
  | "played";

export async function getLeaderboard(
  sortBy: LeaderboardSort = "weighted_avg",
  scope: string = "",
  limit: number = 25,
): Promise<import("../types").LeaderboardResult> {
  return callTool<import("../types").LeaderboardResult>("get_leaderboard", {
    sort_by: sortBy,
    scope,
    limit,
  });
}

/// Shape returned by the wheel's get_my_rank — the patron's own row
/// from the materialized leaderboard_stats. ``stats`` is null until
/// they have at least one evaluated entry.
export interface MyRankResult {
  npub?: string;
  rank?: number | null;
  stats?: {
    total_played?: number;
    avg_score?: number;
    best_score?: number;
    current_streak?: number;
    longest_streak?: number;
    weighted_avg?: number;
    last_played_at?: string;
  } | null;
  error?: string;
}

export async function getMyRank(sortBy: LeaderboardSort = "avg"): Promise<MyRankResult> {
  return callTool<MyRankResult>("get_my_rank", { sort_by: sortBy });
}

/// Server-side sorted, grouped, offset-paginated list of the signed-in
/// patron's journal entries. Sorting and grouping happen in SQL, so each
/// page is a slice of the fully-ordered dataset — not a reordering of one
/// already-fetched page. Returns `{entries, total, page, page_size,
/// groups}`; `groups` carries per-group counts over the whole filtered set.
export async function listJournal(
  opts: {
    status?: string;
    groupBy?: string;
    groupSort?: "asc" | "desc";
    sortCol?: string;
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
  } = {},
): Promise<import("../types").JournalListResult> {
  const args: Record<string, unknown> = {
    group_by: opts.groupBy ?? "none",
    group_sort: opts.groupSort ?? "asc",
    sort_col: opts.sortCol ?? "created",
    sort_dir: opts.sortDir ?? "desc",
    page: opts.page ?? 0,
    page_size: opts.pageSize ?? 25,
  };
  if (opts.status) args.status = opts.status;
  return callTool<import("../types").JournalListResult>("list_journal", args);
}

/// Hard-delete one of the patron's journal entries. Irreversible — the
/// BE drops the row and recomputes the leaderboard cache. Returns the
/// deleted id on success.
export async function deleteJournal(
  entryId: string,
): Promise<{ entry_id?: string; deleted?: boolean; error?: string }> {
  return callTool<{ entry_id?: string; deleted?: boolean; error?: string }>(
    "delete_journal",
    { entry_id: entryId },
  );
}

/// Fetch the full entry record — scenario, trade proposal, parsed
/// legs, evaluation. The Journal tab lazy-fetches this on row expand
/// rather than including the heavy payload in the list response.
export async function getJournal(entryId: string): Promise<{
  entry?: import("../types").JournalDetail;
  error?: string;
}> {
  return callTool<{ entry?: import("../types").JournalDetail; error?: string }>(
    "get_journal",
    { entry_id: entryId },
  );
}

/// Toggle a journal entry's share flag. Shared evaluated entries
/// appear under the patron's row on the public Leaderboard for peer
/// learning. Free (zero sats).
export async function shareEntry(
  entryId: string,
  shared: boolean,
): Promise<{ entry_id?: string; is_shared?: boolean; error?: string }> {
  return callTool<{ entry_id?: string; is_shared?: boolean; error?: string }>(
    "share_entry",
    { entry_id: entryId, shared },
  );
}

/// Fetch a target patron's shared trades — public read, no auth.
/// Eager-loads evaluation + trade_proposal so the leaderboard expansion
/// renders the full assessment in one call.
export async function getSharedEntries(
  targetNpub: string,
  limit: number = 20,
): Promise<import("../types").SharedEntriesResult> {
  return callTool<import("../types").SharedEntriesResult>("get_shared_entries", {
    target_npub: targetNpub,
    limit,
  });
}

/// Aggregated Claude API token usage scoped to the caller's npub.
/// Same shape as taxsort's `get_api_usage_stats` so the FE math
/// (per-model USD cost + sats equivalent) is identical.
export async function getApiUsageStats(): Promise<import("../types").ApiUsageResult> {
  return callTool<import("../types").ApiUsageResult>("get_api_usage_stats", {});
}

// ─── Profile (patron-keyed display_name / avatar / bio / relays) ──────────

export interface GetPatronProfileResult {
  success?: boolean;
  profile?: import("../types").PatronProfile;
  error?: string;
  error_code?: string;
}

export async function getPatronProfile(): Promise<GetPatronProfileResult> {
  return callTool<GetPatronProfileResult>("get_patron_profile", {});
}

export interface SetProfilePatch {
  display_name?: string;
  avatar?: string;
  bio?: string;
  /// FE passes the relays as a JSON-stringified array; the wheel tool
  /// expects a string for now (Pydantic dispatches list-vs-string at
  /// the normalize_relays layer). Stringifying here keeps the wheel
  /// signature stable and the tool argument as a flat string.
  relays?: string[];
}

export interface SetProfileResult {
  success?: boolean;
  updated?: string[];
  errors?: Record<string, string> | null;
  profile?: import("../types").PatronProfile;
  error?: string;
  error_code?: string;
}

export async function setProfile(patch: SetProfilePatch): Promise<SetProfileResult> {
  const args: Record<string, unknown> = {};
  if (typeof patch.display_name === "string") args.display_name = patch.display_name;
  if (typeof patch.avatar === "string") args.avatar = patch.avatar;
  if (typeof patch.bio === "string") args.bio = patch.bio;
  if (Array.isArray(patch.relays)) args.relays = JSON.stringify(patch.relays);
  return callTool<SetProfileResult>("set_profile", args);
}

// ─── Opt-in nsec escrow + operator-signed DMs ────────────────────────────

export interface EscrowNsecResult {
  success?: boolean;
  escrowed?: boolean;
  error?: string;
  error_code?: string;
}

export async function escrowNsec(nsec: string): Promise<EscrowNsecResult> {
  return callTool<EscrowNsecResult>("escrow_nsec", { nsec });
}

export interface WithdrawNsecResult {
  success?: boolean;
  nsec?: string;
  escrowed?: boolean;
  expected_acknowledgment?: string;
  error?: string;
  error_code?: string;
}

export const WITHDRAW_ACKNOWLEDGMENT =
  "I understand I am now solely responsible for this nsec.";

export async function withdrawNsec(acknowledgment: string): Promise<WithdrawNsecResult> {
  return callTool<WithdrawNsecResult>("withdraw_nsec", { acknowledgment });
}

export interface SendPatronDmResult {
  success?: boolean;
  sender_npub?: string;
  target_npub?: string;
  error?: string;
  error_code?: string;
}

export async function sendPatronDm(
  targetNpub: string,
  message: string,
): Promise<SendPatronDmResult> {
  return callTool<SendPatronDmResult>("send_patron_dm", {
    target_npub: targetNpub,
    message,
  });
}

export interface GetEscrowStatusResult {
  success?: boolean;
  escrowed?: boolean;
  error?: string;
}

export async function getEscrowStatus(): Promise<GetEscrowStatusResult> {
  return callTool<GetEscrowStatusResult>("get_escrow_status", {});
}

export interface CheckPriceResult {
  success: boolean;
  tool_id?: string;
  tool_name?: string;
  base_cost?: number;
  effective_cost?: number;
  cost?: number;       // alternate field name some wheel versions return
  error?: string;
  error_code?: string;
}

/// Preview the effective cost of a tool call before invoking it. The
/// wheel computes ``base × multipliers`` server-side; the FE reads the
/// authoritative number here and displays it on the setup screen.
/// `toolCapability` is the bare capability ("deal_scenario") which the
/// wheel resolves to a tool_id internally. `toolKwargs` is a JSON-able
/// object — for deal_scenario, ``{mode, difficulty}``.
export async function checkPrice(
  toolCapability: string,
  toolKwargs: Record<string, unknown>,
): Promise<CheckPriceResult> {
  return callTool<CheckPriceResult>("check_price", {
    tool_id: toolCapability,
    tool_kwargs: JSON.stringify(toolKwargs),
  });
}

// ─── Wider shapes of the standard tools ──────────────────────────────────
// The package types what every operator returns; this operator's wheel
// returns more, and the Usage and Build panels read it.

/// Per-tool usage entry, keyed by tool name in `today_usage`.
export interface ToolUsage {
  calls: number;
  api_sats: number;
}

/// One purchase_credits invoice's worth of sats, with its own expiry. The
/// wheel consumes the oldest first.
export interface CreditTranche {
  id: string;
  amount_sats: number;
  remaining_sats: number;
  expires_at: string | null;
  created_at: string | null;
}

/// `check_balance` as the Usage tab reads it.
export interface BalanceLedger extends CheckBalanceResult {
  total_expired_api_sats?: number;
  pending_invoices?: number;
  active_tranches?: number;
  tranches?: CreditTranche[];
  today_usage?: Record<string, ToolUsage>;
  last_deposit_at?: string | null;
  seed_balance_granted?: boolean;
  vault_unavailable?: boolean;
  warning?: string;
  npub?: string;
}

/// `service_status` with the Horizon build stamp the Build panel shows.
export interface BuildStatus extends ServiceStatus {
  build_info?: {
    fastmcp_cloud_url?: string;
    fastmcp_cloud_git_commit_sha?: string;
    fastmcp_cloud_git_repo?: string;
  };
  process_id?: number;
}


// ─── Coupons (wheel 0.41.0+) ────────────────────────────────────────────

export interface PatronCoupon {
  coupon_id: string;
  name: string;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  uses_per_patron: number | null;
  use_count: number;
  uses_remaining: number | null;
  total_uses: number | null;
  total_remaining: number | null;
  /// "active" / "window_closed" / "patron_limit" / "total_limit" / "window_not_started"
  status: string;
}

export interface ListMyCouponsResult {
  success: boolean;
  count: number;
  coupons: PatronCoupon[];
  error?: string;
}

export interface RedeemCouponResult {
  success: boolean;
  coupon_id?: string;
  name?: string;
  discount_percent?: number;
  valid_until?: string;
  uses_remaining?: number | null;
  uses_per_patron?: number | null;
  error?: string;
}

export interface ForgetCouponResult {
  success: boolean;
  coupon_id?: string;
  error?: string;
}

/**
 * Claim a coupon by its name (operator-distributed code).  On success
 * the wheel records a per-patron redemption row and the discount is
 * automatically applied on subsequent paid tool calls until the
 * uses-per-patron cap or the window expires.  Idempotent.
 */
export async function redeemCoupon(code: string): Promise<RedeemCouponResult> {
  return callTool<RedeemCouponResult>("redeem_coupon", { code });
}

/**
 * List the coupons this patron has redeemed on this MCP.  Returns
 * both active and exhausted rows with a per-row status.
 */
export async function listMyCoupons(): Promise<ListMyCouponsResult> {
  return callTool<ListMyCouponsResult>("list_my_coupons", {});
}

/**
 * Remove a coupon from this patron's redemption list.  Pure cosmetic —
 * the coupon itself still exists at the operator, and the patron can
 * re-redeem the same code later while the window allows.
 */
export async function forgetCoupon(couponId: string): Promise<ForgetCouponResult> {
  return callTool<ForgetCouponResult>("forget_coupon", { coupon_id: couponId });
}
