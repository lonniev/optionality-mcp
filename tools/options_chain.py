"""Server-side options chain builder.

The dealer LLM emits only scaffolds (today_date, expirations,
strike_ladder, and three smile anchors on the asset: iv_30d,
iv_25d_put, iv_25d_call). The server runs Black-Scholes against those
to produce a concrete chain — call mid, put mid, delta — that the FE
renders verbatim and the judge prompt reads. One source of truth keeps
trainee and judge from drifting onto different mental models.

Skew is honored via a 3-anchor piecewise-linear smile in log-moneyness.
A flat-IV chain would let trainees ignore the scenario's skew_note and
pay no price; the macro_integration rubric is the reason it matters.

Risk-free rate defaults to 4.5%. Term structure is flat (all expiries
use the same smile); butterfly beyond 25-delta is a linear
extrapolation. Both are deliberate v1 simplifications.
"""

from __future__ import annotations

import math
from datetime import date
from typing import Any

_R_DEFAULT = 0.045  # 4.5% risk-free rate


def _norm_cdf(x: float) -> float:
    # Abramowitz-Stegun approximation. Same coefficients as the FE's
    # frontend/src/lib/bs.ts so trainee-side and server-side prices
    # agree to the rounding shown.
    a1 = 0.254829592
    a2 = -0.284496736
    a3 = 1.421413741
    a4 = -1.453152027
    a5 = 1.061405429
    p = 0.3275911
    sign = -1.0 if x < 0 else 1.0
    ax = abs(x) / math.sqrt(2.0)
    t = 1.0 / (1.0 + p * ax)
    y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * math.exp(-ax * ax)
    return 0.5 * (1.0 + sign * y)


def _bs_price(S: float, K: float, t_years: float, r: float, sigma: float, kind: str) -> float:
    if t_years <= 0 or sigma <= 0:
        return max(S - K, 0.0) if kind == "call" else max(K - S, 0.0)
    sqrt_t = math.sqrt(t_years)
    d1 = (math.log(S / K) + (r + (sigma * sigma) / 2.0) * t_years) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    if kind == "call":
        return S * _norm_cdf(d1) - K * math.exp(-r * t_years) * _norm_cdf(d2)
    return K * math.exp(-r * t_years) * _norm_cdf(-d2) - S * _norm_cdf(-d1)


def _bs_delta(S: float, K: float, t_years: float, r: float, sigma: float, kind: str) -> float:
    if t_years <= 0 or sigma <= 0:
        if kind == "call":
            return 1.0 if S > K else 0.0
        return -1.0 if S < K else 0.0
    sqrt_t = math.sqrt(t_years)
    d1 = (math.log(S / K) + (r + (sigma * sigma) / 2.0) * t_years) / (sigma * sqrt_t)
    if kind == "call":
        return _norm_cdf(d1)
    return _norm_cdf(d1) - 1.0


def _iv_at_strike(
    S: float,
    K: float,
    atm_iv: float,
    iv_25dp: float,
    iv_25dc: float,
    t_years: float,
) -> float:
    """Three-anchor piecewise-linear smile in log-moneyness.

    Anchors: log(K/S) = 0 → atm_iv; log(K/S) = -m25 → iv_25dp (put
    wing); log(K/S) = +m25 → iv_25dc (call wing). m25 is the
    log-moneyness magnitude at which a flat-IV BS chain has delta ~0.25
    (z = 0.6745 in the lognormal). Linear interp between anchors;
    linear extrapolation beyond, clamped so deep wings stay in
    [0.30 × atm_iv, 3.0 × atm_iv].
    """
    if S <= 0 or K <= 0 or atm_iv <= 0 or t_years <= 0:
        return atm_iv if atm_iv > 0 else 0.01
    m = math.log(K / S)
    m25 = max(atm_iv * math.sqrt(t_years) * 0.6745, 1e-6)
    if m >= 0:
        # Call wing: ATM → 25Δ-call as m increases.
        slope = (iv_25dc - atm_iv) / m25
    else:
        # Put wing: ATM → 25Δ-put as m decreases.
        slope = (atm_iv - iv_25dp) / m25
    iv = atm_iv + slope * m
    return max(min(iv, atm_iv * 3.0), atm_iv * 0.30)


def _parse_iso_date(s: Any) -> date | None:
    if not isinstance(s, str):
        return None
    try:
        # Tolerate plain ISO; ignore time components if present.
        return date.fromisoformat(s.split("T")[0].strip())
    except (ValueError, AttributeError):
        return None


def _frange_strikes(lo: float, hi: float, step: float) -> list[float]:
    if step <= 0 or hi < lo:
        return []
    out: list[float] = []
    # Use an integer counter to avoid float-step drift.
    k = lo
    i = 0
    while k <= hi + step * 0.5:
        # Round to a sensible precision based on the step magnitude.
        if step >= 1:
            out.append(round(k, 2))
        else:
            out.append(round(k, 4))
        i += 1
        k = lo + i * step
        if i > 200:  # safety guard
            break
    return out


def build_option_chain(scenario: dict[str, Any]) -> list[dict[str, Any]] | None:
    """Build the concrete chain from scenario scaffolds.

    Returns a flat list of rows ordered by (expiration ascending, strike
    ascending). Each row is JSON-safe primitives only. Returns ``None``
    if essential scaffolds are missing — the FE then simply skips the
    chain table and the scenario still works.
    """
    asset = scenario.get("asset") or {}
    try:
        spot = float(asset.get("spot"))
        atm_iv_pct = float(asset.get("iv_30d"))
    except (TypeError, ValueError):
        return None
    if spot <= 0 or atm_iv_pct <= 0:
        return None
    atm_iv = atm_iv_pct / 100.0

    # Smile anchors fall back to flat IV if either wing is missing.
    try:
        iv_25dp = float(asset.get("iv_25d_put", atm_iv_pct)) / 100.0
    except (TypeError, ValueError):
        iv_25dp = atm_iv
    try:
        iv_25dc = float(asset.get("iv_25d_call", atm_iv_pct)) / 100.0
    except (TypeError, ValueError):
        iv_25dc = atm_iv

    today = _parse_iso_date(scenario.get("today_date"))
    if today is None:
        return None

    expirations_raw = scenario.get("expirations")
    if not isinstance(expirations_raw, list) or not expirations_raw:
        return None
    expirations: list[tuple[str, int]] = []
    for exp in expirations_raw:
        d = _parse_iso_date(exp)
        if d is None:
            continue
        dte = (d - today).days
        if dte <= 0:
            continue
        expirations.append((d.isoformat(), dte))
    if not expirations:
        return None
    expirations.sort(key=lambda pair: pair[1])

    ladder = scenario.get("strike_ladder") or {}
    try:
        k_min = float(ladder.get("min"))
        k_max = float(ladder.get("max"))
        k_step = float(ladder.get("step"))
    except (TypeError, ValueError):
        return None
    strikes = _frange_strikes(k_min, k_max, k_step)
    if not strikes:
        return None

    rows: list[dict[str, Any]] = []
    for exp_iso, dte in expirations:
        t_years = dte / 365.0
        for K in strikes:
            iv = _iv_at_strike(spot, K, atm_iv, iv_25dp, iv_25dc, t_years)
            call = _bs_price(spot, K, t_years, _R_DEFAULT, iv, "call")
            put = _bs_price(spot, K, t_years, _R_DEFAULT, iv, "put")
            cdelta = _bs_delta(spot, K, t_years, _R_DEFAULT, iv, "call")
            pdelta = _bs_delta(spot, K, t_years, _R_DEFAULT, iv, "put")
            rows.append({
                "expiration": exp_iso,
                "dte": dte,
                "strike": K,
                "iv": round(iv * 100, 1),
                "call_mid": round(call, 2),
                "call_delta": round(cdelta, 2),
                "put_mid": round(put, 2),
                "put_delta": round(pdelta, 2),
            })
    return rows
