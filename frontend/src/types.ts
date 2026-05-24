// Domain types for Optionality drill.

export type Mode = "historical" | "fiction" | "live";
export type Difficulty = "apprentice" | "journeyman" | "adept" | "sovereign";
export type TabId = "play" | "journal";
export type LegSide = "long" | "short";
export type LegType = "call" | "put";

export interface TradeLeg {
  side: LegSide;
  type: LegType;
  strike: number;
  expiry_days: number;
  premium?: number;
  qty?: number;
}

export interface ScenarioAsset {
  ticker: string;
  name: string;
  spot: number;
  iv_30d: number;
  iv_rank?: number;
  skew_note?: string;
}

export interface Scenario {
  scenario_id?: string;
  mode: Mode;
  date_context: string;
  macro_backdrop: string;
  asset: ScenarioAsset;
  catalyst: string;
  key_levels: string;
  constraints: string;
  the_question: string;
  sources?: string[];
  relevant_facts?: string[];
  red_herrings?: string[];
  hidden_considerations?: string[];
}

export interface DimensionResult {
  score: number;
  feedback: string;
}

export interface Evaluation {
  overall_score: number;
  letter_grade: string;
  headline: string;
  dimensions: Record<string, DimensionResult>;
  facts_integrated?: string[];
  facts_missed?: string[];
  red_herrings_caught?: string[];
  red_herrings_followed?: string[];
  what_you_got_right?: string[];
  what_to_improve?: string[];
  alternative_trade?: string;
  deeper_context?: string;
  trade_legs?: TradeLeg[];
  alt_trade_legs?: TradeLeg[];
}

export interface JournalEntry {
  ts: number;
  ticker: string;
  date_context: string;
  mode: Mode;
  grade: string;
  score: number;
  scenario: Scenario;
  answer: string;
  evaluation: Evaluation;
}

export interface Stats {
  played: number;
  avg: number;
  best: number;
  streak: number;
}

export interface PersistedState {
  stats?: Stats;
  history?: JournalEntry[];
}

/// Active play session — the scenario a patron has paid for and is
/// currently working through. Persisted separately from stats/history
/// so a page reload restores the exact game board (scenario, draft
/// answer, evaluation if already judged) without losing the patron's
/// purchase. Cleared on `nextRound()` when the user explicitly moves
/// past the current card.
export interface ActiveSession {
  scenario: Scenario;
  entryId: string;
  answer: string;
  mode: Mode;
  difficulty: Difficulty;
  evaluation?: Evaluation;
}

export interface DifficultyDef {
  id: Difficulty;
  label: string;
  blurb: string;
}

export interface ModeDef {
  id: Mode;
  label: string;
  blurb: string;
}
