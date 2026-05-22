/**
 * Optionality MCP client.
 *
 * Wraps the official @modelcontextprotocol/sdk Client with the
 * StreamableHTTPClientTransport so the SDK handles the initialize
 * handshake, SSE session tracking, and reconnection.
 *
 * Pattern modeled on taxsort-mcp/frontend/src/hooks/useMCP.ts.
 *
 * NOTE on auth: every paid tool call requires (npub, proof). The
 * `npub` comes from the patron's Nostr identity (NIP-07 extension or
 * a saved local key). The `proof` is a poison-keyed Schnorr token
 * issued by the operator's `request_npub_proof` + `receive_npub_proof`
 * flow. Acquiring those is a separate task — Phase 4 wires the
 * scenario/judge calls but does not yet implement the proof handshake.
 * Calls made before the patron has proven their npub will surface a
 * "proof is required" error from the server, which the UI should treat
 * as the prompt to start the proof flow.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import type { Evaluation, Scenario } from "../types";

const _envUrl = (import.meta.env.VITE_MCP_URL as string | undefined) ?? "";
const MCP_URL = _envUrl.startsWith("/")
  ? `${window.location.origin}${_envUrl}`
  : _envUrl;

const NPUB_STORAGE_KEY = "optionality:patron_npub:v1";
const PROOF_STORAGE_KEY = "optionality:patron_proof:v1";

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

interface ToolResultText {
  type: string;
  text?: string;
}

interface ToolResult {
  isError?: boolean;
  content?: ToolResultText[];
  structuredContent?: unknown;
}

async function callTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const c = await getClient();
  const merged: Record<string, unknown> = {
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
  if (result.structuredContent !== undefined) {
    return result.structuredContent as T;
  }
  const textBlocks = (result.content ?? []).filter((b) => b.type === "text");
  if (textBlocks.length > 0) {
    const text = String(textBlocks[0].text ?? "");
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }
  return result as unknown as T;
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
): Promise<DealScenarioResult> {
  return callTool<DealScenarioResult>("deal_scenario", { mode, difficulty });
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
