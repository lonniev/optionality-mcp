// Black-Scholes pricing and payoff curves for the Optionality drill.
// Math preserved verbatim from the canonical artifact — do not redesign.
//
// Server-side: the live game's option chain comes from
// tools/options_chain.py — one source of truth feeds both the chain
// shown to the trainee and the chain the judge prompt sees, so they
// can't drift onto different mental models.
//
// FE-side (this file): used for the risk-profile payoff curves and
// (since v0.1.25) for computing the option chain shown on the static
// Sample Assessment, which has no judge to keep symmetric with.

import type { LegType, OptionChainRow, TradeLeg } from "../types";

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

/// Black-Scholes delta — calls in (0, 1), puts in (-1, 0).
export function bsDelta(S: number, K: number, t: number, r: number, sigma: number, type: LegType): number {
  if (t <= 0 || sigma <= 0) {
    if (type === "call") return S > K ? 1 : 0;
    return S < K ? -1 : 0;
  }
  const sqrtT = Math.sqrt(t);
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * t) / (sigma * sqrtT);
  return type === "call" ? normCdf(d1) : normCdf(d1) - 1;
}

/// Three-anchor piecewise-linear smile in log-moneyness. Mirrors the
/// Python ``_iv_at_strike`` in tools/options_chain.py — same anchor
/// logic, same clamps. ATM → atm_iv; -m25 → iv25dPut; +m25 → iv25dCall;
/// where m25 ≈ atm_iv * sqrt(T) * 0.6745 is the log-moneyness magnitude
/// at which a flat-IV BS chain has |delta| ≈ 0.25.
export function ivAtStrike(
  S: number,
  K: number,
  atmIv: number,
  iv25dPut: number,
  iv25dCall: number,
  tYears: number,
): number {
  if (S <= 0 || K <= 0 || atmIv <= 0 || tYears <= 0) {
    return atmIv > 0 ? atmIv : 0.01;
  }
  const m = Math.log(K / S);
  const m25 = Math.max(atmIv * Math.sqrt(tYears) * 0.6745, 1e-6);
  const slope = m >= 0
    ? (iv25dCall - atmIv) / m25
    : (atmIv - iv25dPut) / m25;
  const iv = atmIv + slope * m;
  return Math.max(Math.min(iv, atmIv * 3.0), atmIv * 0.30);
}

const DEFAULT_R = 0.045;

/// Build a flat list of option-chain rows from scaffolds. Mirrors the
/// Python ``build_option_chain`` so the FE-rendered sample chain reads
/// the same shape as a live chain coming back from the server.
export function buildOptionChain(args: {
  spot: number;
  atmIvPct: number;
  iv25dPutPct?: number;
  iv25dCallPct?: number;
  todayDate: string;
  expirations: string[];
  strikeLadder: { min: number; max: number; step: number };
  r?: number;
}): OptionChainRow[] {
  const r = args.r ?? DEFAULT_R;
  const atmIv = args.atmIvPct / 100;
  const iv25dp = (args.iv25dPutPct ?? args.atmIvPct) / 100;
  const iv25dc = (args.iv25dCallPct ?? args.atmIvPct) / 100;

  const today = new Date(args.todayDate + "T00:00:00Z");
  const expiries: Array<{ iso: string; dte: number }> = [];
  for (const e of args.expirations) {
    const d = new Date(e + "T00:00:00Z");
    if (Number.isNaN(d.getTime())) continue;
    const dte = Math.round((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (dte > 0) expiries.push({ iso: e, dte });
  }
  expiries.sort((a, b) => a.dte - b.dte);

  const strikes: number[] = [];
  const { min, max, step } = args.strikeLadder;
  let i = 0;
  while (true) {
    const k = min + i * step;
    if (k > max + step * 0.5) break;
    strikes.push(Math.round(k * 100) / 100);
    i += 1;
    if (i > 200) break;
  }

  const rows: OptionChainRow[] = [];
  for (const { iso, dte } of expiries) {
    const t = dte / 365;
    for (const K of strikes) {
      const iv = ivAtStrike(args.spot, K, atmIv, iv25dp, iv25dc, t);
      rows.push({
        expiration: iso,
        dte,
        strike: K,
        iv: Math.round(iv * 1000) / 10,
        call_mid: Math.round(bsPrice(args.spot, K, t, r, iv, "call") * 100) / 100,
        call_delta: Math.round(bsDelta(args.spot, K, t, r, iv, "call") * 100) / 100,
        put_mid: Math.round(bsPrice(args.spot, K, t, r, iv, "put") * 100) / 100,
        put_delta: Math.round(bsDelta(args.spot, K, t, r, iv, "put") * 100) / 100,
      });
    }
  }
  return rows;
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
