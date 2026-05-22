import { useState } from "react";
import type { Scenario, TradeLeg } from "../types";
import { niceStep, payoffCurve, type PayoffPoint } from "../lib/bs";
import LegTable from "./LegTable";

interface Props {
  legs?: TradeLeg[];
  altLegs?: TradeLeg[];
  scenario: Scenario | null;
}

export default function RiskProfileChart({ legs, altLegs, scenario }: Props) {
  const safeLegs: TradeLeg[] = Array.isArray(legs) ? legs.filter((l) => l && l.strike && l.type) : [];
  const safeAlt: TradeLeg[] = Array.isArray(altLegs) ? altLegs.filter((l) => l && l.strike && l.type) : [];

  const spot = scenario?.asset?.spot || 100;
  const iv = Math.max(0.05, (scenario?.asset?.iv_30d || 30) / 100);
  const r = 0.045;

  const maxDte = safeLegs.length
    ? Math.max(...safeLegs.map((l) => l.expiry_days || 30))
    : 30;

  const [daysElapsed, setDaysElapsed] = useState<number>(0);
  const [showAlt, setShowAlt] = useState<boolean>(false);

  if (!safeLegs.length) {
    return (
      <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic", padding: "12px 0" }}>
        No structured trade legs were parsed — chart unavailable. (Naked stock/bond positions and unparseable trades skip the chart.)
      </div>
    );
  }

  const allStrikes = [...safeLegs, ...safeAlt].map((l) => l.strike);
  const sMin = Math.max(0.01, Math.min(spot * 0.7, ...allStrikes) * 0.92);
  const sMax = Math.max(spot * 1.3, ...allStrikes) * 1.08;

  const POINTS = 120;
  const expPts = payoffCurve(safeLegs, sMin, sMax, POINTS, maxDte, iv, r);
  const todayPts = payoffCurve(safeLegs, sMin, sMax, POINTS, daysElapsed, iv, r);
  const altExpPts = safeAlt.length
    ? payoffCurve(safeAlt, sMin, sMax, POINTS, Math.max(...safeAlt.map((l) => l.expiry_days || 30)), iv, r)
    : [];

  const allPls = [
    ...expPts.map((p) => p.pl),
    ...todayPts.map((p) => p.pl),
    ...(showAlt ? altExpPts.map((p) => p.pl) : []),
  ];
  let plMin = Math.min(...allPls);
  let plMax = Math.max(...allPls);
  const padPl = (plMax - plMin) * 0.12 || 50;
  plMin -= padPl; plMax += padPl;

  const W = 640, H = 320;
  const padL = 56, padR = 22, padT = 22, padB = 38;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xOf = (s: number) => padL + ((s - sMin) / (sMax - sMin)) * innerW;
  const yOf = (pl: number) => padT + (1 - (pl - plMin) / (plMax - plMin)) * innerH;

  const pathOf = (pts: PayoffPoint[]) => pts.map((p) => `${xOf(p.S).toFixed(1)},${yOf(p.pl).toFixed(1)}`).join(" ");
  const expPath = pathOf(expPts);
  const todayPath = pathOf(todayPts);
  const altPath = altExpPts.length ? pathOf(altExpPts) : null;

  let maxP = -Infinity, maxL = Infinity;
  for (const p of expPts) {
    if (p.pl > maxP) maxP = p.pl;
    if (p.pl < maxL) maxL = p.pl;
  }

  const breakevens: number[] = [];
  for (let i = 1; i < expPts.length; i++) {
    const a = expPts[i - 1].pl, b = expPts[i].pl;
    if ((a <= 0 && b > 0) || (a >= 0 && b < 0)) {
      const t = -a / (b - a);
      breakevens.push(expPts[i - 1].S + t * (expPts[i].S - expPts[i - 1].S));
    }
  }

  const range = plMax - plMin;
  const tickStep = niceStep(range / 6);
  const yTicks: number[] = [];
  const firstTick = Math.ceil(plMin / tickStep) * tickStep;
  for (let v = firstTick; v <= plMax; v += tickStep) yTicks.push(v);

  const xRange = sMax - sMin;
  const xStep = niceStep(xRange / 7);
  const xTicks: number[] = [];
  const firstXTick = Math.ceil(sMin / xStep) * xStep;
  for (let v = firstXTick; v <= sMax; v += xStep) xTicks.push(v);

  const spotX = xOf(spot);
  const zeroY = yOf(0);

  const aboveZero = `M ${xOf(expPts[0].S)},${zeroY} ` +
    expPts.map((p) => `L ${xOf(p.S).toFixed(1)},${yOf(Math.max(p.pl, 0)).toFixed(1)}`).join(" ") +
    ` L ${xOf(expPts[expPts.length - 1].S)},${zeroY} Z`;
  const belowZero = `M ${xOf(expPts[0].S)},${zeroY} ` +
    expPts.map((p) => `L ${xOf(p.S).toFixed(1)},${yOf(Math.min(p.pl, 0)).toFixed(1)}`).join(" ") +
    ` L ${xOf(expPts[expPts.length - 1].S)},${zeroY} Z`;

  return (
    <div>
      <div className="chart-controls">
        <div>
          <label>Days into trade: {daysElapsed}d {daysElapsed === 0 ? "(entry)" : daysElapsed >= maxDte ? "(expiration)" : ""}</label>
          <input
            type="range"
            min="0"
            max={maxDte}
            value={daysElapsed}
            onChange={(e) => setDaysElapsed(+e.target.value)}
          />
        </div>
        {safeAlt.length > 0 && (
          <label className="chart-toggle">
            <input type="checkbox" checked={showAlt} onChange={(e) => setShowAlt(e.target.checked)} />
            <span>Overlay alternative trade</span>
          </label>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="rp-chart" preserveAspectRatio="xMidYMid meet">
        <path d={aboveZero} fill="var(--jade)" opacity="0.07" />
        <path d={belowZero} fill="var(--crimson)" opacity="0.08" />

        {yTicks.map((pl, i) => (
          <g key={`y${i}`}>
            <line x1={padL} y1={yOf(pl)} x2={W - padR} y2={yOf(pl)}
              stroke={Math.abs(pl) < 0.001 ? "var(--amber)" : "var(--panel-edge)"}
              strokeWidth={Math.abs(pl) < 0.001 ? 1 : 0.5}
              opacity={Math.abs(pl) < 0.001 ? 0.7 : 0.5} />
            <text x={padL - 8} y={yOf(pl) + 3} fontSize="9.5" textAnchor="end" fill="var(--ink-faint)" fontFamily="'JetBrains Mono', monospace">
              {pl >= 0 ? "+" : "−"}${Math.abs(pl).toFixed(0)}
            </text>
          </g>
        ))}

        {xTicks.map((S, i) => (
          <g key={`x${i}`}>
            <line x1={xOf(S)} y1={padT + innerH} x2={xOf(S)} y2={padT + innerH + 3} stroke="var(--ink-faint)" strokeWidth="0.5" />
            <text x={xOf(S)} y={padT + innerH + 16} fontSize="9.5" textAnchor="middle" fill="var(--ink-faint)" fontFamily="'JetBrains Mono', monospace">
              ${S.toFixed(0)}
            </text>
          </g>
        ))}

        {safeLegs.map((leg, i) => (
          <g key={`k${i}`}>
            <line x1={xOf(leg.strike)} y1={padT + innerH - 4} x2={xOf(leg.strike)} y2={padT + innerH + 4}
              stroke="var(--amber)" strokeWidth="1.5" />
          </g>
        ))}

        <line x1={spotX} y1={padT} x2={spotX} y2={padT + innerH}
          stroke="var(--ink-soft)" strokeDasharray="3,3" strokeWidth="0.8" opacity="0.7" />
        <text x={spotX} y={padT - 5} fontSize="10" textAnchor="middle" fill="var(--ink-soft)" fontFamily="'JetBrains Mono', monospace">
          spot ${spot}
        </text>

        {showAlt && altPath && (
          <polyline points={altPath} fill="none" stroke="var(--ivory)" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.85" />
        )}

        <polyline points={todayPath} fill="none" stroke="var(--ivory-bright)" strokeWidth="1.3" opacity="0.9" />
        <polyline points={expPath} fill="none" stroke="var(--amber-bright)" strokeWidth="2" />

        {breakevens.map((be, i) => (
          <g key={`be${i}`}>
            <circle cx={xOf(be)} cy={zeroY} r="3.5" fill="var(--amber)" stroke="var(--bg)" strokeWidth="1" />
            <text x={xOf(be)} y={zeroY - 9} fontSize="9.5" textAnchor="middle" fill="var(--amber)" fontFamily="'JetBrains Mono', monospace">
              BE ${be.toFixed(2)}
            </text>
          </g>
        ))}
      </svg>

      <div className="chart-legend">
        <div><span className="swatch" style={{ background: "var(--amber-bright)" }} />Expiration P/L</div>
        <div><span className="swatch" style={{ background: "var(--ivory-bright)" }} />Today (Black-Scholes, slider-controlled)</div>
        {showAlt && <div><span className="swatch dashed" style={{ background: "var(--ivory)" }} />Alt trade (at expiration)</div>}
        <div><span className="swatch tick" />Strikes</div>
      </div>

      <div className="data-row" style={{ marginTop: 16 }}>
        <div className="data-cell"><label>Max Profit</label><b style={{ color: "var(--jade)" }}>+${maxP.toFixed(0)}</b></div>
        <div className="data-cell"><label>Max Loss</label><b style={{ color: "var(--rust)" }}>{"−"}${Math.abs(maxL).toFixed(0)}</b></div>
        <div className="data-cell"><label>Breakeven{breakevens.length > 1 ? "s" : ""}</label><b>{breakevens.length ? breakevens.map((b) => "$" + b.toFixed(2)).join(", ") : "—"}</b></div>
        <div className="data-cell"><label>IV used</label><b>{(iv * 100).toFixed(0)}%</b></div>
        <div className="data-cell"><label>r assumed</label><b>{(r * 100).toFixed(2)}%</b></div>
      </div>

      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10, fontStyle: "italic" }}>
        Black-Scholes with no dividends. Risk-free rate held at 4.5%. Vol held constant at scenario IV — real vol-of-vol effects not modeled. Per-leg qty as parsed; multiplier of 100 shares assumed.
      </div>

      <details style={{ marginTop: 10 }}>
        <summary style={{ cursor: "pointer", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Parsed Legs
        </summary>
        <div style={{ marginTop: 8 }}>
          <LegTable legs={safeLegs} label="Your trade" />
          {safeAlt.length > 0 && <LegTable legs={safeAlt} label="Alt trade" />}
        </div>
      </details>
    </div>
  );
}
