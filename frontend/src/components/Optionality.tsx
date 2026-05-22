import { useState, useEffect, useRef } from "react";

import type {
  Difficulty,
  DifficultyDef,
  Evaluation,
  JournalEntry,
  Mode,
  ModeDef,
  PersistedState,
  Scenario,
  Stats,
  TabId,
} from "../types";
import ModeIcon from "./ModeIcon";
import DifficultyAvatar from "./DifficultyAvatar";
import RiskProfileChart from "./RiskProfileChart";
import FactsLedger from "./FactsLedger";

// ============================================================
//  OPTIONALITY — A Sovereign Trader's Drill
//  Main component. Composed from extracted pieces in this
//  directory plus math in ../lib/bs.ts and types in ../types.
//  Prompts and callClaude live here until Phase 3 moves them
//  server-side (Tasks 15h25–15h35).
// ============================================================

const STORAGE_KEY = "optionality:state:v1";

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

// ------------------------------------------------------------
//  API helpers — replaced by MCP client in Phase 4
// ------------------------------------------------------------

interface ClaudeTool {
  type: string;
  name: string;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  stop_reason?: string;
  error?: { message?: string };
  message?: string;
}

async function callClaude(
  prompt: string,
  system: string,
  maxTokens = 2500,
  tools: ClaudeTool[] | null = null,
): Promise<string> {
  const fullPrompt = system ? `${system}\n\n---\n\n${prompt}` : prompt;

  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: fullPrompt }],
  };
  if (tools) body.tools = tools;

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(`Network error: ${(e as Error).message}`);
  }

  let rawText = "";
  try {
    rawText = await res.text();
  } catch (e) {
    throw new Error(`Could not read response body: ${(e as Error).message}`);
  }

  let data: ClaudeResponse;
  try {
    data = JSON.parse(rawText) as ClaudeResponse;
  } catch {
    throw new Error(`HTTP ${res.status}: non-JSON response — ${rawText.slice(0, 240)}`);
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data).slice(0, 240);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error).slice(0, 240));
  }

  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n");

  if (!text.trim()) {
    throw new Error(`Empty model output. stop_reason=${data.stop_reason || "?"}. Raw: ${rawText.slice(0, 240)}`);
  }
  return text;
}

function extractJson<T = unknown>(text: string): T {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error(`No JSON object in output. Got: ${text.slice(0, 240)}`);
  }
  const jsonStr = cleaned.slice(first, last + 1);
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    throw new Error(`JSON parse failed: ${(e as Error).message}. Slice: ${jsonStr.slice(0, 240)}`);
  }
}

// ============================================================
//  Prompts — DO NOT REDESIGN. Removed in Task 19 (server-side).
// ============================================================

const SCENARIO_SYSTEM = `You are the scenario engine for an elite options-trading drill called OPTIONALITY.
The trainee is a sophisticated trader with deep knowledge of:
- Options structures: verticals, calendars, diagonals, butterflies, condors, ratios, jade lizards
- The Bitcoin / MicroStrategy / digital-asset-treasury complex (MSTR, STRC, BMNR, MTPLF, IBIT, etc.)
- Macro: rate cycles, yield curves, dollar liquidity, Fed reaction functions
- Monetary theory including Austrian economics, sound-money critiques, sovereignty themes
- Political risk: elections, sanctions, capital controls, geopolitical regime shifts

Generate ONE rich scenario. Vary tickers — don't always reach for SPX or MSTR. Use single names (NVDA, TSLA, COIN, GLD, XLF, EEM, TLT, UNG, individual biotechs around FDA dates, etc.) where appropriate.

Return STRICTLY a JSON object with this shape (no prose, no markdown):
{
  "scenario_id": "string",
  "mode": "historical | fiction | live",
  "date_context": "e.g. 'Mid-March 2023, three days after SVB seizure' or 'Hypothetical: Q3 2026, six months into a sovereign debt event' or 'Today, [actual date]'",
  "macro_backdrop": "2-3 sentences. Concrete. Mention what the Fed/Treasury/world is doing.",
  "asset": {
    "ticker": "TICKER",
    "name": "Full Name",
    "spot": 123.45,
    "iv_30d": 38,
    "iv_rank": 72,
    "skew_note": "e.g. 'Puts bid relative to calls; 25d RR at -8'"
  },
  "catalyst": "What's happening or imminent. Specific.",
  "key_levels": "Concrete S/R and expected move",
  "constraints": "Account size, risk budget, time horizon. Be specific.",
  "the_question": "What is your options trade? Specify structure, strikes, expiry, sizing, and rationale.",
  "sources": ["only for live mode — URLs or source names backing the macro/catalyst"],
  "relevant_facts": [
    "3-6 short statements naming the facts from your scenario that genuinely should drive the trade decision (e.g. 'IV rank at 72 favors net premium selling', 'Front-month earnings binary creates calendar opportunity', 'Yen carry unwind pressures risk assets via reflexive deleveraging')"
  ],
  "red_herrings": [
    "1-2 short statements naming facts you DELIBERATELY EMBEDDED in the scenario that are FACTUALLY TRUE / coherent within the scenario, but IRRELEVANT to the ideal trade decision. They are not lies, traps, or misinformation — they are real-world noise: facts a trader could reasonably get distracted by, but which should not actually shape the structure, strikes, sizing, or thesis. Examples: 'CEO appearing on CNBC tomorrow — real event, but no new info expected, not a catalyst', 'Russia-Ukraine headline activity continues — true, but already in the tape and not asymmetric for this name', 'Hedge fund X disclosed a 13F position last week — accurate, but stale and not predictive'."
  ],
  "hidden_considerations": ["other factors a great answer would address — used by evaluator, not shown to user"]
}

IMPORTANT: red_herrings must actually appear in the scenario text (macro_backdrop, catalyst, key_levels, constraints, or skew_note). They are FACTUALLY TRUE within the scenario world — they are not lies, traps, or misinformation. Their flaw is irrelevance, not falsity. They are real-world noise that a trader could reasonably notice and overweight, but which a disciplined thinker would set aside as not material to the trade thesis. Embed them naturally without labeling. A trainee who recognizes them as true-but-irrelevant and sets them aside should be rewarded; one who builds their thesis around them should be penalized.`;

const MODE_INSTRUCTIONS: Record<Mode, string> = {
  historical: `MODE: HISTORICAL FICTION.
Anchor this scenario to a real, identifiable moment in market history — a specific week or named event. The macro_backdrop and catalyst must reflect what actually happened politically, monetarily, and economically in that period. Spot price, IV 30d, IV rank, and skew are plausible reconstructions consistent with the regime (not pulled from a historical option chain feed). Include the year in date_context. Examples of fertile ground: Aug 2015 China devaluation, Feb 2018 Volmageddon, March 2020 COVID, Jan-Feb 2021 retail squeeze, Nov 2021 hawkish pivot, May-June 2022 vol regime, Sep-Oct 2022 BoE/gilt crisis, March 2023 SVB, Aug 2024 yen carry unwind, post-election volatility windows, debt-ceiling standoffs, tariff shocks.`,

  fiction: `MODE: FICTION.
This is pure invention. Construct a hypothetical scenario — near-future, counterfactual, or speculative regime. You have full creative license. Common fertile ground: a counterfactual debasement spiral, a sovereign debt event, a stablecoin de-peg cascade, a Bitcoin spot ETF gamma squeeze, a CBDC announcement, a regional currency crisis, an AI-capex bubble unwind, a geopolitical kinetic event. Mark date_context with phrases like 'Hypothetical: Q3 2026' or 'Counterfactual: a world where...' so the trainee knows this is not real. The macro/political logic must still be internally consistent.`,

  live: `MODE: LIVE EVENTS.
Use the web_search tool to find current market conditions, recent news, and active catalysts as of right now. Then build the scenario around a real ticker with real present-day setup. date_context should be 'Today, [actual date you found]' or similar. macro_backdrop must reflect what is actually happening in markets THIS WEEK. Cite specific recent events and include URLs or source names in the "sources" array. If exact IV numbers aren't findable, estimate from the regime and note that in skew_note.`,
};

const EVAL_SYSTEM = `You are the evaluator for OPTIONALITY, an options-trading drill. You are grading a sophisticated trader on a single proposed trade. Be direct, specific, and pedagogically generous — explain the WHY of every critique. Honor what they got right before noting gaps. Treat them as a peer.

You will be given (1) the scenario JSON, (2) the trainee's written trade.

Evaluate across five dimensions, each scored 0-20:
- strategy_selection: Did they pick a structure that fits the directional/vol/skew thesis?
- strikes_and_tenor: Are strikes and expiry sensibly chosen given the spot, IV, catalyst timing?
- risk_reward: Is max-loss, max-gain, breakeven, and probability of profit reasoned about?
- macro_integration: How many of the scenario's relevant_facts did the trainee weave into their reasoning, and how cleanly? Did they avoid being driven by red_herrings? Note: red_herrings are factually TRUE within the scenario but immaterial to the trade decision — they are noise, not falsehoods. The trainee is not penalized for failing to declare a red herring false; they are penalized only for treating an immaterial fact as a driver of the trade. A high score (16-20) requires citing most of the relevant_facts in the trade rationale AND keeping any red_herrings out of the driving thesis (either by ignoring them or by explicitly noting them as immaterial). A low score is given if relevant facts were neglected OR if the trade was driven by a red_herring. Cite specifics in your feedback.
- tail_risk: Did they account for what could go catastrophically wrong (gaps, vol crush, assignment, IV blowout)?

Return STRICTLY a JSON object (no prose, no markdown fences):
{
  "overall_score": 0-100,
  "letter_grade": "A+ | A | A- | B+ | B | B- | C+ | C | C- | D | F",
  "headline": "One vivid sentence summarizing the verdict.",
  "dimensions": {
    "strategy_selection": { "score": 0-20, "feedback": "2-3 sentences" },
    "strikes_and_tenor": { "score": 0-20, "feedback": "2-3 sentences" },
    "risk_reward": { "score": 0-20, "feedback": "2-3 sentences" },
    "macro_integration": { "score": 0-20, "feedback": "2-3 sentences — name the relevant_facts they cited and any red_herrings they fell for or dismissed" },
    "tail_risk": { "score": 0-20, "feedback": "2-3 sentences" }
  },
  "facts_integrated": [
    "List of scenario.relevant_facts the trainee CITED or clearly relied on in their reasoning. Use the exact phrasing from relevant_facts where possible."
  ],
  "facts_missed": [
    "List of scenario.relevant_facts the trainee FAILED to address that materially should have shaped the trade."
  ],
  "red_herrings_caught": [
    "List of scenario.red_herrings the trainee CORRECTLY treated as immaterial — either by not citing them or by explicitly setting them aside as not driving the thesis."
  ],
  "red_herrings_followed": [
    "List of scenario.red_herrings the trainee INCORRECTLY treated as a material driver of their trade. (This is the penalty list. The fact itself is true; the error is treating it as load-bearing for the thesis.)"
  ],
  "what_you_got_right": ["bullet", "bullet"],
  "what_to_improve": ["bullet", "bullet"],
  "alternative_trade": "Concrete alternative structure with strikes/expiry and one-paragraph rationale.",
  "deeper_context": "The political, monetary, or correlation context the trainee should internalize from this scenario. 3-5 sentences.",
  "trade_legs": [
    { "side": "long|short", "type": "call|put", "strike": NUMBER, "expiry_days": NUMBER, "premium": NUMBER_per_share, "qty": NUMBER_contracts }
  ],
  "alt_trade_legs": [
    { "side": "long|short", "type": "call|put", "strike": NUMBER, "expiry_days": NUMBER, "premium": NUMBER_per_share, "qty": NUMBER_contracts }
  ]
}

For trade_legs and alt_trade_legs:
- Parse the trainee's free-text trade into structured legs. If they were ambiguous about premiums, ESTIMATE from the scenario's spot price and iv_30d (Black-Scholes mental model). premium is always a positive per-share number; the side field (long/short) determines whether it was paid or received.
- For naked stock or bond positions, omit trade_legs (return empty array).
- Single-leg trades are fine: trade_legs can have just one entry.
- qty defaults to 1 contract if unspecified.
- The alt_trade_legs must structurally represent the alternative_trade you described.

For facts_integrated / facts_missed / red_herrings_caught / red_herrings_followed:
- Pull entries from the scenario's relevant_facts and red_herrings arrays. Use their exact phrasing where possible so the trainee can map verdict back to scenario.
- It is fine for a list to be empty if nothing applies.
- A trainee can score well even if they didn't cite every relevant_fact, but missing several drags macro_integration down.
- Any red_herring in red_herrings_followed should cost real points on macro_integration AND be called out specifically in the feedback for that dimension.`;

// ------------------------------------------------------------
//  Storage — temporary localStorage shim.
//  Phase 4 (Task 21) replaces these with MCP journal CRUD.
// ------------------------------------------------------------

async function loadState(): Promise<PersistedState | null> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

async function saveState(state: PersistedState): Promise<void> {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("save failed", e);
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
    padding: 32px 24px 80px;
  }
  .serif { font-family: 'Fraunces', Georgia, serif; }
  .header {
    max-width: 980px;
    margin: 0 auto 32px;
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

  .container { max-width: 980px; margin: 0 auto; }

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

  .actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;}

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

  .tab-bar { display:flex; gap:0; border-bottom:1px solid var(--panel-edge); margin-bottom: 20px; max-width: 980px; margin-left:auto; margin-right:auto;}
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

export default function Optionality() {
  const [tab, setTab] = useState<TabId>("play");
  const [mode, setMode] = useState<Mode>("historical");
  const [difficulty, setDifficulty] = useState<Difficulty>("journeyman");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ played: 0, avg: 0, best: 0, streak: 0 });
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const answerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    (async () => {
      const s = await loadState();
      if (s) {
        setStats(s.stats || { played: 0, avg: 0, best: 0, streak: 0 });
        setHistory(s.history || []);
      }
    })();
  }, []);

  async function persist(nextStats: Stats, nextHistory: JournalEntry[]): Promise<void> {
    await saveState({ stats: nextStats, history: nextHistory });
  }

  async function generateScenario(): Promise<void> {
    setError("");
    setEvaluation(null);
    setAnswer("");
    setScenario(null);
    setLoading(true);
    setLoadingMsg(mode === "live" ? "Reading the tape" : "Tapping the wire");
    try {
      const modeInstr = MODE_INSTRUCTIONS[mode];
      const prompt = `${modeInstr}\n\nGenerate ONE options drill scenario at difficulty level: "${difficulty}". Set the "mode" field to "${mode}". Vary the asset class from any prior attempts. Return JSON only.`;
      const tools: ClaudeTool[] | null = mode === "live"
        ? [{ type: "web_search_20250305", name: "web_search" }]
        : null;
      const tokenBudget = mode === "live" ? 4000 : 2500;
      const raw = await callClaude(prompt, SCENARIO_SYSTEM, tokenBudget, tools);
      const json = extractJson<Scenario>(raw);
      json.mode = mode;
      setScenario(json);
      setTimeout(() => answerRef.current?.focus(), 100);
    } catch (e) {
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
    setError("");
    setLoading(true);
    setLoadingMsg("Marking your card");
    try {
      const prompt = `Scenario:\n${JSON.stringify(scenario)}\n\nTrainee's proposed trade:\n${answer}\n\nReturn evaluation JSON only.`;
      const raw = await callClaude(prompt, EVAL_SYSTEM, 5500);
      const json = extractJson<Evaluation>(raw);
      setEvaluation(json);

      const score = json.overall_score || 0;
      const newPlayed = stats.played + 1;
      const newAvg = Math.round(((stats.avg * stats.played) + score) / newPlayed);
      const newBest = Math.max(stats.best, score);
      const newStreak = score >= 70 ? stats.streak + 1 : 0;
      const nextStats: Stats = { played: newPlayed, avg: newAvg, best: newBest, streak: newStreak };
      const entry: JournalEntry = {
        ts: Date.now(),
        ticker: scenario?.asset?.ticker || "—",
        date_context: scenario?.date_context || "",
        mode: scenario?.mode || mode,
        grade: json.letter_grade,
        score,
        scenario: scenario as Scenario,
        answer,
        evaluation: json,
      };
      const nextHistory: JournalEntry[] = [entry, ...history].slice(0, 50);
      setStats(nextStats);
      setHistory(nextHistory);
      void persist(nextStats, nextHistory);
    } catch (e) {
      setError("Evaluation failed. " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function nextRound(): void {
    setEvaluation(null);
    setScenario(null);
    setAnswer("");
    setError("");
  }

  return (
    <div className="opt-root">
      <style>{styles}</style>

      <header className="header">
        <div className="brand">
          OPTIONALITY
          <small>A Sovereign Trader's Drill</small>
        </div>
        <div className="stats">
          <div>Sessions<b>{stats.played}</b></div>
          <div>Avg Score<b>{stats.avg}</b></div>
          <div>Best<b>{stats.best}</b></div>
          <div>Streak<b>{stats.streak}</b></div>
        </div>
      </header>

      <div className="tab-bar">
        <button className={`tab ${tab === "play" ? "active" : ""}`} onClick={() => setTab("play")}>The Pit</button>
        <button className={`tab ${tab === "journal" ? "active" : ""}`} onClick={() => setTab("journal")}>Journal ({history.length})</button>
      </div>

      <div className="container">
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
                <div className="actions">
                  <button className="btn" onClick={generateScenario}>Deal the Scenario</button>
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
                      <button className="btn" onClick={submitTrade} disabled={loading}>Submit Trade</button>
                      <button className="btn btn-ghost" onClick={nextRound}>Discard, deal another</button>
                    </div>
                    {error && <div className="error" style={{ marginTop: 14 }}>{error}</div>}
                  </>
                )}
              </div>
            )}

            {evaluation && !loading && (
              <div className="panel">
                <span className="panel-label">Verdict</span>
                <div className="score-banner">
                  <div className="grade">{evaluation.letter_grade}</div>
                  <div className="score">Overall<b>{evaluation.overall_score} / 100</b></div>
                  <div className="headline">&ldquo;{evaluation.headline}&rdquo;</div>
                </div>

                <h3 className="serif">By Dimension</h3>
                <div className="dim-grid">
                  {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
                    <div className="dim-card" key={k}>
                      <div className="dim-name">{DIMENSION_LABELS[k] || k}</div>
                      <div className="dim-score">{v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span></div>
                      <div className="dim-fb">{v.feedback}</div>
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
                  {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>

                <h3 className="serif">What to sharpen</h3>
                <ul className="bullet-list bad">
                  {(evaluation.what_to_improve || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>

                <h3 className="serif">An alternative the house would have taken</h3>
                <div className="alt-trade">{evaluation.alternative_trade}</div>

                <h3 className="serif">Deeper context</h3>
                <div className="deeper">{evaluation.deeper_context}</div>

                <div className="actions" style={{ marginTop: 22 }}>
                  <button className="btn" onClick={() => { nextRound(); void generateScenario(); }}>Deal Another</button>
                  <button className="btn btn-ghost" onClick={nextRound}>Back to setup</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "journal" && (
          <div className="panel">
            <span className="panel-label">Journal</span>
            <h2 className="serif">Past sessions</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16 }}>
              Your last {history.length} drills. Click any row to reread the scenario and verdict.
            </p>
            {history.length === 0 && (
              <div className="empty">No sessions yet. Deal your first card.</div>
            )}
            {history.map((h) => (
              <details key={h.ts} style={{ marginBottom: 6 }}>
                <summary style={{ cursor: "pointer", listStyle: "none" }}>
                  <div className="history-row">
                    <div className="h-ticker">{h.ticker}</div>
                    <div>
                      <div>{h.date_context}</div>
                      <div className="h-date">{new Date(h.ts).toLocaleString()}</div>
                    </div>
                    <div className="h-grade">{h.grade}</div>
                    <div className="h-score">{h.score}/100</div>
                  </div>
                </summary>
                <div style={{ padding: "10px 14px 20px", background: "var(--bg-soft)" }}>
                  <h3 className="serif">Your trade</h3>
                  <div style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12, whiteSpace: "pre-wrap" }}>{h.answer}</div>
                  <h3 className="serif">Headline</h3>
                  <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", color: "var(--ink)", marginBottom: 12 }}>&ldquo;{h.evaluation?.headline}&rdquo;</div>
                  <FactsLedger evaluation={h.evaluation} />
                  {(h.evaluation?.trade_legs && h.evaluation.trade_legs.length > 0) && (
                    <>
                      <h3 className="serif">Risk Profile</h3>
                      <RiskProfileChart
                        legs={h.evaluation.trade_legs}
                        altLegs={h.evaluation.alt_trade_legs}
                        scenario={h.scenario}
                      />
                    </>
                  )}
                  <h3 className="serif">Alternative</h3>
                  <div className="alt-trade">{h.evaluation?.alternative_trade}</div>
                  <h3 className="serif">Deeper context</h3>
                  <div className="deeper">{h.evaluation?.deeper_context}</div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
