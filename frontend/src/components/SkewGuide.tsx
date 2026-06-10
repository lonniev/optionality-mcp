// "Guide to Skew" — an educational aid reachable from a discreet
// "Skew Guide" button next to the scenario's Skew note. The IV curve is
// the *literal* smile this scenario prices, computed from the same
// three-anchor piecewise-linear smile (ATM + 25Δ put + 25Δ call) that
// the OptionChainGuide tables use server-side. Trainee and judge read
// from the same curve — no synthesized regime shapes, no clamped
// ATM IV. When a scenario predates the structured smile anchors, the
// curve degrades to flat IV at iv30d and the lede says so plainly.

import { useEffect, useMemo, useState } from "react";

interface SkewGuideProps {
  ticker: string;
  name: string;
  spot: number;
  iv30d: number; // ATM 30-day IV as a percent, e.g. 24
  // IV Rank (0–100): where today's IV level sits within this name's own
  // trailing range. This is the *level* signal — "is premium rich at
  // all right now?" — as opposed to skew, which is the *shape* signal.
  // The scenario carries it (asset.iv_rank) and the card shows it, but
  // the guide needs it to teach level-vs-shape. Optional: some scenarios
  // are dealt without a rank.
  ivRank?: number;
  // Structured smile anchors from the scenario. Both in vol-percent
  // (same units as iv30d). When both are present, the curve is a
  // *literal* read of the scenario's smile — what the chain you're
  // pitching against actually prices. When missing (old / pre-chain
  // scenarios), the curve degrades to flat IV at iv30d and the lede
  // says so plainly. We do NOT synthesize a shape — ambiguity here
  // is deadly to understanding.
  iv25dPut?: number;
  iv25dCall?: number;
  // Narrative color the dealer wrote about the regime — passed through
  // but not used here (it shows on the scenario card directly).
  // Accepting it keeps the call sites tidy.
  skewNote?: string;
}

const W = 640;
const H = 360;
const M = { l: 46, r: 18, t: 24, b: 42 };
const PLOT_W = W - M.l - M.r;
const PLOT_H = H - M.t - M.b;

/// Pick a "nice" strike increment ≈ 0.6% of spot, snapped to a
/// human-readable ladder. $415 → 2.5, a $40 name → 0.5, a $900 name → 5.
function niceStep(spot: number): number {
  const target = spot * 0.006;
  for (const c of [0.25, 0.5, 1, 2.5, 5, 10, 25, 50]) {
    if (c >= target) return c;
  }
  return 100;
}

function roundTo(v: number, step: number): number {
  return Math.round(v / step) * step;
}

export default function SkewGuide({ ticker, name, spot, iv30d, ivRank, iv25dPut, iv25dCall }: SkewGuideProps) {
  const [open, setOpen] = useState(false);
  const [widthMult, setWidthMult] = useState<1 | 2>(1);

  // True if the scenario carries the structured smile anchors. When
  // false the curve degrades to flat IV at iv30d and the lede tells
  // the trainee that explicitly — no implied shape, no ambiguity.
  const hasSmile = typeof iv25dPut === "number" && typeof iv25dCall === "number";

  // While the modal is open: Escape closes it and the page behind it
  // is scroll-locked so the backdrop doesn't drift under the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // The structured smile: three anchor points at log(K/S) ∈ {-m25, 0, +m25}
  // with linear interpolation between them and linear extrapolation
  // beyond, clamped so deep-wing strikes don't blow up. Mirrors the
  // server-side _iv_at_strike (tools/options_chain.py) and the
  // FE-side ivAtStrike used in SampleAssessment so the SkewGuide
  // shows the literal curve the OptionChainGuide tables price from.
  const smile = useMemo(() => {
    const atm = Math.max(0.01, (iv30d || 24) / 100);
    const put = hasSmile ? Math.max(0.01, (iv25dPut as number) / 100) : atm;
    const call = hasSmile ? Math.max(0.01, (iv25dCall as number) / 100) : atm;
    // 30-day tenor — iv_30d is the ATM anchor so this is the smile
    // SkewGuide is meant to render.
    const T = 30 / 365;
    const m25 = Math.max(atm * Math.sqrt(T) * 0.6745, 1e-6);
    return { atm, put, call, m25 };
  }, [iv30d, iv25dPut, iv25dCall, hasSmile]);

  function ivAt(k: number): number {
    const m = Math.log(k / spot);
    const slope = m >= 0
      ? (smile.call - smile.atm) / smile.m25
      : (smile.atm - smile.put) / smile.m25;
    const iv = smile.atm + slope * m;
    return Math.max(Math.min(iv, smile.atm * 3.0), smile.atm * 0.30);
  }

  const geom = useMemo(() => {
    const step = niceStep(spot);
    const Kmin = roundTo(spot * 0.91, step);
    const Kmax = roundTo(spot * 1.09, step);
    // Adapt y-axis to the actual wing extremes so high-IV scenarios
    // (e.g. 100%+ ATM during a vol shock) fit in frame and a thin-IV
    // name doesn't waste half the chart on empty space.
    const wingPut = ivAt(Kmin);
    const wingCall = ivAt(Kmax);
    const lo = Math.min(smile.atm, smile.put, smile.call, wingPut, wingCall);
    const hi = Math.max(smile.atm, smile.put, smile.call, wingPut, wingCall);
    const pad = Math.max(0.04, (hi - lo) * 0.18);
    const IVmin = Math.max(0.0, lo - pad);
    const IVmax = hi + pad;
    const sliderMin = roundTo(spot * 0.935, step);
    const sliderMax = roundTo(spot * 1.024, step);
    const defaultShort = roundTo(spot * 0.988, step);
    return { step, Kmin, Kmax, IVmin, IVmax, sliderMin, sliderMax, defaultShort };
    // ivAt closes over smile; smile is in deps via the destructure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot, smile]);

  const [shortStrike, setShortStrike] = useState<number>(() => geom.defaultShort);

  const { step, Kmin, Kmax, IVmin, IVmax, sliderMin, sliderMax } = geom;
  const width = step * widthMult;
  const longStrike = shortStrike - width;

  const xK = (k: number) => M.l + ((k - Kmin) / (Kmax - Kmin)) * PLOT_W;
  const yIV = (v: number) => M.t + ((IVmax - v) / (IVmax - IVmin)) * PLOT_H;
  const clampIV = (v: number) => Math.max(IVmin, Math.min(IVmax, v));

  /// Minimum-precision strike/width formatter. Shows just enough
  /// decimals to be honest: 0.25 stays "0.25" (not "0.3"), 0.50
  /// renders as "0.5", whole integers stay "39". The original
  /// `(step < 1 ? k.toFixed(1) : …)` silently rounded $0.25-wide
  /// spreads to "$0.3" — a width that doesn't exist on real chains.
  const fmtK = (k: number) => {
    if (Math.abs(k - Math.round(k)) < 1e-6) return String(Math.round(k));
    const oneDec = k.toFixed(1);
    if (Math.abs(parseFloat(oneDec) - k) < 1e-6) return oneDec;
    return k.toFixed(2);
  };

  // ── gridlines ──────────────────────────────────────────────────
  const ivLines: number[] = [];
  for (let v = Math.ceil(IVmin / 0.05) * 0.05; v <= IVmax + 1e-9; v += 0.05) ivLines.push(v);
  const gridStep = step * 4;
  const kLines: number[] = [];
  for (let k = Math.ceil(Kmin / gridStep) * gridStep; k <= Kmax + 1e-9; k += gridStep) kLines.push(k);

  // ── curve path ─────────────────────────────────────────────────
  const curvePath = useMemo(() => {
    const N = 120;
    let d = "";
    for (let i = 0; i <= N; i++) {
      const k = Kmin + ((Kmax - Kmin) * i) / N;
      const x = xK(k);
      const y = yIV(clampIV(ivAt(k)));
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
    // ivAt closes over `smile`; smile drives the curve shape.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smile, Kmin, Kmax, IVmin, IVmax, spot]);

  // ── readouts ───────────────────────────────────────────────────
  const sIV = ivAt(shortStrike);
  const lIV = ivAt(longStrike);
  const gap = (lIV - sIV) * 100;

  // The 25-delta skew compares the two OTM "wings": roughly the 25Δ put
  // (~6% below spot) against the 25Δ call (~6% above). The fear gauge is
  // put-wing IV minus call-wing IV; the chart marks both points and the
  // tilt of the line joining them *is* the skew.
  const putK25 = spot * 0.94;
  const callK25 = spot * 1.06;
  const putIV25 = ivAt(putK25);
  const callIV25 = ivAt(callK25);
  const fear = (putIV25 - callIV25) * 100;

  const ivPct = Math.round(iv30d || 24);

  // ── the LEVEL read (separate from skew, which is SHAPE) ──────────
  // IV Rank answers "is premium rich at all right now?" — the go/no-go
  // a seller asks *before* skew tells them which strike. We band it into
  // plain language so the trainee doesn't have to interpret a bare 0–100.
  const hasRank = typeof ivRank === "number";
  const rankPct = hasRank ? Math.round(ivRank as number) : null;
  const levelRead = (() => {
    if (rankPct == null) {
      return `This scenario didn't supply an IV Rank, so judge the level off ATM IV (${ivPct}%) and your own sense of whether that's high for ${ticker}.`;
    }
    if (rankPct >= 67) {
      return `IV Rank ${rankPct} — premium is rich (expensive) versus ${ticker}'s own trailing range. That's a seller's green light: options across the board are well-paid right now. Skew then tells you which strike to sell.`;
    }
    if (rankPct >= 34) {
      return `IV Rank ${rankPct} — premium is middling: not a fat pitch, not a famine. Lean on the scenario's own catalysts and let skew decide where the relative value sits.`;
    }
    return `IV Rank ${rankPct} — premium is cheap versus ${ticker}'s own range. Thin reward for sellers; the whole curve is low, so be choosier even where skew looks inviting.`;
  })();

  // Verdict reads the *actual* curve rather than a synthesized shape.
  // fear is the 25Δ put minus 25Δ call IV (in vol points): positive
  // = put-bid (the standard equity "smirk"), negative = call-bid
  // (commodity-style forward skew), near zero = symmetric (smile or
  // flat). The verdict text is anchored to the trainee's two legs
  // (long/short strike IVs they're staring at).
  const verdict = (() => {
    if (!hasSmile) {
      return `This scenario didn't supply 25Δ smile anchors, so the curve here is flat IV at ${ivPct}% ATM — purely the level, not the shape. Read the scenario's skew_note for the regime story.`;
    }
    if (fear >= 4) {
      return gap > 0.6
        ? `Reverse smirk (put-bid). The put you buy (${fmtK(longStrike)}) is meaningfully richer in vol than the one you sell (${fmtK(shortStrike)}) — skew eats into your credit, but the wing pays for fear. Sell below the steepest part for real cushion.`
        : `Reverse smirk (put-bid). Up near spot the skew is gentle; both legs carry similar vol, so the credit is clean — but you're closer to the money, so cushion is thinner. The classic trade-off.`;
    }
    if (fear <= -2) {
      return `Forward skew — the call wing is the rich one here. For a put spread on ${ticker} that's friendly: the puts you trade sit on the cheaper, flatter side. The danger this curve prices is an upside spike, not a collapse.`;
    }
    return `Roughly symmetric: both wings carry similar IV. ATM not a deep valley nor heavily biased — read for spot or event positioning rather than counting on skew to pay for a wing.`;
  })();

  const C = {
    put: "var(--rust)",
    call: "var(--sg-call)",
    gold: "var(--amber)",
    goldSoft: "var(--amber-bright)",
  };

  return (
    <div className="skew-guide">
      <button
        type="button"
        className="sg-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="sg-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
        Skew Guide
      </button>

      {open && (
        <div className="sg-scrim" onClick={() => setOpen(false)}>
          <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sg-topbar">
              <button
                type="button"
                className="sg-close"
                onClick={() => setOpen(false)}
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>
            <div className="sg-body">
          <h3 className="serif sg-title">Guide to Skew</h3>
          <p className="sg-lede">
            Implied volatility is not one number — it's a <em>curve</em> across strikes, a map of
            where the market is paying up for fear. For a premium seller it shows where the
            insurance is <em>richest</em> — and throughout this guide <strong>rich means
            expensive</strong> (a high premium): good to <em>sell</em>, bad to buy. It never means
            the option's holder gets rich.{" "}
            {hasSmile ? (
              <>
                The curve below is the <em>literal</em> smile this scenario prices — anchored to{" "}
                <strong>{ticker}</strong>{name ? ` (${name})` : ""} at spot{" "}
                <strong>${fmtK(spot)}</strong>, ATM 30-day IV <strong>{ivPct}%</strong>, 25Δ-put IV{" "}
                <strong>{Math.round(iv25dPut as number)}%</strong>, and 25Δ-call IV{" "}
                <strong>{Math.round(iv25dCall as number)}%</strong>. It is the same smile the option
                chain prices each strike from.
              </>
            ) : (
              <>
                This scenario was dealt before the structured smile anchors were captured, so the
                curve below shows flat IV at <strong>{ivPct}%</strong> across all strikes —{" "}
                <em>level only, no shape</em>. Read the scenario's skew_note for the regime story.
              </>
            )}
          </p>

          {/* interactive panel */}
          <div className="sg-panel">
            <div className="sg-chartwrap">
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Implied volatility skew curve for ${ticker}`}>
                {/* grid */}
                <g>
                  {ivLines.map((v) => (
                    <line key={`h${v}`} x1={M.l} y1={yIV(v)} x2={W - M.r} y2={yIV(v)} stroke="var(--sg-grid)" strokeWidth={1} />
                  ))}
                  {kLines.map((k) => (
                    <line key={`v${k}`} x1={xK(k)} y1={M.t} x2={xK(k)} y2={H - M.b} stroke="var(--sg-grid)" strokeWidth={1} />
                  ))}
                </g>

                {/* curve */}
                <defs>
                  <linearGradient id="sg-cg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={C.put} />
                    <stop offset="50%" stopColor={C.gold} />
                    <stop offset="100%" stopColor={C.call} />
                  </linearGradient>
                </defs>
                <path d={curvePath} fill="none" stroke="url(#sg-cg)" strokeWidth={2.6} strokeLinecap="round" />

                {/* 25-delta skew — mark the two OTM wings the fear gauge
                    compares and join them. The connector's tilt encodes
                    the regime: up-to-the-left = reverse/fear, flat = none,
                    up-to-the-right = forward. */}
                {(() => {
                  const xP = xK(putK25);
                  const yP = yIV(clampIV(putIV25));
                  const xC = xK(callK25);
                  const yC = yIV(clampIV(callIV25));
                  const diamond = (cx: number, cy: number) =>
                    `M${cx} ${cy - 6} L${cx + 6} ${cy} L${cx} ${cy + 6} L${cx - 6} ${cy} Z`;
                  const sign = fear >= 0 ? "+" : "";
                  return (
                    <g className="sg-skew25" pointerEvents="none">
                      <line x1={xP} y1={yP} x2={xC} y2={yC} stroke={C.gold} strokeWidth={1.6} strokeDasharray="5 4" opacity={0.9} />
                      <path d={diamond(xP, yP)} fill="var(--panel)" stroke={C.put} strokeWidth={2} />
                      <path d={diamond(xC, yC)} fill="var(--panel)" stroke={C.call} strokeWidth={2} />
                      <text x={xP} y={yP - 11} textAnchor="middle" className="sg-axis" fill={C.put}>25Δ put</text>
                      <text x={xC} y={yC + 20} textAnchor="middle" className="sg-axis" fill={C.call}>25Δ call</text>
                      {/* Magnitude chip parked over the put wing (open
                          space on the left), clear of the busy center. */}
                      <g transform={`translate(${xP} ${yP - 34})`}>
                        <rect x={-37} y={-13} width={74} height={16} rx={8} fill="var(--panel)" stroke={C.gold} strokeWidth={1} opacity={0.96} />
                        <text x={0} y={-2} textAnchor="middle" className="sg-tick" fill={C.goldSoft}>
                          25Δ {sign}{fear.toFixed(1)} pts
                        </text>
                      </g>
                    </g>
                  );
                })()}

                {/* legs */}
                {([
                  [longStrike, lIV, C.call, "long"],
                  [shortStrike, sIV, C.put, "short"],
                ] as Array<[number, number, string, string]>).map(([k, v, color, label]) => {
                  const x = xK(k);
                  const y = yIV(clampIV(v));
                  return (
                    <g key={label}>
                      <line x1={x} y1={y} x2={x} y2={H - M.b} stroke={color} strokeWidth={1} opacity={0.35} strokeDasharray="2 3" />
                      <circle cx={x} cy={y} r={6} fill={color} stroke="var(--panel)" strokeWidth={2} />
                      <text x={x} y={y - 12} textAnchor="middle" className="sg-axis" fill={color}>
                        {label} {fmtK(k)}
                      </text>
                    </g>
                  );
                })}

                {/* axes */}
                <g>
                  {ivLines.map((v) => (
                    <text key={`ht${v}`} x={M.l - 8} y={yIV(v) + 3} textAnchor="end" className="sg-tick">
                      {Math.round(v * 100)}%
                    </text>
                  ))}
                  {kLines.map((k) => (
                    <text key={`vt${k}`} x={xK(k)} y={H - M.b + 16} textAnchor="middle" className="sg-tick">
                      {fmtK(k)}
                    </text>
                  ))}
                  <line x1={xK(spot)} y1={M.t} x2={xK(spot)} y2={H - M.b} stroke="var(--ink-faint)" strokeWidth={1} strokeDasharray="3 4" opacity={0.8} />
                  <text x={xK(spot)} y={M.t - 8} textAnchor="middle" className="sg-axis" fill="var(--ink-soft)">SPOT</text>
                  <text x={M.l + PLOT_W / 2} y={H - 6} textAnchor="middle" className="sg-axis">STRIKE</text>
                  <text x={14} y={M.t + PLOT_H / 2} textAnchor="middle" className="sg-axis" transform={`rotate(-90 14 ${M.t + PLOT_H / 2})`}>
                    IMPLIED VOLATILITY
                  </text>
                </g>
              </svg>
            </div>

            <div className="sg-legend">
              <span><i className="sg-dot" style={{ background: C.gold }} />IV curve</span>
              <span><i className="sg-dot" style={{ background: C.put }} />short put (sold)</span>
              <span><i className="sg-dot" style={{ background: C.call }} />long put (bought)</span>
              <span><i className="sg-diamond" />25Δ wings (skew)</span>
              <span><i className="sg-dot" style={{ background: "var(--ink-faint)" }} />spot ≈ ${fmtK(spot)}</span>
            </div>

            <div className="sg-slider-row">
              <label>
                Short strike (the put you sell) — drag to walk it down the curve
                <span className="sg-widthbtns">
                  {([1, 2] as Array<1 | 2>).map((mult) => (
                    <button
                      key={mult}
                      type="button"
                      className={`sg-wbtn ${widthMult === mult ? "active" : ""}`}
                      onClick={() => setWidthMult(mult)}
                    >
                      ${fmtK(step * mult)} wide
                    </button>
                  ))}
                </span>
              </label>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={step}
                value={shortStrike}
                onChange={(e) => setShortStrike(parseFloat(e.target.value))}
              />
            </div>

            <div className="sg-readout">
              <div className="sg-stat"><div className="lab">Short put IV</div><div className="val put">{(sIV * 100).toFixed(1)}%</div></div>
              <div className="sg-stat"><div className="lab">Long put IV</div><div className="val call">{(lIV * 100).toFixed(1)}%</div></div>
              <div className="sg-stat"><div className="lab">Skew gap (leg-to-leg)</div><div className="val">{(gap >= 0 ? "+" : "") + gap.toFixed(1)} pts</div></div>
              <div className="sg-stat"><div className="lab">25Δ skew (fear gauge)</div><div className="val">{(fear >= 0 ? "+" : "") + fear.toFixed(1)} pts</div></div>
            </div>

            <div className="sg-verdict">{verdict}</div>
          </div>

          {/* three shapes */}
          <div className="sg-grid2">
            <div className="sg-card put-c">
              <div className="sg-cardtag">Equities &amp; indices — the default</div>
              <h4 className="serif">Reverse skew (smirk)</h4>
              <p>IV climbs as strikes fall. <span className="put-t">OTM puts are the most expensive options on the board.</span> The market is permanently bid for crash protection — hedging demand lifts downside IV. This is the world bull put spreads live in.</p>
            </div>
            <div className="sg-card">
              <div className="sg-cardtag">FX, single names, pre-event</div>
              <h4 className="serif">Volatility smile</h4>
              <p>Both wings lift; ATM is the cheap valley. The market fears a <em>big move either way</em> with no strong lean — classic ahead of binary events (earnings, FOMC, a CPI print) where gap risk is two-sided.</p>
            </div>
            <div className="sg-card call-c">
              <div className="sg-cardtag">Commodities — oil, gas, grains</div>
              <h4 className="serif">Forward skew</h4>
              <p>IV climbs as strikes <em>rise</em>. <span className="call-t">OTM calls are the most expensive options on the board</span> because the feared shock is to the <em>upside</em> — a supply disruption that spikes price. Energy names live closer to this regime.</p>
            </div>
            <div className="sg-card">
              <div className="sg-cardtag">The number to actually watch</div>
              <h4 className="serif">25-delta skew</h4>
              <p>Steepness = <strong>IV of the 25Δ put minus IV of the 25Δ call</strong>. A widening gap = fear bidding up the put wing (stress). A flattening gap = complacency. The cleanest read on "how scared is this name right now."</p>
            </div>
          </div>

          {/* the selling lens */}
          <h4 className="serif sg-h">Why it matters when you sell premium</h4>
          <p className="sg-p">
            You're not buying insurance — you're underwriting it. But a seller is really asking{" "}
            <strong>two separate questions</strong>, and <em>skew only answers the second one.</em>
          </p>

          {/* the two questions — the frame that resolves "is steep skew
              good or bad?". Level (IV Rank) says whether to play at all;
              shape (skew) says which strike and which structure. */}
          <table className="sg-table sg-2q">
            <thead>
              <tr><th>The question</th><th>Answered by</th><th>On this card</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>“Is premium <em>rich</em> at all right now?”</td>
                <td><strong>IV level + IV Rank</strong> — how high the whole curve sits</td>
                <td>IV 30d {ivPct}%{hasRank ? `, IV Rank ${rankPct}` : ""}</td>
              </tr>
              <tr>
                <td>“<em>Which strike</em>, and with what structure, do I keep the most of it?”</td>
                <td><strong>Skew</strong> — the <em>shape</em> of the curve across strikes</td>
                <td>the curve above</td>
              </tr>
            </tbody>
          </table>

          <p className="sg-p">
            <strong>Level is what pays you. Skew just decides how that pay is spread across
            strikes — and which structure captures it versus hands it back.</strong> A rich
            (expensive) curve means options everywhere are well-paid; skew is your actuarial table
            for where the overpaying concentrates.
          </p>

          {/* live level read — pulls IV Rank into the guide so the
              go/no-go isn't left implicit on the scenario card. */}
          <div className={`sg-level ${hasRank ? (rankPct! >= 67 ? "go" : rankPct! >= 34 ? "mid" : "no") : "mid"}`}>
            <div className="sg-ruleh">Step 1 · The level read (go / no-go)</div>
            {levelRead}
          </div>

          <div className="sg-rule">
            <div className="sg-ruleh">Step 2 · The shape read — and the spread wrinkle</div>
            Once the level says “play,” skew says <em>how</em>. The two seller structures use skew
            in opposite ways:
            <ul className="sg-ul">
              <li>
                <strong>Cash-secured put</strong> (sell one put outright): a steep put skew is a
                pure <em>tailwind</em> — you collect the single richest, most fear-bid option on
                the board and keep all of it.
              </li>
              <li>
                <strong>Bull put spread</strong> (sell the higher put, buy the lower one): here
                steep skew is a <em>tax</em>. The put you <strong>buy</strong> sits higher on the
                curve than the one you <strong>sell</strong>, so you pay rich and collect cheap —
                the steeper the skew, the smaller your net credit. That shrunk credit is the price
                of a capped, defined risk. Watch the <strong>skew gap</strong> readout do exactly
                this as you walk the short strike down.
              </li>
            </ul>
          </div>

          <p className="sg-p">
            So <span className="sg-gold">“fear = opportunity”</span> and the spread wrinkle aren't a
            contradiction: a fear-bid put wing means <em>elevated absolute premium</em> (good — you
            collect more), while the <em>tilt</em> of that wing is what a spread gives back for its
            risk cap. Your edge in either structure is the same: sell where the market's priced fear
            is <strong>richer than your own belief that price will hold</strong>.
          </p>

          {/* checklist */}
          <h4 className="serif sg-h">A practical reading checklist</h4>
          <table className="sg-table">
            <thead>
              <tr><th>What you see</th><th>What it means</th><th>Seller's move</th></tr>
            </thead>
            <tbody>
              <tr><td>High IV Rank + steep put skew</td><td>Premium rich (expensive) AND the richness sits in the puts</td><td>The textbook seller's setup — rich wing to sell, and the level says it's well-paid</td></tr>
              <tr><td>Steep put skew</td><td>Crash fear expensively priced</td><td>Put premium is fat — put your short strike <em>below</em> the steepest part of the ramp, so you collect fear-bid premium at a strike price still has room to avoid</td></tr>
              <tr><td>Flat skew</td><td>Complacency</td><td>Thin premium, little cushion priced in — be choosier</td></tr>
              <tr><td>Skew steepening fast</td><td>Stress building</td><td>IV expanding — the entry window is opening</td></tr>
              <tr><td>Smile forming</td><td>Binary event ahead</td><td>Two-sided gap risk — don't be short through it</td></tr>
              <tr><td>Forward skew (energy)</td><td>Upside shock feared</td><td>Calls are the expensive wing; puts relatively cheap to sell</td></tr>
            </tbody>
          </table>

          <div className="sg-foot">
            {hasSmile ? (
              <>
                Curve is the literal three-anchor smile this scenario prices: ATM IV{" "}
                {ivPct}%, 25Δ-put IV {Math.round(iv25dPut as number)}%, 25Δ-call IV{" "}
                {Math.round(iv25dCall as number)}%, anchored at {ticker} spot ${fmtK(spot)}. The
                option chain tables price each strike from this same smile. Implied vol is the
                market's forward guess, not a forecast — read it as sentiment priced.
              </>
            ) : (
              <>
                This scenario predates the structured smile anchors, so the curve is flat IV at{" "}
                {ivPct}% across all strikes (level, not shape). Read the scenario's skew_note for
                the regime story until a fresh scenario is dealt.
              </>
            )}
          </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .skew-guide {
          --sg-grid: color-mix(in srgb, var(--ink-faint) 22%, transparent);
          --sg-call: #5f97a8;
          margin: 6px 0 16px;
        }
        :root[data-theme="light"] .skew-guide { --sg-call: #3f7a8c; }

        .sg-trigger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          padding: 2px 0;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--amber);
          border-bottom: 1px dashed color-mix(in srgb, var(--amber) 50%, transparent);
          transition: color 140ms ease, border-color 140ms ease;
        }
        .sg-trigger:hover { color: var(--amber-bright); border-bottom-color: var(--amber-bright); }
        .sg-chevron { color: var(--ink-faint); font-size: 11px; }

        .sg-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .sg-modal {
          position: relative;
          width: 80vw;
          height: 80vh;
          background: var(--panel);
          border: 1px solid var(--amber);
          box-shadow: 0 16px 56px rgba(0, 0, 0, 0.6);
          overflow-y: auto;
          overflow-x: hidden;
        }
        /* Zero-height sticky bar so the close button stays pinned to the
           modal's top-right as the content scrolls beneath it. */
        .sg-topbar { position: sticky; top: 0; height: 0; z-index: 3; }
        .sg-close {
          position: absolute;
          top: 12px;
          right: 14px;
          width: 30px;
          height: 30px;
          line-height: 1;
          font-size: 14px;
          background: var(--bg-soft);
          border: 1px solid var(--panel-edge);
          color: var(--ink-soft);
          border-radius: 4px;
          cursor: pointer;
          transition: color 140ms ease, border-color 140ms ease;
        }
        .sg-close:hover { color: var(--amber-bright); border-color: var(--amber); }
        .sg-body {
          max-width: 900px;
          margin: 0 auto;
          padding: 22px 26px 30px;
        }
        .sg-title {
          font-size: 26px;
          color: var(--ink);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .sg-lede {
          font-family: 'Fraunces', Georgia, serif;
          font-style: italic;
          font-size: 14px;
          color: var(--ink-soft);
          margin-bottom: 16px;
          line-height: 1.55;
        }
        .sg-lede em { color: var(--amber-bright); font-style: italic; }
        .sg-lede strong { color: var(--ink); font-weight: 500; }

        .sg-panel {
          background: var(--bg-soft);
          border: 1px solid var(--panel-edge);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
        }
        .sg-chartwrap { width: 100%; }
        .sg-chartwrap svg { width: 100%; height: auto; display: block; overflow: visible; }
        .sg-axis { font-family: 'JetBrains Mono', monospace; font-size: 10px; fill: var(--ink-faint); }
        .sg-tick { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; fill: var(--ink-faint); }

        .sg-legend {
          display: flex; gap: 16px; flex-wrap: wrap;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          color: var(--ink-faint); margin-top: 10px;
        }
        .sg-legend span { display: inline-flex; align-items: center; gap: 5px; }
        .sg-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
        .sg-diamond { width: 8px; height: 8px; display: inline-block; border: 1.5px solid var(--amber); transform: rotate(45deg); }

        .sg-slider-row { margin-top: 16px; }
        .sg-slider-row label {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--ink-faint); display: block; margin-bottom: 8px;
        }
        .sg-slider-row input[type=range] { width: 100%; accent-color: var(--amber); height: 4px; cursor: pointer; }
        .sg-widthbtns { display: inline-flex; gap: 5px; margin-left: 8px; }
        .sg-wbtn {
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          padding: 3px 8px; border-radius: 6px; border: 1px solid var(--panel-edge);
          background: var(--panel); color: var(--ink-faint); cursor: pointer;
        }
        .sg-wbtn.active { background: var(--amber); color: var(--bg); border-color: var(--amber); }

        .sg-readout {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px; margin-top: 16px;
        }
        .sg-stat { background: var(--panel); border: 1px solid var(--panel-edge); border-radius: 8px; padding: 9px 10px; }
        .sg-stat .lab {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 4px;
        }
        .sg-stat .val { font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 600; color: var(--amber-bright); }
        .sg-stat .val.put { color: var(--rust); }
        .sg-stat .val.call { color: var(--sg-call); }

        .sg-verdict {
          font-family: 'Fraunces', serif; font-style: italic;
          border-left: 2px solid var(--amber); padding: 8px 0 8px 14px;
          margin-top: 16px; color: var(--ink-soft); font-size: 14px; min-height: 2.6em;
        }

        .sg-grid2 { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 14px 0; }
        @media (min-width: 680px) { .sg-grid2 { grid-template-columns: 1fr 1fr; } }
        .sg-card { background: var(--bg-soft); border: 1px solid var(--panel-edge); border-radius: 10px; padding: 12px 13px; }
        .sg-card.put-c { border-top: 2px solid var(--rust); }
        .sg-card.call-c { border-top: 2px solid var(--sg-call); }
        .sg-card h4 { font-size: 15px; margin-bottom: 5px; color: var(--ink); }
        .sg-card p { font-size: 12.5px; color: var(--ink-soft); line-height: 1.5; }
        .sg-card p em { color: var(--ink); font-style: italic; }
        .sg-cardtag {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: 4px;
        }
        .put-t { color: var(--rust); font-weight: 500; }
        .call-t { color: var(--sg-call); font-weight: 500; }

        .sg-h { font-size: 16px; margin: 22px 0 8px; color: var(--ink); }
        .sg-p { font-size: 13px; color: var(--ink-soft); margin-bottom: 10px; line-height: 1.55; }
        .sg-gold { color: var(--amber-bright); }

        .sg-rule {
          background: linear-gradient(90deg, var(--amber-glow), transparent);
          border: 1px solid var(--panel-edge); border-left: 3px solid var(--amber);
          border-radius: 8px; padding: 12px 14px; margin: 12px 0; font-size: 13px; color: var(--ink-soft);
        }
        .sg-rule strong { color: var(--ink); font-weight: 500; }
        .sg-rule em { font-style: italic; color: var(--ink); }
        .sg-ruleh {
          font-family: 'JetBrains Mono', monospace; font-size: 9.5px;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--amber); margin-bottom: 6px;
        }
        .sg-rule .sg-ul { margin: 8px 0 0; padding-left: 18px; }
        .sg-rule .sg-ul li { margin-bottom: 8px; line-height: 1.5; }
        .sg-rule .sg-ul li:last-child { margin-bottom: 0; }

        /* Step-1 level read. Left-border + tint shift with the go/no-go
           band so the trainee feels the verdict before reading it. */
        .sg-level {
          border: 1px solid var(--panel-edge); border-left: 3px solid var(--ink-faint);
          border-radius: 8px; padding: 12px 14px; margin: 12px 0;
          font-size: 13px; color: var(--ink-soft); line-height: 1.5;
        }
        .sg-level.go { border-left-color: var(--sg-call); background: linear-gradient(90deg, color-mix(in srgb, var(--sg-call) 12%, transparent), transparent); }
        .sg-level.mid { border-left-color: var(--amber); background: linear-gradient(90deg, var(--amber-glow), transparent); }
        .sg-level.no { border-left-color: var(--rust); background: linear-gradient(90deg, color-mix(in srgb, var(--rust) 12%, transparent), transparent); }
        .sg-level .sg-ruleh { color: var(--ink-faint); }

        .sg-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12.5px; }
        /* The two-questions table is prose, not a code-style ledger, so
           opt its first column out of the monospace-amber treatment the
           checklist tables use. */
        .sg-2q td:first-child { font-family: 'Fraunces', Georgia, serif; color: var(--ink); font-size: 13px; }
        .sg-2q em { font-style: italic; color: var(--amber-bright); }
        .sg-2q strong { color: var(--ink); font-weight: 600; }
        .sg-table th, .sg-table td { text-align: left; padding: 7px 6px; border-bottom: 1px solid var(--panel-edge); }
        .sg-table th {
          font-family: 'JetBrains Mono', monospace; font-size: 9px;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); font-weight: 500;
        }
        .sg-table td { color: var(--ink-soft); }
        .sg-table td:first-child { font-family: 'JetBrains Mono', monospace; color: var(--amber-bright); font-size: 12px; }

        .sg-foot {
          margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--panel-edge);
          font-size: 11.5px; color: var(--ink-faint); font-style: italic; line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
