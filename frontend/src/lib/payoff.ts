// Payoff diagram + structure-classifier + order-ticket builder for
// trainee-built proposed legs. BSM math is reused as-is from bs.ts;
// this module is the boundary between the trainee's leg shape
// (ProposedLeg) and the judge-side TradeLeg shape, plus classifier
// and presentation helpers.

import type { OptionChainRow, ProposedLeg, Scenario, TradeLeg } from "../types";
import { payoffCurve } from "./bs";

/// Boundary converter: trainee's chain-built leg shape → math-side leg
/// shape. ProposedLeg.side ∈ {buy, sell}; TradeLeg.side ∈ {long, short}.
/// ProposedLeg.dte; TradeLeg.expiry_days. Otherwise the fields align.
export function proposedToTradeLeg(leg: ProposedLeg): TradeLeg {
  return {
    side: leg.side === "buy" ? "long" : "short",
    type: leg.type,
    strike: leg.strike,
    expiry_days: leg.dte,
    premium: leg.premium,
    qty: leg.qty,
  };
}

export function proposedToTradeLegs(legs: ProposedLeg[]): TradeLeg[] {
  return legs.map(proposedToTradeLeg);
}

/// Compute the high-resolution P/L sample used to derive max profit,
/// max loss, breakevens, and unbounded-tail detection. The chart and
/// the order-ticket share these stats.
export interface PayoffSummary {
  netCredit: number;        // signed dollars: + = credit, − = debit
  maxP: number | null;      // null when unbounded above
  maxL: number | null;      // null when unbounded below
  profitUnbounded: boolean;
  lossUnbounded: boolean;
  breakevens: number[];
  rr: number | null;        // reward:risk ratio; null when undefined
  evalDTE: number;          // front-expiry days (the chart's reference)
}

const SAMPLE_POINTS = 1601;          // 1600 segments → 1601 points
const SAMPLE_RANGE_MULTIPLIER = 3;   // sample out to 3× max strike for tail detection

export function netCredit(legs: TradeLeg[]): number {
  // Per-contract dollars. Short = +premium, Long = −premium.
  let acc = 0;
  for (const l of legs) {
    const sign = l.side === "long" ? -1 : 1;
    acc += sign * (l.premium || 0) * 100 * (l.qty || 1);
  }
  return acc;
}

export function summarizePayoff(
  legs: TradeLeg[],
  spot: number,
  iv: number,
  r: number,
): PayoffSummary | null {
  if (!legs.length) return null;
  const strikes = legs.map((l) => l.strike).filter((k) => k > 0);
  if (!strikes.length) return null;
  const maxK = Math.max(...strikes);
  const evalDTE = Math.min(...legs.map((l) => l.expiry_days || 30));

  // Unbounded-tail detection from the net call slope at large S: any
  // positive net long calls → profit unbounded above; net short calls
  // → loss unbounded above. Symmetric for puts isn't needed (puts
  // can't drive S below 0).
  const callSlopeContracts = legs.reduce(
    (acc, l) => l.type !== "call" ? acc : acc + (l.side === "long" ? 1 : -1) * (l.qty || 1),
    0,
  );
  const profitUnbounded = callSlopeContracts > 0;
  const lossUnbounded = callSlopeContracts < 0;

  // Sample out to a generous upper bound so unbounded-tail structures
  // get a representative high-S P/L.
  const big = Math.max(maxK, spot, 1) * SAMPLE_RANGE_MULTIPLIER + 50;
  const pts = payoffCurve(legs, 0, big, SAMPLE_POINTS, evalDTE, iv, r);

  let maxP = -Infinity;
  let maxL = Infinity;
  const breakevens: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const v = pts[i].pl;
    if (v > maxP) maxP = v;
    if (v < maxL) maxL = v;
    if (i > 0) {
      const prev = pts[i - 1].pl;
      // Detect sign change between adjacent samples; linearly
      // interpolate the crossing.
      if ((prev <= 0 && v > 0) || (prev >= 0 && v < 0)) {
        const t = prev / (prev - v);
        breakevens.push(pts[i - 1].S + t * (pts[i].S - pts[i - 1].S));
      }
    }
  }

  const finiteMaxP = profitUnbounded ? null : maxP;
  const finiteMaxL = lossUnbounded ? null : maxL;
  const rr =
    finiteMaxP != null && finiteMaxL != null && finiteMaxL < 0
      ? finiteMaxP / Math.abs(finiteMaxL)
      : null;

  return {
    netCredit: netCredit(legs),
    maxP: finiteMaxP,
    maxL: finiteMaxL,
    profitUnbounded,
    lossUnbounded,
    breakevens,
    rr,
    evalDTE,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Structure classifier — recognizes common multi-leg structures by
// shape. Naming only; no scoring implication. A trainee who builds
// four mids gets to see "Iron Condor" without having to know the
// name first.
// ─────────────────────────────────────────────────────────────────────

export function classifyStructure(legs: TradeLeg[]): string {
  const n = legs.length;
  if (n === 0) return "";
  const calls = legs.filter((l) => l.type === "call");
  const puts = legs.filter((l) => l.type === "put");
  const dtes = [...new Set(legs.map((l) => l.expiry_days))];
  const multi = dtes.length > 1;

  if (n === 1) {
    const l = legs[0];
    return `${l.side === "long" ? "Long" : "Short"} ${l.type === "call" ? "Call" : "Put"}`;
  }

  if (n === 2) {
    const [a, b] = legs;
    const sameType = a.type === b.type;
    const oppDir = a.side !== b.side;

    if (sameType && oppDir) {
      const L = legs.find((l) => l.side === "long")!;
      const S = legs.find((l) => l.side === "short")!;
      const T = a.type === "call" ? "Call" : "Put";

      if (a.strike === b.strike && multi) {
        return `${L.expiry_days > S.expiry_days ? "Long" : "Reverse"} ${T} Calendar Spread`;
      }
      if (a.strike !== b.strike && multi) {
        return `${T} Diagonal Spread`;
      }
      if (a.type === "put") {
        return S.strike > L.strike ? "Bull Put Spread (credit)" : "Bear Put Spread (debit)";
      }
      return S.strike < L.strike ? "Bear Call Spread (credit)" : "Bull Call Spread (debit)";
    }
    if (!sameType && a.side === b.side) {
      const same = a.strike === b.strike;
      return a.side === "long"
        ? same ? "Long Straddle" : "Long Strangle"
        : same ? "Short Straddle" : "Short Strangle";
    }
    return "Custom 2-leg position";
  }

  if (n === 4 && calls.length === 2 && puts.length === 2) {
    if (multi) return "Double Calendar / Custom";
    const shorts = legs.filter((l) => l.side === "short");
    if (shorts.length === 2) {
      const sp = shorts.map((s) => s.strike);
      return sp[0] === sp[1] ? "Iron Butterfly" : "Iron Condor";
    }
  }

  return `Custom ${n}-leg position`;
}

// ─────────────────────────────────────────────────────────────────────
// Order ticket — broker-style multi-line text. Useful for the Copy
// handoff and for telling the trainee what they've built in
// concrete BTO/STO terms.
// ─────────────────────────────────────────────────────────────────────

const oc = (t: "call" | "put") => (t === "call" ? "C" : "P");
const trimNum = (k: number) => (Number.isInteger(k) ? k.toFixed(0) : parseFloat(k.toFixed(2)).toString());
const money = (v: number) => (v < 0 ? "−" : "") + "$" + Math.abs(Math.round(v)).toLocaleString();
const px = (v: number) => "$" + v.toFixed(2);

function expiryDateOf(legs: TradeLeg[], dte: number): string {
  // Prefer the actual expiration string from a leg that matches this
  // dte (if available via the caller threading ProposedLeg through),
  // but the TradeLeg shape doesn't carry expiration. Compute relative
  // to today as a fallback for the ticket header.
  void legs;
  const d = new Date();
  d.setDate(d.getDate() + Math.round(dte));
  return d.toISOString().slice(0, 10);
}

export function describeOrderTicket(
  legs: TradeLeg[],
  ticker: string,
  stats: PayoffSummary,
  name: string,
): string {
  if (!legs.length) return "";
  const SYM = (ticker || "UNDERLYING").toUpperCase();
  const dtes = [...new Set(legs.map((l) => l.expiry_days))];
  const multi = dtes.length > 1;
  const verb = stats.netCredit >= 0 ? "SELL TO OPEN" : "BUY TO OPEN";
  const ordered = [...legs].sort((a, b) => b.strike - a.strike || a.expiry_days - b.expiry_days);
  const lines = ordered.map((l) => {
    const oo = l.side === "long" ? "BTO" : "STO";
    const ex = multi ? ` ${expiryDateOf(legs, l.expiry_days)}` : "";
    return `  ${oo} ${l.qty || 1}× ${SYM}${ex} ${trimNum(l.strike)}${oc(l.type)} @ ${(l.premium || 0).toFixed(2)}`;
  });

  const header = multi
    ? `${SYM} · multi-expiry (${[...dtes].sort((a, b) => a - b).join("/")} DTE)`
    : `${SYM} · ${dtes[0]} DTE (exp ${expiryDateOf(legs, dtes[0])})`;
  const creditLine = stats.netCredit >= 0
    ? `Net credit: ${money(stats.netCredit)}`
    : `Net debit: ${money(Math.abs(stats.netCredit))}`;
  const mp = stats.profitUnbounded ? "Unlimited" : stats.maxP != null ? money(stats.maxP) : "—";
  const ml = stats.lossUnbounded ? "Unlimited" : stats.maxL != null ? money(stats.maxL) : "—";
  const be = stats.breakevens.length ? stats.breakevens.map((b) => px(b)).join(" / ") : "—";
  const rr = stats.rr != null ? `${stats.rr.toFixed(2)} : 1  (${(stats.rr * 100).toFixed(0)}% RWR)` : "—";

  return [
    `${verb} — ${name}`,
    header,
    ...lines,
    "",
    creditLine,
    `Max profit: ${mp}    Max loss: ${ml}`,
    `Break-even: ${be}`,
    `Reward : Risk  ${rr}`,
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────
// Presets — example structures the trainee can load as a learning
// aid. Premiums come from the REAL chain (not the artifact's
// hardcoded numbers), so the resulting payoff is what the trainee
// would see if they tapped the same strikes on the chain themselves.
//
// Each preset specifies a "shape" — what strikes to pick relative to
// spot, at what expirations. The builder resolves that against the
// scenario's actual chain and skips any shape that can't be
// satisfied (e.g. spot outside the ladder).
// ─────────────────────────────────────────────────────────────────────

type ExpAnchor = "near" | "mid" | "far";

interface PresetLegSpec {
  side: "buy" | "sell";
  type: "call" | "put";
  // Strike target as a multiplier of spot. Snapped to nearest chain
  // strike at build time.
  strikeMult: number;
  exp: ExpAnchor;
}

interface PresetDef {
  label: string;
  description: string;
  specs: PresetLegSpec[];
}

export const PRESETS: PresetDef[] = [
  {
    label: "Bull Put Spread",
    description: "Short OTM put + long lower put. Bullish credit spread.",
    specs: [
      { side: "sell", type: "put", strikeMult: 0.97, exp: "near" },
      { side: "buy", type: "put", strikeMult: 0.92, exp: "near" },
    ],
  },
  {
    label: "Bear Call Spread",
    description: "Short OTM call + long higher call. Bearish credit spread.",
    specs: [
      { side: "sell", type: "call", strikeMult: 1.03, exp: "near" },
      { side: "buy", type: "call", strikeMult: 1.08, exp: "near" },
    ],
  },
  {
    label: "Iron Condor",
    description: "Both wings short, both wings long beyond. Wide range-bound.",
    specs: [
      { side: "sell", type: "put", strikeMult: 0.96, exp: "near" },
      { side: "buy", type: "put", strikeMult: 0.91, exp: "near" },
      { side: "sell", type: "call", strikeMult: 1.04, exp: "near" },
      { side: "buy", type: "call", strikeMult: 1.09, exp: "near" },
    ],
  },
  {
    label: "Iron Butterfly",
    description: "ATM straddle short + far OTM wings long. Narrow pin trade.",
    specs: [
      { side: "sell", type: "put", strikeMult: 1.0, exp: "near" },
      { side: "buy", type: "put", strikeMult: 0.9, exp: "near" },
      { side: "sell", type: "call", strikeMult: 1.0, exp: "near" },
      { side: "buy", type: "call", strikeMult: 1.1, exp: "near" },
    ],
  },
  {
    label: "Long Straddle",
    description: "Long ATM call + long ATM put. Pre-event vol play.",
    specs: [
      { side: "buy", type: "call", strikeMult: 1.0, exp: "near" },
      { side: "buy", type: "put", strikeMult: 1.0, exp: "near" },
    ],
  },
  {
    label: "Short Strangle",
    description: "Short OTM call + short OTM put. Premium-collection on range.",
    specs: [
      { side: "sell", type: "call", strikeMult: 1.03, exp: "near" },
      { side: "sell", type: "put", strikeMult: 0.97, exp: "near" },
    ],
  },
  {
    label: "Call Calendar",
    description: "Short near-dated ATM call + long back-dated same strike.",
    specs: [
      { side: "sell", type: "call", strikeMult: 1.0, exp: "near" },
      { side: "buy", type: "call", strikeMult: 1.0, exp: "far" },
    ],
  },
  {
    label: "Put Calendar",
    description: "Short near-dated ATM put + long back-dated same strike.",
    specs: [
      { side: "sell", type: "put", strikeMult: 1.0, exp: "near" },
      { side: "buy", type: "put", strikeMult: 1.0, exp: "far" },
    ],
  },
  {
    label: "Diagonal (PMCC)",
    description: "Long deep-ITM back-month call + short OTM front-month call.",
    specs: [
      { side: "buy", type: "call", strikeMult: 0.85, exp: "far" },
      { side: "sell", type: "call", strikeMult: 1.05, exp: "near" },
    ],
  },
];

/// Find the chain strike nearest a target value within a given
/// expiration. Returns null if the expiration has no rows.
function nearestStrike(chain: OptionChainRow[], expiration: string, targetK: number): OptionChainRow | null {
  const rows = chain.filter((r) => r.expiration === expiration);
  if (!rows.length) return null;
  let best = rows[0];
  let bestDiff = Math.abs(rows[0].strike - targetK);
  for (let i = 1; i < rows.length; i++) {
    const d = Math.abs(rows[i].strike - targetK);
    if (d < bestDiff) { best = rows[i]; bestDiff = d; }
  }
  return best;
}

export function buildPresetLegs(
  presetLabel: string,
  scenario: Scenario | null,
  chain: OptionChainRow[],
): ProposedLeg[] {
  if (!scenario || !chain.length) return [];
  const preset = PRESETS.find((p) => p.label === presetLabel);
  if (!preset) return [];
  const spot = scenario.asset?.spot;
  if (typeof spot !== "number" || spot <= 0) return [];

  // Resolve the chain's expiration anchors. Sort distinct expirations
  // by DTE ascending; "near" = first, "far" = last, "mid" = middle.
  const expirations = [...new Set(chain.map((r) => r.expiration))].sort((a, b) => {
    const da = chain.find((r) => r.expiration === a)?.dte ?? 0;
    const db = chain.find((r) => r.expiration === b)?.dte ?? 0;
    return da - db;
  });
  if (!expirations.length) return [];
  const anchor = (a: ExpAnchor): string => {
    if (a === "near") return expirations[0];
    if (a === "far") return expirations[expirations.length - 1];
    return expirations[Math.floor(expirations.length / 2)];
  };

  const legs: ProposedLeg[] = [];
  for (const spec of preset.specs) {
    const exp = anchor(spec.exp);
    const row = nearestStrike(chain, exp, spot * spec.strikeMult);
    if (!row) return []; // can't satisfy → abort the whole preset
    legs.push({
      expiration: row.expiration,
      dte: row.dte,
      strike: row.strike,
      type: spec.type,
      side: spec.side,
      premium: spec.type === "call" ? row.call_mid : row.put_mid,
      qty: 1,
    });
  }
  return legs;
}
