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

import type { Evaluation, Scenario } from "../types";

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
  return Boolean(getStoredNpub() && getStoredProof());
}

export function logOut(): void {
  window.localStorage.removeItem(NPUB_STORAGE_KEY);
  window.localStorage.removeItem(PROOF_STORAGE_KEY);
  setGuestMode(false);
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
        proof: getStoredProof(),
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
      window.localStorage.removeItem(PROOF_STORAGE_KEY);
      throw new ProofRequiredError(String(p.error ?? "Sign-in required."));
    }
  }
  return payload as T;
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
): Promise<DealScenarioResult> {
  const args: Record<string, unknown> = { mode, difficulty };
  if (typeof maxLossUsd === "number" && maxLossUsd > 0) {
    args.max_loss_usd = maxLossUsd;
  }
  return callTool<DealScenarioResult>("deal_scenario", args);
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
  return callTool<JudgeTradeResult>("judge_trade", {
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
): Promise<AskTipResult> {
  return callTool<AskTipResult>("ask_tip", {
    entry_id: entryId,
    question,
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
export async function getLeaderboard(
  sortBy: "avg" | "best" | "streak" | "played" = "avg",
  scope: string = "",
  limit: number = 25,
): Promise<import("../types").LeaderboardResult> {
  return callTool<import("../types").LeaderboardResult>("get_leaderboard", {
    sort_by: sortBy,
    scope,
    limit,
  });
}

/// Aggregated Claude API token usage scoped to the caller's npub.
/// Same shape as taxsort's `get_api_usage_stats` so the FE math
/// (per-model USD cost + sats equivalent) is identical.
export async function getApiUsageStats(): Promise<import("../types").ApiUsageResult> {
  return callTool<import("../types").ApiUsageResult>("get_api_usage_stats", {});
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

// ─── Login / auth — free tools, no proof required ─────────────────────────

export interface ServiceStatus {
  operator_npub_hash?: string;
  lifecycle?: string;
  message?: string;
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
 */
export async function receiveNpubProof(patronNpub: string): Promise<NpubProofResult> {
  return callTool<NpubProofResult>("receive_npub_proof", { patron_npub: patronNpub });
}
