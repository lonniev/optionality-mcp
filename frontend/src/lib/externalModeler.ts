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
// The URL carries only public market identifiers (ticker, strategy, and
// the strikes/expiries the trainee is already looking at) — never an
// npub, credential, or anything from the vault. Nothing here crosses a
// security boundary.

import type { ProposedLeg, Scenario, TradeLeg } from "../types";
import { classifyStructure, proposedToTradeLegs } from "./payoff";

/// A single leg, normalized for URL building. Carries the absolute
/// expiration DATE (not a DTE) so a provider can encode it into a
/// per-leg option symbol.
export interface ModelerLeg {
  side: "long" | "short";
  type: "call" | "put";
  strike: number;
  /// ISO date, e.g. "2026-08-07".
  expiration: string;
  qty: number;
}

export interface ModelerInput {
  ticker: string;
  slug: string;
  legs: ModelerLeg[];
}

/// A third-party options modeler we can hand a real position to. A
/// provider deep-links to a strategy builder that loads the underlying's
/// live chain. `buildUrl` returns null when the provider can't faithfully
/// represent this position (e.g. OptionStrat needs a real expiration date
/// on every leg) — the caller then falls back to the next provider.
export interface ExternalModelerProvider {
  id: string;
  label: string;
  buildUrl(input: ModelerInput): string | null;
}

// ── Encoding helpers ─────────────────────────────────────────────────

/// ISO date → OptionStrat's YYMMDD, or null if unparseable.
function yymmdd(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  return m ? m[1].slice(2) + m[2] + m[3] : null;
}

/// Strike as a bare number: "122" for integers, "122.5" for fractions.
function strikeStr(k: number): string {
  return Number.isInteger(k) ? String(k) : parseFloat(k.toFixed(2)).toString();
}

/// OptionStrat leg token, verified against a real share URL (2026-07-11):
///   .PLTR260807P122   → long 1× PLTR 2026-08-07 122 put
///   -.PLTR260807P127  → short 1× PLTR 2026-08-07 127 put
/// Form: [sign][qty>1] "." TICKER YYMMDD (C|P) strike. A leading "-" alone
/// is short 1; "" alone is long 1; a quantity >1 is written after the sign
/// (e.g. "-2.PLTR…"). Returns null if the leg has no encodable expiration.
function optionStratToken(leg: ModelerLeg, ticker: string): string | null {
  const ymd = yymmdd(leg.expiration);
  if (!ymd) return null;
  const q = leg.qty && leg.qty > 0 ? Math.round(leg.qty) : 1;
  const sign = leg.side === "short" ? "-" : "";
  const mult = q === 1 ? "" : String(q);
  const cp = leg.type === "call" ? "C" : "P";
  return `${sign}${mult}.${ticker}${ymd}${cp}${strikeStr(leg.strike)}`;
}

// ── Providers ────────────────────────────────────────────────────────

/// OptionStrat — full per-leg pre-fill. The legs are authoritative; the
/// strategy slug is just the builder template. Legs are sorted by
/// (expiration, strike, type) so the URL is stable and matches the shape
/// of a hand-built share link. Returns null if any leg lacks an
/// expiration date (then the caller falls back to a strategy+ticker
/// provider).
export const OPTIONSTRAT: ExternalModelerProvider = {
  id: "optionstrat",
  label: "OptionStrat",
  buildUrl({ ticker, slug, legs }) {
    const sym = ticker.trim().toUpperCase();
    const sorted = [...legs].sort(
      (a, b) =>
        a.expiration.localeCompare(b.expiration) ||
        a.strike - b.strike ||
        a.type.localeCompare(b.type),
    );
    const tokens: string[] = [];
    for (const leg of sorted) {
      const t = optionStratToken(leg, sym);
      if (!t) return null;
      tokens.push(t);
    }
    if (!tokens.length) return null;
    return `https://optionstrat.com/build/${slug}/${sym}/${tokens.join(",")}`;
  },
};

/// InsiderFinance's Options Profit Calculator — strategy + ticker only
/// (the trainee re-selects strikes against the live chain). Path shape and
/// strategy slugs verified live 2026-07-11. This is the fallback when a
/// position can't be fully leg-encoded.
export const INSIDER_FINANCE: ExternalModelerProvider = {
  id: "insiderfinance",
  label: "InsiderFinance",
  buildUrl({ ticker, slug }) {
    const sym = encodeURIComponent(ticker.trim().toUpperCase());
    return `https://www.insiderfinance.io/options-profit-calculator/strategy/${slug}/${sym}`;
  },
};

/// Preference order: OptionStrat (full pre-fill) first, InsiderFinance
/// (strategy+ticker) as the fallback. A future user-choice UI can widen
/// this into a picker.
export const DEFAULT_PROVIDERS: ExternalModelerProvider[] = [OPTIONSTRAT, INSIDER_FINANCE];

// ── Structure → strategy slug ────────────────────────────────────────

/// classifyStructure() display name → strategy slug. The classifier's
/// output is deterministic; we strip its trailing "(credit)"/"(debit)"
/// qualifier before lookup. Both providers use these standard slugs.
/// Structures with no single-strategy preset (calendars, diagonals,
/// custom N-leg) map to nothing on purpose — the in-app payoff already
/// covers them.
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

/// Resolve a classifier display name to a strategy slug, or null when the
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

/// The applicability gate. Given the scenario and the trainee's proposed
/// legs, decide whether an external modeler can rigorously treat this
/// exact position — and if so, with which provider and URL.
export function externalModelerFor(
  scenario: Scenario | null | undefined,
  legs: ProposedLeg[],
  providers: ExternalModelerProvider[] = DEFAULT_PROVIDERS,
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

  const tradeLegs: TradeLeg[] = proposedToTradeLegs(legs);
  const structureName = classifyStructure(tradeLegs);
  const slug = strategySlugForStructure(structureName);
  if (!slug) {
    return {
      kind: "unavailable",
      reason:
        "No preset for this structure on external modelers — the payoff above already covers it.",
    };
  }

  const modelerLegs: ModelerLeg[] = legs.map((l) => ({
    side: l.side === "buy" ? "long" : "short",
    type: l.type,
    strike: l.strike,
    expiration: l.expiration,
    qty: l.qty && l.qty > 0 ? l.qty : 1,
  }));

  for (const provider of providers) {
    const url = provider.buildUrl({ ticker, slug, legs: modelerLegs });
    if (url) return { kind: "available", provider, url, structureName };
  }

  return { kind: "unavailable", reason: null };
}
