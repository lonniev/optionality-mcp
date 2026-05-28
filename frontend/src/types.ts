// Domain types for Optionality drill.

export type Mode = "historical" | "fiction" | "live";
export type Difficulty = "apprentice" | "journeyman" | "adept" | "sovereign" | "mulligan";
export type TabId = "welcome" | "play" | "sample" | "journal" | "leaderboard" | "usage" | "profile";
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
  // Echoed back by the dealer when the patron set a per-trade risk
  // envelope. Drives the "fits the envelope?" check in the judge's
  // risk_reward dimension. Absent on scenarios dealt without a budget.
  max_loss_usd?: number;
  // Echoed back when the patron requested a sector filter (e.g.,
  // "biotech", "semis"). Surfaces on the scenario card so the trainee
  // can confirm the dealer honored the request.
  sector?: string;
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

/// Lightweight summary row from the wheel's `list_journal` tool —
/// what the Journal tab uses to render the paginated list. Heavy
/// fields (scenario, evaluation, answer) are NOT included; the FE
/// lazy-fetches via `get_journal` when the user expands a row.
export interface JournalListEntry {
  id: string;
  status: "open" | "submitted" | "evaluated" | "abandoned" | string;
  mode: Mode;
  difficulty: Difficulty | string;
  ticker?: string | null;
  score?: number | null;
  letter_grade?: string | null;
  is_shared?: boolean;
  created_at: string;
  updated_at: string;
}

/// One entry that a peer has chosen to share — appears under their
/// row on the public Leaderboard. Eager-loads the full evaluation +
/// trade proposal so the row expansion needs no follow-up fetch.
export interface SharedEntry {
  id: string;
  mode: Mode;
  difficulty: Difficulty | string;
  ticker?: string | null;
  score?: number | null;
  letter_grade?: string | null;
  trade_proposal?: string | null;
  trade_legs?: TradeLeg[] | null;
  evaluation?: Evaluation | null;
  created_at: string;
}

export interface SharedEntriesResult {
  target_npub?: string;
  entries: SharedEntry[];
  count?: number;
  error?: string;
}

export interface JournalListResult {
  entries: JournalListEntry[];
  count: number;
  error?: string;
}

/// Full entry shape returned by `get_journal` — joined ledger of
/// scenario + trade + evaluation. Used to populate the expanded view
/// inside the Journal tab.
export interface JournalDetail {
  id: string;
  status: string;
  mode: Mode;
  difficulty: Difficulty | string;
  ticker?: string | null;
  score?: number | null;
  letter_grade?: string | null;
  scenario?: Scenario;
  trade_proposal?: string | null;
  trade_legs?: TradeLeg[] | null;
  evaluation?: Evaluation | null;
  is_shared?: boolean;
  created_at: string;
  updated_at: string;
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
  maxLossUsd?: number;
  /// Optional market-sector filter (e.g., "biotech", "semis", "banks").
  /// When set, the dealer picks an underlying from that sector and the
  /// patron sees it persisted across reloads so a refresh doesn't clear
  /// their chosen focus area.
  sector?: string;
  evaluation?: Evaluation;
  tips?: TipExchange[];
  draftSavedAt?: number;
}

/// One Q&A round in the inline "Ask a Tip" panel on the scenario card.
/// The tip itself comes from the wheel's `ask_tip` tool — a Socratic,
/// non-spoiler nudge the LLM produces given the open journal entry.
export interface TipExchange {
  ts: number;
  question: string;
  answer: string;
}

/// One row of the leaderboard returned by the wheel's `get_leaderboard`.
/// `by_mode` and `by_difficulty` carry the per-bucket aggregates the
/// scoped views need; the top-level fields are the global aggregates.
export interface LeaderboardRow {
  npub: string;
  display_name?: string | null;
  avatar?: string | null;
  total_played: number;
  avg_score: number;
  best_score: number;
  /// Difficulty-weighted scores (like diving's degree-of-difficulty).
  /// weighted_score = raw_score × DIFFICULTY_WEIGHT[difficulty].
  /// Sovereign 80 weights to 320; Apprentice 80 weights to 80.
  weighted_avg?: number;
  weighted_best?: number;
  current_streak: number;
  longest_streak: number;
  last_played_at?: string | null;
  by_mode?: Record<string, unknown>;
  by_difficulty?: Record<string, unknown>;
}

/// Patron profile returned by `get_patron_profile`. All editable fields
/// are nullable — fresh patrons start with display_name / avatar / bio
/// all unset and an empty relays list. Theme is FE-only (localStorage).
export interface PatronProfile {
  npub: string;
  display_name?: string | null;
  avatar?: string | null;
  bio?: string | null;
  relays: string[];
  /// True when Optionality holds an AES-encrypted copy of the patron's
  /// nsec. Drives the DM modal routing (escrow → BE-signed) and the
  /// Profile page's Game Persona Key panel (Withdraw vs Deposit).
  escrowed?: boolean;
  created_at?: string | null;
}

export interface LeaderboardResult {
  sort_by: string;
  scope: string;
  rows: LeaderboardRow[];
  count: number;
}

/// One row of the Claude API usage view, grouped by model. Mirrors the
/// shape taxsort-mcp's `get_api_usage_stats` returns so the FE-side
/// math (per-model cost + sats equivalent) is identical.
export interface ModelUsage {
  model: string;
  runs: number;
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface ApiUsageResult {
  models: ModelUsage[];
}

/// Lifetime per-tool entry from the wheel's account_statement. The
/// authoritative source — covers every paid tool, not just Claude-
/// burning ones, and reports actual sats charged.
export interface AccountStatementToolUsage {
  tool: string;
  calls: number;
  api_sats: number;
}

export interface AccountStatementDailyUsage {
  date: string;
  total_calls: number;
  total_api_sats: number;
  tools: Record<string, { calls: number; api_sats: number }>;
}

export interface AccountStatementSummary {
  balance_api_sats: number;
  total_deposited_api_sats: number;
  total_consumed_api_sats: number;
  total_expired_api_sats: number;
}

export interface AccountStatementResult {
  success?: boolean;
  generated_at?: string;
  statement_period_days?: number;
  account_summary?: AccountStatementSummary;
  purchase_history?: unknown[];
  active_tranches?: unknown[];
  tool_usage_all_time?: AccountStatementToolUsage[];
  daily_usage?: AccountStatementDailyUsage[];
  error?: string;
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
