import { useMemo, useState } from "react";
import type { Scenario, TradeLeg } from "../types";
import { summarizePayoff } from "../lib/payoff";
import LegTable from "./LegTable";
import PayoffChart from "./PayoffChart";
import { useT } from "../i18n";
import { usd0, usd2 } from "../lib/money";

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
  const t = useT();
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
        {t("risk.noLegs")}
      </div>
    );
  }

  return (
    <div>
      <div className="chart-controls">
        <div>
          <label>
            {t("risk.days", { days: daysElapsed })}{" "}
            {daysElapsed === 0 ? t("risk.entry") : daysElapsed >= maxDte ? t("risk.expiration") : ""}
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
            <span>{t("risk.overlay")}</span>
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
            <label>{t("risk.maxProfit")}</label>
            <b style={{ color: "var(--jade)" }}>
              {stats.profitUnbounded ? t("risk.unlimited") : stats.maxP != null ? `+${usd0(stats.maxP)}` : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>{t("risk.maxLoss")}</label>
            <b style={{ color: "var(--rust)" }}>
              {stats.lossUnbounded ? t("risk.unlimited") : stats.maxL != null ? `−${usd0(Math.abs(stats.maxL))}` : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>{t("risk.breakeven", { count: Math.max(1, stats.breakevens.length) })}</label>
            <b>
              {stats.breakevens.length
                ? stats.breakevens.map((b) => usd2(b)).join(", ")
                : "—"}
            </b>
          </div>
          <div className="data-cell">
            <label>{t("risk.iv")}</label>
            <b>{(iv * 100).toFixed(0)}%</b>
          </div>
          <div className="data-cell">
            <label>{t("risk.r")}</label>
            <b>{(r * 100).toFixed(2)}%</b>
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 10, fontStyle: "italic" }}>
        {t("risk.footnote")}
      </div>

      <details style={{ marginTop: 10 }}>
        <summary style={{
          cursor: "pointer",
          fontSize: 11,
          color: "var(--ink-soft)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}>
          {t("risk.parsed")}
        </summary>
        <div style={{ marginTop: 8 }}>
          <LegTable legs={safeLegs} label={t("risk.yours")} />
          {safeAlt.length > 0 && <LegTable legs={safeAlt} label={t("risk.alt")} />}
        </div>
      </details>
    </div>
  );
}
