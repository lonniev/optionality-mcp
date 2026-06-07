/**
 * Optionality MCP client.
 *
 * Pattern modeled verbatim on taxsort-mcp/frontend/src/hooks/useMCP.ts:
 *
 * 1. One singleton @modelcontextprotocol/sdk Client over the
 *    StreamableHTTPClientTransport. The SDK handles the initialize
 *    handshake, SSE session tracking, and reconnection.
 * 2. After the npub login handshake (request_npub_proof →
 *    receive_npub_proof) succeeds, the wheel caches the patron's
 *    Schnorr proof server-side keyed by their npub. Subsequent paid
 *    tool calls send ONLY `npub` — no client-side `proof` token.
 *    Same wheel version as taxsort, so we follow the same convention.
 * 3. Auth/balance/proof tools are always free and pre-login-safe.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import type { Evaluation, Scenario, TipExchange } from "../types";
import { clearSessionNsec, hasSessionNsec, sessionNsecNpub } from "./sessionNsec";
import { signInlineProof } from "./inlineProof";

/// Return the npub proof that authenticates a paid tool call. One
/// of two cached sources, depending on how the patron signed in:
///
///   - nsec login: we have the secret key in browser session
///     storage; produce a fresh kind-27235 inline proof bound to
///     the runtime tool name. Cheap (single Schnorr sig).
///   - npub + DM login: we have the poison-phrase token the wheel
///     cached at receive_npub_proof time; return it verbatim.
///
/// Either way callTool just asks once and forgets about which login
/// path produced the answer. Stale-session-nsec entries (left over
/// from a prior identity) are evicted automatically so they don't
/// poison subsequent calls.
function getCachedProof(toolName: string): string {
  try {
    const currentNpub = getStoredNpub();
    const sessionNpub = hasSessionNsec() ? sessionNsecNpub() : null;
    if (sessionNpub && sessionNpub === currentNpub) {
      return signInlineProof(`optionality_${toolName}`);
    }
    if (sessionNpub && sessionNpub !== currentNpub) {
      clearSessionNsec();
    }
  } catch {
    // Inline-proof generation failed (decode / sign error). Fall
    // through to the cached poison-phrase token; if THAT's also
    // missing or stale, the call returns PROOF_REQUIRED and the
    // UI bounces the user to the gate cleanly.
  }
  return getStoredProof();
}

const _envUrl = (import.meta.env.VITE_MCP_URL as string | undefined) ?? "";
const MCP_URL = _envUrl.startsWith("/")
  ? `${window.location.origin}${_envUrl}`
  : _envUrl;

const NPUB_STORAGE_KEY = "optionality:patron_npub:v1";
const PROOF_STORAGE_KEY = "optionality:proof_token:v1";

let client: Client | null = null;
let connecting: Promise<void> | null = null;

function requireUrl(): string {
  if (!MCP_URL) {
    throw new Error(
      "VITE_MCP_URL is not configured. Set it in .env (e.g. http://localhost:8000/mcp).",
    );
  }
  return MCP_URL;
}

async function getClient(): Promise<Client> {
  if (client) return client;
  if (connecting) {
    await connecting;
    return client!;
  }
  connecting = (async () => {
    const url = requireUrl();
    const c = new Client({ name: "optionality-frontend", version: "0.1.0" });
    const transport = new StreamableHTTPClientTransport(new URL(url));
    await c.connect(transport);
    client = c;
    connecting = null;
  })();
  await connecting;
  return client!;
}

export function getStoredNpub(): string {
  return window.localStorage.getItem(NPUB_STORAGE_KEY) ?? "";
}

/// Stable per-browser guest identifier — 8-char hex, generated on
/// first call, persisted so a returning guest sees the same handle.
/// Used to address the patron-as-guest in the Welcome / guest-pass
/// copy ("Welcome Guest Trader <hash>") without inventing an npub
/// for someone who hasn't signed in.
const GUEST_ID_KEY = "optionality:guest-id:v1";

export function getGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing && /^[0-9a-f]{8}$/.test(existing)) return existing;
  const bytes = new Uint8Array(4);
  window.crypto.getRandomValues(bytes);
  const id = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}

export function setStoredNpub(npub: string): void {
  window.localStorage.setItem(NPUB_STORAGE_KEY, npub);
}

export function getStoredProof(): string {
  return window.localStorage.getItem(PROOF_STORAGE_KEY) ?? "";
}

export function setStoredProof(proof: string): void {
  window.localStorage.setItem(PROOF_STORAGE_KEY, proof);
}

/// Guest mode: the user clicked "Continue as Guest" on NpubGate. They
/// reach the scenario chooser and the free preview surfaces (check_price,
/// scenario briefing) but every paid call is gated. No npub, no proof,
/// no journal / leaderboard / usage. Persisted so a reload survives.
const GUEST_STORAGE_KEY = "optionality:guest";

/// Cache of recently-authenticated (npub, proof_token, expiresAt) tuples.
/// Lets a returning patron skip the DM exchange on re-entry as long as
/// the server-side proof cache hasn't expired (default 2h). Cap at the
/// five most-recently-used entries; older or expired entries get pruned
/// on every read. Stored as a single JSON blob under one key.
const RECENT_LOGINS_KEY = "optionality:recent-logins:v1";
const MAX_RECENT_LOGINS = 5;

export interface RecentLogin {
  /// Bech32 npub the user signed in with.
  npub: string;
  /// Server-issued proof_token (e.g. poison phrase "rare-lake-49").
  proof: string;
  /// Unix ms timestamp when the server-side cache expires.
  expiresAt: number;
  /// Unix ms timestamp of most recent successful use — drives ordering
  /// and eviction.
  lastUsed: number;
}

function readRecentLogins(): RecentLogin[] {
  try {
    const raw = window.localStorage.getItem(RECENT_LOGINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentLogin =>
        typeof e === "object" && e !== null &&
        typeof e.npub === "string" &&
        typeof e.proof === "string" &&
        typeof e.expiresAt === "number" &&
        typeof e.lastUsed === "number",
    );
  } catch {
    return [];
  }
}

function writeRecentLogins(entries: RecentLogin[]): void {
  window.localStorage.setItem(RECENT_LOGINS_KEY, JSON.stringify(entries));
}

/// Return all unexpired recent logins, sorted by lastUsed descending.
/// Prunes expired entries from storage as a side effect — a returning
/// patron sees a clean list.
export function getValidRecentLogins(): RecentLogin[] {
  const now = Date.now();
  const entries = readRecentLogins();
  const valid = entries.filter((e) => e.expiresAt > now);
  if (valid.length !== entries.length) writeRecentLogins(valid);
  valid.sort((a, b) => b.lastUsed - a.lastUsed);
  return valid;
}

/// Look up a still-valid cached entry for a specific npub. Returns null
/// if not cached or already expired.
export function findRecentLogin(npub: string): RecentLogin | null {
  const now = Date.now();
  const hit = readRecentLogins().find((e) => e.npub === npub && e.expiresAt > now);
  return hit ?? null;
}

/// Record (or refresh) a successful login. Called on the success path of
/// receiveNpubProof. expiresInSec comes from the server response; we
/// derate by 30s so cache stragglers don't end up serving an
/// already-expired token to the next paid call.
export function recordRecentLogin(npub: string, proof: string, expiresInSec: number): void {
  const safeTtl = Math.max(0, expiresInSec - 30);
  const next: RecentLogin = {
    npub,
    proof,
    expiresAt: Date.now() + safeTtl * 1000,
    lastUsed: Date.now(),
  };
  // Drop any prior entry for this npub and prepend the new one. Cap to
  // MAX_RECENT_LOGINS, evicting the oldest if over.
  const others = readRecentLogins().filter((e) => e.npub !== npub);
  const combined = [next, ...others]
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, MAX_RECENT_LOGINS);
  writeRecentLogins(combined);
}

/// Remove one cached identity. Used by the gate's per-row "forget"
/// affordance and by the auth-bounce path when a proof_token is
/// rejected by the server (cache miss / mismatch).
export function forgetRecentLogin(npub: string): void {
  writeRecentLogins(readRecentLogins().filter((e) => e.npub !== npub));
}

export function isGuestMode(): boolean {
  return window.localStorage.getItem(GUEST_STORAGE_KEY) === "1";
}

export function setGuestMode(on: boolean): void {
  if (on) window.localStorage.setItem(GUEST_STORAGE_KEY, "1");
  else window.localStorage.removeItem(GUEST_STORAGE_KEY);
}

/**
 * "Logged in" means we have both the patron's npub AND a proof_token
 * that — until the server-side cache expires — authenticates ownership
 * of that npub for paid tool calls. Server-side expiry is the patron's
 * chosen ``cache_duration`` from the proof DM, default 2 hours.
 *
 * Guest mode also short-circuits to ``true`` so the gate hands off to the
 * main UI; the main UI is responsible for disabling paid-call surfaces
 * when ``isGuestMode()`` is true.
 */
export function isLoggedIn(): boolean {
  if (isGuestMode()) return true;
  const npub = getStoredNpub();
  if (!npub) return false;
  // Two valid auth tactics:
  //   1. Cached proof_token (poison-phrase). Used by patrons who went
  //      through the DM-based proof flow.
  //   2. Session nsec whose derived npub matches the stored npub —
  //      every paid call inline-signs a fresh kind-27235 proof, no
  //      cached token needed. Used by patrons who pasted their nsec
  //      on the gate ("Sign In Directly").
  // Tactic 2 users never set a proof_token, so checking only that
  // bounces them to the gate on every page refresh.
  if (getStoredProof()) return true;
  if (hasSessionNsec() && sessionNsecNpub() === npub) return true;
  return false;
}

export function logOut(): void {
  window.localStorage.removeItem(NPUB_STORAGE_KEY);
  window.localStorage.removeItem(PROOF_STORAGE_KEY);
  setGuestMode(false);
  // Best-effort wipe of the in-browser session nsec. The escrowed copy
  // on the BE survives until the user explicitly withdraws it via
  // Profile → Game Persona Key.
  try {
    // Lazy require to avoid load-order issues if sessionNsec module is
    // not yet hydrated (e.g. on cold tab close).
    window.localStorage.removeItem("optionality:session_nsec:v1");
  } catch {
    /* noop */
  }
}

interface ToolResultText {
  type: string;
  text?: string;
}

interface ToolResult {
  isError?: boolean;
  content?: ToolResultText[];
  structuredContent?: unknown;
}

/**
 * Sentinel error class. callTool throws this when the server rejects a
 * paid call because the proof_token expired or was never sent. The gate
 * UI catches this and bounces the user back to sign-in.
 */
export class ProofRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProofRequiredError";
  }
}

/// Bootstrap / login tools — wheel signatures take only `patron_npub`, no
/// `npub`/`proof` envelope. Listing them explicitly avoids the noise of
/// injecting empty pre-login values that Pydantic rejects as unexpected
/// keyword arguments.
const BOOTSTRAP_TOOLS = new Set([
  "request_npub_proof",
  "receive_npub_proof",
  // service_status() takes zero kwargs on the wheel side — passing
  // npub/proof gets rejected by Pydantic strict mode with
  // unexpected_keyword_argument. Treat it like a bootstrap tool so
  // callTool skips the envelope. Most other free tools (check_balance,
  // check_payment, etc.) explicitly declare (npub: str, proof: str)
  // in their signature and remain fine.
  "service_status",
  // get_shared_entries is a public read — anyone (guests too) can
  // browse a peer's shared trades. The wheel-side signature has no
  // npub/proof params, so injecting them is a Pydantic-strict error.
  "get_shared_entries",
]);

async function callTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const c = await getClient();
  const merged: Record<string, unknown> = BOOTSTRAP_TOOLS.has(toolName)
    ? { ...args }
    : {
        npub: getStoredNpub(),
        proof: getCachedProof(toolName),
        ...args,
      };
  let result: ToolResult;
  try {
    result = (await c.callTool(
      { name: `optionality_${toolName}`, arguments: merged },
      undefined,
      { timeout: 120_000 },
    )) as ToolResult;
  } catch (e) {
    throw new Error(`optionality_${toolName}: ${(e as Error).message}`);
  }
  if (result.isError) {
    const errText = (result.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => String(b.text))
      .join("\n") || "Tool call failed";
    throw new Error(errText);
  }

  // Unwrap the actual payload from the MCP response envelope.
  let payload: unknown = undefined;
  if (result.structuredContent !== undefined) {
    payload = result.structuredContent;
  } else {
    const textBlocks = (result.content ?? []).filter((b) => b.type === "text");
    if (textBlocks.length > 0) {
      const text = String(textBlocks[0].text ?? "");
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    } else {
      payload = result;
    }
  }

  // Wheel `require_proof` returns `{success: false, error_code: ...}` for
  // proof failures. These are "soft" errors at the MCP layer (no isError
  // flag) but the FE must treat them as auth bounces — clear the stale
  // proof_token and let the gate handle re-sign-in.
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const errCode = String(p.error_code ?? "");
    if (p.success === false && (errCode === "PROOF_REQUIRED" || errCode === "PROOF_REFRESH_NEEDED")) {
      // Also evict the cached entry for this npub so the gate's
      // "Recent identities" picker doesn't immediately re-arm the same
      // dead proof_token on the next visit.
      const currentNpub = getStoredNpub();
      if (currentNpub) forgetRecentLogin(currentNpub);
      window.localStorage.removeItem(PROOF_STORAGE_KEY);
      throw new ProofRequiredError(String(p.error ?? "Sign-in required."));
    }
  }
  return payload as T;
}

// ─── Claim-check polling ────────────────────────────────────────────────────
//
// The slow LLM tools (deal_scenario, ask_tip, judge_trade) return a claim
// check instead of the end item — generation runs concurrently on the
// server and outlives any single MCP call. Each has a free companion
// tool that redeems the claim. We poll the companion until the work is
// done; every poll is a fast call, so the per-call MCP timeout never
// comes into play.

interface ClaimCheckStart {
  success?: boolean;
  claim_check?: string;
  poll_after_seconds?: number;
  error?: string;
}

interface ClaimFetch<T> {
  status?: string; // running | done | error | expired
  result?: T;
  error?: string;
  next_steps?: string;
  poll_after_seconds?: number;
}

const CLAIM_MAX_WAIT_MS = 600_000;

async function startAndPoll<T>(
  startTool: string,
  fetchTool: string,
  args: Record<string, unknown>,
): Promise<T> {
  const start = await callTool<ClaimCheckStart>(startTool, args);
  const claim = start.claim_check;
  if (!claim) {
    throw new Error(
      start.error ?? `optionality_${startTool}: no claim check returned`,
    );
  }
  const deadline = Date.now() + CLAIM_MAX_WAIT_MS;
  let waitSeconds = start.poll_after_seconds ?? 3;
  for (;;) {
    await new Promise((r) => setTimeout(r, waitSeconds * 1000));
    const fetched = await callTool<ClaimFetch<T>>(fetchTool, {
      claim_check: claim,
    });
    if (fetched.status === "done" && fetched.result !== undefined) {
      return fetched.result;
    }
    if (fetched.status === "error") {
      throw new Error(
        fetched.error ?? "The request failed; the fee was refunded.",
      );
    }
    if (fetched.status === "expired") {
      throw new Error(
        fetched.next_steps ?? "The claim check expired — please retry.",
      );
    }
    if (Date.now() > deadline) {
      throw new Error(
        `optionality_${startTool}: timed out waiting for the result.`,
      );
    }
    waitSeconds = fetched.poll_after_seconds ?? 3;
  }
}

// ─── Domain calls ──────────────────────────────────────────────────────────

export interface DealScenarioResult {
  entry_id: string;
  scenario: Scenario;
  error?: string;
}

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

/// Paginated list of the signed-in patron's journal entries, newest
/// first. ``before`` is the cursor — the ISO ``created_at`` of the last
/// row from the previous page. Omit on first fetch.
///
/// The BE's list_entries caps internally at 200; the FE defaults to 25
/// per page so the Journal tab loads quickly even with thousands of
/// historical sessions. "Load more" appends successive pages.
export async function listJournal(
  opts: { limit?: number; before?: string; status?: string } = {},
): Promise<import("../types").JournalListResult> {
  const args: Record<string, unknown> = { limit: opts.limit ?? 25 };
  if (opts.before) args.before = opts.before;
  if (opts.status) args.status = opts.status;
  return callTool<import("../types").JournalListResult>("list_journal", args);
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

// ─── Patron credit-purchase flow ──────────────────────────────────────────

/// Subset of the wheel's purchase_credits response the FE needs to
/// surface payment UI. Field names mirror Studio's PurchaseCreditsResult
/// so the FE flow is portable. Some wheel versions return
/// ``lightning_invoice`` (bolt11), others ``payment_request`` — both
/// names are accepted by the helper below.
export interface PurchaseCreditsResult {
  success?: boolean;
  invoice_id?: string;
  checkout_link?: string;
  lightning_invoice?: string;
  payment_request?: string;
  expires_at?: string;
  amount_sats?: number;
  error?: string;
  error_code?: string;
}

export async function purchaseCredits(sats: number): Promise<PurchaseCreditsResult> {
  // Wheel signature is purchase_credits(npub, proof, amount_sats) — kw
  // name "amount_sats", not "sats". Pydantic rejects extra kwargs so the
  // FE name MUST match. callTool injects npub + proof from localStorage.
  return callTool<PurchaseCreditsResult>("purchase_credits", { amount_sats: sats });
}

/// Shape of the wheel's check_payment response. Notes for the FE:
/// - status is the primary signal ("New" | "Processing" | "Settled" |
///   "Expired" | "Invalid"). There is NO ``settled: bool`` field.
/// - balance_api_sats is the canonical patron balance (snake_case).
/// - message is a human-readable status the wheel writes for every
///   branch — surface this when the call returns "pending" so the user
///   can see what BTCPay reported.
/// - On Settled: credits_granted + persisted are set.
export interface CheckPaymentResult {
  success?: boolean;
  status?: "New" | "Processing" | "Settled" | "Expired" | "Invalid" | string;
  additional_status?: string;
  message?: string;
  invoice_id?: string;
  credits_granted?: number;
  persisted?: boolean;
  warning?: string;
  balance_api_sats?: number;
  error?: string;
  error_code?: string;
}

export async function checkPayment(invoiceId: string): Promise<CheckPaymentResult> {
  return callTool<CheckPaymentResult>("check_payment", { invoice_id: invoiceId });
}

/// Per-tool usage entry. Keyed by tool name in the today_usage dict the
/// wheel returns. ``api_sats`` is the cumulative spend on that tool for
/// the current UTC day.
export interface ToolUsage {
  calls: number;
  api_sats: number;
}

/// Per-tranche credit record. A "tranche" is a single purchase_credits
/// invoice's worth of sats, with its own creation time and expiry. The
/// patron can have multiple tranches active simultaneously; the wheel
/// consumes from oldest-first.
export interface CreditTranche {
  id: string;
  amount_sats: number;
  remaining_sats: number;
  expires_at: string | null;
  created_at: string | null;
}

export interface CheckBalanceResult {
  success?: boolean;
  balance_api_sats?: number;
  total_deposited_api_sats?: number;
  total_consumed_api_sats?: number;
  total_expired_api_sats?: number;
  pending_invoices?: number;
  active_tranches?: number;
  tranches?: CreditTranche[];
  today_usage?: Record<string, ToolUsage>;
  last_deposit_at?: string | null;
  expiring_within_24h_sats?: number;
  next_expiration_iso?: string;
  seed_balance_granted?: boolean;
  vault_unavailable?: boolean;
  warning?: string;
  npub?: string;
  error?: string;
  error_code?: string;
}

export async function checkBalance(): Promise<CheckBalanceResult> {
  return callTool<CheckBalanceResult>("check_balance", {});
}

/// Free wheel-standard tool. Returns the patron's all-time spending
/// statement: account summary, purchase history, active tranches,
/// per-tool lifetime usage (with sats!), and a day-by-day breakdown.
/// Authoritative source for "what did the patron spend on" reporting —
/// includes every paid tool, not just Claude-burning ones.
export async function getAccountStatement(
  days: number = 30,
): Promise<import("../types").AccountStatementResult> {
  return callTool<import("../types").AccountStatementResult>("account_statement", { days });
}

// ─── Login / auth — free tools, no proof required ─────────────────────────

export interface ServiceStatus {
  operator_npub_hash?: string;
  lifecycle?: string;
  message?: string;
  /// Optionality MCP server.py __version__ (semver-ish, e.g. "0.1.9").
  version?: string;
  /// tollbooth-dpyc wheel version the MCP is linked against.
  tollbooth_dpyc_version?: string;
  /// Horizon-injected build info — commit SHA + repo URL.
  build_info?: {
    fastmcp_cloud_url?: string;
    fastmcp_cloud_git_commit_sha?: string;
    fastmcp_cloud_git_repo?: string;
  };
  process_id?: number;
  service?: string;
  slug?: string;
}

/** Read the operator's npub fingerprint so the patron can verify the DM source. */
export async function serviceStatus(): Promise<ServiceStatus> {
  return callTool<ServiceStatus>("service_status", {});
}

export interface NpubProofResult {
  verified?: boolean;
  status?: string;
  message?: string;
  proof_token?: string;
  popped_dms?: number;
  expires_in_seconds?: number;
  expires_at?: string;
  error?: string;
}

/**
 * Step 1 of npub login. Sends a Secure Courier DM to the patron's npub
 * containing a challenge string. The user must reply to that DM in their
 * own Nostr client. Free.
 */
export async function requestNpubProof(patronNpub: string): Promise<NpubProofResult> {
  return callTool<NpubProofResult>("request_npub_proof", { patron_npub: patronNpub });
}

/**
 * Step 2 of npub login. Drains the patron's DMs from the relay and looks for
 * a valid signed reply to the challenge from step 1. On success, the wheel
 * caches the patron's proof server-side keyed by the npub — subsequent paid
 * tool calls only need to send the npub. Free.
 *
 * Per memory `feedback_human_in_loop_courier`: this is a destructive drain;
 * the caller MUST wait until the user has actually replied before invoking
 * this. Do not poll or speculatively retry.
 *
 * `poison` is the `proof_token` returned by requestNpubProof — the wheel's
 * deterministic retrieve contract requires it to resolve the pinned
 * rendezvous relay for this exact challenge.
 */
export async function receiveNpubProof(
  patronNpub: string,
  poison: string,
): Promise<NpubProofResult> {
  return callTool<NpubProofResult>("receive_npub_proof", {
    patron_npub: patronNpub,
    poison,
  });
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
