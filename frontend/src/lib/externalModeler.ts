// Deep-link a trainee's proposed structure out to an external, purpose-
// built options modeler for a rigorous "second opinion" on the position.
//
// Why delegate at all: Optionality already draws the expiration payoff
// in-app (see payoff.ts / PayoffChart) — that curve is pure intrinsic-
// value math and needs no live chain. What an external modeler adds is
// the market-derived layer Optionality deliberately doesn't rebuild:
// live Greeks, IV surface, probability-of-profit. Those require a REAL,
// quoted contract to anchor against.
//
// That anchor is exactly why applicability is mode-gated. A chain-driven
// modeler can only quote an underlying that exists in TODAY's listed
// chain:
//   • live       → the scenario IS "now" against a real ticker → works.
//   • historical → real ticker, but the modeler shows today's chain, not
//                   the scenario's past date → it can't reconstruct the
//                   as-of quotes → don't pretend it can.
//   • fiction    → the underlying doesn't exist to be quoted → nothing to
//                   link to.
// In the two unavailable cases the in-app payoff panel already covers the
// position; we surface a one-line reason rather than a dead link.
//
// The URL carries only public market identifiers (ticker, strategy name)
// — never an npub, credential, or anything from the vault. Nothing here
// crosses a security boundary.

import type { Scenario, TradeLeg } from "../types";
import { classifyStructure } from "./payoff";

/// A third-party options modeler we can hand a real ticker + named
/// strategy to. Providers deep-link to a strategy builder that loads the
/// underlying's live chain; the trainee confirms the strikes they already
/// see in Optionality's own order ticket.
export interface ExternalModelerProvider {
  id: string;
  label: string;
  /// Build a deep-link for a listed underlying and a strategy slug the
  /// provider recognizes. `ticker` and `slug` are pre-validated by the
  /// caller; this is a pure URL constructor.
  buildUrl(ticker: string, slug: string): string;
}

/// InsiderFinance's Options Profit Calculator. Path shape and strategy
/// slugs verified live 2026-07-11: every slug in STRUCTURE_SLUGS resolves
/// to a strategy page, and the /strategy/{slug}/{TICKER} pattern is the
/// one the user confirmed working.
export const INSIDER_FINANCE: ExternalModelerProvider = {
  id: "insiderfinance",
  label: "InsiderFinance",
  buildUrl(ticker, slug) {
    const sym = encodeURIComponent(ticker.trim().toUpperCase());
    return `https://www.insiderfinance.io/options-profit-calculator/strategy/${slug}/${sym}`;
  },
};

/// The active provider. Kept as a single export so a future registry /
/// user-choice UI has one obvious seam to widen.
export const DEFAULT_PROVIDER: ExternalModelerProvider = INSIDER_FINANCE;

/// classifyStructure() display name → provider strategy slug. The
/// classifier's output is deterministic; we strip its trailing
/// "(credit)"/"(debit)" qualifier before lookup. Structures with no
/// single-strategy preset (calendars, diagonals, custom N-leg) map to
/// nothing on purpose — the in-app payoff already covers them.
const STRUCTURE_SLUGS: Record<string, string> = {
  "Long Call": "long-call",
  "Short Call": "short-call",
  "Long Put": "long-put",
  "Short Put": "short-put",
  "Bull Put Spread": "bull-put-spread",
  "Bear Put Spread": "bear-put-spread",
  "Bull Call Spread": "bull-call-spread",
  "Bear Call Spread": "bear-call-spread",
  "Long Straddle": "straddle",
  "Short Straddle": "short-straddle",
  "Long Strangle": "strangle",
  "Short Strangle": "short-strangle",
  "Iron Condor": "iron-condor",
  "Iron Butterfly": "iron-butterfly",
};

/// Resolve a classifier display name to a provider slug, or null when the
/// structure has no clean single-strategy preset.
export function strategySlugForStructure(structureName: string): string | null {
  const bare = structureName.replace(/\s*\((credit|debit)\)\s*$/i, "").trim();
  return STRUCTURE_SLUGS[bare] ?? null;
}

export type ModelerResult =
  /// Deep-link is live: real underlying, mapped strategy, listed chain.
  | {
      kind: "available";
      provider: ExternalModelerProvider;
      url: string;
      structureName: string;
    }
  /// Deliberately no link. `reason` is a short, patron-facing sentence
  /// explaining why the position stays in Optionality's own model; null
  /// when there is simply nothing to say (no legs / no ticker yet).
  | { kind: "unavailable"; reason: string | null };

/// The applicability gate. Given the scenario and the trainee's legs,
/// decide whether an external modeler can rigorously treat this exact
/// position — and if not, why.
export function externalModelerFor(
  scenario: Scenario | null | undefined,
  legs: TradeLeg[],
  provider: ExternalModelerProvider = DEFAULT_PROVIDER,
): ModelerResult {
  if (!legs.length) return { kind: "unavailable", reason: null };

  const mode = scenario?.mode;
  if (mode === "fiction") {
    return {
      kind: "unavailable",
      reason:
        "Hypothetical underlying — external modelers only quote real, listed chains, so this payoff is Optionality's own.",
    };
  }
  if (mode === "historical") {
    return {
      kind: "unavailable",
      reason:
        "This scenario is set in the past. External modelers quote today's chain, not the scenario's date — this payoff is Optionality's own reconstruction.",
    };
  }

  const ticker = scenario?.asset?.ticker?.trim();
  if (!ticker) return { kind: "unavailable", reason: null };

  const structureName = classifyStructure(legs);
  const slug = strategySlugForStructure(structureName);
  if (!slug) {
    return {
      kind: "unavailable",
      reason:
        "No preset for this structure on external modelers — the payoff above already covers it.",
    };
  }

  return {
    kind: "available",
    provider,
    url: provider.buildUrl(ticker, slug),
    structureName,
  };
}
