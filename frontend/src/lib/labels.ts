// Names the game shows for values the server sends, in the reader's language.
// A value this page doesn't know shows as sent.

import type { MessageKey, Translate } from "../i18n";

const DIMENSIONS = new Set([
  "strategy_selection",
  "strikes_and_tenor",
  "risk_reward",
  "macro_integration",
  "tail_risk",
  "communication",
]);

/** A scoring dimension's name. */
export const dimensionLabel = (t: Translate, d: string): string =>
  DIMENSIONS.has(d) ? t(`game.dimension.${d}` as MessageKey) : d;

/** A Journal entry's state. */
export const statusLabel = (t: Translate, s: string): string =>
  ["open", "submitted", "evaluated", "abandoned"].includes(s) ? t(`game.status.${s}` as MessageKey) : s;
