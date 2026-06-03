import { useMemo, useState } from "react";
import type { Scenario, TradeLeg } from "../types";
import { summarizePayoff } from "../lib/payoff";
import LegTable from "./LegTable";
import PayoffChart from "./PayoffChart";

interface Props {
  legs?: TradeLeg[];
  altLegs?: TradeLeg[];
  scenario: Scenario | null;
}

/// Post-judge risk profile — same Recharts payoff curve the trainee
/// saw inside ``OptionChainGuide`` while building. The shared
/// ``PayoffChart`` carries the math + rendering; this wrapper adds
/// the judge-side affordances: a days-elapsed slider (replay value
/// across the holding period via BSM), an optional overlay of the
/// judge's alt trade, and a stat row with max P/L + breakevens.
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

  // Stats from the trade's expiration profile (daysElapsed = front-DTE).
  // Independent of the slider so headline figures are stable.
  const stats = useMemo(
    () => (safeLegs.length ? summarizePayoff(safeLegs, spot, iv, r) : null),
    [safeLegs, spot, iv, r],
  );

  if (!safeLegs.length) {
    return (
      <div style={{ color: "var(--ink-faint)", fontSize: 12, fontStyle: "italic", padding: "12px 0" }}>
        No structured trade legs were parsed — chart unavailable. (Naked stock/bond positions and unparseable trades skip the chart.)
      </div>
    );
  }

  return (
    <div>
      <div className="chart-controls">
        <div>
          <label>
            Days into trade: {daysElapsed}d{" "}
            {daysElapsed === 0 ? "(entry)" : daysElapsed >= maxDte ? "(expiration)" : ""}
          </label>
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
            <input
              type="checkbox"
              checked={showAlt}
              onChange={(e) => setShowAlt(e.target.checked)}
            />
            <span>Overlay alternative trade</span>
          </label>
        )}
      </div>

      <PayoffChart
        legs={safeLegs}
        spot={spot}
        iv={iv}
        r={r}
        evalDTE={daysElapsed}
        altLegs={showAlt && safeAlt.length ? safeAlt : undefined}
        breakevens={stats?.breakevens}
        height={340}
      />

      {stats && (
        <div className="data-row" style={{ marginTop: 16 }}>
          <div className="data-cell">
            <label>Max Profit</label>
            <b style={{ color: "var(--jade)" }}>
              {stats.profitUnbounded ? "Unlimited" : stats.maxP != null ? `+$${stats.maxP.toFixed(0)}` : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>Max Loss</label>
            <b style={{ color: "var(--rust)" }}>
              {stats.lossUnbounded ? "Unlimited" : stats.maxL != null ? `−$${Math.abs(stats.maxL).toFixed(0)}` : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>Breakeven{stats.breakevens.length > 1 ? "s" : ""}</label>
            <b>
              {stats.breakevens.length
                ? stats.breakevens.map((b) => "$" + b.toFixed(2)).join(", ")
                : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>IV used</label>
            <b>{(iv * 100).toFixed(0)}%</b>
          </div>
          <div className="data-cell">
            <label>r assumed</label>
            <b>{(r * 100).toFixed(2)}%</b>
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10, fontStyle: "italic" }}>
        Black-Scholes with no dividends. Risk-free rate held at 4.5%. Vol held constant at scenario IV — real vol-of-vol effects not modeled. Per-leg qty as parsed; multiplier of 100 shares assumed.
      </div>

      <details style={{ marginTop: 10 }}>
        <summary style={{
          cursor: "pointer",
          fontSize: 11,
          color: "var(--ink-soft)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
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
