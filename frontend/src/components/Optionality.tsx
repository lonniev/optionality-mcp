import { useState, useEffect, useRef } from "react";

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
  PersistedState,
  ProposedLeg,
  Scenario,
  Stats,
  TabId,
  TipExchange,
} from "../types";
import {
  askTip,
  checkBalance,
  checkPrice,
  dealScenario,
  deleteJournal,
  getApiUsageStats,
  getJournal,
  getLeaderboard,
  getMyRank,
  getSharedEntries,
  isGuestMode,
  judgeTrade,
  listJournal,
  ProofRequiredError,
  saveDraft,
  shareEntry,
  type CheckBalanceResult,
} from "../lib/mcp";
import type { SharedEntry } from "../types";
import { useHashTab } from "../lib/hashTab";

/// Grid column template for the Journal table: caret · Symbol · Historicity
/// · Difficulty · Created · Updated · Grade · Score · Status · Actions.
/// Fixed widths for the narrow cells; flexible minmax(floor, fr) for the
/// text cells so the table fills its (80%-wide, centered) frame and reflows
/// responsively, falling back to horizontal scroll below the floor widths.
const JOURNAL_COLS =
  "26px minmax(56px,0.8fr) minmax(88px,1fr) minmax(92px,1fr) " +
  "minmax(116px,1.3fr) minmax(116px,1.3fr) 50px 56px minmax(84px,1fr) 50px";

/// Sortable column headers. `key` matches the wheel's `sort_col` whitelist
/// (list_journal); the caret and actions columns aren't sortable.
const JOURNAL_SORT_HEADERS: { key: string; label: string; align?: "right" }[] = [
  { key: "symbol", label: "Symbol" },
  { key: "historicity", label: "Historicity" },
  { key: "difficulty", label: "Difficulty" },
  { key: "created", label: "Created" },
  { key: "updated", label: "Updated" },
  { key: "grade", label: "Grade", align: "right" },
  { key: "score", label: "Score", align: "right" },
  { key: "status", label: "Status" },
];

const JOURNAL_GROUP_OPTIONS: { val: string; label: string }[] = [
  { val: "none", label: "None" },
  { val: "historicity", label: "Historicity" },
  { val: "difficulty", label: "Difficulty" },
  { val: "symbol", label: "Symbol" },
];

/// Compact date+time for the Created / Updated columns.
function fmtJournalDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "2-digit",
    hour: "numeric", minute: "2-digit",
  });
}

/// Display label for a group header. Symbol keys pass through; the
/// lowercase enum keys (mode / difficulty) get Title-cased.
function fmtGroupLabel(groupBy: string, key: string): string {
  if (!key) return "—";
  if (groupBy === "symbol") return key;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// Material Design icon paths (Apache 2.0), 24×24 viewBox — one glyph per
// concept, rendered with currentColor so each inherits its button's color.
const MI_LOGOUT = "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z";
const MI_DELETE = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";
const MI_REFRESH = "M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z";
const MI_CART = "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z";

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
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  optionality_deal_scenario: "Trade Scenario",
  optionality_judge_trade: "Pitch Review",
  optionality_ask_tip: "Clue Request",
  optionality_save_draft: "Save Draft",
  optionality_purchase_credits: "Top Off",
  optionality_check_payment: "Payment Check",
  optionality_check_balance: "Balance Check",
  optionality_check_price: "Price Preview",
  optionality_get_leaderboard: "Leaderboard",
  optionality_get_my_rank: "My Rank",
  optionality_get_journal: "Journal Lookup",
  optionality_list_journal: "Journal List",
  optionality_delete_journal: "Journal Delete",
  optionality_set_display_name: "Display Name",
  optionality_get_api_usage_stats: "API Usage",
  optionality_account_statement: "Account Statement",
  optionality_request_npub_proof: "Sign-In (request)",
  optionality_receive_npub_proof: "Sign-In (verify)",
};

function displayToolName(rawKey: string): string {
  if (TOOL_DISPLAY_NAMES[rawKey]) return TOOL_DISPLAY_NAMES[rawKey];
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
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
import ModeIcon from "./ModeIcon";
import DifficultyAvatar from "./DifficultyAvatar";
import RiskProfileChart from "./RiskProfileChart";
import FactsLedger from "./FactsLedger";
import SampleAssessment from "./SampleAssessment";
import TopOffModal from "./TopOffModal";
import Avatar, { shortNpub } from "./Avatar";
import ProfileTab from "./Profile";
import DMComposeModal from "./DMComposeModal";
import Welcome from "./Welcome";
import DealAnimation from "./DealAnimation";
import JudgeAnimation from "./JudgeAnimation";
import OptionChainGuide from "./OptionChainGuide";
import RichText from "./RichText";
import SkewGuide from "./SkewGuide";
import { getGuestId, getPatronProfile, getStoredNpub } from "../lib/mcp";

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
/// Separate from stats/history. The patron paid for this scenario; it
/// must survive a page reload until they explicitly finish the round.
const SESSION_KEY = "optionality:session:v1";

const DIFFICULTIES: DifficultyDef[] = [
  {
    id: "apprentice",
    label: "Apprentice",
    blurb: "Clean directional setups. Vanilla macro backdrop.",
  },
  {
    id: "journeyman",
    label: "Journeyman",
    blurb: "Volatility regime matters. Earnings, Fed days, single catalysts.",
  },
  {
    id: "adept",
    label: "Adept",
    blurb: "Multi-factor. Cross-asset correlations. Skew and term structure.",
  },
  {
    id: "sovereign",
    label: "Sovereign",
    blurb: "Regime-change era. Monetary debasement, geopolitics, tail hedging.",
  },
];

const MODES: ModeDef[] = [
  {
    id: "historical",
    label: "Historical Fiction",
    blurb: "Anchored to a real moment in market history. Macro real; numbers calibrated.",
  },
  {
    id: "fiction",
    label: "Fiction",
    blurb: "Pure invention. Near-future hypotheticals, counterfactuals, speculative regimes.",
  },
  {
    id: "live",
    label: "Live Events",
    blurb: "Grounded in today's actual market via web search. Real ticker, real catalyst, now.",
  },
];

/// Curated sector chips the patron can constrain the dealer to. Each
/// has a rich options-trading story — concentrated catalysts, distinctive
/// IV regimes, recurring tape patterns — so the LLM has plenty to work
/// with. "" = no constraint, dealer picks freely. The full string is
/// passed verbatim to the dealer prompt so it can be a free-text label
/// (e.g., "luxury goods", "uranium miners") via the inline override.
const SECTORS: ReadonlyArray<{ id: string; label: string; glyph: string }> = [
  { id: "", label: "Any", glyph: "🎲" },
  { id: "biotech", label: "Biotech", glyph: "🧬" },
  { id: "semis", label: "Semis", glyph: "💾" },
  { id: "mega-cap tech", label: "Mega Tech", glyph: "🤖" },
  { id: "banks", label: "Banks", glyph: "🏦" },
  { id: "energy", label: "Energy", glyph: "🛢️" },
  { id: "miners", label: "Miners", glyph: "⛏️" },
  { id: "consumer discretionary", label: "Consumer", glyph: "🛍️" },
  { id: "homebuilders", label: "Homebuilders", glyph: "🏗️" },
  { id: "defense", label: "Defense", glyph: "🛡️" },
  { id: "airlines", label: "Airlines", glyph: "✈️" },
  { id: "crypto-adjacent equities", label: "Crypto Equities", glyph: "₿" },
  { id: "index / ETF", label: "Index/ETF", glyph: "📈" },
];

const DIMENSION_LABELS: Record<string, string> = {
  strategy_selection: "Structure",
  strikes_and_tenor: "Strikes & Tenor",
  risk_reward: "Risk / Reward",
  macro_integration: "Macro Context",
  tail_risk: "Tail Awareness",
  communication: "Communication",
};

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

function loadSession(): ActiveSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

function saveSession(s: ActiveSession): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch (e) {
    console.error("session save failed", e);
  }
}

function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
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
  * { box-sizing: border-box; margin: 0; padding: 0; }
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

  .loading { display: inline-block; padding: 12px 18px; color: var(--amber); font-size: 12px; letter-spacing: 0.3em; text-transform: uppercase; }
  .loading::after { content: ""; animation: dots 1.4s infinite; }
  @keyframes dots { 0%,20%{content:"";} 40%{content:" .";} 60%{content:" . .";} 80%,100%{content:" . . .";} }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .icon-btn { transition: color 0.15s; }
  .icon-btn:hover:not(:disabled) { color: var(--amber-bright); }
  .icon-btn:disabled { cursor: default; }
  .icon-btn.spin:disabled svg { animation: spin 0.8s linear infinite; }

  .error { color: var(--crimson); background: rgba(164,69,58,0.08); border-left: 2px solid var(--crimson); padding: 10px 14px; font-size: 12px; }

  .tab-bar { display:flex; gap:0; border-bottom:1px solid var(--panel-edge); margin-bottom: 20px; max-width: min(1400px, 100%); margin-left:auto; margin-right:auto;}
  .tab { padding: 10px 16px; cursor:pointer; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color: var(--ink-faint); border-bottom:2px solid transparent; background:none; border-top:none; border-left:none; border-right:none; font-family:inherit;}
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
`;

// ============================================================
//  Main component
// ============================================================

interface OptionalityProps {
  onSignOut?: () => void;
}

export default function Optionality({ onSignOut }: OptionalityProps = {}) {
  // Hash-routed tab. Browser back/forward and refresh restore the view.
  // `setTab` is user-initiated and adds a history entry; `replaceTab` is
  // for system-initiated bounces (auto-route, guest guard) and doesn't.
  const { tab, setTab, replaceTab } = useHashTab("play");
  // Guest mode: came in via "Continue as Guest" on the gate. The scenario
  // chooser and briefing render, but every paid surface is suppressed.
  const guest = isGuestMode();
  // Top Off modal — purchases sats from the operator via BTCPay Lightning.
  // Open from the lower-left of the scenario chooser; closed in all other
  // app states so an in-progress scenario doesn't get covered.
  const [topOffOpen, setTopOffOpen] = useState<boolean>(false);
  // DM Compose modal target — clicking an avatar on the leaderboard
  // populates this with that patron's identity; null hides the modal.
  const [dmTarget, setDmTarget] = useState<{
    npub: string;
    displayName?: string | null;
    avatar?: string | null;
  } | null>(null);
  // Sender's preferred Nostr relays — needed when we publish a DM. Loaded
  // once at sign-in from the patron's Profile; refreshed lazily on
  // Profile-tab edits via a Profile-component callback (not wired here
  // for Phase 2 — relays change ~never per session).
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
  const [loadingMsg, setLoadingMsg] = useState<string>("");
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
  const zoomableTitle = "Tap to read this in a larger font";
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
  // DPYC ledger snapshot for the Usage tab — sats balance + per-tool
  // spend today + tranche detail. Loaded on tab open alongside apiUsage.
  const [ledger, setLedger] = useState<CheckBalanceResult | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);
  // Wheel's account_statement — authoritative all-time per-tool spend
  // with real sats. Loaded on Usage tab open. Covers every paid tool,
  // not just Claude-burning ones.
  const [statement, setStatement] = useState<import("../types").AccountStatementResult | null>(null);
  const [statementLoading, setStatementLoading] = useState<boolean>(false);
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
      try {
        const r = await getPatronProfile();
        if (r.profile?.relays) setUserRelays(r.profile.relays);
        if (typeof r.profile?.escrowed === "boolean") setEscrowed(r.profile.escrowed);
        if (r.profile?.display_name) setPatronDisplayName(r.profile.display_name);
      } catch {
        /* silent — DM modal will tell the user if relays are missing */
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
      const sess = loadSession();
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

  // Persist active session whenever the play state changes. The clear
  // path is `nextRound()`, which removes the row; otherwise this keeps
  // the patron's paid-for scenario alive across reloads.
  useEffect(() => {
    if (!scenario || !entryId) return;
    const parsedMaxLoss = parseInt(maxLossInput, 10);
    saveSession({
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

  async function generateScenario(): Promise<void> {
    setError("");
    setEvaluation(null);
    setAnswer("");
    setScenario(null);
    setEntryId(null);
    setLoading(true);
    setLoadingMsg(mode === "live" ? "Reading the tape" : "Tapping the wire");
    try {
      const parsedMaxLoss = parseInt(maxLossInput, 10);
      const maxLossArg = Number.isFinite(parsedMaxLoss) && parsedMaxLoss > 0 ? parsedMaxLoss : undefined;
      const sectorArg = sector.trim() || undefined;
      const result = await dealScenario(mode, difficulty, maxLossArg, undefined, sectorArg);
      if (result.error) throw new Error(result.error);
      const json = result.scenario;
      json.mode = mode;
      setScenario(json);
      setEntryId(result.entry_id);
      setTimeout(() => answerRef.current?.focus(), 100);
      // Toll for deal_scenario was just debited — keep the header
      // chip current and let the Sample-Assessment-at-zero affordance
      // appear or disappear as appropriate.
      void refreshBalance();
    } catch (e) {
      if (e instanceof ProofRequiredError) {
        onSignOut?.();
        return;
      }
      setError("Could not generate scenario. " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitTrade(): Promise<void> {
    if (!answer.trim()) {
      setError("Type your trade first.");
      return;
    }
    if (!entryId) {
      setError("No active scenario — deal a new one first.");
      return;
    }
    setError("");
    setLoading(true);
    setLoadingMsg("Judging your Pitch");
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
      setError("Evaluation failed. " + (e as Error).message);
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
    clearSession();
  }

  async function handleSaveDraft(): Promise<void> {
    if (!entryId) { setError("No active scenario to save against."); return; }
    setError("");
    setSavingDraft(true);
    try {
      const res = await saveDraft(entryId, answer);
      if (res.error) throw new Error(res.error);
      setDraftSavedAt(Date.now());
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setError("Save failed. " + (e as Error).message);
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleAskTip(): Promise<void> {
    const q = tipQuestion.trim();
    if (!q) return;
    if (!entryId) { setError("Accept a challenge before asking for a clue."); return; }
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
      setError("Clue request failed. " + (e as Error).message);
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
    for (const t of tips) {
      lines.push(`Q: ${t.question}`);
      lines.push(`A: ${t.answer}`);
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

  /// Column-header click: flip direction on the active column, else
  /// switch to the new column (descending for newest/highest columns,
  /// ascending otherwise). Always returns to page 0 so the user lands at
  /// the top of the new ordering.
  function applyJournalSort(col: string): void {
    setExpandedEntryId(null);
    if (col === journalSortCol) {
      setJournalSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setJournalSortCol(col);
      setJournalSortDir(JOURNAL_DESC_FIRST.has(col) ? "desc" : "asc");
    }
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
            <h3 className="serif">Your trade</h3>
            <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
              <RichText text={detail.trade_proposal} />
            </div>
          </>
        )}
        {detail.evaluation?.headline && (
          <>
            <h3 className="serif">Headline</h3>
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
            <h3 className="serif">Risk Profile</h3>
            <RiskProfileChart
              legs={detail.evaluation.trade_legs}
              altLegs={detail.evaluation.alt_trade_legs}
              scenario={detail.scenario ?? null}
            />
          </>
        )}
        {detail.evaluation?.alternative_trade && (
          <>
            <h3 className="serif">Alternative</h3>
            <div className="alt-trade"><RichText text={detail.evaluation.alternative_trade} /></div>
          </>
        )}
        {detail.evaluation?.deeper_context && (
          <>
            <h3 className="serif">Deeper context</h3>
            <div className="deeper"><RichText text={detail.evaluation.deeper_context} /></div>
          </>
        )}
        {detail.status === "evaluated" && (
          <div className="actions" style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn"
              onClick={() => { void replayJournalEntry(detail.id); }}
              title="Reissue this scenario as a mulligan — same setup, fresh pitch"
            >
              Redo Again
            </button>
            <button
              className={`btn ${detail.is_shared ? "" : "btn-ghost"}`}
              onClick={() => { void toggleShareEntry(detail.id, !!detail.is_shared); }}
              disabled={!!sharingInFlight[detail.id]}
              title={detail.is_shared
                ? "Currently shared on your Leaderboard row — click to make private"
                : "Share this pitch on your Leaderboard row so peers can compare"}
            >
              {sharingInFlight[detail.id]
                ? "…"
                : detail.is_shared
                ? "✓ Shared"
                : "Share"}
            </button>
            {detail.is_shared && (
              <span style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Visible to all
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
                ? "You have a saved draft — resume in The Pit to finish and pitch it. No new deal, no charge."
                : "Resume this open scenario in The Pit to pitch a trade and get a review. No new deal, no charge."}
            >
              🙋 Resume
            </button>
          </div>
        )}
        {!detail.evaluation && detail.status !== "evaluated" && detail.status !== "open" && (
          <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic" }}>
            {`Entry status: ${detail.status}. No pitch review available.`}
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
    setLoadingMsg("Reissuing the scenario");
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
      setError("Replay failed. " + (e as Error).message);
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
      setError("This entry has no scenario to resume.");
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
  // After they navigate away (or top off), we don't force them back;
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

  // Auto-load the Journal when the tab opens with an empty cache (initial
  // open, or after a fresh trade submission invalidated it). Bouncing
  // between tabs with a populated cache doesn't refetch.
  useEffect(() => {
    if (tab === "journal" && journalEntries.length === 0 && !journalLoading) {
      void loadJournalPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  async function loadLedger(): Promise<void> {
    setLedgerLoading(true);
    try {
      const res = await checkBalance();
      setLedger(res);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      console.error("ledger load failed", e);
    } finally {
      setLedgerLoading(false);
    }
  }

  async function loadStatement(): Promise<void> {
    setStatementLoading(true);
    try {
      const { getAccountStatement } = await import("../lib/mcp");
      const res = await getAccountStatement(30);
      setStatement(res);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      console.error("account_statement load failed", e);
    } finally {
      setStatementLoading(false);
    }
  }

  // Auto-load usage stats + DPYC ledger + account statement on Usage tab open.
  useEffect(() => {
    if (tab === "usage") {
      if (apiUsage === null && !apiUsageLoading) void loadApiUsage();
      if (ledger === null && !ledgerLoading) void loadLedger();
      if (statement === null && !statementLoading) void loadStatement();
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
        const r = await checkPrice("deal_scenario", { mode, difficulty });
        if (cancelled) return;
        const eff = r.effective_cost ?? r.cost
          ?? ((r as unknown as { effective_cost_api_sats?: number }).effective_cost_api_sats)
          ?? ((r as unknown as { base_cost_api_sats?: number }).base_cost_api_sats);
        setDealPrice(typeof eff === "number" ? eff : -1);
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
          <small>Gamified Options Trading Consultant Trainer</small>
        </div>
        <div className="stats">
          <div>Sessions<b>{stats.played}</b></div>
          <div>Avg Score<b>{stats.avg}</b></div>
          <div>Best<b>{stats.best}</b></div>
          <div>Streak<b>{stats.streak}</b></div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign out — clear stored npub and proof token"
              aria-label="Sign out"
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
              <MaterialIcon path={MI_LOGOUT} />
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
        <button className={`tab ${tab === "welcome" ? "active" : ""}`} onClick={() => setTab("welcome")}>Welcome</button>
        <button className={`tab ${tab === "play" ? "active" : ""}`} onClick={() => setTab("play")}>The Pit</button>
        {/* Sample Assessment tab — visible for guests AND for signed-in
            patrons who've run their balance to zero. Acts as both
            inspiration ("look what you could have judged") and a
            soft nudge toward Top Off. Disappears as soon as the
            balance is positive again. */}
        {(guest || currentBalance === 0) && (
          <button className={`tab ${tab === "sample" ? "active" : ""}`} onClick={() => setTab("sample")}>See Assessment</button>
        )}
        {!guest && (
          <>
            <button className={`tab ${tab === "journal" ? "active" : ""}`} onClick={() => setTab("journal")}>Journal</button>
            <button className={`tab ${tab === "leaderboard" ? "active" : ""}`} onClick={() => setTab("leaderboard")}>Leaderboard</button>
            <button className={`tab ${tab === "usage" ? "active" : ""}`} onClick={() => setTab("usage")}>Usage</button>
            <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>Profile</button>
          </>
        )}
      </div>

      <div className="container">
        {guest && (
          <div className="panel" style={{ borderLeft: "3px solid var(--amber)", background: "rgba(212,163,91,0.04)" }}>
            <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>Guest pass</div>
            <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>
              <b>
                Welcome Guest Trader{" "}
                <code style={{ color: "var(--amber-bright)", fontFamily: "JetBrains Mono, monospace" }}>
                  {getGuestId()}
                </code>.
              </b>{" "}
              The site is live but you only can use the free services until you buy some DPYC tokens.
              Visit the <b>Usage</b> tab to see your account and to buy tokens.
              Getting a Challenge, asking for clues, Getting Assessed — these all are paid services but the
              fees are tiny: just a few sats each. Once you have your Nostr credentials, you can Top Off
              here and then work your challenges, save your work in progress, message peers on the
              Leaderboard — and hopefully become more proficient about pitching options trades to
              professional audiences. Welcome.
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
                    Sign in to play →
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
                <span className="panel-label">Briefing</span>
                <h2 className="serif">The desk is open.</h2>
                <p className="briefing-prose">
                  The Firm presents an opportunity: a moment in markets — perhaps real, perhaps invented, perhaps unfolding right now.
                  You&apos;ll see a date, a macro backdrop, an asset, a catalyst, key levels, and the constraints of your book.
                  Read it like a courtroom brief. Then write your trade — structure, strikes, expiry, sizing, and your reasoning, in your own words.
                </p>

                <div className="briefing-rule">
                  <span className="rule-mark">§</span>
                  <div>
                    <b>Integration is rewarded.</b> A strong answer accounts for the political, monetary, and cross-asset facts The Firm put in front of you. The more relevant facts you weave into your thesis, the higher you score — particularly on the Macro Context dimension.
                  </div>
                </div>

                <div className="briefing-rule warn">
                  <span className="rule-mark">⚑</span>
                  <div>
                    <b>Red herrings are planted.</b> The Firm will embed one or two facts that are perfectly true but immaterial to the ideal trade — real-world noise that a trader could reasonably notice and overweight. A skew note may be color, not catalyst. A headline may already be in the tape. A disclosed position may be stale. They aren&apos;t traps in the sense of falsehood; they&apos;re traps in the sense of relevance. Building your thesis on one will cost you points; recognizing it as noise and setting it aside earns you them.
                  </div>
                </div>

                <p className="briefing-coda">
                  Choose your historicity. Choose your persona. Accept the challenge.
                </p>

                <div style={{ fontSize: 10, color: "var(--ivory)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 20, marginBottom: 8, fontStyle: "italic" }}>Historicity</div>
                <div className="difficulty-grid">
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

                <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>Persona</div>
                <div className="difficulty-grid">
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

                <div style={{ fontSize: 10, color: "var(--rust)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>Risk Envelope</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 12, color: "var(--ink-soft)" }}>Max loss per trade:</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: "var(--ink-faint)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>$</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={50}
                      placeholder="optional"
                      value={maxLossInput}
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
                      ${v.toLocaleString()}
                    </button>
                  ))}
                  {maxLossInput && (
                    <button
                      type="button"
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
                      clear
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4, fontStyle: "italic" }}>
                  Optional. When set, The Firm sizes the opportunity&apos;s account and constraints so a well-chosen structure fits your envelope. The judge will score down trades whose worst case exceeds it.
                </div>

                <div style={{ fontSize: 10, color: "var(--rust)", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>Sector Focus</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {SECTORS.map((s) => {
                    const active = (sector || "") === s.id;
                    return (
                      <button
                        key={s.id || "_any"}
                        type="button"
                        onClick={() => setSector(s.id)}
                        title={s.id ? `Limit the dealer to ${s.label}` : "Let the dealer pick any sector"}
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
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <label style={{ fontSize: 11, color: "var(--ink-faint)" }}>or type a custom sector:</label>
                  <input
                    type="text"
                    placeholder="e.g. luxury goods"
                    value={SECTORS.some((s) => s.id === sector) ? "" : sector}
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
                      clear
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4, fontStyle: "italic" }}>
                  Optional. The Firm picks the underlying from the chosen sector and tailors the catalyst, relevant facts, and red herrings to its dynamics.
                </div>

                <div className="actions">
                  {!guest && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => setTopOffOpen(true)}
                      style={{ marginRight: "auto" }}
                      title="Buy sats from the operator via Bitcoin Lightning"
                    >
                      Top Off
                    </button>
                  )}
                  {dealPrice !== null && dealPrice > 0 && (
                    <div style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}>
                      Toll
                      <span style={{
                        marginLeft: 8,
                        fontFamily: "Fraunces, serif",
                        fontSize: 18,
                        color: "var(--amber-bright)",
                        fontWeight: 500,
                        letterSpacing: 0,
                        textTransform: "none",
                      }}>
                        {dealPrice} sat{dealPrice === 1 ? "" : "s"}
                      </span>
                      <span style={{ marginLeft: 6, color: "var(--ink-faint)", fontSize: 10 }}>
                        ({difficulty} × {MODES.find((m) => m.id === mode)?.label.toLowerCase()})
                      </span>
                    </div>
                  )}
                  {dealPrice === -1 && (
                    <div style={{ fontSize: 11, color: "var(--ink-faint)", fontStyle: "italic" }}>
                      Pricing model has no multipliers yet — run reset_pricing_model on this operator.
                    </div>
                  )}
                  {guest ? (
                    <button
                      className="btn"
                      onClick={onSignOut}
                      title="Sign in with your Nostr identity to deal a Trade Scenario"
                    >
                      Sign In to Play
                    </button>
                  ) : (
                    <button className="btn" onClick={generateScenario}>Be Challenged</button>
                  )}
                </div>
                {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}
              </div>
            )}

            {loading &&
              (loadingMsg === "Judging your Pitch" ? (
                // Full-viewport immersive scene — see JudgeAnimation;
                // its fixed overlay paints the full page.
                <JudgeAnimation />
              ) : (
                // Deal / mulligan scene — full-viewport overlay using
                // the login backdrop so the trainee waits inside the
                // institutional setting the Firm is pretending to be.
                <DealAnimation loadingMsg={loadingMsg} mode={mode} />
              ))}

            {scenario && !loading && (
              <div className="panel">
                <span className="panel-label">
                  {scenario.asset?.ticker} · {MODES.find((m) => m.id === (scenario.mode || mode))?.label} · {difficulty}
                  {scenario.sector && <> · <span style={{ color: "var(--rust)" }}>{scenario.sector}</span></>}
                </span>

                <div className="scenario-grid">
                  {/* LEFT — the facts */}
                  <div>
                    <div className="scenario-meta">
                      <span aria-hidden="true" style={{ marginRight: 6 }}>📅</span>
                      {scenario.date_context}
                    </div>
                    <h2 className="serif">{scenario.asset?.name}</h2>
                    <div
                      className="scenario-quote"
                      style={zoomableStyle}
                      title={zoomableTitle}
                      onClick={() => openZoom("Macro Backdrop", scenario.macro_backdrop)}
                    >{scenario.macro_backdrop}</div>

                    <div className="data-row" style={{ justifyContent: "center" }}>
                      <div className="data-cell"><label>Spot</label><b>${scenario.asset?.spot}</b></div>
                      <div className="data-cell"><label>IV 30d</label><b>{scenario.asset?.iv_30d}%</b></div>
                      <div className="data-cell"><label>IV Rank</label><b>{scenario.asset?.iv_rank}</b></div>
                    </div>
                    {scenario.asset?.skew_note && (
                      <div
                        style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12, cursor: "zoom-in" }}
                        title={zoomableTitle}
                        onClick={() => openZoom("Skew Note", scenario.asset?.skew_note)}
                      >
                        <span style={{ color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>Skew · </span>
                        {scenario.asset.skew_note}
                      </div>
                    )}

                    {typeof scenario.asset?.spot === "number" && (
                      <SkewGuide
                        ticker={scenario.asset.ticker}
                        name={scenario.asset.name}
                        spot={scenario.asset.spot}
                        iv30d={scenario.asset.iv_30d}
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

                    <h3 className="serif">Catalyst</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom("Catalyst", scenario.catalyst)}
                    >{scenario.catalyst}</div>

                    <h3 className="serif">Key Levels</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom("Key Levels", scenario.key_levels)}
                    >{scenario.key_levels}</div>

                    <h3 className="serif">Constraints</h3>
                    <div
                      style={{ color: "var(--ink-soft)", fontSize: 13, cursor: "zoom-in" }}
                      title={zoomableTitle}
                      onClick={() => openZoom("Constraints", scenario.constraints)}
                    >{scenario.constraints}</div>

                    {Array.isArray(scenario.sources) && scenario.sources.length > 0 && (
                      <>
                        <h3 className="serif">Sources</h3>
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
                          title="Persist this draft to your Journal entry so it survives a page reload — keep working without losing your pitch"
                          aria-label="Save draft"
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
                          title="Discard this scenario and pick a new one — the scenario fee is non-refundable, so you'll be asked to confirm"
                          aria-label="Discard scenario"
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
                      style={zoomableStyle}
                      title={zoomableTitle}
                      onClick={() => openZoom("The Question", scenario.the_question)}
                    >→ {scenario.the_question}</div>

                    {!evaluation && (
                      <>
                        {/* Pitch composer: textarea with an inset Present
                            button at bottom-right (same affordance as the
                            clue panel's send icon). Discard and Save Draft
                            stay below as ancillary actions. */}
                        <div style={{ position: "relative" }}>
                          <textarea
                            ref={answerRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="e.g. Sell the 30-day 95/90 put spread for 1.20 credit, sized to risk 0.5% of NAV. The Fed's hawkish hold puts a floor under the dollar but the equity is bid on insider buying; collecting premium below the 200d feels asymmetric…"
                            style={{ paddingRight: 56 }}
                          />
                          <button
                            type="button"
                            onClick={submitTrade}
                            disabled={loading || !answer.trim()}
                            title="Present your trade — submit to the senior PM for review and a graded pitch audit"
                            aria-label="Present pitch"
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
                            ✓ Draft saved {new Date(draftSavedAt).toLocaleTimeString()}
                          </div>
                        )}
                        {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}

                        {/* Ask-a-Clue — inline Q&A on the scenario card. */}
                        <div style={{ marginTop: 22, borderTop: "1px solid var(--panel-edge)", paddingTop: 14 }}>
                          <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
                            Ask for a Clue
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 8, fontStyle: "italic" }}>
                            Ask what you like for a small fee. e.g. <span style={{ color: "var(--ink-soft)" }}>"What do you mean by Call Skew?"</span>
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
                                    ? "Copied to clipboard"
                                    : "Copy this clue conversation to your clipboard, to continue in your own Claude.ai session"}
                                  aria-label="Copy conversation to clipboard"
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
                                {tips.map((t, i) => (
                                  <div key={i} style={{ marginBottom: 10, padding: "8px 10px", background: "var(--bg-soft)", borderLeft: "2px solid var(--bronze)" }}>
                                    <div style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 4 }}>
                                      Q · {t.question}
                                    </div>
                                    <RichText
                                      text={t.answer}
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
                              placeholder="Type your question…"
                              style={{ minHeight: 60, paddingRight: 56 }}
                            />
                            <button
                              type="button"
                              onClick={handleAskTip}
                              disabled={tipAsking || !tipQuestion.trim()}
                              title={tipAsking
                                ? "Asking the clue desk…"
                                : "Send this question — small clue fee applies"}
                              aria-label="Send clue question"
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
                <span className="panel-label">Pitch Review</span>
                <div className="score-banner">
                  <div className="grade">{evaluation.letter_grade}</div>
                  <div className="score">Overall<b>{evaluation.overall_score} / 100</b></div>
                  <div className="headline">&ldquo;<RichText inline text={evaluation.headline} />&rdquo;</div>
                </div>

                <h3 className="serif">By Dimension</h3>
                <div className="dim-grid">
                  {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
                    <div className="dim-card" key={k}>
                      <div className="dim-name">{DIMENSION_LABELS[k] || k}</div>
                      <div className="dim-score">{v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span></div>
                      <div className="dim-fb"><RichText text={v.feedback} /></div>
                    </div>
                  ))}
                </div>

                <FactsLedger evaluation={evaluation} />

                <h3 className="serif">Risk Profile</h3>
                <RiskProfileChart
                  legs={evaluation.trade_legs}
                  altLegs={evaluation.alt_trade_legs}
                  scenario={scenario}
                />

                <h3 className="serif">What you got right</h3>
                <ul className="bullet-list good">
                  {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
                </ul>

                <h3 className="serif">What to sharpen</h3>
                <ul className="bullet-list bad">
                  {(evaluation.what_to_improve || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
                </ul>

                <h3 className="serif">An alternative the house would have taken</h3>
                <div className="alt-trade"><RichText text={evaluation.alternative_trade || ""} /></div>

                <h3 className="serif">Deeper context</h3>
                <div className="deeper"><RichText text={evaluation.deeper_context || ""} /></div>

                <div className="actions" style={{ marginTop: 22 }}>
                  <button
                    className="btn"
                    onClick={nextRound}
                    title="Back to the scenario picker"
                  >
                    🔁 Replay
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "welcome" && (
          <Welcome
            onTopOff={() => (guest ? onSignOut?.() : setTopOffOpen(true))}
            onSeeAssessment={() => setTab("sample")}
            isGuest={guest}
            npub={guest ? null : getStoredNpub()}
            displayName={patronDisplayName}
          />
        )}

        {tab === "sample" && <SampleAssessment />}

        {tab === "usage" && (
          <div className="panel" style={{ position: "relative" }}>
            <button
              className="icon-btn spin"
              onClick={() => { void loadLedger(); }}
              disabled={ledgerLoading}
              title="Refresh the ledger"
              aria-label="Refresh the ledger"
              style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--ink-faint)", cursor: "pointer", padding: 4, display: "inline-flex" }}
            >
              <MaterialIcon path={MI_REFRESH} size={20} />
            </button>
            <span className="panel-label">DPYC Ledger</span>
            <h2 className="serif">Sats balance & MCP tool usage</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              Your live balance at Optionality MCP, what you've spent today, and the active
              credit tranches funding it. Tolls are deducted at call time; the operator's
              accounting flushes to Neon after each settle.
            </p>

            {ledgerLoading && ledger === null && (
              <div className="loading" style={{ display: "block", padding: "20px 0" }}>Pulling the ledger</div>
            )}

            {ledger !== null && ledger.error && (
              <div className="error">{ledger.error}</div>
            )}

            {ledger !== null && !ledger.error && (() => {
              const balance = ledger.balance_api_sats ?? 0;
              const deposited = ledger.total_deposited_api_sats ?? 0;
              const consumed = ledger.total_consumed_api_sats ?? 0;
              const expired = ledger.total_expired_api_sats ?? 0;
              // Lifetime per-tool from the wheel's account_statement —
              // authoritative source with REAL sats per tool. Covers
              // every paid tool, not just Claude-burning ones.
              const lifetimeTools = (statement?.tool_usage_all_time ?? [])
                .map((t) => ({
                  tool: t.tool,
                  calls: t.calls,
                  sats: t.api_sats,
                }))
                .sort((a, b) => b.sats - a.sats);
              const lifetimeCalls = lifetimeTools.reduce((s, r) => s + r.calls, 0);
              const lifetimeSats = lifetimeTools.reduce((s, r) => s + r.sats, 0);

              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
                    <div style={{ background: "rgba(212,163,91,0.06)", border: "1px solid var(--amber)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Balance
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--amber-bright)", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        {balance.toLocaleString()}
                        <button
                          className="icon-btn"
                          onClick={() => setTopOffOpen(true)}
                          title="Top off — buy sats from the operator via Bitcoin Lightning"
                          aria-label="Top off sats"
                          style={{ background: "transparent", border: "none", color: "var(--amber)", cursor: "pointer", padding: 2, display: "inline-flex" }}
                        >
                          <MaterialIcon path={MI_CART} size={30} />
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        sats · {ledger.active_tranches ?? 0} tranche{(ledger.active_tranches ?? 0) === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div style={{ background: "var(--bg-soft)", border: "1px solid var(--panel-edge)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Deposited
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "var(--ink)" }}>
                        {deposited.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ background: "var(--bg-soft)", border: "1px solid var(--panel-edge)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--ink-soft)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Consumed
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "var(--ink)" }}>
                        {consumed.toLocaleString()}
                      </div>
                    </div>
                    {expired > 0 && (
                      <div style={{ background: "var(--bg-soft)", border: "1px solid var(--panel-edge)", padding: 16 }}>
                        <div style={{ fontSize: 10, color: "var(--rust)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                          Expired
                        </div>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 20, color: "var(--rust)" }}>
                          {expired.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {ledger.expiring_within_24h_sats && ledger.expiring_within_24h_sats > 0 && (
                    <div style={{ background: "rgba(184,85,58,0.06)", border: "1px solid var(--rust)", borderLeft: "3px solid var(--rust)", padding: 12, fontSize: 12, marginBottom: 14 }}>
                      <b>{ledger.expiring_within_24h_sats.toLocaleString()} sats</b> expire within 24 hours.
                      {ledger.next_expiration_iso && <> Next expiration: {new Date(ledger.next_expiration_iso).toLocaleString()}.</>}
                    </div>
                  )}

                  <h3 className="serif">MCP tool usage — all time</h3>
                  <p style={{ color: "var(--ink-faint)", fontSize: 11, marginTop: -4, marginBottom: 12 }}>
                    Every paid tool you've ever called at this operator, with the sats actually charged. Source: the wheel's <code>account_statement</code> ledger.
                  </p>
                  {statementLoading && lifetimeTools.length === 0 ? (
                    <div className="loading" style={{ display: "block", padding: "12px 0" }}>Fetching statement</div>
                  ) : lifetimeTools.length === 0 ? (
                    <div className="empty">No paid tool calls recorded yet.</div>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--panel-edge)", color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 10 }}>
                          <th style={{ textAlign: "left", padding: "8px 6px" }}>Tool</th>
                          <th style={{ textAlign: "right", padding: "8px 6px" }}>Calls</th>
                          <th style={{ textAlign: "right", padding: "8px 6px" }}>Sats</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lifetimeTools.map((r) => (
                          <tr key={r.tool} style={{ borderBottom: "1px solid var(--panel-edge)" }}>
                            <td style={{ padding: "8px 6px", color: "var(--ink)" }}>
                              {displayToolName(r.tool)}
                              <span style={{ marginLeft: 8, color: "var(--ink-faint)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                                {r.tool}
                              </span>
                            </td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--ink-soft)" }}>{r.calls.toLocaleString()}</td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>{r.sats.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: "2px solid var(--panel-edge)", fontWeight: 600 }}>
                          <td style={{ padding: "8px 6px", color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 10 }}>Lifetime</td>
                          <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{lifetimeCalls.toLocaleString()}</td>
                          <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>{lifetimeSats.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {tab === "usage" && (() => {
          const models: ModelUsage[] = apiUsage?.models ?? [];
          let totalInputTokens = 0;
          let totalOutputTokens = 0;
          let totalRuns = 0;
          let estimatedCostUsd = 0;
          for (const m of models) {
            totalInputTokens += m.total_input_tokens;
            totalOutputTokens += m.total_output_tokens;
            totalRuns += m.runs;
            const p = priceFor(m.model);
            estimatedCostUsd +=
              (m.total_input_tokens / 1_000_000) * p.input +
              (m.total_output_tokens / 1_000_000) * p.output;
          }
          const totalTokens = totalInputTokens + totalOutputTokens;
          const btcPriceUsd = 100_000;
          const estimatedSats = Math.round((estimatedCostUsd / btcPriceUsd) * 100_000_000);

          return (
            <div className="panel" style={{ position: "relative" }}>
              <button
                className="icon-btn spin"
                onClick={() => { void loadApiUsage(); }}
                disabled={apiUsageLoading}
                title="Refresh API usage"
                aria-label="Refresh API usage"
                style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--ink-faint)", cursor: "pointer", padding: 4, display: "inline-flex" }}
              >
                <MaterialIcon path={MI_REFRESH} size={20} />
              </button>
              <span className="panel-label">Usage</span>
              <h2 className="serif">Claude API usage & estimated cost</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
                Optionality calls Anthropic's Claude for every scenario, clue, and verdict.
                {" "}This is what your tool calls have spent in tokens — and what those tokens
                {" "}cost the operator at Anthropic's published rates. Your toll covers this plus operator overhead.
                {" "}No hidden margin.
              </p>
              <p style={{ color: "var(--ink-faint)", fontSize: 10, marginTop: -10, marginBottom: 16 }}>
                Rates via OpenRouter pass-through, fetched {PRICING_FETCHED_AT.slice(0, 10)}.
              </p>

              {apiUsageLoading && apiUsage === null && (
                <div className="loading" style={{ display: "block", padding: "20px 0" }}>Tallying the receipts</div>
              )}

              {apiUsage !== null && models.length === 0 && (
                <div className="empty">No model calls recorded yet. Accept a challenge.</div>
              )}

              {apiUsage !== null && models.length > 0 && (
                <>
                  {/* Per-model breakdown */}
                  {models.map((m, i) => {
                    const p = priceFor(m.model);
                    const cost =
                      (m.total_input_tokens / 1_000_000) * p.input +
                      (m.total_output_tokens / 1_000_000) * p.output;
                    return (
                      <div key={i} style={{ background: "var(--bg-soft)", border: "1px solid var(--panel-edge)", padding: "12px 14px", marginBottom: 8 }}>
                        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ink-soft)", marginBottom: 6 }}>
                          {m.model || "unknown"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, fontSize: 12 }}>
                          <div><span style={{ color: "var(--ink-faint)" }}>Runs:</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.runs}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>Input:</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.total_input_tokens.toLocaleString()}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>Output:</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{m.total_output_tokens.toLocaleString()}</span></div>
                          <div><span style={{ color: "var(--ink-faint)" }}>Cost:</span>{" "}<span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>${fmt$(cost)}</span></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Totals */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
                    <div style={{ background: "rgba(212,163,91,0.06)", border: "1px solid var(--amber)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Estimated Anthropic cost
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--amber-bright)", fontWeight: 500 }}>
                        ${fmt$(estimatedCostUsd)}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        {totalTokens.toLocaleString()} tokens across {totalRuns} model calls
                      </div>
                    </div>
                    <div style={{ background: "rgba(107,142,107,0.06)", border: "1px solid var(--jade)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--jade)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Equivalent in sats
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--ivory-bright)", fontWeight: 500 }}>
                        {estimatedSats.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }}>
                        at ~${btcPriceUsd.toLocaleString()}/BTC
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 18, fontStyle: "italic", lineHeight: 1.6 }}>
                    Operator passes the AI cost through to patrons via Lightning micropayments.
                    {" "}This view is the raw transparency — you see what each scenario, tip, and
                    {" "}verdict cost in real tokens, plus a sats estimate at a $100K/BTC reference.
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {tab === "leaderboard" && (
          <div className="panel">
            <span className="panel-label">Leaderboard</span>
            <h2 className="serif">Sovereign traders, sorted by skill</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              <code style={{ color: "var(--amber-bright)" }}>weighted = raw_score × current_price(mode, difficulty)</code>.
              The pricing model is the single dial: a hard, expensive pitch scored well
              outranks a cheap one scored well. When the operator retunes a multiplier
              (mulligan, sovereign, anything), the next leaderboard recompute reflects the
              new weights for every entry — no snapshot to drift. Default sort is the
              weighted average; raw scores available too.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {(["weighted_avg", "weighted_best", "avg", "best", "streak", "played"] as const).map((s) => {
                const label =
                  s === "weighted_avg" ? "Weighted Avg" :
                  s === "weighted_best" ? "Weighted Best" :
                  s === "avg" ? "Raw Avg" :
                  s === "best" ? "Raw Best" :
                  s === "streak" ? "Streak" : "Played";
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
                {leaderboardLoading ? "Loading…" : "Refresh"}
              </button>
            </div>

            {leaderboardLoading && leaderboard === null && (
              <div className="loading" style={{ display: "block", padding: "20px 0" }}>Reading the tape</div>
            )}

            {/* Defensive: wheel returns {success:false, error_code, error}
                on any tool failure path (schema mismatch, billing,
                anything). In that case there's no `rows` field — surface
                the error to the user instead of crashing the tab. */}
            {leaderboard !== null && !Array.isArray((leaderboard as unknown as { rows?: unknown }).rows) && (
              <div className="error">
                Leaderboard didn't load.{" "}
                {((leaderboard as unknown as { error?: string }).error) || "Unknown error."}
              </div>
            )}

            {leaderboard !== null && Array.isArray(leaderboard.rows) && leaderboard.rows.length === 0 && (
              <div className="empty">No judged trades yet. Be the first.</div>
            )}

            {leaderboard !== null && Array.isArray(leaderboard.rows) && leaderboard.rows.length > 0 && (
              <div>
                <div className="history-row" style={{ gridTemplateColumns: "40px 56px 1fr 84px 84px 60px 60px 60px", color: "var(--ink-faint)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  <div>#</div>
                  <div></div>
                  <div>Trader</div>
                  <div style={{ textAlign: "right" }} title="Weighted average — raw score × difficulty multiplier">W·Avg</div>
                  <div style={{ textAlign: "right" }} title="Weighted best single pitch">W·Best</div>
                  <div style={{ textAlign: "right" }} title="Raw average across all evaluated pitches">Avg</div>
                  <div style={{ textAlign: "right" }}>Streak</div>
                  <div style={{ textAlign: "right" }}>Played</div>
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
                      className="history-row"
                      onClick={() => { void togglePeerExpansion(row.npub); }}
                      style={{
                        gridTemplateColumns: "40px 56px 1fr 84px 84px 60px 60px 60px",
                        background: isYou ? "var(--amber-glow)" : undefined,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title="Click to see this trader's shared pitches"
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
                        <Avatar
                          value={row.avatar}
                          size={40}
                          onClick={() => setDmTarget({
                            npub: row.npub,
                            displayName: row.display_name,
                            avatar: row.avatar,
                          })}
                          title={
                            isYou
                              ? "DM yourself — test the relay path"
                              : `DM ${row.display_name || shortNpub(row.npub)}`
                          }
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: "var(--ink)" }}>
                          {row.display_name || "Anonymous"}
                          {isYou && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: "var(--amber)", letterSpacing: "0.15em" }}>YOU</span>
                          )}
                        </div>
                        <div className="h-date" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                          {shortNpub(row.npub)}{row.last_played_at ? `  ·  last: ${new Date(row.last_played_at).toLocaleDateString()}` : ""}
                        </div>
                      </div>
                      <div className="h-score" style={{ color: "var(--amber-bright)", fontWeight: 600 }}>
                        {row.weighted_avg != null ? Number(row.weighted_avg).toFixed(1) : "—"}
                      </div>
                      <div className="h-score">
                        {row.weighted_best != null ? Number(row.weighted_best).toFixed(1) : "—"}
                      </div>
                      <div className="h-score" style={{ color: "var(--ink-faint)" }}>{row.avg_score}</div>
                      <div className="h-score">{row.longest_streak ?? row.current_streak}</div>
                      <div className="h-score">{row.total_played}</div>
                    </div>

                    {isExpanded && (
                      <div style={{ background: "var(--bg-soft)", borderLeft: "2px solid var(--amber)", padding: "12px 16px 16px 22px", marginBottom: 6 }}>
                        {sharedLoading && (
                          <div className="loading" style={{ display: "block", padding: "12px 0" }}>Fetching shared pitches</div>
                        )}
                        {sharedError && (
                          <div className="error" style={{ marginTop: 4 }}>{sharedError}</div>
                        )}
                        {!sharedLoading && !sharedError && Array.isArray(shared) && shared.length === 0 && (
                          <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic", padding: "8px 0" }}>
                            {isYou
                              ? "You haven't shared any pitches yet. Open one of your evaluated journal entries and tap Share."
                              : "This trader hasn't shared any pitches yet."}
                          </div>
                        )}
                        {Array.isArray(shared) && shared.length > 0 && (
                          <>
                            <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
                              {isYou ? "Your shared pitches" : "Shared pitches"} · {shared.length}
                            </div>
                            {shared.map((s) => {
                              const open = expandedSharedTrade === s.id;
                              return (
                                <div key={s.id} style={{ marginBottom: 6 }}>
                                  <div
                                    className="history-row"
                                    onClick={() => setExpandedSharedTrade(open ? null : s.id)}
                                    style={{ cursor: "pointer", gridTemplateColumns: "1fr 80px 80px 64px", padding: "8px 12px", background: open ? "var(--bg)" : undefined }}
                                  >
                                    <div>
                                      <div style={{ color: "var(--ink)" }}>
                                        <span style={{ color: "var(--ink-faint)", marginRight: 8, fontSize: 10 }}>{open ? "▼" : "▶"}</span>
                                        {s.ticker || "—"} <span style={{ color: "var(--ink-faint)", fontSize: 11 }}>· {s.mode} · {s.difficulty}</span>
                                      </div>
                                      <div className="h-date">{s.created_at ? new Date(s.created_at).toLocaleString() : ""}</div>
                                    </div>
                                    <div className="h-grade">{s.letter_grade ?? "—"}</div>
                                    <div className="h-score">{s.score != null ? `${s.score}/100` : "—"}</div>
                                    <div></div>
                                  </div>
                                  {open && (
                                    <div style={{ padding: "10px 16px 14px", background: "var(--bg)" }}>
                                      {s.trade_proposal && (
                                        <>
                                          <h3 className="serif">Their pitch</h3>
                                          <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
                                            <RichText text={s.trade_proposal} />
                                          </div>
                                        </>
                                      )}
                                      {s.evaluation?.headline && (
                                        <>
                                          <h3 className="serif">Headline</h3>
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
                                          <h3 className="serif">House alternative</h3>
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
            <span className="panel-label">Journal</span>
            <h2 className="serif">Your study room</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 6, marginBottom: 16 }}>
              Welcome to your study room{patronDisplayName ? `, ${patronDisplayName}` : ""}. Here you can
              review your prior proposals, reread your assessments, and pick up and resume any pitches
              that you started but had to set aside.
            </p>

            {journalLoading && journalEntries.length === 0 && (
              <div className="loading" style={{ display: "block", padding: "20px 0" }}>Pulling sessions</div>
            )}

            {journalError && (
              <div className="error" style={{ marginBottom: 12 }}>{journalError}</div>
            )}

            {!journalLoading && journalEntries.length === 0 && !journalError && (
              <div className="empty">No sessions yet. Deal your first Trade Scenario.</div>
            )}

            {journalEntries.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Group by</span>
                {JOURNAL_GROUP_OPTIONS.map((g) => (
                  <button
                    key={g.val}
                    className={`btn ${journalGroupBy === g.val ? "" : "btn-ghost"}`}
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => applyJournalGroupBy(g.val)}
                  >
                    {g.label}
                  </button>
                ))}
                {journalGroupBy !== "none" && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    title="Flip the order of the groups"
                    onClick={() => { setExpandedEntryId(null); setJournalGroupSort((d) => (d === "asc" ? "desc" : "asc")); setJournalPage(0); }}
                  >
                    Groups {journalGroupSort === "asc" ? "▲" : "▼"}
                  </button>
                )}
              </div>
            )}

            {journalEntries.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <div style={{ width: "80%", minWidth: 760, margin: "0 auto" }}>
                  <div
                    className="history-row"
                    style={{ gridTemplateColumns: JOURNAL_COLS, color: "var(--ink-faint)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    <div></div>
                    {JOURNAL_SORT_HEADERS.map((h) => (
                      <div
                        key={h.key}
                        onClick={() => applyJournalSort(h.key)}
                        title={`Sort by ${h.label.toLowerCase()}`}
                        style={{ cursor: "pointer", userSelect: "none", textAlign: h.align ?? "left" }}
                      >
                        {h.label}{journalSortCol === h.key ? (journalSortDir === "asc" ? " ▲" : " ▼") : ""}
                      </div>
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
                              {fmtGroupLabel(journalGroupBy, row.group_key ?? "")}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                              {agg ? `${agg.count} ${agg.count === 1 ? "session" : "sessions"}` : ""}
                              {agg?.avg_score != null ? ` · avg ${Math.round(agg.avg_score)}` : ""}
                            </span>
                          </div>
                        )}
                        <div
                          className="history-row"
                          onClick={() => {
                            const willOpen = !expanded;
                            setExpandedEntryId(willOpen ? row.id : null);
                            if (willOpen && !detail && !detailLoading) {
                              void loadJournalDetail(row.id);
                            }
                          }}
                          style={{ gridTemplateColumns: JOURNAL_COLS, cursor: "pointer", alignItems: "center", fontSize: 12 }}
                        >
                          <div style={{ color: "var(--ink-faint)" }}>{expanded ? "▾" : "▸"}</div>
                          <div className="h-ticker">{row.ticker || "—"}</div>
                          <div style={{ color: "var(--ink-soft)" }}>{row.mode}</div>
                          <div style={{ color: "var(--ink-soft)" }}>{row.difficulty}</div>
                          <div style={{ color: "var(--ink-faint)", fontSize: 11 }}>{fmtJournalDate(row.created_at)}</div>
                          <div style={{ color: "var(--ink-faint)", fontSize: 11 }}>{fmtJournalDate(row.updated_at)}</div>
                          <div className="h-grade" style={{ fontSize: 16 }}>{row.letter_grade ?? "—"}</div>
                          <div className="h-score">{row.score != null ? row.score : "—"}</div>
                          <div>
                            <span style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{row.status}</span>
                            {row.is_shared && (
                              <span style={{ marginLeft: 6, fontSize: 9, color: "var(--amber)", letterSpacing: "0.12em", textTransform: "uppercase" }}>· shared</span>
                            )}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingEntry(row); }}
                              title="Delete this session — permanent"
                              aria-label="Delete session"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--ink-faint)", display: "inline-flex", opacity: 0.7 }}
                            >
                              <MaterialIcon path={MI_DELETE} size={16} />
                            </button>
                          </div>
                        </div>
                        {expanded && (
                          <div style={{ padding: "10px 14px 20px", background: "var(--bg-soft)" }}>
                            {detailLoading && (
                              <div className="loading" style={{ display: "block", padding: "16px 0" }}>Loading entry</div>
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

            {journalTotal > JOURNAL_PAGE_SIZE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 14, fontSize: 12, color: "var(--ink-faint)", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: "3px 9px" }} disabled={journalPage === 0} onClick={() => { setExpandedEntryId(null); setJournalPage(0); }} title="First page">⏮</button>
                  <button className="btn btn-ghost" style={{ padding: "3px 9px" }} disabled={journalPage === 0} onClick={() => { setExpandedEntryId(null); setJournalPage((p) => Math.max(0, p - 1)); }}>← Prev</button>
                </div>
                <span>Page {journalPage + 1} of {Math.ceil(journalTotal / JOURNAL_PAGE_SIZE)} · {journalTotal} total</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: "3px 9px" }} disabled={journalPage >= Math.ceil(journalTotal / JOURNAL_PAGE_SIZE) - 1} onClick={() => { setExpandedEntryId(null); setJournalPage((p) => p + 1); }}>Next →</button>
                  <button className="btn btn-ghost" style={{ padding: "3px 9px" }} disabled={journalPage >= Math.ceil(journalTotal / JOURNAL_PAGE_SIZE) - 1} onClick={() => { setExpandedEntryId(null); setJournalPage(Math.ceil(journalTotal / JOURNAL_PAGE_SIZE) - 1); }} title="Last page">⏭</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {topOffOpen && (
        <TopOffModal
          onClose={() => setTopOffOpen(false)}
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
            padding: 20,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setConfirmingDiscard(false)}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              padding: "26px 28px",
              width: "100%",
              maxWidth: 460,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "var(--amber-bright)", marginBottom: 14 }}>
              Discard this scenario?
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 }}>
              Discarding allows you to choose a new scenario. Unfortunately, because each
              scenario involves monetized external LLM processing, your fee for the scenario you
              have cannot be refunded. Are you sure you want to give up on this scenario and
              choose another?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => setConfirmingDiscard(false)}>
                Keep this scenario
              </button>
              <button
                className="btn"
                onClick={() => {
                  setConfirmingDiscard(false);
                  nextRound();
                }}
              >
                Discard &amp; choose another
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
            padding: 20,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => { if (!deleteInFlight) setDeletingEntry(null); }}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              padding: "26px 28px",
              width: "100%",
              maxWidth: 460,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: "var(--amber-bright)", marginBottom: 14 }}>
              Delete this session — gone gone?
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 }}>
              You're about to permanently delete your{" "}
              <strong style={{ color: "var(--ink)" }}>{deletingEntry.ticker || "this"}</strong>{" "}
              session{deletingEntry.letter_grade ? ` (graded ${deletingEntry.letter_grade})` : ""}.
              The scenario, your pitch, the review, the score, and any leaderboard standing it
              earned are <strong style={{ color: "var(--ink)" }}>erased for good</strong> — this
              cannot be undone, and there is no recovering it later.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDeletingEntry(null)}
                disabled={deleteInFlight}
              >
                Keep it
              </button>
              <button
                className="btn"
                onClick={() => { void confirmDeleteEntry(); }}
                disabled={deleteInFlight}
              >
                {deleteInFlight ? "Deleting…" : "Delete forever"}
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
            padding: 16,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setZoomedText(null)}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--amber)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
              width: "min(960px, 96vw)",
              maxHeight: "92vh",
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
                  title={zoomedCopied ? "Copied to clipboard" : "Copy this text to your clipboard"}
                  aria-label="Copy text to clipboard"
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
                  title="Close (Esc)"
                  aria-label="Close"
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
