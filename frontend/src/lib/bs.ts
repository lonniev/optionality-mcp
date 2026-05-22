// Black-Scholes pricing and payoff curves for the Optionality drill.
// Math preserved verbatim from the canonical artifact — do not redesign.

import type { LegType, TradeLeg } from "../types";

export interface PayoffPoint {
  S: number;
  pl: number;
}

export function normCdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

export function bsPrice(S: number, K: number, t: number, r: number, sigma: number, type: LegType): number {
  if (t <= 0 || sigma <= 0) {
    return type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
  }
  const sqrtT = Math.sqrt(t);
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * t) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  return type === "call"
    ? S * normCdf(d1) - K * Math.exp(-r * t) * normCdf(d2)
    : K * Math.exp(-r * t) * normCdf(-d2) - S * normCdf(-d1);
}

export function legPL(leg: TradeLeg, S: number, daysElapsed: number, sigma: number, r: number): number {
  const expiryDays = leg.expiry_days || 30;
  const dte = Math.max(0, expiryDays - daysElapsed);
  const t = dte / 365;
  const optVal = bsPrice(S, leg.strike, t, r, sigma, leg.type);
  const sign = leg.side === "long" ? 1 : -1;
  const qty = leg.qty || 1;
  const premium = leg.premium || 0;
  return sign * qty * (optVal - premium) * 100;
}

export function payoffCurve(
  legs: TradeLeg[],
  sMin: number,
  sMax: number,
  points: number,
  daysElapsed: number,
  sigma: number,
  r: number,
): PayoffPoint[] {
  const out: PayoffPoint[] = [];
  for (let i = 0; i < points; i++) {
    const S = sMin + (sMax - sMin) * (i / (points - 1));
    let pl = 0;
    for (const leg of legs) pl += legPL(leg, S, daysElapsed, sigma, r);
    out.push({ S, pl });
  }
  return out;
}

export function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * pow;
}
