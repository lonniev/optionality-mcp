import { lazy, Suspense, useState, useEffect, useRef } from "react";

import type {
  ActiveSession,
  ApiUsageResult,
  Difficulty,
  DifficultyDef,
  Evaluation,
  JournalDetail,
  JournalGroupAgg,
  JournalListEntry,
  LeaderboardResult,
  LeaderboardRow,
  Mode,
  ModeDef,
  ModelUsage,
  OptionChainRow,
  PendingDeal,
  PersistedState,
  ProposedLeg,
  Scenario,
  Stats,
  TabId,
  TipExchange,
} from "../types";
import {
  checkBalance,
  checkPrice,
  formatDate,
  formatDateTime,
  formatTime,
  getStoredNpub,
  ProofRequiredError,
} from "@tollbooth-dpyc/web";
import { PatronFundingStatus, RefreshButton, UsageSummary, useTimezone } from "@tollbooth-dpyc/web/react";
import {
  askTip,
  ClaimCheckError,
  dealScenario,
  deleteJournal,
  getApiUsageStats,
  getJournal,
  getLeaderboard,
  getMyRank,
  getSharedEntries,
  judgeTrade,
  listJournal,
  resumeDealClaim,
  saveDraft,
  shareEntry,
  startDeal,
} from "../lib/mcp";
import { getGuestId, isGuestMode } from "../lib/guest";
import type { SharedEntry } from "../types";
import { useHashTab } from "../lib/hashTab";
import { LEGACY_SESSION_KEY, sessionKey } from "../lib/sessionKey";
import {
  legacyPendingDealKey,
  pendingDealsKey,
  prunePending,
  removePending,
  upsertPending,
} from "../lib/pendingDeals";
import { etaLabel as computeEtaLabel, fmtClock } from "../lib/dealClock";
import { useT, WORDS, type MessageKey, type Translate } from "../i18n";
import { usd0 } from "../lib/money";
import { dimensionLabel, statusLabel } from "../lib/labels";
import { Tx } from "@tollbooth-dpyc/web/react";


/// Sortable column headers. `key` matches the wheel's `sort_col` whitelist
/// (list_journal); the caret and actions columns aren't sortable.
const JOURNAL_SORT_HEADERS: { key: string; align?: "right" }[] = [
  { key: "symbol" },
  { key: "historicity" },
  { key: "difficulty" },
  { key: "created" },
  { key: "updated" },
  { key: "grade", align: "right" },
  { key: "score", align: "right" },
  { key: "status" },
];

/// A Journal column's name, in the reader's language.
const columnLabel = (t: Translate, key: string): string => t(`game.journal.col.${key}` as MessageKey);

const JOURNAL_GROUP_OPTIONS: string[] = ["none", "historicity", "difficulty", "symbol"];

/// A Journal grouping's name, in the reader's language.
const groupOptionLabel = (t: Translate, val: string): string =>
  val === "none" ? t("game.journal.group.none") : columnLabel(t, val);

/// Compact date+time for the Created / Updated columns.
function fmtJournalDate(iso: string | undefined, zone: string): string {
  if (!iso || isNaN(Date.parse(iso))) return "—";
  return formatDateTime(iso, zone, {
    month: "short", day: "numeric", year: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

/// Display label for a group header. Symbol keys pass through; the
/// lowercase enum keys (mode / difficulty) get Title-cased.
function fmtGroupLabel(t: Translate, groupBy: string, key: string): string {
  if (!key) return "—";
  if (groupBy === "symbol") return key;
  if (groupBy === "historicity") return modeLabel(t, key);
  if (groupBy === "difficulty") return difficultyLabel(t, key);
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// Material Design icon paths (Apache 2.0), 24×24 viewBox — one glyph per
// concept, rendered with currentColor so each inherits its button's color.
const MI_LOGOUT = "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z";
const MI_DELETE = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";
const MI_REFRESH = "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z";
// Tab glyphs. waving_hand + emoji_people fetched verbatim from Google's
// material-design-icons repo; the rest are standard Material paths.
const MI_WAVE = "M23,17c0,3.31-2.69,6-6,6v-1.5c2.48,0,4.5-2.02,4.5-4.5H23z M1,7c0-3.31,2.69-6,6-6v1.5C4.52,2.5,2.5,4.52,2.5,7H1z M8.01,4.32l-4.6,4.6c-3.22,3.22-3.22,8.45,0,11.67s8.45,3.22,11.67,0l7.07-7.07c0.49-0.49,0.49-1.28,0-1.77 c-0.49-0.49-1.28-0.49-1.77,0l-4.42,4.42l-0.71-0.71l6.54-6.54c0.49-0.49,0.49-1.28,0-1.77s-1.28-0.49-1.77,0l-5.83,5.83l-0.71-0.71 l6.89-6.89c0.49-0.49,0.49-1.28,0-1.77s-1.28-0.49-1.77,0l-6.89,6.89L11.02,9.8l5.48-5.48c0.49-0.49,0.49-1.28,0-1.77 s-1.28-0.49-1.77,0l-7.62,7.62c1.22,1.57,1.11,3.84-0.33,5.28l-0.71-0.71c1.17-1.17,1.17-3.07,0-4.24l-0.35-0.35l4.07-4.07 c0.49-0.49,0.49-1.28,0-1.77C9.29,3.83,8.5,3.83,8.01,4.32z";
// A person raising their hand (for "The Pit" — raise your hand to pitch a
// trade). Material Symbols `person_raised_hand` (24px) — head + torso + one
// raised arm. Replaces an earlier headless custom silhouette.
const MI_PERSON = "M2 23v-2h20v2zm2-3v-6q-.825-1.35-1.275-2.863t-.45-3.087q0-1.525.388-3t.912-2.9q.2-.525.65-.837t1-.313Q6 1 6.55 1.525T7 2.775L6.725 5.05q-.15 1.2.213 2.275t1.087 1.887t1.75 1.3T12 11q1.5 0 3.013.313t2.637.887t1.738 1.463T20 15.85V20H10v-.925q0-.85.575-1.463T12 17h4v-2h-4q-1.675 0-2.838 1.2T8 19.075V20zM9.175 8.825Q8 7.65 8 6t1.175-2.825T12 2t2.825 1.175T16 6t-1.175 2.825T12 10T9.175 8.825";
const MI_EYE = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
const MI_BOOKS = "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z";
const MI_BARCHART = "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z";
const MI_MONEY = "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z";
const MI_GEAR = "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z";

function MaterialIcon({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
      <path d={path} />
    </svg>
  );
}

/// Map MCP-namespaced tool names (the wheel's debit ledger key) to
/// friendlier labels for the Usage panel. Keys are the
/// "<slug>_<capability>" strings the wheel writes to today_usage.
/// Unmapped tools fall back to a humanized version of the capability.
const NAMED_TOOLS = new Set([
  "deal_scenario",
  "judge_trade",
  "ask_tip",
  "save_draft",
  "purchase_credits",
  "check_payment",
  "check_balance",
  "check_price",
  "get_leaderboard",
  "get_my_rank",
  "get_journal",
  "list_journal",
  "delete_journal",
  "set_display_name",
  "get_api_usage_stats",
  "account_statement",
  "request_npub_proof",
  "receive_npub_proof",
]);

function displayToolName(t: Translate, rawKey: string): string {
  const capability = rawKey.startsWith("optionality_") ? rawKey.slice("optionality_".length) : rawKey;
  if (NAMED_TOOLS.has(capability)) return t(`game.tool.${capability}` as MessageKey);
  // Strip the operator-slug prefix and Title-Case the capability.
  const stripped = rawKey.startsWith("optionality_") ? rawKey.slice("optionality_".length) : rawKey;
  return stripped
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Anthropic per-million-token pricing, refreshed at build time from
// OpenRouter's /api/v1/models (they pass through Anthropic rates with
// no per-token markup). See scripts/fetch-anthropic-pricing.mjs.
import {
  MODEL_PRICING as GENERATED_PRICING,
  PRICING_FETCHED_AT,
} from "../data/anthropicPricing.generated";

const DEFAULT_PRICING = { input: 3, output: 15 };

// Look up a model's per-Mtok rate. Strips any trailing date suffix
// (e.g. "-20251015") so dated API ids resolve to the base entry.
function priceFor(model: string): { input: number; output: number } {
  if (GENERATED_PRICING[model]) return GENERATED_PRICING[model];
  const stripped = model.replace(/-\d{8}$/, "");
  if (GENERATED_PRICING[stripped]) return GENERATED_PRICING[stripped];
  return DEFAULT_PRICING;
}

function fmt$(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
import ModeIcon from "./ModeIcon";
import DifficultyAvatar from "./DifficultyAvatar";
import FactsLedger from "./FactsLedger";
import TopUpModal from "./TopUpModal";
import { shortNpub } from "@tollbooth-dpyc/web";
import { Avatar, PageControls, SortHeader, tourTarget, useTour } from "@tollbooth-dpyc/web/react";
import DMComposeModal from "./DMComposeModal";
import DealAnimation from "./DealAnimation";
import JudgeAnimation from "./JudgeAnimation";
import RichText from "./RichText";
import { getPatronProfile } from "../lib/mcp";
import { getEcosystemRelays } from "../lib/relays";

// Each tab past the Pit, and every chart, is its own chunk, fetched the first time it opens.
const RiskProfileChart = lazy(() => import("./RiskProfileChart"));
const SampleAssessment = lazy(() => import("./SampleAssessment"));
const ProfileTab = lazy(() => import("./Profile"));
const Welcome = lazy(() => import("./Welcome"));
const OptionChainGuide = lazy(() => import("./OptionChainGuide"));
const SkewGuide = lazy(() => import("./SkewGuide"));

// ============================================================
//  OPTIONALITY — A Sovereign Trader's Drill
//  Main component. Composed from extracted pieces in this
//  directory plus math in ../lib/bs.ts and types in ../types.
//  Dealer and judge calls dispatch through ../lib/mcp.ts; the
//  prompts live server-side now (mcp/src/optionality_mcp/prompts.py).
// ============================================================

// Per-npub state key. The previous flat "optionality:state:v1" key was
// shared across whoever signed in on this browser, so the Journal +
// Stats showed the prior identity's data when you switched npubs.
// Namespacing by npub fixes the cross-identity bleed; the lookup
// falls back to "" so guests can read/write their own slot.
const STORAGE_KEY_PREFIX = "optionality:state:v1:";
function storageKey(npub: string): string {
  return STORAGE_KEY_PREFIX + (npub || "_guest");
}
/// Separate from stats/history. The patron paid for this scenario; it must
/// survive a page reload until they explicitly finish the round. The key is
/// npub-scoped (see ./lib/sessionKey) so an identity switch can't seat one
/// patron's scenario in another's Pit.

const DIFFICULTY_IDS: DifficultyDef["id"][] = ["apprentice", "journeyman", "adept", "sovereign"];

/// The personas, in the reader's language.
const difficultiesIn = (t: Translate): DifficultyDef[] =>
  DIFFICULTY_IDS.map((id) => ({
    id,
    label: t(`game.difficulty.${id}.label` as MessageKey),
    blurb: t(`game.difficulty.${id}.blurb` as MessageKey),
  }));

/// A persona's name; an id this page doesn't know shows as sent.
function difficultyLabel(t: Translate, id: string): string {
  return [...DIFFICULTY_IDS, "mulligan"].includes(id as DifficultyDef["id"]) ? t(`game.difficulty.${id}.label` as MessageKey) : id;
}

const MODE_IDS: ModeDef["id"][] = ["historical", "fiction", "live"];

/// The historicities, in the reader's language.
const modesIn = (t: Translate): ModeDef[] =>
  MODE_IDS.map((id) => ({
    id,
    label: t(`game.mode.${id}.label` as MessageKey),
    blurb: t(`game.mode.${id}.blurb` as MessageKey),
  }));

/// A historicity's name; an id this page doesn't know shows as sent.
function modeLabel(t: Translate, id: string): string {
  return MODE_IDS.includes(id as ModeDef["id"]) ? t(`game.mode.${id}.label` as MessageKey) : id;
}

/// Curated sector chips the patron can constrain the dealer to. Each
/// has a rich options-trading story — concentrated catalysts, distinctive
/// IV regimes, recurring tape patterns — so the LLM has plenty to work
/// with. "" = no constraint, dealer picks freely. The full string is
/// passed verbatim to the dealer prompt so it can be a free-text label
/// (e.g., "luxury goods", "uranium miners") via the inline override.
/// `id` is what the dealer is sent (English, by design); `name` keys the label.
const SECTORS: ReadonlyArray<{ id: string; name: string; glyph: string }> = [
  { id: "", name: "any", glyph: "🎲" },
  { id: "biotech", name: "biotech", glyph: "🧬" },
  { id: "semis", name: "semis", glyph: "💾" },
  { id: "mega-cap tech", name: "megaTech", glyph: "🤖" },
  { id: "banks", name: "banks", glyph: "🏦" },
  { id: "energy", name: "energy", glyph: "🛢️" },
  { id: "miners", name: "miners", glyph: "⛏️" },
  { id: "consumer discretionary", name: "consumer", glyph: "🛍️" },
  { id: "homebuilders", name: "homebuilders", glyph: "🏗️" },
  { id: "defense", name: "defense", glyph: "🛡️" },
  { id: "airlines", name: "airlines", glyph: "✈️" },
  { id: "crypto-adjacent equities", name: "crypto", glyph: "₿" },
  { id: "index / ETF", name: "index", glyph: "📈" },
];



// ============================================================
//  Prompts and Claude API calls are server-side now (mcp/src/optionality_mcp/
//  prompts.py + claude.py). The frontend dispatches via ../lib/mcp.ts.
// ============================================================


// ------------------------------------------------------------
//  Storage — temporary localStorage shim.
//  Phase 4 (Task 21) replaces these with MCP journal CRUD.
// ------------------------------------------------------------

async function loadState(npub: string): Promise<PersistedState | null> {
  try {
    const raw = window.localStorage.getItem(storageKey(npub));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

async function saveState(npub: string, state: PersistedState): Promise<void> {
  try {
    window.localStorage.setItem(storageKey(npub), JSON.stringify(state));
  } catch (e) {
    console.error("save failed", e);
  }
}

function loadSession(npub: string): ActiveSession | null {
  try {
    // One-time cleanup: the pre-scoping global key is unreliable (it could hold
    // another identity's scenario), so drop it rather than migrate it — a legit
    // in-progress drill survives as an `open` journal entry the patron can
    // resume from the Journal tab; only the unsaved draft text is lost.
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
    const raw = window.localStorage.getItem(sessionKey(npub));
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

function saveSession(npub: string, s: ActiveSession): void {
  try {
    window.localStorage.setItem(sessionKey(npub), JSON.stringify(s));
  } catch (e) {
    console.error("session save failed", e);
  }
}

function clearSession(npub: string): void {
  try {
    window.localStorage.removeItem(sessionKey(npub));
  } catch {
    /* noop */
  }
}

// The per-npub queue of paid scenarios still composing ("Scenarios in
// Preparation"). Persisted as a LIST so several concurrent deals survive a
// reload / dropped connection independently — each is resumed and settled on
// next load. See PendingDeal and ../lib/pendingDeals.
function loadPendingDeals(npub: string): PendingDeal[] {
  try {
    const raw = window.localStorage.getItem(pendingDealsKey(npub));
    let list: PendingDeal[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as PendingDeal[];
      if (Array.isArray(parsed)) list = parsed;
    }
    // MIGRATE the superseded 0.6.4 single-slot crumb into the v2 list rather
    // than dropping it — an in-flight claim persisted under v1 is a paid deal
    // still composing; discarding it orphans the job (nothing polls it to
    // settle + journal it). Merge, then retire the old key.
    const legacyRaw = window.localStorage.getItem(legacyPendingDealKey(npub));
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw) as PendingDeal;
        if (legacy?.claimCheck) list = upsertPending(list, legacy);
      } catch {
        /* corrupt legacy crumb — nothing to migrate */
      }
      window.localStorage.removeItem(legacyPendingDealKey(npub));
    }
    return list;
  } catch {
    return [];
  }
}

function savePendingDeals(npub: string, list: PendingDeal[]): void {
  try {
    if (list.length === 0) window.localStorage.removeItem(pendingDealsKey(npub));
    else window.localStorage.setItem(pendingDealsKey(npub), JSON.stringify(list));
  } catch (e) {
    console.error("pending-deals save failed", e);
  }
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=JetBrains+Mono:wght@300;400;500;600&display=swap');

  :root {
    --bg: #0d0b08;
    --bg-soft: #14110c;
    --panel: #1a1610;
    --panel-edge: #2a2218;
    --ink: #efe7d6;
    --ink-soft: #b8ad96;
    --ink-faint: #6e6553;
    --amber: #d4a35b;
    --amber-bright: #f0c272;
    --amber-glow: rgba(212, 163, 91, 0.18);
    --ivory: #c8b88a;
    --ivory-bright: #e6d9b3;
    --bronze: #a08862;
    --rust: #b8553a;
    --jade: #6b8e6b;
    --crimson: #a4453a;
  }
  body, .opt-root {
    background: var(--bg);
    color: var(--ink);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 14px;
    line-height: 1.55;
    min-height: 100vh;
  }
  .opt-root {
    background-image:
      radial-gradient(ellipse at top left, rgba(212,163,91,0.05), transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(164,69,58,0.04), transparent 50%);
    padding: 24px clamp(16px, 3vw, 40px) 80px;
    padding-left: max(clamp(16px, 3vw, 40px), env(safe-area-inset-left));
    padding-right: max(clamp(16px, 3vw, 40px), env(safe-area-inset-right));
  }
  .serif { font-family: 'Fraunces', Georgia, serif; }
  /* Container widths scale with viewport. iPad landscape (~1180-1366px)
     gets a wide layout where the scenario can read in two columns
     without horizontal scroll. Phone widths fall back to centered
     single column at the original 980px. */
  .header {
    max-width: min(1400px, 100%);
    margin: 0 auto 24px;
    border-bottom: 1px solid var(--panel-edge);
    padding-bottom: 20px;
    display: flex; align-items: baseline; justify-content: space-between;
    flex-wrap: wrap; gap: 12px;
  }
  .brand {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 34px;
    letter-spacing: 0.04em;
    color: var(--amber-bright);
    text-shadow: 0 0 24px var(--amber-glow);
  }
  .brand small {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 400;
    color: var(--ink-faint);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .stats {
    display: flex; gap: 24px;
    font-size: 11px;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }
  .stats b { display:block; font-family:'Fraunces',serif; font-size:22px; color: var(--amber-bright); letter-spacing:0; text-transform:none; margin-top:2px; font-weight:500;}
  .balance-chip {
    display:flex; flex-direction:column; align-items:flex-start; gap:0;
    background:transparent; border:none; padding:0; cursor:pointer; font:inherit;
    font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color: var(--ink-soft);
  }
  .balance-chip b { display:block; font-family:'Fraunces',serif; font-size:22px; color: var(--amber-bright); letter-spacing:0; text-transform:none; margin-top:2px; font-weight:500;}
  .balance-chip small { font-family:'JetBrains Mono',monospace; font-size:11px; color: var(--ink-faint); }
  .balance-chip-cta { margin-top:3px; font-size:9px; letter-spacing:0.2em; color: var(--amber); }
  .balance-chip:hover .balance-chip-cta { color: var(--amber-bright); }
  .balance-chip.zero b, .balance-chip.zero .balance-chip-cta { color: var(--rust); }

  .container { max-width: min(1400px, 100%); margin: 0 auto; }

  /* Two-column layout for the scenario card on landscape iPad / desktop.
     Left column: macro/asset/catalyst/levels/constraints/sources.
     Right column: the question + answer textarea + actions.
     Falls back to single column under 900px (phones, portrait iPad mini). */
  .scenario-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 22px 32px;
  }
  @media (min-width: 900px) {
    .scenario-grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
    .scenario-grid > .scenario-prompt { padding-left: 8px; border-left: 1px solid var(--panel-edge); }
  }
  .scenario-prompt textarea { min-height: 220px; }

  .panel {
    background: var(--panel);
    border: 1px solid var(--panel-edge);
    padding: 24px 28px;
    margin-bottom: 18px;
    position: relative;
  }
  .panel-label {
    position: absolute; top: -9px; left: 18px;
    background: var(--bg);
    padding: 0 10px;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--amber);
    text-transform: uppercase;
  }

  h2.serif { font-size: 26px; font-weight: 500; color: var(--ink); margin-bottom: 10px; line-height: 1.2; }
  h3.serif { font-size: 18px; font-weight: 500; color: var(--amber-bright); margin: 18px 0 8px; }

  .difficulty-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 14px;
  }
  .card-base {
    background: var(--bg-soft);
    border: 1px solid var(--panel-edge);
    padding: 14px 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    color: var(--ink);
    font-family: inherit;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .card-base .art { flex-shrink: 0; line-height: 0; }
  .card-base .txt { flex: 1; min-width: 0; }
  .card-base b { font-family: 'Fraunces', serif; font-weight: 500; font-size: 16px; display:block; margin-bottom:4px; line-height:1.15;}
  .card-base span { font-size: 11px; color: var(--ink-soft); line-height: 1.4; display:block;}

  .diff-card:hover { border-color: var(--amber); transform: translateY(-1px); }
  .diff-card.active { border-color: var(--amber-bright); background: rgba(212,163,91,0.06); }
  .diff-card b { color: var(--amber-bright); }
  .diff-card .art { color: var(--amber); }
  .diff-card.active .art { color: var(--amber-bright); }

  .mode-card:hover { border-color: var(--ivory); transform: translateY(-1px); }
  .mode-card.active { border-color: var(--ivory-bright); background: rgba(200, 184, 138, 0.05); }
  .mode-card b { color: var(--ivory-bright); }
  .mode-card span { color: var(--ink-soft); }
  .mode-card .art { color: var(--bronze); }
  .mode-card.active .art { color: var(--ivory-bright); }

  .btn {
    background: var(--amber);
    color: #1a1208;
    border: none;
    padding: 13px 24px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .btn:hover:not(:disabled) { background: var(--amber-bright); box-shadow: 0 0 20px var(--amber-glow); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost {
    background: transparent;
    color: var(--ink-soft);
    border: 1px solid var(--panel-edge);
  }
  .journal-pager { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 14px; font-size: 12px; color: var(--ink-faint); flex-wrap: wrap; }
  .journal-pager .btn { padding: 3px 9px; }
  .journal-pager-label { flex: 1; text-align: center; }
  .btn-ghost:hover:not(:disabled) { color: var(--amber-bright); border-color: var(--amber); background: transparent; box-shadow:none;}

  .scenario-meta { font-size: 11px; color: var(--amber); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;}
  .scenario-quote {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-size: 17px;
    color: var(--ink);
    line-height: 1.5;
    padding-left: 14px;
    border-left: 2px solid var(--amber);
    margin: 12px 0 18px;
  }
  .data-row { display: flex; flex-wrap: wrap; gap: 24px; margin: 14px 0;}
  .data-cell { font-size: 12px;}
  .data-cell label { display:block; font-size:10px; color: var(--ink-faint); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:2px;}
  .data-cell b { font-family: 'Fraunces',serif; font-size:18px; font-weight:500; color: var(--amber-bright);}

  .question { font-family:'Fraunces',serif; font-size:19px; color:var(--ink); margin: 18px 0 8px; line-height:1.4;}

  textarea {
    width: 100%;
    min-height: 180px;
    background: var(--bg-soft);
    border: 1px solid var(--panel-edge);
    color: var(--ink);
    padding: 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    resize: vertical;
    margin-top: 6px;
  }
  textarea:focus { outline: none; border-color: var(--amber); }
  textarea::placeholder { color: var(--ink-faint); font-style: italic;}

  .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; align-items: center; justify-content: flex-end;}

  .score-banner {
    display: flex; align-items: center; gap: 20px;
    padding: 18px 24px;
    background: linear-gradient(90deg, rgba(212,163,91,0.08), transparent);
    border-left: 3px solid var(--amber);
    margin-bottom: 14px;
  }
  .score-banner .grade { font-family: 'Fraunces', serif; font-size: 56px; color: var(--amber-bright); line-height: 1; font-weight: 500; }
  .score-banner .score { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink-soft); letter-spacing: 0.2em; text-transform: uppercase; }
  .score-banner .score b { color: var(--ink); font-size: 22px; display:block; font-weight:500; margin-top:2px;}
  .score-banner .headline { font-family:'Fraunces',serif; font-style:italic; font-size:16px; color: var(--ink); flex: 1;}

  .dim-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap:8px; margin: 10px 0;}
  .dim-card { background: var(--bg-soft); border:1px solid var(--panel-edge); padding: 12px 14px;}
  .dim-card .dim-name { font-size:10px; color: var(--ink-faint); letter-spacing:0.2em; text-transform:uppercase; }
  .dim-card .dim-score { font-family:'Fraunces',serif; font-size:24px; color: var(--amber-bright); font-weight:500; }
  .dim-card .dim-fb { font-size: 11.5px; color: var(--ink-soft); line-height:1.5; margin-top:6px;}

  .bullet-list { list-style:none; padding:0; margin: 6px 0;}
  .bullet-list li { padding: 5px 0 5px 18px; position:relative; font-size:13px; color: var(--ink-soft); line-height:1.5;}
  .bullet-list li::before { content:"\\25C7"; position:absolute; left:0; color: var(--amber); }
  .bullet-list.good li::before { content:"+"; color: var(--jade); font-weight:600;}
  .bullet-list.bad li::before { content:"\\2212"; color: var(--rust); font-weight:600;}

  .alt-trade { background: var(--bg-soft); border-left: 2px solid var(--jade); padding: 12px 16px; font-size:13px; color: var(--ink-soft); line-height:1.6;}
  .deeper { font-family:'Fraunces',serif; font-size:15px; line-height:1.6; color: var(--ink); margin-top: 8px;}

  .history-row { display:grid; grid-template-columns: 60px 1fr 80px 80px; gap:12px; padding:10px 14px; border-bottom:1px solid var(--panel-edge); font-size:12px; align-items:center;}
  .history-row:last-child { border-bottom:none;}
  .history-row .h-ticker { font-family:'Fraunces',serif; color: var(--amber-bright); font-size:15px;}
  .history-row .h-date { color: var(--ink-faint); font-size:11px;}
  .history-row .h-grade { font-family:'Fraunces',serif; font-size:20px; color: var(--amber); text-align:right; font-weight:500;}
  .history-row .h-score { color: var(--ink-soft); text-align:right;}

  .avatar-dm { display:inline-flex; padding:0; border:none; border-radius:50%; background:none; cursor:pointer;}
  .avatar-dm > span { transition: border-color 120ms ease;}
  .avatar-dm:hover > span, .avatar-dm:focus-visible > span { border-color: var(--amber);}

  .loading { display: inline-block; padding: 12px 18px; color: var(--amber); font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; }
  .loading::after { content: ""; animation: dots 1.4s infinite; }
  @keyframes dots { 0%,20%{content:"";} 40%{content:" .";} 60%{content:" . .";} 80%,100%{content:" . . .";} }
  .icon-btn { transition: color 0.15s; }
  .icon-btn:hover:not(:disabled) { color: var(--amber-bright); }
  .icon-btn:disabled { cursor: default; }

  .error { color: var(--crimson); background: rgba(164,69,58,0.08); border-left: 2px solid var(--crimson); padding: 10px 14px; font-size: 12px; }

  .tab-bar { display:flex; gap:0; border-bottom:1px solid var(--panel-edge); margin-bottom: 20px; width:100%; max-width: min(1400px, 100%); margin-left:auto; margin-right:auto;}
  .tab { flex:1 1 0; min-width:0; display:flex; flex-direction:column; align-items:center; gap:5px; padding: 10px 8px; cursor:pointer; font-size:10px; letter-spacing:0.15em; text-transform:uppercase; line-height:1.2; text-align:center; color: var(--ink-faint); border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit; transition: color 0.15s;}
  .tab svg { opacity:0.85; }
  .tab:hover { color: var(--ink-soft);}
  .tab.active { color: var(--amber-bright); border-bottom-color: var(--amber); }

  .empty { text-align:center; padding: 40px; color: var(--ink-faint); font-style: italic; font-family:'Fraunces',serif;}

  .briefing-prose { font-family: 'Fraunces', serif; font-size: 15px; line-height: 1.6; color: var(--ink); margin-top: 10px; margin-bottom: 18px; }
  .briefing-rule { display: flex; gap: 14px; padding: 12px 16px 12px 14px; margin: 10px 0; background: rgba(212, 163, 91, 0.04); border-left: 2px solid var(--amber); font-size: 13px; line-height: 1.55; color: var(--ink-soft); }
  .briefing-rule.warn { background: rgba(184, 85, 58, 0.05); border-left-color: var(--rust); }
  .briefing-rule b { font-family: 'Fraunces', serif; font-style: italic; font-weight: 500; color: var(--ink); font-size: 14px; margin-right: 4px; }
  .briefing-rule .rule-mark { font-family: 'Fraunces', serif; font-size: 22px; color: var(--amber); line-height: 1; flex-shrink: 0; margin-top: 2px; }
  .briefing-rule.warn .rule-mark { color: var(--rust); }
  .briefing-coda { font-family: 'Fraunces', serif; font-style: italic; font-size: 14px; color: var(--ink-soft); text-align: center; margin: 20px 0 4px; letter-spacing: 0.02em; }

  .ledger-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px; margin: 10px 0 4px; }
  .ledger-col { background: var(--bg-soft); border: 1px solid var(--panel-edge); border-left-width: 2px; padding: 12px 14px; }
  .ledger-head { font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 8px; line-height: 1.4; }
  .ledger-mark { display: inline-block; margin-right: 6px; font-weight: 600; font-size: 12px; }
  .ledger-col ul { list-style: none; padding: 0; margin: 0; }
  .ledger-col li { font-size: 12px; color: var(--ink); padding: 4px 0 4px 12px; position: relative; line-height: 1.5; }
  .ledger-col li::before { content: "\\00B7"; position: absolute; left: 0; color: var(--ink-faint); }
  .ledger-empty { font-size: 11.5px; color: var(--ink-faint); font-style: italic; font-family: 'Fraunces', serif; }
  .ledger-col.integrated { border-left-color: var(--jade); }
  .ledger-col.integrated .ledger-head { color: var(--jade); }
  .ledger-col.integrated .ledger-mark { color: var(--jade); }
  .ledger-col.missed { border-left-color: var(--ivory); }
  .ledger-col.missed .ledger-head { color: var(--ivory); }
  .ledger-col.missed .ledger-mark { color: var(--ivory); }
  .ledger-col.caught { border-left-color: var(--amber); }
  .ledger-col.caught .ledger-head { color: var(--amber); }
  .ledger-col.caught .ledger-mark { color: var(--amber); }
  .ledger-col.followed { border-left-color: var(--rust); }
  .ledger-col.followed .ledger-head { color: var(--rust); }
  .ledger-col.followed .ledger-mark { color: var(--rust); }

  .rp-chart { width: 100%; height: auto; background: var(--bg-soft); border: 1px solid var(--panel-edge); display: block; margin-top: 4px; }
  .chart-controls { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; margin-bottom: 10px; font-size: 11px; }
  .chart-controls label { color: var(--ink-faint); letter-spacing: 0.15em; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px; }
  .chart-controls input[type=range] { -webkit-appearance: none; appearance: none; width: 200px; background: transparent; height: 20px; outline: none; cursor: pointer; }
  .chart-controls input[type=range]::-webkit-slider-runnable-track { height: 3px; background: var(--panel-edge); border-radius: 2px; }
  .chart-controls input[type=range]::-moz-range-track { height: 3px; background: var(--panel-edge); border-radius: 2px; }
  .chart-controls input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; background: var(--amber-bright); border-radius: 50%; margin-top: -5.5px; cursor: pointer; box-shadow: 0 0 6px var(--amber-glow); }
  .chart-controls input[type=range]::-moz-range-thumb { width: 14px; height: 14px; background: var(--amber-bright); border-radius: 50%; border: none; cursor: pointer; }
  .chart-toggle { display: flex !important; align-items: center; gap: 8px; color: var(--ink-soft) !important; text-transform: none !important; letter-spacing: 0 !important; font-size: 12px !important; cursor: pointer; margin: 0 !important; }
  .chart-toggle input { accent-color: var(--ivory); }

  .chart-legend { display: flex; gap: 22px; flex-wrap: wrap; margin-top: 10px; font-size: 11px; color: var(--ink-soft); }
  .chart-legend .swatch { display: inline-block; width: 16px; height: 2px; margin-right: 6px; vertical-align: middle; }
  .chart-legend .swatch.dashed { background-image: linear-gradient(to right, var(--ivory) 50%, transparent 50%); background-size: 5px 2px; background-color: transparent !important; }
  .chart-legend .swatch.tick { width: 2px; height: 10px; background: var(--amber); vertical-align: middle; }

  .leg-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
  .leg-table th { text-align: left; font-weight: 400; font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-faint); padding: 5px 8px; border-bottom: 1px solid var(--panel-edge); }
  .leg-table td { padding: 5px 8px; border-bottom: 1px solid var(--panel-edge); color: var(--ink); }
  .leg-table tr:last-child td { border-bottom: none; }

  /* Journal: a sortable table on wide screens, row cards on narrow ones.
     The card-only pieces (the sort picker, the row breaks, the cell labels)
     are display:none here, so the desktop grid never sees them. */
  .journal-scroll { overflow-x: auto; }
  .journal-table { width: 80%; min-width: 760px; margin: 0 auto; }
  /* caret · Symbol · Historicity · Difficulty · Created · Updated · Grade ·
     Score · Status · Actions: fixed widths for the narrow cells, minmax for
     the text cells so the table fills its frame. */
  .journal-row { grid-template-columns: 26px minmax(56px,0.8fr) minmax(88px,1fr) minmax(92px,1fr) minmax(116px,1.3fr) minmax(116px,1.3fr) 50px 56px minmax(84px,1fr) 50px; }
  .journal-row .j-break, .journal-row .j-label, .journal-sort-picker { display: none; }
  .j-del { background: none; border: none; cursor: pointer; padding: 2px 4px; color: var(--ink-faint); display: inline-flex; align-items: center; justify-content: center; opacity: 0.7; }

  /* Leaderboard rows: the same grid for the header and every trader. */
  .lb-row { grid-template-columns: 40px 56px 1fr 84px 84px 60px 60px 60px; }
  .lb-row .lb-label, .lb-row .lb-break { display: none; }
  .lb-name, .lb-npub { overflow-wrap: anywhere; }

  .tap-icon { display: inline-flex; align-items: center; justify-content: center; }

  @media (max-width: 1100px) {
    .journal-table { width: 100%; }
  }

  /* Touch-sized screens: every control a thumb can hit (40px floor). */
  @media (max-width: 1000px) {
    .btn { min-height: 40px; }
    .journal-pager .btn { min-width: 40px; }
    .icon-btn, .tap-icon, .j-del, .avatar-dm { min-width: 40px; min-height: 40px; }
  }

  @media (max-width: 1000px) {
    .journal-table { min-width: 0; }
    .journal-row.journal-head { display: none !important; }
    .journal-sort-picker { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .journal-sort-picker select {
      -webkit-appearance: none; appearance: none; height: 40px; border-radius: 0; color: var(--ink); border: 1px solid var(--panel-edge);
      font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 0 30px 0 10px;
      background-color: var(--bg-soft);
      background-image: linear-gradient(45deg, transparent 50%, var(--ink-soft) 50%), linear-gradient(135deg, var(--ink-soft) 50%, transparent 50%);
      background-position: calc(100% - 15px) 55%, calc(100% - 10px) 55%;
      background-size: 5px 5px; background-repeat: no-repeat;
    }
    .journal-row { display: flex !important; flex-wrap: wrap; align-items: center; gap: 2px 12px; padding: 12px 10px 12px 34px; position: relative; }
    .journal-row .j-break { display: block; flex-basis: 100%; height: 0; }
    .journal-row .j-caret { position: absolute; left: 12px; top: 16px; }
    .journal-row .j-ticker { order: 1; flex: 1 1 0; min-width: 0; overflow-wrap: anywhere; font-size: 17px; }
    .journal-row .j-grade { order: 2; font-size: 20px !important; }
    .journal-row .j-score { order: 3; min-width: 28px; }
    .journal-row .j-act { order: 4; }
    .journal-row .j-break.b1 { order: 5; }
    .journal-row .j-mode, .journal-row .j-diff, .journal-row .j-status { order: 6; }
    .journal-row .j-break.b2 { order: 7; }
    .journal-row .j-created, .journal-row .j-updated { order: 8; }
    .journal-row .j-label { display: inline; color: var(--ink-faint); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; margin-right: 6px; }
    .journal-detail { padding: 10px 4px 20px !important; }
  }

  @media (max-width: 640px) {
    .panel { padding: 22px 16px; }
    .header { align-items: flex-start; }
    .brand { font-size: 28px; }
    .stats { flex-wrap: wrap; gap: 12px 20px; width: 100%; }
    .stats b, .balance-chip b { font-size: 19px; }
    h2.serif { font-size: 23px; }
    .score-banner { flex-wrap: wrap; gap: 10px 18px; padding: 14px 16px; }
    .score-banner .headline { flex-basis: 100%; }

    .lb-row.lb-head { display: none !important; }
    .lb-row { display: flex !important; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 12px 8px; }
    .lb-row .lb-name { flex: 1 1 0; min-width: 0; }
    .lb-row .lb-stat { flex: 1 1 0; min-width: 52px; text-align: left !important; }
    .lb-row .lb-label { display: block; color: var(--ink-faint); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 400; }
    .lb-row .lb-break { display: block; flex-basis: 100%; height: 0; }
    .lb-shared-row { grid-template-columns: 1fr 44px 64px !important; }
    .lb-shared-row > div:last-child { display: none; }
  }
  @media (max-width: 560px) {
    .tab-bar { flex-wrap: wrap; }
    .tab { flex: 1 0 33.333%; padding: 10px 4px; letter-spacing: 0.08em; }
  }
`;

// ============================================================
//  Main component
// ============================================================

interface OptionalityProps {
  onSignOut?: () => void;
}

export default function Optionality({ onSignOut }: OptionalityProps = {}) {
  const t = useT();
  const MODES = modesIn(t);
  const DIFFICULTIES = difficultiesIn(t);
  // Hash-routed tab. Browser back/forward and refresh restore the view.
  // `setTab` is user-initiated and adds a history entry; `replaceTab` is
  // for system-initiated bounces (auto-route, guest guard) and doesn't.
  const { tab, setTab, replaceTab } = useHashTab("play");
  // Guest mode: came in via "Continue as Guest" on the gate. The scenario
  // chooser and briefing render, but every paid surface is suppressed.
  const guest = isGuestMode();
  // Top Up modal — purchases sats from the operator via BTCPay Lightning.
  // Open from the lower-left of the scenario chooser; closed in all other
  // app states so an in-progress scenario doesn't get covered.
  const [topUpOpen, setTopUpOpen] = useState<boolean>(false);
  // The patron's display time zone (Profile → Preferences); every date here follows it.
  const [, zone] = useTimezone();
  // DM Compose modal target — clicking an avatar on the leaderboard
  // populates this with that patron's identity; null hides the modal.
  const [dmTarget, setDmTarget] = useState<{
    npub: string;
    displayName?: string | null;
    avatar?: string | null;
  } | null>(null);
  // Relays for publishing a NIP-07 DM. These are the ecosystem's shared set
  // (dpyc-community/relays.json), not a per-patron choice — loaded once at
  // sign-in with a baked-in fallback, so a DM never lacks somewhere to land.
  const [userRelays, setUserRelays] = useState<string[]>([]);
  // Escrow status — true when Optionality holds the patron's nsec and
  // the DM modal can route through the BE signer instead of requiring
  // a NIP-07 browser extension. Loaded at the same time as relays.
  const [escrowed, setEscrowed] = useState<boolean>(false);
  // Current sats balance — drives the conditional Welcome /
  // Sample-Assessment tabs for signed-in patrons. null = not yet
  // loaded (don't render the auto-route); 0 = patron is at zero and
  // we surface the onboarding panels; >0 = play tab default.
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  // Patron display name — surfaced in the Welcome greeting and the
  // header chip. Loaded from get_patron_profile alongside relays
  // + escrowed flag.
  const [patronDisplayName, setPatronDisplayName] = useState<string | null>(null);
  // One-shot guard so the initial-zero auto-route to Welcome fires
  // exactly once per session. After the patron navigates away (or
  // tops off), they can return to Welcome via the tab button while
  // balance is still zero, but they don't get force-routed again.
  const [welcomeAutoRouted, setWelcomeAutoRouted] = useState<boolean>(false);

  async function refreshBalance(): Promise<void> {
    if (guest) return;
    try {
      const r = await checkBalance();
      if (typeof r.balance_api_sats === "number") {
        setCurrentBalance(r.balance_api_sats);
      }
    } catch {
      // silent — header chip just won't update; not blocking gameplay
    }
  }
  const [mode, setMode] = useState<Mode>("historical");
  const [difficulty, setDifficulty] = useState<Difficulty>("journeyman");
  // Per-trade max-loss envelope in USD. Empty string = no constraint.
  // Some trainees reason more crisply about a $250 trade than a $10,000
  // version of the same setup; this lets them shape the scenario.
  const [maxLossInput, setMaxLossInput] = useState<string>("");
  // Optional market-sector focus (e.g., "biotech", "semis"). Empty
  // string = no constraint, dealer picks freely. The chooser surfaces
  // a curated list of sectors that genuinely have rich options-trading
  // dynamics; "Other" round-trips a free-text label through the MCP.
  const [sector, setSector] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Each tab offers its own tour; the Pit has two, the choosing and the dealt scenario.
  useTour(
    tab === "play" ? (scenario && !evaluation ? "scenario" : "pit")
      : tab === "profile" ? "account" : tab,
    { ready: !loading },
  );
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  // The queue of scenarios the Firm is still composing — a patron can fire
  // several at once and wander off. Each is polled by a background poller
  // (pollersRef) that settles it into its own `open` journal entry. Surfaced as
  // the "Scenarios in Preparation" table in the Journal.
  const [preparing, setPreparing] = useState<PendingDeal[]>([]);
  // Which preparing claim the full-screen "Reading the tape" overlay is showing,
  // if any. Null = no overlay (patron is elsewhere while deals compose).
  const [focusedClaim, setFocusedClaim] = useState<string | null>(null);
  // Mirror of focusedClaim readable inside a poller closure without re-subscribing.
  const focusedClaimRef = useRef<string | null>(null);
  focusedClaimRef.current = focusedClaim;
  // Claims with a live background poller — guards against double-spawning.
  const pollersRef = useRef<Set<string>>(new Set());
  // Guards the wallet against an impatient patron: a re-entrancy lock so rapid
  // clicks can't fire two paid deals before the first registers, and a confirm
  // gate before starting an ADDITIONAL deal while others are still composing.
  const startingRef = useRef<boolean>(false);
  const [confirmDealAnother, setConfirmDealAnother] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ played: 0, avg: 0, best: 0, streak: 0 });
  // Journal — server-authoritative, sorted + grouped + offset-paginated
  // by the wheel's list_journal (the TaxSort get_transactions_paged
  // model). The BE does the ORDER BY / GROUP BY, so each page is a slice
  // of the fully-ordered dataset; the FE just picks sort_col/sort_dir,
  // group_by, and page. Lightweight summary rows; expanding a row triggers
  // a lazy get_journal fetch for the full entry detail.
  const [journalEntries, setJournalEntries] = useState<JournalListEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState<boolean>(false);
  const [journalError, setJournalError] = useState<string>("");
  // Sort / group / page state — every change re-fetches the page.
  const [journalSortCol, setJournalSortCol] = useState<string>("created");
  const [journalSortDir, setJournalSortDir] = useState<"asc" | "desc">("desc");
  const [journalGroupBy, setJournalGroupBy] = useState<string>("none");
  const [journalGroupSort, setJournalGroupSort] = useState<"asc" | "desc">("asc");
  const [journalPage, setJournalPage] = useState<number>(0);
  const [journalTotal, setJournalTotal] = useState<number>(0);
  const [journalGroups, setJournalGroups] = useState<JournalGroupAgg[]>([]);
  // Which row is expanded to show its full review (single-open).
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  // Entry queued for the "gone gone" delete confirm modal, and the
  // in-flight guard so a double-tap can't double-delete.
  const [deletingEntry, setDeletingEntry] = useState<JournalListEntry | null>(null);
  const [deleteInFlight, setDeleteInFlight] = useState<boolean>(false);
  /// Lazy-loaded detail rows, keyed by entry id. Populated on row
  /// expand; staying in memory across collapses so a re-expand is
  /// free. Cleared on sign-out via the storage-scoped slot mechanism.
  const [journalDetails, setJournalDetails] = useState<Record<string, JournalDetail>>({});
  const [journalDetailLoading, setJournalDetailLoading] = useState<Record<string, boolean>>({});
  // Per-entry share toggle in flight — disables the button so quick
  // taps don't double-fire share_entry.
  const [sharingInFlight, setSharingInFlight] = useState<Record<string, boolean>>({});
  // Leaderboard row expansion: which peer's shared trades are open,
  // and cached payloads keyed by their npub.
  const [expandedPeer, setExpandedPeer] = useState<string | null>(null);
  const [peerShared, setPeerShared] = useState<Record<string, SharedEntry[]>>({});
  const [peerSharedLoading, setPeerSharedLoading] = useState<Record<string, boolean>>({});
  const [peerSharedError, setPeerSharedError] = useState<Record<string, string>>({});
  const [expandedSharedTrade, setExpandedSharedTrade] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  // Save-draft transient state — last server-confirmed save timestamp so
  // the patron can see "Saved 2s ago" feedback.
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  // Gates the "Discard" confirmation — the scenario fee is already
  // spent on external LLM processing and can't be refunded, so we make
  // the patron acknowledge that before throwing the scenario away.
  const [confirmingDiscard, setConfirmingDiscard] = useState<boolean>(false);

  // Tap-to-zoom: any text region on the scenario card can be opened in a
  // nearly full-screen modal at a much larger font, so older eyes don't
  // have to squint at the briefing fine print. The zoomed text remains
  // copyable; closing returns to the card untouched.
  const [zoomedText, setZoomedText] = useState<{ label: string; content: string } | null>(null);
  const [zoomedCopied, setZoomedCopied] = useState<boolean>(false);
  useEffect(() => {
    if (!zoomedText) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setZoomedText(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoomedText]);
  function openZoom(label: string, content: string | undefined | null): void {
    const text = (content ?? "").toString().trim();
    if (!text) return;
    setZoomedCopied(false);
    setZoomedText({ label, content: text });
  }
  function handleCopyZoomed(): void {
    if (!zoomedText) return;
    void navigator.clipboard
      .writeText(`${zoomedText.label}\n\n${zoomedText.content}`)
      .then(() => {
        setZoomedCopied(true);
        window.setTimeout(() => setZoomedCopied(false), 2000);
      })
      .catch(() => {});
  }
  const zoomableStyle: React.CSSProperties = { cursor: "zoom-in" };
  const zoomableTitle = t("game.zoom.title");
  useEffect(() => {
    if (!confirmingDiscard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmingDiscard(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmingDiscard]);
  // Ask-a-Tip Q&A thread for the open scenario. Persisted with the
  // active session so a reload preserves the conversation context.
  const [tips, setTips] = useState<TipExchange[]>([]);
  const [tipsCopied, setTipsCopied] = useState<boolean>(false);
  // Trainee-built option-chain legs. Persisted in active session so
  // closing the chain modal or reloading the page doesn't blow away
  // the structure they were exploring. Reset on nextRound().
  const [proposedLegs, setProposedLegs] = useState<ProposedLeg[]>([]);
  const [tipQuestion, setTipQuestion] = useState<string>("");
  const [tipAsking, setTipAsking] = useState<boolean>(false);
  /// Scroll container for the clue Q&A history. Capped at min(40vh, 360px)
  /// so it never pushes the textarea below the fold; scrolls to the
  /// newest clue automatically whenever a new tip lands.
  const tipsScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (tipsScrollRef.current && tips.length > 0) {
      tipsScrollRef.current.scrollTop = tipsScrollRef.current.scrollHeight;
    }
  }, [tips.length]);
  // Leaderboard state, lazy-loaded when the tab is opened.
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  /// Default leaderboard sort is weighted_avg — a hard pitch scored well
  /// outranks an easy one scored well (diving's DD model). Raw avg / best
  /// stay available so patrons can see the unweighted view.
  const [leaderboardSort, setLeaderboardSort] = useState<
    "weighted_avg" | "weighted_best" | "avg" | "best" | "streak" | "played"
  >("weighted_avg");
  // Profile/Usage state (TaxSort-style transparency view).
  const [apiUsage, setApiUsage] = useState<ApiUsageResult | null>(null);
  const [apiUsageLoading, setApiUsageLoading] = useState<boolean>(false);
  // Effective price preview for the current (mode, difficulty) selection.
  // null = not yet looked up; -1 = lookup failed (e.g. pricing model has no
  // multipliers configured yet). Positive integers are the wheel's authoritative
  // sats cost. Recomputed when either selector changes.
  const [dealPrice, setDealPrice] = useState<number | null>(null);

  // One-shot fetch of the patron's relay list at sign-in so the DM
  // modal can publish without a round-trip per send. Guests skip this —
  // they can't DM anyway. Errors swallowed silently; the modal surfaces
  // an empty-relays state with a "Profile → Nostr Relays" prompt.
  useEffect(() => {
    if (guest) return;
    (async () => {
      // Relays are an ecosystem constant now, not a profile field.
      void getEcosystemRelays().then(setUserRelays).catch(() => { /* fallback covers it */ });
      try {
        const r = await getPatronProfile();
        if (typeof r.profile?.escrowed === "boolean") setEscrowed(r.profile.escrowed);
        if (r.profile?.display_name) setPatronDisplayName(r.profile.display_name);
      } catch {
        /* silent — escrow/name just default */
      }
      // Initial balance check — drives the Sample-Assessment tab
      // surfacing when the patron is at zero.
      void refreshBalance();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest]);

  useEffect(() => {
    (async () => {
      // Scoped to the signed-in npub so switching identities on this
      // browser doesn't leak the prior patron's stats + Journal into
      // the new session. Guests use a "_guest" slot.
      const s = await loadState(getStoredNpub());
      if (s) {
        setStats(s.stats || { played: 0, avg: 0, best: 0, streak: 0 });
      } else {
        // Fresh slot for this npub — clear any in-memory carry-over
        // (e.g. when bouncing between identities without a full reload).
        setStats({ played: 0, avg: 0, best: 0, streak: 0 });
      }

      // localStorage is just a cache for instant render — the server's
      // materialized leaderboard_stats row is the source of truth, so
      // a different browser sees the same career stats. Hydrate from
      // the wheel and overwrite both in-memory state and the cache.
      const me = getStoredNpub();
      if (me && me !== "_guest") {
        try {
          const rank = await getMyRank("avg");
          const ss = rank.stats;
          if (ss) {
            const next: Stats = {
              played: Number(ss.total_played ?? 0),
              avg: Math.round(Number(ss.avg_score ?? 0)),
              best: Number(ss.best_score ?? 0),
              streak: Number(ss.current_streak ?? 0),
            };
            setStats(next);
            await saveState(me, { stats: next });
          }
        } catch {
          // Network / proof / cold-start hiccup — leave the localStorage
          // cache showing. The next mount or post-judge persist() will
          // refresh it.
        }
      }
      // Hydrate active session — the patron paid for this scenario; a
      // page reload must put them back on the same board with their
      // draft answer / evaluation intact.
      const sess = loadSession(getStoredNpub());
      if (sess && sess.scenario) {
        setScenario(sess.scenario);
        setEntryId(sess.entryId);
        setAnswer(sess.answer || "");
        if (sess.evaluation) setEvaluation(sess.evaluation);
        if (sess.mode) setMode(sess.mode);
        if (sess.difficulty) setDifficulty(sess.difficulty);
        if (typeof sess.maxLossUsd === "number") setMaxLossInput(String(sess.maxLossUsd));
        if (typeof sess.sector === "string") setSector(sess.sector);
        if (Array.isArray(sess.tips)) setTips(sess.tips);
        if (Array.isArray(sess.proposedLegs)) setProposedLegs(sess.proposedLegs);
        if (sess.draftSavedAt) setDraftSavedAt(sess.draftSavedAt);
      }
    })();
  }, []);

  // Hydrate the "Scenarios in Preparation" queue on load. Deals left composing
  // on a prior load (reload, dropped connection, closed tab) are picked back up
  // here; the poller-manager below resumes each, which is what settles the
  // detached job and writes its `open` journal entry — so a wandered-off patron
  // returns to a finished assignment, never a lost fare. If exactly one is
  // pending and the Pit is idle, focus it so the reload feels continuous.
  useEffect(() => {
    const me = getStoredNpub();
    if (guest || !me || me === "_guest") return;
    const fresh = prunePending(loadPendingDeals(me), Date.now());
    savePendingDeals(me, fresh); // write back any pruned crumbs
    if (fresh.length === 0) return;
    setPreparing(fresh);
    if (fresh.length === 1 && !loadSession(me)?.scenario) {
      const only = fresh[0];
      setMode(only.mode);
      setDifficulty(only.difficulty);
      if (typeof only.maxLossUsd === "number") setMaxLossInput(String(only.maxLossUsd));
      if (typeof only.sector === "string") setSector(only.sector);
      setLoadingMsg("game.loading.tape");
      setFocusedClaim(only.claimCheck);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The poller manager: one background poller per preparing claim. Polling a
  // claim to terminal is ALSO what settles it server-side (fetch_async_job runs
  // shape_result → open_entry), so these run regardless of which one — if any —
  // is focused. On settle a deal leaves the queue and becomes an `open` journal
  // entry; if it was the focused one, it seats into the Pit so the wait flows
  // straight into pitching (the lone-deal happy path).
  useEffect(() => {
    const me = getStoredNpub();
    if (guest || me === "_guest") return;
    for (const pd of preparing) {
      if (pollersRef.current.has(pd.claimCheck)) continue;
      pollersRef.current.add(pd.claimCheck);
      void (async () => {
        try {
          const result = await resumeDealClaim(pd.claimCheck, pd.startedAt);
          if (result.error) throw new Error(result.error);
          const json = result.scenario;
          json.mode = pd.mode;
          dequeuePreparing(me, pd.claimCheck);
          setJournalEntries([]); // the new `open` entry now tops the Journal
          setJournalPage(0);
          void refreshBalance();
          if (focusedClaimRef.current === pd.claimCheck) {
            seatScenario(json, result.entry_id, pd); // drop the overlay into the Pit
          }
        } catch (e) {
          if (e instanceof ProofRequiredError) {
            // Proof lapsed — KEEP the crumb so a later load (post re-auth) can
            // resume and settle. Just release the poller and drop any overlay.
            pollersRef.current.delete(pd.claimCheck);
            setFocusedClaim((fc) => (fc === pd.claimCheck ? null : fc));
            return;
          }
          // Expired / not-found / genuine failure — the fare was refunded
          // server-side. Drop it from the queue and, if focused, surface why.
          dequeuePreparing(me, pd.claimCheck);
          if (focusedClaimRef.current === pd.claimCheck) {
            setFocusedClaim(null);
            setError(
              e instanceof ClaimCheckError && e.code === "expired"
                ? t("game.error.agedOut")
                : t("game.error.recover", { message: (e as Error).message }),
            );
          }
        } finally {
          pollersRef.current.delete(pd.claimCheck);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preparing, guest]);

  // 1 Hz clock so the Preparation table's elapsed / ETA advance while any deal
  // is composing. Idle (no interval) when the queue is empty.
  const [prepNow, setPrepNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (preparing.length === 0) return;
    const id = window.setInterval(() => setPrepNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [preparing.length]);

  /// Add a just-started deal to the preparation queue (state + storage).
  function enqueuePreparing(npub: string, pd: PendingDeal): void {
    setPreparing((prev) => {
      const next = upsertPending(prev, pd);
      savePendingDeals(npub, next);
      return next;
    });
  }

  /// Remove a settled/failed deal from the preparation queue (state + storage).
  function dequeuePreparing(npub: string, claim: string): void {
    setPreparing((prev) => {
      const next = removePending(prev, claim);
      savePendingDeals(npub, next);
      return next;
    });
  }

  /// Seat a finished scenario into the Pit for pitching, restoring the drill's
  /// mode/difficulty/envelope. Shared by a focused-deal settle and the "Resume"
  /// affordance path.
  function seatScenario(json: Scenario, seatEntryId: string, pd: PendingDeal): void {
    setScenario(json);
    setEntryId(seatEntryId);
    setMode(pd.mode);
    setDifficulty(pd.difficulty);
    if (typeof pd.maxLossUsd === "number") setMaxLossInput(String(pd.maxLossUsd));
    if (typeof pd.sector === "string") setSector(pd.sector);
    setAnswer("");
    setEvaluation(null);
    setFocusedClaim(null);
    setLoading(false);
    setTimeout(() => answerRef.current?.focus(), 100);
  }

  // Persist active session whenever the play state changes. The clear
  // path is `nextRound()`, which removes the row; otherwise this keeps
  // the patron's paid-for scenario alive across reloads.
  useEffect(() => {
    if (!scenario || !entryId) return;
    const parsedMaxLoss = parseInt(maxLossInput, 10);
    saveSession(getStoredNpub(), {
      scenario,
      entryId,
      answer,
      mode,
      difficulty,
      maxLossUsd: Number.isFinite(parsedMaxLoss) && parsedMaxLoss > 0 ? parsedMaxLoss : undefined,
      sector: sector.trim() || undefined,
      evaluation: evaluation ?? undefined,
      tips,
      proposedLegs: proposedLegs.length > 0 ? proposedLegs : undefined,
      draftSavedAt: draftSavedAt ?? undefined,
    });
  }, [scenario, entryId, answer, evaluation, mode, difficulty, maxLossInput, sector, tips, proposedLegs, draftSavedAt]);

  async function persist(nextStats: Stats): Promise<void> {
    // The Journal is server-authoritative via list_journal — only
    // stats are still locally cached so the header chips don't flash
    // empty on each page load.
    await saveState(getStoredNpub(), { stats: nextStats });
  }

  // The "Be Challenged" button handler. Guards the patron's wallet: ignore a
  // click while a start is already in flight (rapid double-taps), and require an
  // explicit confirm before starting an ADDITIONAL paid deal while others are
  // still composing — an impatient patron shouldn't rack up duplicate tolls.
  function onBeChallenged(): void {
    if (startingRef.current) return;
    if (preparing.length > 0) {
      setConfirmDealAnother(true);
      return;
    }
    void generateScenario();
  }

  async function generateScenario(): Promise<void> {
    if (startingRef.current) return; // re-entrancy lock: one toll per intent
    startingRef.current = true;
    setConfirmDealAnother(false);
    setError("");
    // Clear the current board — the new deal becomes the focus. Any unpitched
    // scenario already survives as its own `open` journal entry to resume later.
    setEvaluation(null);
    setAnswer("");
    setScenario(null);
    setEntryId(null);
    setLoadingMsg(mode === "live" ? "game.loading.tape" : "game.loading.wire");
    const startedAt = Date.now();
    const me = getStoredNpub();
    try {
      const parsedMaxLoss = parseInt(maxLossInput, 10);
      const maxLossArg = Number.isFinite(parsedMaxLoss) && parsedMaxLoss > 0 ? parsedMaxLoss : undefined;
      const sectorArg = sector.trim() || undefined;
      // Start the deal but don't block on the (minutes-long) composition — queue
      // the claim and hand it to a background poller. The toll was just debited
      // for requesting the work; the poller settles it into an `open` journal
      // entry whether or not the patron stays on this screen.
      const { claim, expectedSeconds } = await startDeal(mode, difficulty, maxLossArg, sectorArg);
      const pd: PendingDeal = {
        claimCheck: claim,
        mode,
        difficulty,
        startedAt,
        expectedSeconds,
        maxLossUsd: maxLossArg,
        sector: sectorArg,
      };
      enqueuePreparing(me, pd);
      setFocusedClaim(claim); // watch this one compose
      void refreshBalance();
    } catch (e) {
      if (e instanceof ProofRequiredError) {
        onSignOut?.();
        return;
      }
      setError(t("game.error.start", { message: (e as Error).message }));
    } finally {
      startingRef.current = false;
    }
  }

  /// Re-open the "Reading the tape" overlay for the most recently started
  /// preparing scenario (the one an impatient patron most likely wants to see).
  function watchLatestPreparing(): void {
    const latest = [...preparing].sort((a, b) => b.startedAt - a.startedAt)[0];
    if (latest) watchPreparing(latest);
  }

  // Leave the wait and let the assignment finish in the background. It keeps
  // composing (its poller is independent of this overlay); the Journal's
  // "Scenarios in Preparation" table shows it until it's ready, then it settles
  // into an `open` entry to claim. Never cancels, never re-charges.
  function claimInJournal(): void {
    setFocusedClaim(null);
    setJournalEntries([]);
    setJournalPage(0);
    setTab("journal");
  }

  // Re-open the "Reading the tape" overlay for a still-composing scenario picked
  // from the Preparation table.
  function watchPreparing(pd: PendingDeal): void {
    setMode(pd.mode);
    setDifficulty(pd.difficulty);
    if (typeof pd.maxLossUsd === "number") setMaxLossInput(String(pd.maxLossUsd));
    if (typeof pd.sector === "string") setSector(pd.sector);
    setLoadingMsg("game.loading.tape");
    setFocusedClaim(pd.claimCheck);
    setTab("play");
  }

  async function submitTrade(): Promise<void> {
    if (!answer.trim()) {
      setError(t("game.error.typeFirst"));
      return;
    }
    if (!entryId) {
      setError(t("game.error.noScenario"));
      return;
    }
    setError("");
    setLoading(true);
    setLoadingMsg("game.loading.judging");
    try {
      const result = await judgeTrade(entryId, answer);
      if (result.error) throw new Error(result.error);
      const json = result.evaluation;
      setEvaluation(json);

      const score = json.overall_score || 0;
      const newPlayed = stats.played + 1;
      const newAvg = Math.round(((stats.avg * stats.played) + score) / newPlayed);
      const newBest = Math.max(stats.best, score);
      const newStreak = score >= 70 ? stats.streak + 1 : 0;
      const nextStats: Stats = { played: newPlayed, avg: newAvg, best: newBest, streak: newStreak };
      // Server is the source of truth for the Journal now — the wheel
      // already persisted this entry in journal_entries via the
      // judge_trade tool. We invalidate the cached page (and reset to
      // page 0) so the next Journal-tab visit re-fetches with the new
      // entry at the top.
      setJournalEntries([]);
      setJournalPage(0);
      setExpandedEntryId(null);
      setJournalDetails({});
      setStats(nextStats);
      void persist(nextStats);
      // judge_trade was billed at the heavy tier — refresh balance
      // so the Sample-tab affordance (visible only at zero) re-arms.
      void refreshBalance();
    } catch (e) {
      if (e instanceof ProofRequiredError) {
        onSignOut?.();
        return;
      }
      // The scenario in The Pit has no journal entry for this npub — an orphan
      // (e.g. a deal caught mid-redeploy that never persisted, or an entry since
      // deleted). The wheel already refunded the fare; don't strand the patron
      // pitching into a void. Drop the dead board (nextRound clears the session)
      // and send them back to deal a fresh, properly-journaled scenario.
      if (e instanceof ClaimCheckError && e.code === "journal_entry_not_found") {
        nextRound();
        setError(t("game.error.notInJournal"));
        return;
      }
      setError(t("game.error.evaluation", { message: (e as Error).message }));
    } finally {
      setLoading(false);
    }
  }

  function nextRound(): void {
    setEvaluation(null);
    setScenario(null);
    setEntryId(null);
    setAnswer("");
    setError("");
    setTips([]);
    setTipQuestion("");
    setProposedLegs([]);
    setDraftSavedAt(null);
    // User explicitly moved past this card — drop the paid-for session
    // so the next reload lands on the setup screen, not on this stale
    // board. (Pre-judge "Discard, deal another" also flows through here.)
    clearSession(getStoredNpub());
  }

  async function handleSaveDraft(): Promise<void> {
    if (!entryId) { setError(t("game.error.noScenarioToSave")); return; }
    setError("");
    setSavingDraft(true);
    try {
      const res = await saveDraft(entryId, answer);
      if (res.error) throw new Error(res.error);
      setDraftSavedAt(Date.now());
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setError(t("game.error.save", { message: (e as Error).message }));
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleAskTip(): Promise<void> {
    const q = tipQuestion.trim();
    if (!q) return;
    if (!entryId) { setError(t("game.error.acceptFirst")); return; }
    setError("");
    setTipAsking(true);
    try {
      const res = await askTip(entryId, q, tips);
      if (res.error) throw new Error(res.error);
      const answerText = res.tip || "";
      setTips((prev) => [...prev, { ts: Date.now(), question: q, answer: answerText }]);
      setTipQuestion("");
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setError(t("game.error.clue", { message: (e as Error).message }));
    } finally {
      setTipAsking(false);
    }
  }

  // Render one expiration's chain rows into a fenced monospaced text
  // block so it can travel through both the zoom modal (rendered as
  // <pre><code> by RichText) and the clipboard copy.
  function formatChainExpirationText(
    expiration: string,
    dte: number,
    rows: OptionChainRow[],
  ): string {
    const header = `Expiry ${expiration} · ${dte} DTE`;
    const cols = "Strike   Call Mid   ΔC      Put Mid    ΔP";
    const lines = rows.map((r) =>
      [
        r.strike.toFixed(2).padStart(7),
        r.call_mid.toFixed(2).padStart(10),
        r.call_delta.toFixed(2).padStart(7),
        r.put_mid.toFixed(2).padStart(11),
        r.put_delta.toFixed(2).padStart(7),
      ].join("  "),
    );
    return `${header}\n\`\`\`\n${cols}\n${lines.join("\n")}\n\`\`\``;
  }

  function formatChainAllText(chain: OptionChainRow[]): string {
    const byExpiry = new Map<string, { dte: number; rows: OptionChainRow[] }>();
    for (const r of chain) {
      const key = r.expiration;
      let entry = byExpiry.get(key);
      if (!entry) {
        entry = { dte: r.dte, rows: [] };
        byExpiry.set(key, entry);
      }
      entry.rows.push(r);
    }
    return Array.from(byExpiry.entries())
      .sort((a, b) => a[1].dte - b[1].dte)
      .map(([exp, { dte, rows }]) => formatChainExpirationText(exp, dte, rows))
      .join("\n\n");
  }

  // Copy the full scenario briefing + clue conversation to the clipboard
  // so the trainee can continue in their OWN Claude.ai session. The desk
  // can't push a thread into someone's account — this is the honest
  // handoff. We serialize the scenario exactly as the trainee sees it on
  // the card; the grader's answer key (relevant_facts / red_herrings /
  // hidden_considerations) is the unrevealed solution and is left out.
  function handleCopyTips(): void {
    if (tips.length === 0) return;
    const lines: string[] = ["Optionality — options trading scenario"];
    if (scenario) {
      const a = scenario.asset;
      lines.push("");
      lines.push("— The scenario (mine — I purchased this drill) —");
      if (scenario.date_context) lines.push(`Date context: ${scenario.date_context}`);
      if (a) {
        const bits = [
          a.ticker && a.name ? `${a.ticker} — ${a.name}` : a.ticker || a.name,
          a.spot != null ? `spot ${a.spot}` : "",
          a.iv_30d != null ? `IV(30d) ${a.iv_30d}` : "",
          a.iv_rank != null ? `IV rank ${a.iv_rank}` : "",
        ].filter(Boolean);
        if (bits.length) lines.push(`Asset: ${bits.join(" · ")}`);
        if (a.skew_note) lines.push(`Skew note: ${a.skew_note}`);
      }
      if (scenario.macro_backdrop) lines.push(`Macro backdrop: ${scenario.macro_backdrop}`);
      if (scenario.catalyst) lines.push(`Catalyst: ${scenario.catalyst}`);
      if (scenario.key_levels) lines.push(`Key levels: ${scenario.key_levels}`);
      if (scenario.constraints) lines.push(`Constraints: ${scenario.constraints}`);
      if (scenario.sector) lines.push(`Sector focus: ${scenario.sector}`);
      if (scenario.max_loss_usd != null)
        lines.push(`Max-loss budget: $${scenario.max_loss_usd.toLocaleString()}`);
      if (Array.isArray(scenario.sources) && scenario.sources.length > 0)
        lines.push(`Sources: ${scenario.sources.join("; ")}`);
      if (Array.isArray(scenario.option_chain) && scenario.option_chain.length > 0) {
        lines.push("");
        lines.push("Option chain (mid prices and deltas — what was on the card):");
        lines.push(formatChainAllText(scenario.option_chain));
      }
      if (scenario.the_question) lines.push(`The question: ${scenario.the_question}`);
    }
    lines.push("");
    lines.push("— Clue conversation —");
    for (const tip of tips) {
      lines.push(`Q: ${tip.question}`);
      lines.push(`A: ${tip.answer}`);
      lines.push("");
    }
    lines.push("(Paste this into your own Claude.ai session to keep exploring.)");
    void navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => {
        setTipsCopied(true);
        window.setTimeout(() => setTipsCopied(false), 2000);
      })
      .catch(() => {});
  }

  const JOURNAL_PAGE_SIZE = 25;
  // Columns where "first" naturally means newest / highest, so a fresh
  // click on them sorts descending; everything else ascends first.
  const JOURNAL_DESC_FIRST = new Set(["created", "updated", "score"]);

  /// Fetch the current Journal page from the wheel with the active sort /
  /// group / page selection. The BE does the ORDER BY / GROUP BY, so this
  /// returns a slice of the fully-ordered dataset plus the grand total and
  /// per-group counts. Re-runs on every sort/group/page change via effect.
  async function loadJournalPage(): Promise<void> {
    setJournalLoading(true);
    setJournalError("");
    try {
      const r = await listJournal({
        sortCol: journalSortCol,
        sortDir: journalSortDir,
        groupBy: journalGroupBy,
        groupSort: journalGroupSort,
        page: journalPage,
        pageSize: JOURNAL_PAGE_SIZE,
      });
      const entries = Array.isArray(r.entries) ? r.entries : [];
      setJournalEntries(entries);
      setJournalTotal(typeof r.total === "number" ? r.total : entries.length);
      setJournalGroups(Array.isArray(r.groups) ? r.groups : []);
      if (r.error) setJournalError(r.error);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setJournalError((e as Error).message);
    } finally {
      setJournalLoading(false);
    }
  }

  /// Column-header sort (the package's SortHeader picks the column and
  /// direction). Always returns to page 0 so the user lands at the top of
  /// the new ordering.
  function applyJournalSort(col: string, dir: "asc" | "desc"): void {
    setExpandedEntryId(null);
    setJournalSortCol(col);
    setJournalSortDir(dir);
    setJournalPage(0);
  }

  /// Switch the group dimension (or "none"); back to page 0.
  function applyJournalGroupBy(g: string): void {
    setExpandedEntryId(null);
    setJournalGroupBy(g);
    setJournalPage(0);
  }

  /// Hard-delete the queued entry after the "gone gone" confirm. Drops it
  /// from local state, decrements the total, and refetches the current
  /// page (stepping back a page if that page is now empty).
  async function confirmDeleteEntry(): Promise<void> {
    const entry = deletingEntry;
    if (!entry || deleteInFlight) return;
    setDeleteInFlight(true);
    try {
      const r = await deleteJournal(entry.id);
      if (r.error) throw new Error(r.error);
      if (expandedEntryId === entry.id) setExpandedEntryId(null);
      setJournalDetails((prev) => {
        if (!prev[entry.id]) return prev;
        const m = { ...prev };
        delete m[entry.id];
        return m;
      });
      setDeletingEntry(null);
      const remaining = Math.max(0, journalTotal - 1);
      setJournalTotal(remaining);
      const lastPage = Math.max(0, Math.ceil(remaining / JOURNAL_PAGE_SIZE) - 1);
      if (journalPage > lastPage) {
        setJournalPage(lastPage); // param effect refetches the prior page
      } else {
        void loadJournalPage(); // same page — refetch to backfill the gap
      }
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setJournalError((e as Error).message);
    } finally {
      setDeleteInFlight(false);
    }
  }

  /// The full review body shown when a Journal row is expanded — trade,
  /// headline, facts ledger, risk profile, and the status-appropriate
  /// actions (Redo/Share for evaluated, Resume for open). Reused verbatim
  /// from the old <details> layout so an expanded table row reads identically.
  function renderEntryDetail(detail: JournalDetail) {
    return (
      <>
        {detail.trade_proposal && (
          <>
            <h3 className="serif">{t("game.entry.yourTrade")}</h3>
            <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
              <RichText text={detail.trade_proposal} />
            </div>
          </>
        )}
        {detail.evaluation?.headline && (
          <>
            <h3 className="serif">{t("game.entry.headline")}</h3>
            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: "var(--ink)", marginBottom: 12 }}>
              &ldquo;<RichText inline text={detail.evaluation.headline} />&rdquo;
            </div>
          </>
        )}
        {detail.evaluation && (
          <FactsLedger evaluation={detail.evaluation} />
        )}
        {(detail.evaluation?.trade_legs && detail.evaluation.trade_legs.length > 0) && (
          <>
            <h3 className="serif">{t("game.entry.riskProfile")}</h3>
            <RiskProfileChart
              legs={detail.evaluation.trade_legs}
              altLegs={detail.evaluation.alt_trade_legs}
              scenario={detail.scenario ?? null}
            />
          </>
        )}
        {detail.evaluation?.alternative_trade && (
          <>
            <h3 className="serif">{t("game.entry.alternative")}</h3>
            <div className="alt-trade"><RichText text={detail.evaluation.alternative_trade} /></div>
          </>
        )}
        {detail.evaluation?.deeper_context && (
          <>
            <h3 className="serif">{t("game.entry.deeper")}</h3>
            <div className="deeper"><RichText text={detail.evaluation.deeper_context} /></div>
          </>
        )}
        {detail.status === "evaluated" && (
          <div className="actions" style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn"
              onClick={() => { void replayJournalEntry(detail.id); }}
              title={t("game.entry.redoTitle")}
            >
              {t("game.entry.redo")}
            </button>
            <button
              className={`btn ${detail.is_shared ? "" : "btn-ghost"}`}
              onClick={() => { void toggleShareEntry(detail.id, !!detail.is_shared); }}
              disabled={!!sharingInFlight[detail.id]}
              title={detail.is_shared
                ? t("game.entry.sharedTitle")
                : t("game.entry.shareTitle")}
            >
              {sharingInFlight[detail.id]
                ? "…"
                : detail.is_shared
                ? t("game.entry.shared")
                : t("game.entry.share")}
            </button>
            {detail.is_shared && (
              <span style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {t("game.entry.visibleToAll")}
              </span>
            )}
          </div>
        )}
        {detail.status === "open" && (
          <div className="actions" style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() => { resumeOpenEntry(detail); }}
              title={detail.trade_proposal
                ? t("game.entry.resumeDraftTitle")
                : t("game.entry.resumeTitle")}
            >
              {t("game.entry.resume")}
            </button>
          </div>
        )}
        {!detail.evaluation && detail.status !== "evaluated" && detail.status !== "open" && (
          <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic" }}>
            {t("game.entry.noReview", { status: detail.status })}
          </div>
        )}
      </>
    );
  }

  /// Replay an evaluated journal entry as a fresh "mulligan" play.
  /// Calls deal_scenario with replay_entry_id — the wheel reissues
  /// the same scenario JSON under a new entry_id with
  /// mode="historical", difficulty="mulligan". The user lands on
  /// The Pit with the original setup; they pitch a fresh trade.
  async function replayJournalEntry(entryId: string): Promise<void> {
    setError("");
    setEvaluation(null);
    setAnswer("");
    setScenario(null);
    setEntryId(null);
    setTab("play");
    setLoading(true);
    setLoadingMsg("game.loading.reissuing");
    try {
      const result = await dealScenario("historical", "mulligan", undefined, entryId);
      if (result.error) throw new Error(result.error);
      const json = result.scenario as Scenario;
      json.mode = "historical";
      setScenario(json);
      setEntryId(result.entry_id);
      // Force the chooser's mode/difficulty to match what the wheel
      // recorded so any subsequent "Discard, next scenario" returns
      // to the right state for the new play.
      setMode("historical");
      setDifficulty("mulligan");
      setTimeout(() => answerRef.current?.focus(), 100);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setError(t("game.error.replay", { message: (e as Error).message }));
    } finally {
      setLoading(false);
    }
  }

  /// Resume an OPEN journal entry in The Pit. Unlike replay, this does
  /// not deal a new scenario (no toll) — it loads the entry's existing
  /// scenario and any saved draft back into the active session so the
  /// trainee can keep pitching against the same setup and the same
  /// entry_id. The detail is already loaded (the resume affordance only
  /// renders inside an expanded entry), so this is synchronous.
  function resumeOpenEntry(detail: JournalDetail): void {
    if (!detail.scenario) {
      setError(t("game.error.nothingToResume"));
      return;
    }
    setError("");
    setEvaluation(null);
    const scn = { ...detail.scenario, mode: detail.mode } as Scenario;
    setScenario(scn);
    setEntryId(detail.id);
    setAnswer(detail.trade_proposal || "");
    setTips([]);
    setTipQuestion("");
    setProposedLegs([]);
    // Reflect a previously-saved draft if one exists, else clear the chip.
    setDraftSavedAt(
      detail.trade_proposal ? new Date(detail.updated_at).getTime() : null,
    );
    // Align the chooser so a later "Discard, next scenario" returns here.
    setMode(detail.mode);
    setDifficulty(detail.difficulty as Difficulty);
    setTab("play");
    setTimeout(() => answerRef.current?.focus(), 100);
  }

  /// On row expand — fetch the full entry detail (scenario,
  /// evaluation, parsed trade legs). No-op if already cached.
  async function loadJournalDetail(entryId: string): Promise<void> {
    if (journalDetails[entryId] || journalDetailLoading[entryId]) return;
    setJournalDetailLoading((prev) => ({ ...prev, [entryId]: true }));
    try {
      const r = await getJournal(entryId);
      if (r.entry) {
        setJournalDetails((prev) => ({ ...prev, [entryId]: r.entry! }));
      } else if (r.error) {
        setJournalError(r.error);
      }
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setJournalError((e as Error).message);
    } finally {
      setJournalDetailLoading((prev) => {
        const next = { ...prev };
        delete next[entryId];
        return next;
      });
    }
  }

  // Toggle is_shared on one of the patron's evaluated entries.
  // Optimistic — flips the local flag immediately, calls the BE, and
  // reverts on error. Free tool (zero sats).
  async function toggleShareEntry(entryId: string, current: boolean): Promise<void> {
    if (sharingInFlight[entryId]) return;
    const next = !current;
    setSharingInFlight((prev) => ({ ...prev, [entryId]: true }));
    setJournalEntries((prev) =>
      prev.map((r) => (r.id === entryId ? { ...r, is_shared: next } : r)),
    );
    setJournalDetails((prev) =>
      prev[entryId] ? { ...prev, [entryId]: { ...prev[entryId], is_shared: next } } : prev,
    );
    try {
      const r = await shareEntry(entryId, next);
      if (r.error) throw new Error(r.error);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      // Revert on failure.
      setJournalEntries((prev) =>
        prev.map((r) => (r.id === entryId ? { ...r, is_shared: current } : r)),
      );
      setJournalDetails((prev) =>
        prev[entryId] ? { ...prev, [entryId]: { ...prev[entryId], is_shared: current } } : prev,
      );
      setJournalError((e as Error).message);
    } finally {
      setSharingInFlight((prev) => {
        const m = { ...prev };
        delete m[entryId];
        return m;
      });
    }
  }

  // Toggle the row expansion for a peer on the Leaderboard, lazy-loading
  // their shared entries on first open. Public free read.
  async function togglePeerExpansion(peerNpub: string): Promise<void> {
    if (expandedPeer === peerNpub) {
      setExpandedPeer(null);
      return;
    }
    setExpandedPeer(peerNpub);
    setExpandedSharedTrade(null);
    if (peerShared[peerNpub] || peerSharedLoading[peerNpub]) return;
    setPeerSharedLoading((prev) => ({ ...prev, [peerNpub]: true }));
    setPeerSharedError((prev) => {
      const m = { ...prev };
      delete m[peerNpub];
      return m;
    });
    try {
      const r = await getSharedEntries(peerNpub, 20);
      if (r.error) throw new Error(r.error);
      setPeerShared((prev) => ({ ...prev, [peerNpub]: r.entries || [] }));
    } catch (e) {
      setPeerSharedError((prev) => ({ ...prev, [peerNpub]: (e as Error).message }));
    } finally {
      setPeerSharedLoading((prev) => {
        const m = { ...prev };
        delete m[peerNpub];
        return m;
      });
    }
  }

  async function loadLeaderboard(
    sort:
      | "weighted_avg"
      | "weighted_best"
      | "avg"
      | "best"
      | "streak"
      | "played" = leaderboardSort,
  ): Promise<void> {
    setLeaderboardLoading(true);
    try {
      const res = await getLeaderboard(sort);
      setLeaderboard(res);
      setLeaderboardSort(sort);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      console.error("leaderboard load failed", e);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  // Auto-load leaderboard the first time the tab is opened.
  useEffect(() => {
    if (tab === "leaderboard" && leaderboard === null && !leaderboardLoading) {
      void loadLeaderboard("weighted_avg");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // The Sample tab disappears the moment a signed-in patron's
  // balance goes positive — bump them off it if they're parked there.
  // Welcome stays permanently in the tab strip, so no auto-route off.
  useEffect(() => {
    if (!guest && currentBalance !== null && currentBalance > 0 && tab === "sample") {
      replaceTab("play");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBalance, tab, guest]);

  // Auto-route brand-new arrivals to the Welcome panel exactly once
  // per session. Fires for anyone "without money to play":
  //   - Guests (guest === true) — no proof, no sats, just looking
  //   - Signed-in patrons with currentBalance === 0
  // After they navigate away (or top up), we don't force them back;
  // they can return via the Welcome tab button any time.
  useEffect(() => {
    if (welcomeAutoRouted || tab !== "play") return;
    if (guest) {
      replaceTab("welcome");
      setWelcomeAutoRouted(true);
      return;
    }
    if (currentBalance === 0) {
      replaceTab("welcome");
      setWelcomeAutoRouted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBalance, guest]);

  // Guard: a guest who deep-links to a restricted tab (e.g. someone
  // shared an #/journal URL) gets bounced to Welcome rather than
  // landing on a tab their UI strip doesn't even expose.
  useEffect(() => {
    if (!guest) return;
    const allowed: TabId[] = ["welcome", "play", "sample"];
    if (!allowed.includes(tab)) {
      replaceTab("welcome");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, guest]);

  // Auto-load the Journal when the tab opens with an empty cache, or when the
  // cache is invalidated while the tab is open — a fresh trade submission or a
  // background deal settling (both set journalEntries=[]) then surfaces without
  // a manual refresh. Bouncing between tabs with a populated cache doesn't
  // refetch.
  useEffect(() => {
    if (tab === "journal" && journalEntries.length === 0 && !journalLoading) {
      void loadJournalPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, journalEntries.length]);

  // Refetch whenever the sort / group / page selection changes while the
  // Journal tab is open — each change asks the wheel for the matching
  // slice of the fully-ordered dataset.
  useEffect(() => {
    if (tab === "journal") {
      void loadJournalPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalSortCol, journalSortDir, journalGroupBy, journalGroupSort, journalPage]);

  async function loadApiUsage(): Promise<void> {
    setApiUsageLoading(true);
    try {
      const res = await getApiUsageStats();
      setApiUsage(res);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      console.error("usage load failed", e);
    } finally {
      setApiUsageLoading(false);
    }
  }

  // Auto-load the model usage stats on Usage tab open (the ledger cards load
  // themselves).
  useEffect(() => {
    if (tab === "usage") {
      if (apiUsage === null && !apiUsageLoading) void loadApiUsage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Preview the deal_scenario price for the current (mode, difficulty)
  // pair. Re-runs when either selection changes. Skipped while a
  // scenario is active (the patron has already paid for that one).
  useEffect(() => {
    if (scenario || loading) return;
    let cancelled = false;
    (async () => {
      try {
        const fare = await checkPrice("deal_scenario", { mode, difficulty });
        if (cancelled) return;
        setDealPrice(fare ?? -1);
      } catch {
        if (!cancelled) setDealPrice(-1);
      }
    })();
    return () => { cancelled = true; };
  }, [mode, difficulty, scenario, loading]);

  return (
    <div className="opt-root">
      <style>{styles}</style>

      <header className="header">
        <div className="brand">
          OPTIONALITY
          <small>{t("game.brand.tagline")}</small>
        </div>
        <div className="stats">
          <div>{t("game.stats.sessions")}<b>{stats.played}</b></div>
          <div>{t("game.stats.avg")}<b>{stats.avg}</b></div>
          <div>{t("game.stats.best")}<b>{stats.best}</b></div>
          <div>{t("game.stats.streak")}<b>{stats.streak}</b></div>
          {/* Persistent balance + Top Up. Always reachable for signed-in
              patrons (mirrors eXcalibur's Nav wallet affordance) so a
              zero balance always has a one-click recovery path, not just
              the Welcome/Usage screens. Turns rust at zero to pull the eye. */}
          {!guest && (
            <button
              type="button"
              className={`balance-chip${currentBalance === 0 ? " zero" : ""}`}
              onClick={() => setTopUpOpen(true)}
              title={t("game.balance.title")}
            >
              {t("game.balance.label")}
              <b>
                {currentBalance === null ? "—" : currentBalance.toLocaleString()}
                <small>{t("game.balance.sats")}</small>
              </b>
              <span className="balance-chip-cta">{t("game.balance.topUp")}</span>
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              title={t("game.signOut.title")}
              aria-label={t("game.signOut.label")}
              className="tap-icon"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ink-faint)",
                cursor: "pointer",
                alignSelf: "center",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <MaterialIcon path={MI_LOGOUT} size={30} />
            </button>
          )}
        </div>
      </header>

      <div className="tab-bar">
        {/* Welcome tab — mission + how-it's-played + Tollbooth-DPYC
            context. Always visible. Auto-routed once on first arrival
            for anyone "without money to play": guests, and signed-in
            patrons whose balance is zero. Stays available afterwards
            so seasoned patrons can find a refresher. */}
        <button className={`tab ${tab === "welcome" ? "active" : ""}`} onClick={() => setTab("welcome")}>
          <MaterialIcon path={MI_WAVE} size={24} /><span>{t("game.tab.welcome")}</span>
        </button>
        <button className={`tab ${tab === "play" ? "active" : ""}`} onClick={() => setTab("play")}>
          <MaterialIcon path={MI_PERSON} size={24} /><span>{t("game.tab.play")}</span>
        </button>
        {/* Sample Assessment tab — visible for guests AND for signed-in
            patrons who've run their balance to zero. Acts as both
            inspiration ("look what you could have judged") and a
            soft nudge toward Top Up. Disappears as soon as the
            balance is positive again. */}
        {(guest || currentBalance === 0) && (
          <button className={`tab ${tab === "sample" ? "active" : ""}`} onClick={() => setTab("sample")}>
            <MaterialIcon path={MI_EYE} size={24} /><span>{t("game.tab.sample")}</span>
          </button>
        )}
        {!guest && (
          <>
            <button className={`tab ${tab === "journal" ? "active" : ""}`} onClick={() => setTab("journal")}>
              <MaterialIcon path={MI_BOOKS} size={24} /><span>{t("game.tab.journal")}</span>
            </button>
            <button className={`tab ${tab === "leaderboard" ? "active" : ""}`} onClick={() => setTab("leaderboard")}>
              <MaterialIcon path={MI_BARCHART} size={24} /><span>{t("game.tab.leaderboard")}</span>
            </button>
            <button className={`tab ${tab === "usage" ? "active" : ""}`} onClick={() => setTab("usage")}>
              <MaterialIcon path={MI_MONEY} size={24} /><span>{t("game.tab.usage")}</span>
            </button>
            <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
              <MaterialIcon path={MI_GEAR} size={24} /><span>{t("game.tab.profile")}</span>
            </button>
          </>
        )}
      </div>

      <div className="container">
        <Suspense fallback={<div className="loading" style={{ display: "block", padding: "20px 0" }}>{t("game.openingFloor")}</div>}>
        {guest && (
          <div className="panel" style={{ borderLeft: "3px solid var(--amber)", background: "rgba(212,163,91,0.04)" }}>
            <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>{t("game.guest.label")}</div>
            <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>
              <b>
                <Tx ns={WORDS} k="game.guest.welcome" vars={{ id: getGuestId() }}
                  components={{ id: <code style={{ color: "var(--amber-bright)", fontFamily: "JetBrains Mono, monospace" }} /> }} />
              </b>{" "}
              <Tx ns={WORDS} k="game.guest.body" components={{ b: <b /> }} />
              {onSignOut && (
                <>
                  {" "}
                  <button
                    onClick={onSignOut}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--amber-bright)",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                      font: "inherit",
                    }}
                  >
                    {t("game.guest.signIn")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {tab === "play" && (
          <>
            {!scenario && !loading && (
              <div className="panel">
                <span className="panel-label">{t("game.briefing.label")}</span>
                <h2 className="serif">{t("game.briefing.title")}</h2>
                <p className="briefing-prose">{t("game.briefing.prose")}</p>

                <div className="briefing-rule">
                  <span className="rule-mark">§</span>
                  <div>
                    <Tx ns={WORDS} k="game.briefing.integration" components={{ b: <b /> }} />
                  </div>
                </div>

                <div className="briefing-rule warn">
                  <span className="rule-mark">⚑</span>
                  <div>
                    <Tx ns={WORDS} k="game.briefing.herrings" components={{ b: <b /> }} />
                  </div>
                </div>

                <p className="briefing-coda">{t("game.briefing.coda")}</p>

                <div style={{ fontSize: 10, color: "var(--ivory)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 20, marginBottom: 8, fontStyle: "italic" }}>{t("game.chooser.historicity")}</div>
                <div className="difficulty-grid" {...tourTarget("pit.historicity")}>
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      className={`card-base mode-card ${mode === m.id ? "active" : ""}`}
                      onClick={() => setMode(m.id)}
                    >
                      <div className="art"><ModeIcon id={m.id} /></div>
                      <div className="txt">
                        <b>{m.label}</b>
                        <span>{m.blurb}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>{t("game.chooser.persona")}</div>
                <div className="difficulty-grid" {...tourTarget("pit.persona")}>
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      className={`card-base diff-card ${difficulty === d.id ? "active" : ""}`}
                      onClick={() => setDifficulty(d.id)}
                    >
                      <div className="art"><DifficultyAvatar id={d.id} /></div>
                      <div className="txt">
                        <b>{d.label}</b>
                        <span>{d.blurb}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: "var(--rust)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>{t("game.chooser.risk")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }} {...tourTarget("pit.risk")}>
                  <label style={{ fontSize: 12, color: "var(--ink-soft)" }}>{t("game.chooser.maxLoss")}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "var(--ink-faint)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={50}
                      placeholder={t("game.chooser.optional")}
                      value={maxLossInput}
                      className="opt-tap"
                      onChange={(e) => setMaxLossInput(e.target.value)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--panel-edge)",
                        borderRadius: 4,
                        color: "var(--ivory-bright)",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 13,
                        padding: "4px 8px",
                        width: 110,
                      }}
                    />
                  </div>
                  {[250, 1000, 5000, 10000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className="opt-tap"
                      onClick={() => setMaxLossInput(String(v))}
                      style={{
                        background: maxLossInput === String(v) ? "var(--amber-glow)" : "transparent",
                        border: `1px solid ${maxLossInput === String(v) ? "var(--amber)" : "var(--panel-edge)"}`,
                        borderRadius: 4,
                        color: maxLossInput === String(v) ? "var(--amber-bright)" : "var(--ink-soft)",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        padding: "3px 8px",
                        cursor: "pointer",
                      }}
                    >
                      {usd0(v)}
                    </button>
                  ))}
                  {maxLossInput && (
                    <button
                      type="button"
                      className="opt-tap"
                      onClick={() => setMaxLossInput("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--ink-faint)",
                        fontSize: 11,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {t("game.chooser.clear")}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4, fontStyle: "italic" }}>
                  {t("game.chooser.maxLossHint")}
                </div>

                <div style={{ fontSize: 10, color: "var(--rust)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>{t("game.chooser.sector")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }} {...tourTarget("pit.sector")}>
                  {SECTORS.map((s) => {
                    const active = (sector || "") === s.id;
                    return (
                      <button
                        key={s.id || "_any"}
                        type="button"
                        className="opt-tap"
                        onClick={() => setSector(s.id)}
                        title={s.id ? t("game.chooser.sectorLimit", { sector: t(`game.sector.${s.name}` as MessageKey) }) : t("game.chooser.sectorAny")}
                        style={{
                          background: active ? "var(--amber-glow)" : "transparent",
                          border: `1px solid ${active ? "var(--amber)" : "var(--panel-edge)"}`,
                          borderRadius: 4,
                          color: active ? "var(--amber-bright)" : "var(--ink-soft)",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          padding: "4px 9px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span aria-hidden="true" style={{ fontSize: 13 }}>{s.glyph}</span>
                        <span>{t(`game.sector.${s.name}` as MessageKey)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 11, color: "var(--ink-faint)" }}>{t("game.chooser.customSector")}</label>
                  <input
                    type="text"
                    placeholder={t("game.chooser.customExample")}
                    value={SECTORS.some((s) => s.id === sector) ? "" : sector}
                    className="opt-tap"
                    onChange={(e) => setSector(e.target.value)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--panel-edge)",
                      borderRadius: 4,
                      color: "var(--ivory-bright)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      padding: "4px 8px",
                      width: 180,
                    }}
                  />
                  {sector && !SECTORS.some((s) => s.id === sector) && (
                    <button
                      type="button"
                      className="opt-tap"
                      onClick={() => setSector("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--ink-faint)",
                        fontSize: 11,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {t("game.chooser.clear")}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4, fontStyle: "italic" }}>
                  {t("game.chooser.sectorHint")}
                </div>

                <div className="actions">
                  {!guest && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => setTopUpOpen(true)}
                      style={{ marginRight: "auto" }}
                      {...tourTarget("pit.topUp")}
                      title={t("game.topUp.title")}
                    >
                      {t("game.topUp.label")}
                    </button>
                  )}
                  {dealPrice !== null && dealPrice > 0 && (
                    <div {...tourTarget("pit.toll")} style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}>
                      {t("game.toll.label")}
                      <span style={{
                        marginLeft: 8,
                        fontFamily: "Fraunces, serif",
                        fontSize: 18,
                        color: "var(--amber-bright)",
                        fontWeight: 500,
                        letterSpacing: 0,
                        textTransform: "none",
                      }}>
                        {t("game.sats", { count: dealPrice })}
                      </span>
                      <span style={{ marginLeft: 6, color: "var(--ink-faint)", fontSize: 10 }}>
                        ({difficultyLabel(t, difficulty)} × {modeLabel(t, mode)})
                      </span>
                    </div>
                  )}
                  {dealPrice === -1 && (
                    <div style={{ fontSize: 11, color: "var(--ink-faint)", fontStyle: "italic" }}>
                      {t("game.toll.noModel")}
                    </div>
                  )}
                  {guest ? (
                    <button
                      className="btn"
                      onClick={onSignOut}
                      title={t("game.signInToPlayTitle")}
                    >
                      {t("game.signInToPlay")}
                    </button>
                  ) : (
                    <button className="btn" onClick={onBeChallenged} {...tourTarget("pit.deal")}>
                      {preparing.length > 0 ? t("game.deal.another") : t("game.deal.challenge")}
                    </button>
                  )}
                </div>

                {/* An impatient patron shouldn't rack up duplicate paid deals.
                    Surface what's already cooking, and confirm before spending
                    on another. */}
                {!guest && preparing.length > 0 && (
                  <div className="deal-guard">
                    <button
                      type="button"
                      className="deal-guard-live"
                      onClick={watchLatestPreparing}
                      title={t("game.deal.watchTitle")}
                    >
                      <span className="deal-guard-dot" aria-hidden="true" />
                      {t("game.deal.preparing", { count: preparing.length })}
                    </button>
                    {confirmDealAnother && (
                      <div className="deal-guard-confirm">
                        <span>
                          {dealPrice !== null && dealPrice > 0
                            ? t("game.deal.confirmPriced", { price: dealPrice })
                            : t("game.deal.confirm")}
                        </span>
                        <div className="deal-guard-actions">
                          <button className="btn" onClick={() => void generateScenario()}>
                            {t("game.deal.yes")}
                          </button>
                          <button className="btn btn-ghost" onClick={() => setConfirmDealAnother(false)}>
                            {t("game.deal.notYet")}
                          </button>
                        </div>
                      </div>
                    )}
                    <style>{`
                      .deal-guard { margin-top: 12px; }
                      .deal-guard-live { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid var(--amber); border-radius: 8px; background: color-mix(in srgb, var(--amber) 8%, transparent); color: var(--amber); font: inherit; font-size: 13px; cursor: pointer; }
                      .deal-guard-live:hover { background: color-mix(in srgb, var(--amber) 16%, transparent); }
                      .deal-guard-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); animation: deal-guard-pulse 1.4s ease-in-out infinite; }
                      @keyframes deal-guard-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
                      .deal-guard-confirm { margin-top: 10px; font-size: 13px; color: var(--ink-soft, var(--ink-faint)); }
                      .deal-guard-actions { display: flex; gap: 8px; margin-top: 8px; }
                    `}</style>
                  </div>
                )}

                {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}
              </div>
            )}

            {/* Overlays: judging a pitch, watching a focused deal compose, or a
                brief synchronous replay. The deal overlay is driven by
                focusedClaim (not `loading`) so it can persist across the
                minutes-long wait and be re-opened from the Preparation table. */}
            {loading && loadingMsg === "game.loading.judging" ? (
              // Full-viewport immersive scene — see JudgeAnimation.
              <JudgeAnimation />
            ) : (() => {
              const focused = focusedClaim
                ? preparing.find((p) => p.claimCheck === focusedClaim)
                : undefined;
              if (focused) {
                // The status card (claim id, elapsed, ETA, "Claim in Journal")
                // makes the multi-minute wait bearable and walk-away-safe.
                return (
                  <DealAnimation
                    loadingMsg={t(loadingMsg as MessageKey)}
                    mode={focused.mode}
                    status={{
                      claimId: focused.claimCheck,
                      startedAt: focused.startedAt,
                      expectedSeconds: focused.expectedSeconds,
                      assignmentName: `${modeLabel(t, focused.mode)} · ${difficultyLabel(t, focused.difficulty)}`,
                      onClaimInJournal: claimInJournal,
                    }}
                  />
                );
              }
              // A synchronous replay (mulligan) — brief plain animation.
              return loading ? <DealAnimation loadingMsg={t(loadingMsg as MessageKey)} mode={mode} /> : null;
            })()}

            {scenario && !loading && (
              <div className="panel">
                <span className="panel-label">
                  {scenario.asset?.ticker} · {modeLabel(t, scenario.mode || mode)} · {difficultyLabel(t, difficulty)}
                  {scenario.sector && <> · <span style={{ color: "var(--rust)" }}>{scenario.sector}</span></>}
                </span>

                <div className="scenario-grid">
                  {/* LEFT — the facts */}
                  <div {...tourTarget("pit.facts")}>
                    <div className="scenario-meta">
                      <span aria-hidden="true" style={{ marginRight: 6 }}>📅</span>
                      {scenario.date_context}
                    </div>
                    <h2 className="serif">{scenario.asset?.name}</h2>
                    <div
                      className="scenario-quote"
                      style={zoomableStyle}
                      title={zoomableTitle}
                      onClick={() => openZoom(t("game.card.macro"), scenario.macro_backdrop)}
                    >{scenario.macro_backdrop}</div>

                    <div className="data-row" style={{ justifyContent: "center" }}>
                      <div className="data-cell"><label>{t("game.card.spot")}</label><b>${scenario.asset?.spot}</b></div>
                      <div className="data-cell"><label>{t("game.card.iv30")}</label><b>{scenario.asset?.iv_30d}%</b></div>
                      <div className="data-cell"><label>{t("game.card.ivRank")}</label><b>{scenario.asset?.iv_rank}</b></div>
                    </div>
                    {scenario.asset?.skew_note && (
                      <div
                        style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12, cursor: "zoom-in" }}
                        title={zoomableTitle}
                        onClick={() => openZoom(t("game.card.skewNote"), scenario.asset?.skew_note)}
                      >
                        <span style={{ color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>{t("game.card.skew")}</span>
                        {scenario.asset.skew_note}
                      </div>
                    )}

                    {typeof scenario.asset?.spot === "number" && (
                      <SkewGuide
                        ticker={scenario.asset.ticker}
                        name={scenario.asset.name}
                        spot={scenario.asset.spot}
                        iv30d={scenario.asset.iv_30d}
                        ivRank={scenario.asset.iv_rank}
                        iv25dPut={scenario.asset.iv_25d_put}
                        iv25dCall={scenario.asset.iv_25d_call}
                        skewNote={scenario.asset.skew_note}
                      />
                    )}

                    {typeof scenario.asset?.spot === "number" && Array.isArray(scenario.option_chain) && scenario.option_chain.length > 0 && (
                      <div style={{ marginTop: 6, marginBottom: 12 }}>
                        <OptionChainGuide
                          spot={scenario.asset.spot}
                          chain={scenario.option_chain}
                          legs={proposedLegs}
                          onLegsChange={setProposedLegs}
                          ticker={scenario.asset.ticker || ""}
                          ivPct={scenario.asset.iv_30d}
                          scenario={scenario}
                        />
                      </div>
                    )}

                    <h3 className="serif">{t("game.card.catalyst")}</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom(t("game.card.catalyst"), scenario.catalyst)}
                    >{scenario.catalyst}</div>

                    <h3 className="serif">{t("game.card.keyLevels")}</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom(t("game.card.keyLevels"), scenario.key_levels)}
                    >{scenario.key_levels}</div>

                    <h3 className="serif">{t("game.card.constraints")}</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom(t("game.card.constraints"), scenario.constraints)}
                    >{scenario.constraints}</div>

                    {Array.isArray(scenario.sources) && scenario.sources.length > 0 && (
                      <>
                        <h3 className="serif">{t("game.card.sources")}</h3>
                        <ul style={{ listStyle: "none", padding: 0, fontSize: 12, color: "var(--ink-soft)" }}>
                          {scenario.sources.map((s, i) => (
                            <li key={i} style={{ padding: "3px 0 3px 14px", position: "relative" }}>
                              <span style={{ position: "absolute", left: 0, color: "var(--amber)" }}>·</span>
                              {String(s).startsWith("http") ? (
                                <a href={s} target="_blank" rel="noreferrer" style={{ color: "var(--amber)", textDecoration: "none", borderBottom: "1px solid var(--panel-edge)" }}>{s}</a>
                              ) : s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {/* RIGHT — the question + answer (or empty if already judged
                      so the evaluation panel below takes over) */}
                  <div className="scenario-prompt">
                    {!evaluation && (
                      <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 4,
                        marginBottom: 4,
                      }}>
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          disabled={savingDraft || !answer.trim()}
                          title={t("game.pitch.saveTitle")}
                          aria-label={t("game.pitch.save")}
                          className="tap-icon"
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: "2px 6px",
                            cursor: savingDraft || !answer.trim() ? "not-allowed" : "pointer",
                            opacity: savingDraft || !answer.trim() ? 0.4 : 1,
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                        >
                          {savingDraft ? "…" : "💾"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDiscard(true)}
                          title={t("game.pitch.discardTitle")}
                          aria-label={t("game.pitch.discard")}
                          className="tap-icon"
                          style={{
                            background: "transparent",
                            border: "none",
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: 16,
                            lineHeight: 1,
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                    <div
                      className="question"
                      {...tourTarget("pit.question")}
                      style={zoomableStyle}
                      title={zoomableTitle}
                      onClick={() => openZoom(t("game.card.question"), scenario.the_question)}
                    >→ {scenario.the_question}</div>

                    {!evaluation && (
                      <>
                        {/* Pitch composer: textarea with an inset Present
                            button at bottom-right (same affordance as the
                            clue panel's send icon). Discard and Save Draft
                            stay below as ancillary actions. */}
                        <div style={{ position: "relative" }} {...tourTarget("pit.pitch")}>
                          <textarea
                            ref={answerRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder={t("game.pitch.placeholder")}
                            style={{ paddingRight: 56 }}
                          />
                          <button
                            type="button"
                            onClick={submitTrade}
                            disabled={loading || !answer.trim()}
                            title={t("game.pitch.presentTitle")}
                            aria-label={t("game.pitch.present")}
                          className="tap-icon"
                            style={{
                              position: "absolute",
                              right: 8,
                              bottom: 8,
                              background: "transparent",
                              border: "none",
                              padding: "4px 6px",
                              cursor: loading || !answer.trim() ? "not-allowed" : "pointer",
                              opacity: loading || !answer.trim() ? 0.4 : 1,
                              fontSize: 22,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {loading ? "…" : "🙋🏼"}
                          </button>
                        </div>
                        {draftSavedAt && !savingDraft && (
                          <div style={{ fontSize: 11, color: "var(--jade)", marginTop: 8, letterSpacing: "0.1em" }}>
                            {t("game.pitch.saved", { time: formatTime(new Date(draftSavedAt).toISOString(), zone) })}
                          </div>
                        )}
                        {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}

                        {/* Ask-a-Clue — inline Q&A on the scenario card. */}
                        <div style={{ marginTop: 22, borderTop: "1px solid var(--panel-edge)", paddingTop: 14 }} {...tourTarget("pit.clue")}>
                          <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
                            {t("game.clue.heading")}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 8, fontStyle: "italic" }}>
                            <Tx ns={WORDS} k="game.clue.hint" components={{ q: <span style={{ color: "var(--ink-soft)" }} /> }} />
                          </div>

                          {tips.length > 0 && (
                            <>
                              {/* Header bar above the scroll region: share
                                  glyph (iOS outbox/share) copies the clue
                                  conversation to the clipboard so the trainee
                                  can continue it in their own Claude.ai
                                  session. Icon-only by design — the title
                                  carries the explanation on hover. */}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={handleCopyTips}
                                  title={tipsCopied
                                    ? t("game.clue.copied")
                                    : t("game.clue.copyTitle")}
                                  aria-label={t("game.clue.copy")}
                          className="tap-icon"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "2px 6px",
                                    cursor: "pointer",
                                    fontSize: 16,
                                    lineHeight: 1,
                                    color: tipsCopied ? "var(--jade)" : "var(--ink-soft)",
                                  }}
                                >
                                  {tipsCopied ? "✓" : "📤"}
                                </button>
                              </div>
                              <div
                                ref={tipsScrollRef}
                                style={{
                                  // Cap at ~40% of viewport height (or 360px,
                                  // whichever is smaller) so a long Q&A
                                  // history doesn't push the textarea and
                                  // Pitch button below the fold on tall
                                  // sessions. Below the cap, scroll
                                  // internally with newest clue at the
                                  // bottom (auto-scrolled into view).
                                  maxHeight: "min(40vh, 360px)",
                                  overflowY: "auto",
                                  marginBottom: 10,
                                  paddingRight: 4,
                                  scrollBehavior: "smooth",
                                }}
                              >
                                {tips.map((tip, i) => (
                                  <div key={i} style={{ marginBottom: 10, padding: "8px 10px", background: "var(--bg-soft)", borderLeft: "2px solid var(--bronze)" }}>
                                    <div style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 4 }}>
                                      {t("game.clue.q", { question: tip.question })}
                                    </div>
                                    <RichText
                                      text={tip.answer}
                                      style={{ fontSize: 13, color: "var(--ink)" }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Question composer: textarea with an inset send
                              button. Paper plane = send; flying money signals
                              the toll. Icon-only — the title carries the
                              explanation on hover. */}
                          <div style={{ position: "relative" }}>
                            <textarea
                              value={tipQuestion}
                              onChange={(e) => setTipQuestion(e.target.value)}
                              placeholder={t("game.clue.placeholder")}
                              style={{ minHeight: 60, paddingRight: 56 }}
                            />
                            <button
                              type="button"
                              onClick={handleAskTip}
                              disabled={tipAsking || !tipQuestion.trim()}
                              title={tipAsking
                                ? t("game.clue.asking")
                                : t("game.clue.sendTitle")}
                              aria-label={t("game.clue.send")}
                          className="tap-icon"
                              style={{
                                position: "absolute",
                                right: 8,
                                bottom: 8,
                                background: "transparent",
                                border: "none",
                                padding: "4px 6px",
                                cursor: tipAsking || !tipQuestion.trim() ? "not-allowed" : "pointer",
                                opacity: tipAsking || !tipQuestion.trim() ? 0.4 : 1,
                                fontSize: 18,
                                lineHeight: 1,
                                letterSpacing: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {tipAsking ? "…" : "💸✈"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {evaluation && !loading && (
              <div className="panel">
                <span className="panel-label">{t("game.review.label")}</span>
                <div className="score-banner">
                  <div className="grade">{evaluation.letter_grade}</div>
                  <div className="score">{t("game.review.overall")}<b>{evaluation.overall_score} / 100</b></div>
                  <div className="headline">&ldquo;<RichText inline text={evaluation.headline} />&rdquo;</div>
                </div>

                <h3 className="serif">{t("game.review.byDimension")}</h3>
                <div className="dim-grid">
                  {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
                    <div className="dim-card" key={k}>
                      <div className="dim-name">{dimensionLabel(t, k)}</div>
                      <div className="dim-score">{v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span></div>
                      <div className="dim-fb"><RichText text={v.feedback} /></div>
                    </div>
                  ))}
                </div>

                <FactsLedger evaluation={evaluation} />

                <h3 className="serif">{t("game.entry.riskProfile")}</h3>
                <RiskProfileChart
                  legs={evaluation.trade_legs}
                  altLegs={evaluation.alt_trade_legs}
                  scenario={scenario}
                />

                <h3 className="serif">{t("game.review.right")}</h3>
                <ul className="bullet-list good">
                  {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
                </ul>

                <h3 className="serif">{t("game.review.sharpen")}</h3>
                <ul className="bullet-list bad">
                  {(evaluation.what_to_improve || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
                </ul>

                <h3 className="serif">{t("game.review.alternative")}</h3>
                <div className="alt-trade"><RichText text={evaluation.alternative_trade || ""} /></div>

                <h3 className="serif">{t("game.entry.deeper")}</h3>
                <div className="deeper"><RichText text={evaluation.deeper_context || ""} /></div>

                <div className="actions" style={{ marginTop: 22 }}>
                  <button
                    className="btn"
                    onClick={nextRound}
                    title={t("game.review.replayTitle")}
                  >
                    {t("game.review.replay")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "welcome" && (
          <Welcome
            onTopUp={() => (guest ? onSignOut?.() : setTopUpOpen(true))}
            onSeeAssessment={() => setTab("sample")}
            isGuest={guest}
            npub={guest ? null : getStoredNpub()}
            displayName={patronDisplayName}
          />
        )}

        {tab === "sample" && <SampleAssessment />}

        {tab === "usage" && (
          <div className="panel">
            <span className="panel-label">{t("game.ledger.label")}</span>
            <h2 className="serif">{t("game.ledger.title")}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>{t("game.ledger.intro")}</p>
            <UsageSummary
              heading=""
              toolsHeading={t("game.ledger.tools")}
              empty={t("game.ledger.empty")}
              renderRow={(row) => (
                <>
                  <span className="usage-tool">
                    {displayToolName(t, row.tool)}
                    <span className="usage-raw">{row.tool}</span>
                  </span>
                  <span className="usage-calls">{row.calls.toLocaleString()}</span>
                  <span className="usage-sats">{row.sats.toLocaleString()}</span>
                </>
              )}
              classNames={{
                root: "tb-host usage",
                header: "usage-header",
                chip: "btn btn-ghost usage-chip",
                figures: "usage-figures",
                figure: "usage-figure",
                value: "usage-value",
                label: "usage-label",
                subheading: "usage-subheading",
                list: "usage-list",
                row: "usage-row",
                loading: "loading usage-note",
                error: "error",
                empty: "empty",
              }}
            />
            <PatronFundingStatus
              heading={t("game.ledger.health")}
              classNames={{
                root: "tb-host funding",
                header: "usage-header funding-header",
                heading: "usage-subheading",
                overall: "funding-state",
                chip: "btn btn-ghost usage-chip",
                list: "funding-list",
                row: "funding-row",
                dependency: "funding-dep",
                state: "funding-state",
                detail: "funding-detail",
                checked: "funding-checked",
                loading: "loading usage-note",
                error: "error",
                ok: "ok",
                warning: "warn",
                blocked: "blocked",
              }}
            />
          </div>
        )}

        {tab === "usage" && (() => {
          const models: ModelUsage[] = apiUsage?.models ?? [];
          // Prefer what the provider billed. Only fall back to the local rate
          // table for rows written before the cost column existed — and say so,
          // rather than blending a measured number with a guessed one silently.
          const costOf = (m: ModelUsage): { usd: number; reported: boolean } => {
            if (m.total_cost_usd !== null && m.total_cost_usd !== undefined) {
              return { usd: m.total_cost_usd, reported: true };
            }
            const p = priceFor(m.model);
            return {
              usd:
                (m.total_input_tokens / 1_000_000) * p.input +
                (m.total_output_tokens / 1_000_000) * p.output,
              reported: false,
            };
          };

          let totalInputTokens = 0;
          let totalOutputTokens = 0;
          let totalRuns = 0;
          let totalCostUsd = 0;
          let anyEstimated = false;
          for (const m of models) {
            totalInputTokens += m.total_input_tokens;
            totalOutputTokens += m.total_output_tokens;
            totalRuns += m.runs;
            const c = costOf(m);
            totalCostUsd += c.usd;
            if (!c.reported) anyEstimated = true;
          }
          const totalTokens = totalInputTokens + totalOutputTokens;
          const avgCostUsd = totalRuns > 0 ? totalCostUsd / totalRuns : 0;
          const btcPriceUsd = 100_000;
          const estimatedSats = Math.round((totalCostUsd / btcPriceUsd) * 100_000_000);

          return (
            <div className="panel" style={{ position: "relative" }}>
              <RefreshButton
                onRefresh={loadApiUsage}
                busy={apiUsageLoading}
                label={t("game.ai.refresh")}
                icon={<MaterialIcon path={MI_REFRESH} size={30} />}
                classNames={{ root: "icon-btn usage-refresh" }}
              />
              <span className="panel-label">{t("game.ai.label")}</span>
              <h2 className="serif">{t("game.ai.title")}</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>{t("game.ai.intro")}</p>
              <p style={{ color: "var(--ink-faint)", fontSize: 10, marginTop: -10, marginBottom: 16 }}>
                {anyEstimated
                  ? t("game.ai.estimated", { date: PRICING_FETCHED_AT.slice(0, 10) })
                  : t("game.ai.reported")}
              </p>

              {apiUsageLoading && apiUsage === null && (
                <div className="loading" style={{ display: "block", padding: "20px 0" }}>{t("game.ai.tallying")}</div>
              )}

              {apiUsage !== null && models.length === 0 && (
                <div className="empty">{t("game.ai.none")}</div>
              )}

              {apiUsage !== null && models.length > 0 && (
                <>
                  {/* Per-model breakdown */}
                  {models.map((m, i) => {
                    const c = costOf(m);
                    const cost = c.usd;
                    const perRun = m.runs > 0 ? cost / m.runs : 0;
                    return (
                      <div key={i} style={{ background: "var(--bg-soft)", border: "1px solid var(--panel-edge)", padding: "12px 14px", marginBottom: 8 }}>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ink-soft)", marginBottom: 6 }}>
                          {m.model || t("game.ai.unknown")}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, fontSize: 12 }}>
                          <div><span style={{ color: "var(--ink-faint)" }}>{t("game.ai.runs")}</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.runs}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>{t("game.ai.input")}</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.total_input_tokens.toLocaleString()}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>{t("game.ai.output")}</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.total_output_tokens.toLocaleString()}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>{c.reported ? t("game.ai.cost") : t("game.ai.costEst")}</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>${fmt$(cost)}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>{t("game.ai.perCall")}</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>${fmt$(perRun)}</span></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Totals */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
                    <div style={{ background: "rgba(212,163,91,0.06)", border: "1px solid var(--amber)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        {anyEstimated ? t("game.ai.costPartEst") : t("game.ai.costBilled")}
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--amber-bright)", fontWeight: 500 }}>
                        ${fmt$(totalCostUsd)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        {t("game.ai.tokens", { tokens: totalTokens.toLocaleString(), calls: totalRuns.toLocaleString() })}
                      </div>
                    </div>
                    <div style={{ background: "rgba(212,163,91,0.06)", border: "1px solid var(--amber)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        {t("game.ai.costPerCall")}
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--amber-bright)", fontWeight: 500 }}>
                        ${fmt$(avgCostUsd)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        {t("game.ai.averaged")}
                      </div>
                    </div>
                    <div style={{ background: "rgba(107,142,107,0.06)", border: "1px solid var(--jade)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--jade)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        {t("game.ai.sats")}
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--ivory-bright)", fontWeight: 500 }}>
                        {estimatedSats.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        {t("game.ai.atRate", { rate: usd0(btcPriceUsd) })}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 18, fontStyle: "italic", lineHeight: 1.6 }}>
                    {t("game.ai.footnote", { rate: usd0(btcPriceUsd) })}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {tab === "leaderboard" && (
          <div className="panel">
            <span className="panel-label">{t("game.lb.label")}</span>
            <h2 className="serif">{t("game.lb.title")}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              <code style={{ color: "var(--amber-bright)" }}>weighted = raw_score × current_price(mode, difficulty)</code>.{" "}
              {t("game.lb.intro")}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }} {...tourTarget("lb.sort")}>
              {(["weighted_avg", "weighted_best", "avg", "best", "streak", "played"] as const).map((s) => {
                const label = t(`game.lb.sort.${s}` as MessageKey);
                return (
                  <button
                    key={s}
                    className={`btn ${leaderboardSort === s ? "" : "btn-ghost"}`}
                    onClick={() => { void loadLeaderboard(s); }}
                    disabled={leaderboardLoading}
                    style={{ padding: "8px 14px", fontSize: 10 }}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                className="btn btn-ghost"
                onClick={() => { void loadLeaderboard(leaderboardSort); }}
                disabled={leaderboardLoading}
                style={{ padding: "8px 14px", fontSize: 10, marginLeft: "auto" }}
              >
                {leaderboardLoading ? t("game.lb.loading") : t("game.lb.refresh")}
              </button>
            </div>

            {leaderboardLoading && leaderboard === null && (
              <div className="loading" style={{ display: "block", padding: "20px 0" }}>{t("game.loading.tape")}</div>
            )}

            {/* Defensive: wheel returns {success:false, error_code, error}
                on any tool failure path (schema mismatch, billing,
                anything). In that case there's no `rows` field — surface
                the error to the user instead of crashing the tab. */}
            {leaderboard !== null && !Array.isArray((leaderboard as unknown as { rows?: unknown }).rows) && (
              <div className="error">
                {t("game.lb.failed", { error: ((leaderboard as unknown as { error?: string }).error) || t("game.lb.unknownError") })}
              </div>
            )}

            {leaderboard !== null && Array.isArray(leaderboard.rows) && leaderboard.rows.length === 0 && (
              <div className="empty">{t("game.lb.empty")}</div>
            )}

            {leaderboard !== null && Array.isArray(leaderboard.rows) && leaderboard.rows.length > 0 && (
              <div {...tourTarget("lb.table")}>
                <div className="history-row lb-row lb-head" style={{ color: "var(--ink-faint)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  <div>#</div>
                  <div></div>
                  <div>{t("game.lb.trader")}</div>
                  <div style={{ textAlign: "right" }} title={t("game.lb.wavgTitle")}>{t("game.lb.wavg")}</div>
                  <div style={{ textAlign: "right" }} title={t("game.lb.wbestTitle")}>{t("game.lb.wbest")}</div>
                  <div style={{ textAlign: "right" }} title={t("game.lb.avgTitle")}>{t("game.lb.avg")}</div>
                  <div style={{ textAlign: "right" }}>{t("game.lb.streak")}</div>
                  <div style={{ textAlign: "right" }}>{t("game.lb.played")}</div>
                </div>
                {leaderboard.rows.map((row: LeaderboardRow, i: number) => {
                  const isYou = row.npub === getStoredNpub();
                  const isExpanded = expandedPeer === row.npub;
                  const shared = peerShared[row.npub];
                  const sharedLoading = !!peerSharedLoading[row.npub];
                  const sharedError = peerSharedError[row.npub];
                  return (
                    <div key={row.npub}>
                    <div
                      className="history-row lb-row"
                      onClick={() => { void togglePeerExpansion(row.npub); }}
                      style={{
                        background: isYou ? "var(--amber-glow)" : undefined,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title={t("game.lb.rowTitle")}
                    >
                      <div style={{ color: "var(--amber)", fontFamily: "Fraunces, serif", fontSize: 16 }}>
                        <span style={{ display: "inline-block", marginRight: 4, transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 180ms ease", fontSize: 10, color: "var(--ink-faint)" }}>▶</span>
                        {i + 1}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        {/* Click → DM via NIP-07. Self-row clicks open
                            a DM to yourself — useful for verifying the
                            NIP-07 signer + relay path end-to-end
                            without pinging a peer. NIP-04 encryption
                            works on (own_priv, own_pub) ECDH; the DM
                            shows up in your own Nostr client's inbox.
                            stopPropagation so the avatar tap doesn't
                            also expand the row's shared-pitches list. */}
                        <button
                          type="button"
                          className="avatar-dm"
                          onClick={() => setDmTarget({
                            npub: row.npub,
                            displayName: row.display_name,
                            avatar: row.avatar,
                          })}
                          title={
                            isYou
                              ? t("game.lb.dmSelf")
                              : t("game.lb.dm", { name: row.display_name || shortNpub(row.npub) })
                          }
                        >
                          <Avatar value={row.avatar} size={40} />
                        </button>
                      </div>
                      <div className="lb-name" style={{ minWidth: 0 }}>
                        <div style={{ color: "var(--ink)" }}>
                          {row.display_name || t("game.lb.anonymous")}
                          {isYou && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: "var(--amber)", letterSpacing: "0.15em" }}>{t("game.lb.you")}</span>
                          )}
                        </div>
                        <div className="h-date lb-npub" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {shortNpub(row.npub)}{row.last_played_at ? t("game.lb.last", { date: formatDate(row.last_played_at, zone) }) : ""}
                        </div>
                      </div>
                      <div className="lb-break" />
                      <div className="h-score lb-stat" style={{ color: "var(--amber-bright)", fontWeight: 600 }}>
                        <span className="lb-label">{t("game.lb.wavg")}</span>
                        {row.weighted_avg != null ? Number(row.weighted_avg).toFixed(1) : "—"}
                      </div>
                      <div className="h-score lb-stat">
                        <span className="lb-label">{t("game.lb.wbest")}</span>
                        {row.weighted_best != null ? Number(row.weighted_best).toFixed(1) : "—"}
                      </div>
                      <div className="h-score lb-stat" style={{ color: "var(--ink-faint)" }}><span className="lb-label">{t("game.lb.avg")}</span>{row.avg_score}</div>
                      <div className="h-score lb-stat"><span className="lb-label">{t("game.lb.streak")}</span>{row.longest_streak ?? row.current_streak}</div>
                      <div className="h-score lb-stat"><span className="lb-label">{t("game.lb.played")}</span>{row.total_played}</div>
                    </div>

                    {isExpanded && (
                      <div style={{ background: "var(--bg-soft)", borderLeft: "2px solid var(--amber)", padding: "12px 16px 16px 22px", marginBottom: 6 }}>
                        {sharedLoading && (
                          <div className="loading" style={{ display: "block", padding: "12px 0" }}>{t("game.lb.fetching")}</div>
                        )}
                        {sharedError && (
                          <div className="error" style={{ marginTop: 4 }}>{sharedError}</div>
                        )}
                        {!sharedLoading && !sharedError && Array.isArray(shared) && shared.length === 0 && (
                          <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic", padding: "8px 0" }}>
                            {isYou
                              ? t("game.lb.youNone")
                              : t("game.lb.theyNone")}
                          </div>
                        )}
                        {Array.isArray(shared) && shared.length > 0 && (
                          <>
                            <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
                              {isYou ? t("game.lb.yourShared", { count: shared.length }) : t("game.lb.shared", { count: shared.length })}
                            </div>
                            {shared.map((s) => {
                              const open = expandedSharedTrade === s.id;
                              return (
                                <div key={s.id} style={{ marginBottom: 6 }}>
                                  <div
                                    className="history-row lb-shared-row"
                                    onClick={() => setExpandedSharedTrade(open ? null : s.id)}
                                    style={{ cursor: "pointer", gridTemplateColumns: "1fr 80px 80px 64px", padding: "8px 12px", background: open ? "var(--bg)" : undefined }}
                                  >
                                    <div>
                                      <div style={{ color: "var(--ink)" }}>
                                        <span style={{ color: "var(--ink-faint)", marginRight: 8, fontSize: 10 }}>{open ? "▼" : "▶"}</span>
                                        {s.ticker || "—"} <span style={{ color: "var(--ink-faint)", fontSize: 11 }}>· {modeLabel(t, s.mode)} · {difficultyLabel(t, s.difficulty)}</span>
                                      </div>
                                      <div className="h-date">{s.created_at ? formatDateTime(s.created_at, zone) : ""}</div>
                                    </div>
                                    <div className="h-grade">{s.letter_grade ?? "—"}</div>
                                    <div className="h-score">{s.score != null ? `${s.score}/100` : "—"}</div>
                                    <div></div>
                                  </div>
                                  {open && (
                                    <div style={{ padding: "10px 16px 14px", background: "var(--bg)" }}>
                                      {s.trade_proposal && (
                                        <>
                                          <h3 className="serif">{t("game.lb.theirPitch")}</h3>
                                          <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
                                            <RichText text={s.trade_proposal} />
                                          </div>
                                        </>
                                      )}
                                      {s.evaluation?.headline && (
                                        <>
                                          <h3 className="serif">{t("game.entry.headline")}</h3>
                                          <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: "var(--ink)", marginBottom: 12 }}>
                                            &ldquo;<RichText inline text={s.evaluation.headline} />&rdquo;
                                          </div>
                                        </>
                                      )}
                                      {s.evaluation && (
                                        <FactsLedger evaluation={s.evaluation} />
                                      )}
                                      {s.evaluation?.alternative_trade && (
                                        <>
                                          <h3 className="serif">{t("game.lb.houseAlt")}</h3>
                                          <div className="alt-trade"><RichText text={s.evaluation.alternative_trade} /></div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && !guest && <ProfileTab npub={getStoredNpub()} />}

        {tab === "journal" && (
          <div className="panel">
            <span className="panel-label">{t("game.journal.label")}</span>
            <h2 className="serif">{t("game.journal.title")}</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 6, marginBottom: 16 }}>
              {patronDisplayName ? t("game.journal.introNamed", { name: patronDisplayName }) : t("game.journal.intro")}
            </p>

            {preparing.length > 0 && (
              <div className="prep-section">
                <div className="prep-head">
                  <span className="prep-dot" aria-hidden="true" />
                  {t("game.prep.heading", { count: preparing.length })}
                </div>
                <div className="prep-list">
                  {[...preparing]
                    .sort((a, b) => b.startedAt - a.startedAt)
                    .map((pd) => {
                      const elapsed = (prepNow - pd.startedAt) / 1000;
                      const eta = computeEtaLabel(elapsed, pd.expectedSeconds, {
                        left: (clock) => t("clock.left", { clock }),
                        wrapping: t("clock.wrapping"),
                      });
                      const name = `${modeLabel(t, pd.mode)} · ${difficultyLabel(t, pd.difficulty)}`;
                      return (
                        <button
                          key={pd.claimCheck}
                          type="button"
                          className="prep-row"
                          onClick={() => watchPreparing(pd)}
                          title={t("game.prep.rowTitle")}
                        >
                          <span className="prep-name">
                            {name}
                            {pd.sector ? <span className="prep-sector"> · {pd.sector}</span> : null}
                          </span>
                          <span className="prep-meta">
                            <span className="prep-elapsed">{fmtClock(elapsed)}</span>
                            {eta && <span className="prep-eta">{eta}</span>}
                            <span className="prep-claim">{pd.claimCheck.slice(0, 8)}</span>
                          </span>
                          <span className="prep-cta">{t("game.prep.watch")}</span>
                        </button>
                      );
                    })}
                </div>
                <div className="prep-note">
                  {t("game.prep.note")}
                </div>
                <style>{`
                  .prep-section { margin: 4px 0 22px; padding: 14px 16px 12px; border: 1px solid var(--amber); border-radius: 10px; background: color-mix(in srgb, var(--amber) 8%, transparent); }
                  .prep-head { display: flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--amber); margin-bottom: 10px; }
                  .prep-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); animation: prep-pulse 1.4s ease-in-out infinite; }
                  @keyframes prep-pulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
                  .prep-list { display: flex; flex-direction: column; gap: 6px; }
                  .prep-row { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 10px 12px; border: 1px solid var(--line, rgba(255,255,255,0.1)); border-radius: 8px; background: var(--panel); color: var(--ink); cursor: pointer; font: inherit; transition: border-color 0.15s, background 0.15s; }
                  .prep-row:hover { border-color: var(--amber); background: var(--bg-soft); }
                  .prep-name { flex: 1 1 auto; font-family: Fraunces, serif; font-size: 15px; }
                  .prep-sector { color: var(--rust); }
                  .prep-meta { display: flex; align-items: center; gap: 12px; font-variant-numeric: tabular-nums; }
                  .prep-elapsed { font-weight: 600; }
                  .prep-eta { font-size: 12px; color: var(--ink-faint); }
                  .prep-claim { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--ink-faint); }
                  .prep-cta { color: var(--amber); font-size: 13px; white-space: nowrap; }
                  .prep-note { margin-top: 10px; font-size: 12px; color: var(--ink-soft, var(--ink-faint)); font-style: italic; }
                  @media (max-width: 560px) { .prep-row { flex-wrap: wrap; gap: 6px 12px; } .prep-cta { width: 100%; } }
                `}</style>
              </div>
            )}

            {journalLoading && journalEntries.length === 0 && (
              <div className="loading" style={{ display: "block", padding: "20px 0" }}>{t("game.journal.pulling")}</div>
            )}

            {journalError && (
              <div className="error" style={{ marginBottom: 12 }}>{journalError}</div>
            )}

            {!journalLoading && journalEntries.length === 0 && !journalError && (
              <div className="empty">
                {preparing.length > 0
                  ? t("game.journal.emptyPreparing")
                  : t("game.journal.empty")}
              </div>
            )}

            {journalEntries.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("game.journal.groupBy")}</span>
                {JOURNAL_GROUP_OPTIONS.map((g) => (
                  <button
                    key={g}
                    className={`btn ${journalGroupBy === g ? "" : "btn-ghost"}`}
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => applyJournalGroupBy(g)}
                  >
                    {groupOptionLabel(t, g)}
                  </button>
                ))}
                {journalGroupBy !== "none" && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    title={t("game.journal.flipGroups")}
                    onClick={() => { setExpandedEntryId(null); setJournalGroupSort((d) => (d === "asc" ? "desc" : "asc")); setJournalPage(0); }}
                  >
                    {journalGroupSort === "asc" ? t("game.journal.groupsAsc") : t("game.journal.groupsDesc")}
                  </button>
                )}
              </div>
            )}

            {/* Narrow screens hide the column headers (the rows become
                cards), so the same sort is picked here instead. */}
            {journalEntries.length > 0 && (
              <div className="journal-sort-picker" {...tourTarget("journal.sort")}>
                <label htmlFor="journal-sort" style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t("game.journal.sortBy")}</label>
                <select
                  id="journal-sort"
                  value={journalSortCol}
                  onChange={(e) => {
                    const col = e.target.value;
                    applyJournalSort(col, JOURNAL_DESC_FIRST.has(col) ? "desc" : "asc");
                  }}
                >
                  {JOURNAL_SORT_HEADERS.map((h) => (
                    <option key={h.key} value={h.key}>{columnLabel(t, h.key)}</option>
                  ))}
                </select>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px 12px", fontSize: 12 }}
                  title={t("game.journal.flipSort")}
                  aria-label={journalSortDir === "asc" ? t("game.journal.sortedAsc") : t("game.journal.sortedDesc")}
                  onClick={() => applyJournalSort(journalSortCol, journalSortDir === "asc" ? "desc" : "asc")}
                >
                  {journalSortDir === "asc" ? t("game.journal.asc") : t("game.journal.desc")}
                </button>
              </div>
            )}

            {journalEntries.length > 0 && (
              <div className="journal-scroll" {...tourTarget("journal.table")}>
                <div className="journal-table">
                  <div
                    className="history-row journal-row journal-head"
                    style={{ color: "var(--ink-faint)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    <div></div>
                    {JOURNAL_SORT_HEADERS.map((h) => (
                      <SortHeader
                        key={h.key}
                        as="div"
                        label={columnLabel(t, h.key)}
                        col={h.key}
                        activeCol={journalSortCol}
                        dir={journalSortDir}
                        onSort={applyJournalSort}
                        initialDir={JOURNAL_DESC_FIRST.has(h.key) ? "desc" : "asc"}
                        classNames={{ cell: h.align === "right" ? "journal-sort right" : "journal-sort" }}
                      />
                    ))}
                    <div></div>
                  </div>

                  {journalEntries.map((row, i) => {
                    const expanded = expandedEntryId === row.id;
                    const detail = journalDetails[row.id];
                    const detailLoading = !!journalDetailLoading[row.id];
                    const showGroupHeader =
                      journalGroupBy !== "none" &&
                      (i === 0 || journalEntries[i - 1].group_key !== row.group_key);
                    const agg = showGroupHeader
                      ? journalGroups.find((g) => g.key === row.group_key)
                      : undefined;
                    return (
                      <div key={row.id}>
                        {showGroupHeader && (
                          <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "12px 14px 4px", borderTop: i === 0 ? "none" : "1px solid var(--panel-edge)" }}>
                            <span style={{ fontFamily: "Fraunces, serif", color: "var(--amber-bright)", fontSize: 15 }}>
                              {fmtGroupLabel(t, journalGroupBy, row.group_key ?? "")}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                              {agg ? t("game.journal.sessions", { count: agg.count }) : ""}
                              {agg?.avg_score != null ? t("game.journal.avg", { score: Math.round(agg.avg_score) }) : ""}
                            </span>
                          </div>
                        )}
                        <div
                          className="history-row journal-row"
                          onClick={() => {
                            const willOpen = !expanded;
                            setExpandedEntryId(willOpen ? row.id : null);
                            if (willOpen && !detail && !detailLoading) {
                              void loadJournalDetail(row.id);
                            }
                          }}
                          style={{ cursor: "pointer", alignItems: "center", fontSize: 12 }}
                        >
                          <div className="j-caret" style={{ color: "var(--ink-faint)" }}>{expanded ? "▾" : "▸"}</div>
                          <div className="h-ticker j-ticker">{row.ticker || "—"}</div>
                          <div className="j-mode" style={{ color: "var(--ink-soft)" }}>{modeLabel(t, row.mode)}</div>
                          <div className="j-diff" style={{ color: "var(--ink-soft)" }}>{difficultyLabel(t, row.difficulty)}</div>
                          <div className="j-created" style={{ color: "var(--ink-faint)", fontSize: 11 }}><span className="j-label">{columnLabel(t, "created")}</span>{fmtJournalDate(row.created_at, zone)}</div>
                          <div className="j-updated" style={{ color: "var(--ink-faint)", fontSize: 11 }}><span className="j-label">{columnLabel(t, "updated")}</span>{fmtJournalDate(row.updated_at, zone)}</div>
                          <div className="h-grade j-grade" style={{ fontSize: 16 }}>{row.letter_grade ?? "—"}</div>
                          <div className="h-score j-score">{row.score != null ? row.score : "—"}</div>
                          <div className="j-break b1" />
                          <div className="j-status">
                            <span style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{statusLabel(t, row.status)}</span>
                            {row.is_shared && (
                              <span style={{ marginLeft: 6, fontSize: 9, color: "var(--amber)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t("game.journal.sharedTag")}</span>
                            )}
                          </div>
                          <div className="j-act" style={{ textAlign: "right" }}>
                            <button
                              className="j-del"
                              onClick={(e) => { e.stopPropagation(); setDeletingEntry(row); }}
                              title={t("game.journal.deleteTitle")}
                              aria-label={t("game.journal.delete")}
                            >
                              <MaterialIcon path={MI_DELETE} size={16} />
                            </button>
                          </div>
                          <div className="j-break b2" />
                        </div>
                        {expanded && (
                          <div className="journal-detail" style={{ padding: "10px 14px 20px", background: "var(--bg-soft)" }}>
                            {detailLoading && (
                              <div className="loading" style={{ display: "block", padding: "16px 0" }}>{t("game.journal.loadingEntry")}</div>
                            )}
                            {detail && renderEntryDetail(detail)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <PageControls
              page={journalPage}
              pageSize={JOURNAL_PAGE_SIZE}
              total={journalTotal}
              onPage={(p) => { setExpandedEntryId(null); setJournalPage(p); }}
              hideSinglePage
              classNames={{ root: "journal-pager", chip: "btn btn-ghost", label: "journal-pager-label" }}
            />
          </div>
        )}
        </Suspense>
      </div>

      {topUpOpen && (
        <TopUpModal
          onClose={() => setTopUpOpen(false)}
          onBalanceUpdated={(newBalance) => setCurrentBalance(newBalance)}
        />
      )}

      {dmTarget && (
        <DMComposeModal
          target={dmTarget}
          relays={userRelays}
          escrowed={escrowed}
          onClose={() => setDmTarget(null)}
        />
      )}

      {confirmingDiscard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setConfirmingDiscard(false)}
          className="opt-scrim"
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              width: "100%",
              maxWidth: 460,
            }}
            className="opt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "var(--amber-bright)", marginBottom: 14 }}>
              {t("game.discard.title")}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 }}>{t("game.discard.body")}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmingDiscard(false)}>
                {t("game.discard.keep")}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setConfirmingDiscard(false);
                  nextRound();
                }}
              >
                {t("game.discard.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingEntry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => { if (!deleteInFlight) setDeletingEntry(null); }}
          className="opt-scrim"
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              width: "100%",
              maxWidth: 460,
            }}
            className="opt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "var(--amber-bright)", marginBottom: 14 }}>
              {t("game.delete.title")}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 }}>
              <Tx ns={WORDS} k={deletingEntry.letter_grade ? "game.delete.bodyGraded" : "game.delete.body"}
                vars={{ ticker: deletingEntry.ticker || t("game.delete.this"), grade: deletingEntry.letter_grade ?? "" }}
                components={{ b: <strong style={{ color: "var(--ink)" }} /> }} />
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDeletingEntry(null)}
                disabled={deleteInFlight}
              >
                {t("game.delete.keep")}
              </button>
              <button
                className="btn"
                onClick={() => { void confirmDeleteEntry(); }}
                disabled={deleteInFlight}
              >
                {deleteInFlight ? t("game.delete.deleting") : t("game.delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomedText && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setZoomedText(null)}
          className="opt-scrim"
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              width: "min(960px, 100%)",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 22px",
                borderBottom: "1px solid var(--panel-edge)",
                gap: 12,
              }}
            >
              <div
                style={{
                  color: "var(--amber)",
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                {zoomedText.label}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleCopyZoomed}
                  title={zoomedCopied ? t("game.clue.copied") : t("game.zoom.copyTitle")}
                  aria-label={t("game.zoom.copy")}
                          className="tap-icon"
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                    color: zoomedCopied ? "var(--jade)" : "var(--ink-soft)",
                  }}
                >
                  {zoomedCopied ? "✓" : "📋"}
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedText(null)}
                  title={t("game.zoom.closeTitle")}
                  className="tap-icon"
                  aria-label={t("game.zoom.close")}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: 1,
                    color: "var(--ink-soft)",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              style={{
                padding: "22px 28px",
                overflowY: "auto",
                fontSize: 22,
                lineHeight: 1.65,
                color: "var(--ink)",
                fontFamily: "'Fraunces', Georgia, serif",
                userSelect: "text",
                WebkitUserSelect: "text",
              }}
            >
              <RichText text={zoomedText.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
