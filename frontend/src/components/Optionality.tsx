import { useState, useEffect, useRef } from "react";

import type {
  ActiveSession,
  ApiUsageResult,
  Difficulty,
  DifficultyDef,
  Evaluation,
  JournalDetail,
  JournalListEntry,
  LeaderboardResult,
  LeaderboardRow,
  Mode,
  ModeDef,
  ModelUsage,
  PersistedState,
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
  getApiUsageStats,
  getJournal,
  getLeaderboard,
  isGuestMode,
  judgeTrade,
  listJournal,
  ProofRequiredError,
  saveDraft,
  type CheckBalanceResult,
} from "../lib/mcp";
import { annotate } from "../lib/annotate";

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

// Anthropic per-million-token pricing for the models Optionality uses.
// Mirrors taxsort's ProfilePage so the math is identical across our
// transparency surfaces.
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  "claude-sonnet-4-6-20250514": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 1, output: 5 },
};
const DEFAULT_PRICING = { input: 3, output: 15 };

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
import { getPatronProfile, getStoredNpub } from "../lib/mcp";

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

const DIMENSION_LABELS: Record<string, string> = {
  strategy_selection: "Structure",
  strikes_and_tenor: "Strikes & Tenor",
  risk_reward: "Risk / Reward",
  macro_integration: "Macro Context",
  tail_risk: "Tail Awareness",
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
  const [tab, setTab] = useState<TabId>("play");
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
  const [mode, setMode] = useState<Mode>("historical");
  const [difficulty, setDifficulty] = useState<Difficulty>("journeyman");
  // Per-trade max-loss envelope in USD. Empty string = no constraint.
  // Some trainees reason more crisply about a $250 trade than a $10,000
  // version of the same setup; this lets them shape the scenario.
  const [maxLossInput, setMaxLossInput] = useState<string>("");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ played: 0, avg: 0, best: 0, streak: 0 });
  // Journal — server-authoritative, paginated. The wheel's list_journal
  // returns lightweight summary rows; expanding a row triggers a lazy
  // get_journal fetch for the full entry detail (scenario, evaluation,
  // trade legs). Cursor-based pagination via the ISO created_at of the
  // last row in the current page; the BE caps at 200 per fetch and the
  // FE defaults to PAGE_SIZE per page so the tab opens fast even with
  // thousands of sessions in Neon.
  const [journalEntries, setJournalEntries] = useState<JournalListEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState<boolean>(false);
  const [journalLoadingMore, setJournalLoadingMore] = useState<boolean>(false);
  const [journalEnd, setJournalEnd] = useState<boolean>(false);
  const [journalError, setJournalError] = useState<string>("");
  /// Lazy-loaded detail rows, keyed by entry id. Populated on row
  /// expand; staying in memory across collapses so a re-expand is
  /// free. Cleared on sign-out via the storage-scoped slot mechanism.
  const [journalDetails, setJournalDetails] = useState<Record<string, JournalDetail>>({});
  const [journalDetailLoading, setJournalDetailLoading] = useState<Record<string, boolean>>({});
  const [entryId, setEntryId] = useState<string | null>(null);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  // Save-draft transient state — last server-confirmed save timestamp so
  // the patron can see "Saved 2s ago" feedback.
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  // Ask-a-Tip Q&A thread for the open scenario. Persisted with the
  // active session so a reload preserves the conversation context.
  const [tips, setTips] = useState<TipExchange[]>([]);
  const [tipQuestion, setTipQuestion] = useState<string>("");
  const [tipAsking, setTipAsking] = useState<boolean>(false);
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
      } catch {
        /* silent — DM modal will tell the user if relays are missing */
      }
    })();
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
        if (Array.isArray(sess.tips)) setTips(sess.tips);
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
      evaluation: evaluation ?? undefined,
      tips,
      draftSavedAt: draftSavedAt ?? undefined,
    });
  }, [scenario, entryId, answer, evaluation, mode, difficulty, maxLossInput, tips, draftSavedAt]);

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
      const result = await dealScenario(mode, difficulty, maxLossArg);
      if (result.error) throw new Error(result.error);
      const json = result.scenario;
      json.mode = mode;
      setScenario(json);
      setEntryId(result.entry_id);
      setTimeout(() => answerRef.current?.focus(), 100);
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
    setLoadingMsg("Marking your card");
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
      // judge_trade tool. We invalidate the cached page so the next
      // Journal-tab visit re-fetches with the new entry at the top.
      setJournalEntries([]);
      setJournalEnd(false);
      setJournalDetails({});
      setStats(nextStats);
      void persist(nextStats);
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
    if (!entryId) { setError("Deal a Trade Scenario before asking for a clue."); return; }
    setError("");
    setTipAsking(true);
    try {
      const res = await askTip(entryId, q);
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

  const JOURNAL_PAGE_SIZE = 25;

  /// Fetch the first page of the patron's Journal. Replaces any
  /// prior entries; clears the detail cache; resets the cursor. Used
  /// on tab open and after a fresh trade submission.
  async function loadJournalFirstPage(): Promise<void> {
    setJournalLoading(true);
    setJournalError("");
    try {
      const r = await listJournal({ limit: JOURNAL_PAGE_SIZE });
      const entries = Array.isArray(r.entries) ? r.entries : [];
      setJournalEntries(entries);
      setJournalEnd(entries.length < JOURNAL_PAGE_SIZE);
      setJournalDetails({});
      setJournalDetailLoading({});
      if (r.error) setJournalError(r.error);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setJournalError((e as Error).message);
    } finally {
      setJournalLoading(false);
    }
  }

  /// Fetch the next page using the last row's created_at as the
  /// cursor. Appends to the existing list; sets journalEnd when the
  /// returned page is shorter than the request (BE returned all
  /// remaining rows).
  async function loadJournalMore(): Promise<void> {
    if (journalEnd || journalLoadingMore || journalEntries.length === 0) return;
    const last = journalEntries[journalEntries.length - 1];
    if (!last?.created_at) {
      setJournalEnd(true);
      return;
    }
    setJournalLoadingMore(true);
    setJournalError("");
    try {
      const r = await listJournal({
        limit: JOURNAL_PAGE_SIZE,
        before: last.created_at,
      });
      const more = Array.isArray(r.entries) ? r.entries : [];
      setJournalEntries((prev) => [...prev, ...more]);
      if (more.length < JOURNAL_PAGE_SIZE) setJournalEnd(true);
      if (r.error) setJournalError(r.error);
    } catch (e) {
      if (e instanceof ProofRequiredError) { onSignOut?.(); return; }
      setJournalError((e as Error).message);
    } finally {
      setJournalLoadingMore(false);
    }
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

  // Auto-load Journal on tab open. Re-fetches when the cached page is
  // empty (initial open, or after a fresh trade submission invalidated
  // it). Doesn't refetch on every open — keeps the cached scroll
  // position + already-expanded detail rows when bouncing between tabs.
  useEffect(() => {
    if (tab === "journal" && journalEntries.length === 0 && !journalLoading && !journalEnd) {
      void loadJournalFirstPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  // Auto-load usage stats + DPYC ledger the first time the Usage tab is opened.
  useEffect(() => {
    if (tab === "usage") {
      if (apiUsage === null && !apiUsageLoading) void loadApiUsage();
      if (ledger === null && !ledgerLoading) void loadLedger();
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
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ink-faint)",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                alignSelf: "center",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <div className="tab-bar">
        <button className={`tab ${tab === "play" ? "active" : ""}`} onClick={() => setTab("play")}>The Pit</button>
        {guest && (
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
            <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.55 }}>
              You&apos;re browsing as a guest. The chooser, the briefing, and the live pricing display work.
              Dealing a Trade Scenario, pitching trades, asking for clues, and saving to your Journal all require a Nostr sign-in.
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
                  A card is dealt: a moment in markets — perhaps real, perhaps invented, perhaps unfolding right now.
                  You&apos;ll see a date, a macro backdrop, an asset, a catalyst, key levels, and the constraints of your book.
                  Read it like a courtroom brief. Then write your trade — structure, strikes, expiry, sizing, and your reasoning, in your own words.
                </p>

                <div className="briefing-rule">
                  <span className="rule-mark">§</span>
                  <div>
                    <b>Integration is rewarded.</b> A strong answer accounts for the political, monetary, and cross-asset facts the dealer put in front of you. The more relevant facts you weave into your thesis, the higher you score — particularly on the Macro Context dimension.
                  </div>
                </div>

                <div className="briefing-rule warn">
                  <span className="rule-mark">⚑</span>
                  <div>
                    <b>Red herrings are planted.</b> The dealer will embed one or two facts that are perfectly true but immaterial to the ideal trade — real-world noise that a trader could reasonably notice and overweight. A skew note may be color, not catalyst. A headline may already be in the tape. A disclosed position may be stale. They aren&apos;t traps in the sense of falsehood; they&apos;re traps in the sense of relevance. Building your thesis on one will cost you points; recognizing it as noise and setting it aside earns you them.
                  </div>
                </div>

                <p className="briefing-coda">
                  Choose your historicity. Choose your persona. Deal the card.
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
                  Optional. When set, the dealer sizes the scenario&apos;s account and constraints so a well-chosen structure fits your envelope. The judge will score down trades whose worst case exceeds it.
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

            {loading && (
              <div className="panel" style={{ textAlign: "center" }}>
                <div className="loading">{loadingMsg}</div>
                {mode === "live" && loading && (
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 8, fontStyle: "italic" }}>
                    Live mode searches the web — expect 15–30s.
                  </div>
                )}
              </div>
            )}

            {scenario && !loading && (
              <div className="panel">
                <span className="panel-label">{scenario.asset?.ticker} · {MODES.find((m) => m.id === (scenario.mode || mode))?.label} · {difficulty}</span>

                <div className="scenario-grid">
                  {/* LEFT — the facts */}
                  <div>
                    <div className="scenario-meta">{scenario.date_context}</div>
                    <h2 className="serif">{scenario.asset?.name}</h2>
                    <div className="scenario-quote">{scenario.macro_backdrop}</div>

                    <div className="data-row">
                      <div className="data-cell"><label>Spot</label><b>${scenario.asset?.spot}</b></div>
                      <div className="data-cell"><label>IV 30d</label><b>{scenario.asset?.iv_30d}%</b></div>
                      <div className="data-cell"><label>IV Rank</label><b>{scenario.asset?.iv_rank}</b></div>
                    </div>
                    {scenario.asset?.skew_note && (
                      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
                        <span style={{ color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>Skew · </span>
                        {scenario.asset.skew_note}
                      </div>
                    )}

                    <h3 className="serif">Catalyst</h3>
                    <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{scenario.catalyst}</div>

                    <h3 className="serif">Key Levels</h3>
                    <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{scenario.key_levels}</div>

                    <h3 className="serif">Constraints</h3>
                    <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{scenario.constraints}</div>

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
                    <div className="question">→ {scenario.the_question}</div>

                    {!evaluation && (
                      <>
                        <textarea
                          ref={answerRef}
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="e.g. Sell the 30-day 95/90 put spread for 1.20 credit, sized to risk 0.5% of NAV. The Fed's hawkish hold puts a floor under the dollar but the equity is bid on insider buying; collecting premium below the 200d feels asymmetric…"
                        />
                        <div className="actions">
                          <button className="btn btn-ghost" onClick={nextRound}>Discard, next scenario</button>
                          <button
                            className="btn btn-ghost"
                            onClick={handleSaveDraft}
                            disabled={savingDraft || !answer.trim()}
                            title="Persist this draft to the Journal entry so it survives a reload"
                          >
                            {savingDraft ? "Saving…" : "Save Draft"}
                          </button>
                          <button
                            className="btn"
                            onClick={submitTrade}
                            disabled={loading}
                            title="Submit your trade to the pitch panel for review"
                          >
                            Pitch the Trade
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
                            Socratic, non-spoiler. e.g. <span style={{ color: "var(--ink-soft)" }}>"What do you mean by Call Skew?"</span>
                          </div>

                          {tips.map((t, i) => (
                            <div key={i} style={{ marginBottom: 10, padding: "8px 10px", background: "var(--bg-soft)", borderLeft: "2px solid var(--bronze)" }}>
                              <div style={{ fontSize: 12, color: "var(--ink-soft)", fontStyle: "italic", marginBottom: 4 }}>
                                Q · {t.question}
                              </div>
                              <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                                {t.answer}
                              </div>
                            </div>
                          ))}

                          <textarea
                            value={tipQuestion}
                            onChange={(e) => setTipQuestion(e.target.value)}
                            placeholder="Type your question…"
                            style={{ minHeight: 60 }}
                          />
                          <div className="actions">
                            <button
                              className="btn btn-ghost"
                              onClick={handleAskTip}
                              disabled={tipAsking || !tipQuestion.trim()}
                            >
                              {tipAsking ? "Asking…" : "Ask for Clue"}
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
                  <div className="headline">&ldquo;{annotate(evaluation.headline)}&rdquo;</div>
                </div>

                <h3 className="serif">By Dimension</h3>
                <div className="dim-grid">
                  {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
                    <div className="dim-card" key={k}>
                      <div className="dim-name">{DIMENSION_LABELS[k] || k}</div>
                      <div className="dim-score">{v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span></div>
                      <div className="dim-fb">{annotate(v.feedback)}</div>
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
                  {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}>{annotate(b)}</li>)}
                </ul>

                <h3 className="serif">What to sharpen</h3>
                <ul className="bullet-list bad">
                  {(evaluation.what_to_improve || []).map((b, i) => <li key={i}>{annotate(b)}</li>)}
                </ul>

                <h3 className="serif">An alternative the house would have taken</h3>
                <div className="alt-trade">{annotate(evaluation.alternative_trade || "")}</div>

                <h3 className="serif">Deeper context</h3>
                <div className="deeper">{annotate(evaluation.deeper_context || "")}</div>

                <div className="actions" style={{ marginTop: 22 }}>
                  <button className="btn btn-ghost" onClick={nextRound}>Back to setup</button>
                  <button className="btn" onClick={() => { nextRound(); void generateScenario(); }}>Next Trade Scenario</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "sample" && <SampleAssessment />}

        {tab === "usage" && (
          <div className="panel">
            <span className="panel-label">DPYC Ledger</span>
            <h2 className="serif">Sats balance & MCP tool usage</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              Your live balance at Optionality MCP, what you've spent today, and the active
              credit tranches funding it. Tolls are deducted at call time; the operator's
              accounting flushes to Neon after each settle.
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                onClick={() => { void loadLedger(); }}
                disabled={ledgerLoading}
                style={{ padding: "8px 14px", fontSize: 10 }}
              >
                {ledgerLoading ? "Loading…" : "Refresh"}
              </button>
              <button
                className="btn"
                onClick={() => setTopOffOpen(true)}
                style={{ padding: "8px 14px", fontSize: 10 }}
                title="Buy sats from the operator via Bitcoin Lightning"
              >
                Top Off
              </button>
            </div>

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
              const todayUsage = ledger.today_usage ?? {};
              const toolRows = Object.entries(todayUsage)
                .map(([tool, u]) => ({ tool, calls: u.calls, sats: u.api_sats }))
                .sort((a, b) => b.sats - a.sats);
              const todaySpend = toolRows.reduce((s, r) => s + r.sats, 0);
              const todayCalls = toolRows.reduce((s, r) => s + r.calls, 0);

              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
                    <div style={{ background: "rgba(212,163,91,0.06)", border: "1px solid var(--amber)", padding: 16 }}>
                      <div style={{ fontSize: 10, color: "var(--amber)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>
                        Balance
                      </div>
                      <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, color: "var(--amber-bright)", fontWeight: 500 }}>
                        {balance.toLocaleString()}
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

                  <h3 className="serif">Today's MCP tool usage</h3>
                  {toolRows.length === 0 ? (
                    <div className="empty">No paid tool calls today.</div>
                  ) : (
                    <>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--panel-edge)", color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 10 }}>
                            <th style={{ textAlign: "left", padding: "8px 6px" }}>Tool</th>
                            <th style={{ textAlign: "right", padding: "8px 6px" }}>Calls</th>
                            <th style={{ textAlign: "right", padding: "8px 6px" }}>Sats</th>
                          </tr>
                        </thead>
                        <tbody>
                          {toolRows.map((r) => (
                            <tr key={r.tool} style={{ borderBottom: "1px solid var(--panel-edge)" }}>
                              <td style={{ padding: "8px 6px", color: "var(--ink)" }}>
                                {displayToolName(r.tool)}
                                <span style={{ marginLeft: 8, color: "var(--ink-faint)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                                  {r.tool}
                                </span>
                              </td>
                              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--ink-soft)" }}>{r.calls}</td>
                              <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>{r.sats.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: "2px solid var(--panel-edge)", fontWeight: 600 }}>
                            <td style={{ padding: "8px 6px", color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 10 }}>Today</td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--ink)" }}>{todayCalls}</td>
                            <td style={{ padding: "8px 6px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", color: "var(--amber-bright)" }}>{todaySpend.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
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
            const p = MODEL_PRICING[m.model] ?? DEFAULT_PRICING;
            estimatedCostUsd +=
              (m.total_input_tokens / 1_000_000) * p.input +
              (m.total_output_tokens / 1_000_000) * p.output;
          }
          const totalTokens = totalInputTokens + totalOutputTokens;
          const btcPriceUsd = 100_000;
          const estimatedSats = Math.round((estimatedCostUsd / btcPriceUsd) * 100_000_000);

          return (
            <div className="panel">
              <span className="panel-label">Usage</span>
              <h2 className="serif">Claude API usage & estimated cost</h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
                Optionality calls Anthropic's Claude for every scenario, tip, and verdict.
                {" "}This is what your tool calls have spent in tokens — and what those tokens
                {" "}cost the operator. Your toll covers this plus operator overhead. No hidden margin.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => { void loadApiUsage(); }}
                  disabled={apiUsageLoading}
                  style={{ padding: "8px 14px", fontSize: 10 }}
                >
                  {apiUsageLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {apiUsageLoading && apiUsage === null && (
                <div className="loading" style={{ display: "block", padding: "20px 0" }}>Tallying the receipts</div>
              )}

              {apiUsage !== null && models.length === 0 && (
                <div className="empty">No model calls recorded yet. Deal a scenario.</div>
              )}

              {apiUsage !== null && models.length > 0 && (
                <>
                  {/* Per-model breakdown */}
                  {models.map((m, i) => {
                    const p = MODEL_PRICING[m.model] ?? DEFAULT_PRICING;
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
              Weighted by the toll paid: <code style={{ color: "var(--amber-bright)" }}>weighted_score = raw_score × effective_price_sats</code>.
              A hard, expensive pitch scored well outranks a cheap one scored well. The pricing
              model is the single dial — operators tune scoring weight by tuning per-difficulty
              multipliers (mulligan included). Default sort is the weighted average; raw scores
              available too.
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
                  return (
                    <div
                      key={row.npub}
                      className="history-row"
                      style={{
                        gridTemplateColumns: "40px 56px 1fr 84px 84px 60px 60px 60px",
                        background: isYou ? "var(--amber-glow)" : undefined,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ color: "var(--amber)", fontFamily: "Fraunces, serif", fontSize: 16 }}>{i + 1}</div>
                      <div>
                        {/* Click → DM via NIP-07. Self-row clicks open
                            a DM to yourself — useful for verifying the
                            NIP-07 signer + relay path end-to-end
                            without pinging a peer. NIP-04 encryption
                            works on (own_priv, own_pub) ECDH; the DM
                            shows up in your own Nostr client's inbox. */}
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
            <h2 className="serif">Past sessions</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              Server-stored, npub-scoped. Click any row to reread the scenario and pitch review.
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

            {journalEntries.map((row) => {
              const detail = journalDetails[row.id];
              const detailLoading = !!journalDetailLoading[row.id];
              return (
                <details
                  key={row.id}
                  style={{ marginBottom: 6 }}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open && !detail && !detailLoading) {
                      void loadJournalDetail(row.id);
                    }
                  }}
                >
                  <summary style={{ cursor: "pointer", listStyle: "none" }}>
                    <div className="history-row">
                      <div className="h-ticker">{row.ticker || "—"}</div>
                      <div>
                        <div style={{ color: "var(--ink)" }}>
                          {row.mode} · {row.difficulty}
                          {row.status !== "evaluated" && (
                            <span style={{ marginLeft: 8, fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                              {row.status}
                            </span>
                          )}
                        </div>
                        <div className="h-date">
                          {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                        </div>
                      </div>
                      <div className="h-grade">{row.letter_grade ?? "—"}</div>
                      <div className="h-score">{row.score != null ? `${row.score}/100` : "—"}</div>
                    </div>
                  </summary>
                  <div style={{ padding: "10px 14px 20px", background: "var(--bg-soft)" }}>
                    {detailLoading && (
                      <div className="loading" style={{ display: "block", padding: "16px 0" }}>Loading entry</div>
                    )}
                    {detail && (
                      <>
                        {detail.trade_proposal && (
                          <>
                            <h3 className="serif">Your trade</h3>
                            <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12, whiteSpace: "pre-wrap" }}>
                              {annotate(detail.trade_proposal)}
                            </div>
                          </>
                        )}
                        {detail.evaluation?.headline && (
                          <>
                            <h3 className="serif">Headline</h3>
                            <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: "var(--ink)", marginBottom: 12 }}>
                              &ldquo;{annotate(detail.evaluation.headline)}&rdquo;
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
                            <div className="alt-trade">{annotate(detail.evaluation.alternative_trade)}</div>
                          </>
                        )}
                        {detail.evaluation?.deeper_context && (
                          <>
                            <h3 className="serif">Deeper context</h3>
                            <div className="deeper">{annotate(detail.evaluation.deeper_context)}</div>
                          </>
                        )}
                        {detail.status === "evaluated" && (
                          <div className="actions" style={{ marginTop: 16 }}>
                            <button
                              className="btn"
                              onClick={() => { void replayJournalEntry(detail.id); }}
                              title="Reissue this scenario as a mulligan — same setup, fresh pitch"
                            >
                              Redo Again
                            </button>
                          </div>
                        )}
                        {!detail.evaluation && detail.status !== "evaluated" && (
                          <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic" }}>
                            {detail.status === "open"
                              ? "This entry is still open — deal a scenario in The Pit and pitch a trade to get a review."
                              : `Entry status: ${detail.status}. No pitch review available.`}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </details>
              );
            })}

            {journalEntries.length > 0 && !journalEnd && (
              <div className="actions" style={{ marginTop: 16 }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => { void loadJournalMore(); }}
                  disabled={journalLoadingMore}
                >
                  {journalLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}

            {journalEntries.length > 0 && journalEnd && (
              <div style={{ fontSize: 11, color: "var(--ink-faint)", fontStyle: "italic", marginTop: 14, textAlign: "center" }}>
                That's all your sessions.
              </div>
            )}
          </div>
        )}
      </div>

      {topOffOpen && (
        <TopOffModal
          onClose={() => setTopOffOpen(false)}
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
    </div>
  );
}
