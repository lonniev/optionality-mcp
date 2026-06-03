import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TradeLeg } from "../types";
import { legPL } from "../lib/bs";

interface PayoffChartProps {
  /// Math-side legs (side: long/short). Use ``proposedToTradeLegs`` at
  /// the caller boundary when feeding from chain-built ProposedLegs.
  legs: TradeLeg[];
  spot: number;
  iv: number;            // decimal, e.g. 0.30
  r?: number;            // risk-free rate, defaults to 4.5%
  evalDTE?: number;      // days elapsed at evaluation; defaults to 0
  /// Optional alt-trade overlay (e.g. judge's alternative).
  altLegs?: TradeLeg[];
  /// When true, render per-leg dashed lines beneath the combined curve.
  showLegLines?: boolean;
  /// Mark breakeven crossings (zero-crossings) on the combined curve.
  breakevens?: number[];
  height?: number;
}

const POINTS = 240;
const DEFAULT_R = 0.045;

/// Shared Recharts payoff curve. Used by ``PayoffPanel`` (the
/// trainee-side build-and-feel surface inside ``OptionChainGuide``)
/// and ``RiskProfileChart`` (the judge-side post-evaluation curve).
/// Theme reads CSS variables so dark/light flips automatically.
export default function PayoffChart({
  legs,
  spot,
  iv,
  r = DEFAULT_R,
  evalDTE,
  altLegs,
  showLegLines = false,
  breakevens,
  height = 320,
}: PayoffChartProps) {
  const data = useMemo(() => {
    if (!legs.length) return [] as Array<Record<string, number>>;
    const strikes = [...legs, ...(altLegs ?? [])].map((l) => l.strike).filter((k) => k > 0);
    const sBase = Math.max(spot, 1);
    const lo = Math.min(sBase, ...strikes);
    const hi = Math.max(sBase, ...strikes);
    const span = Math.max(hi - lo, sBase * 0.18, 5);
    const pad = span * 0.65;
    const sMin = Math.max(0, lo - pad);
    const sMax = hi + pad;
    const effectiveDTE = evalDTE ?? Math.min(...legs.map((l) => l.expiry_days || 30));
    const altDTE = altLegs?.length
      ? Math.min(...altLegs.map((l) => l.expiry_days || 30))
      : effectiveDTE;
    const out: Array<Record<string, number>> = [];
    for (let i = 0; i <= POINTS; i++) {
      const price = sMin + ((sMax - sMin) * i) / POINTS;
      const row: Record<string, number> = { price };
      let total = 0;
      legs.forEach((l, idx) => {
        const v = legPL(l, price, effectiveDTE, iv, r);
        row[`leg${idx}`] = v;
        total += v;
      });
      row.total = total;
      if (altLegs?.length) {
        let altTotal = 0;
        for (const l of altLegs) altTotal += legPL(l, price, altDTE, iv, r);
        row.alt = altTotal;
      }
      out.push(row);
    }
    return out;
  }, [legs, altLegs, spot, iv, r, evalDTE]);

  const grad = useMemo(() => {
    if (!data.length) return 0.5;
    const vals = data.map((d) => d.total);
    const mx = Math.max(...vals);
    const mn = Math.min(...vals);
    if (mx <= 0) return 0;
    if (mn >= 0) return 1;
    return mx / (mx - mn);
  }, [data]);

  const computedBreakevens = useMemo(() => {
    if (breakevens) return breakevens;
    if (!data.length) return [] as number[];
    const out: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const a = data[i - 1].total;
      const b = data[i].total;
      if ((a <= 0 && b > 0) || (a >= 0 && b < 0)) {
        const t = a / (a - b);
        out.push(data[i - 1].price + t * (data[i].price - data[i - 1].price));
      }
    }
    return out;
  }, [data, breakevens]);

  const multi = useMemo(() => new Set(legs.map((l) => l.expiry_days)).size > 1, [legs]);
  const curveType = multi ? ("monotone" as const) : ("linear" as const);
  const fmtMoney = (v: number) =>
    v === 0 ? "0" : `${v > 0 ? "+$" : "−$"}${Math.abs(Math.round(v)).toLocaleString()}`;
  const uniqueStrikes = useMemo(() => Array.from(new Set(legs.map((l) => l.strike))), [legs]);

  if (!data.length) return null;

  return (
    <div style={{ width: "100%" }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 22, left: 8 }}>
          <defs>
            <linearGradient id="payoff-split" x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="var(--jade)" stopOpacity={0.32} />
              <stop offset={grad} stopColor="var(--jade)" stopOpacity={0.03} />
              <stop offset={grad} stopColor="var(--rust)" stopOpacity={0.03} />
              <stop offset={1} stopColor="var(--rust)" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--panel-edge)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="price"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            tick={{ fill: "var(--ink-soft)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            stroke="var(--panel-edge)"
            tickCount={9}
          />
          <YAxis
            tickFormatter={fmtMoney}
            tick={{ fill: "var(--ink-soft)", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            stroke="var(--panel-edge)"
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--panel-edge)",
              borderRadius: 8,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "var(--ink)",
            }}
            labelStyle={{ color: "var(--amber-bright)", fontWeight: 700 }}
            labelFormatter={(v) => `Underlying  $${Number(v).toFixed(2)}`}
            formatter={(val: unknown, name: unknown) => {
              const v = typeof val === "number" ? val : 0;
              const label = name === "total" ? "Net P/L" : name === "alt" ? "Alt P/L" : String(name);
              return [fmtMoney(v), label];
            }}
          />
          <ReferenceLine y={0} stroke="var(--ink-faint)" strokeWidth={1} />
          <ReferenceLine
            x={spot}
            stroke="var(--amber-bright)"
            strokeDasharray="4 4"
            strokeOpacity={0.55}
            label={{
              value: "spot",
              fill: "var(--amber-bright)",
              fontSize: 10,
              position: "top",
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
          {uniqueStrikes.map((k) => (
            <ReferenceLine
              key={`k${k}`}
              x={k}
              stroke="var(--ink-faint)"
              strokeDasharray="1 5"
              strokeOpacity={0.5}
            />
          ))}
          <Area
            type={curveType}
            dataKey="total"
            stroke="none"
            fill="url(#payoff-split)"
            isAnimationActive={false}
            baseValue={0}
          />
          {showLegLines &&
            legs.map((l, i) => (
              <Line
                key={`leg${i}`}
                type={curveType}
                dataKey={`leg${i}`}
                dot={false}
                isAnimationActive={false}
                stroke={l.side === "long" ? "var(--jade)" : "var(--rust)"}
                strokeOpacity={0.4}
                strokeWidth={1}
                strokeDasharray="3 3"
                name={`${l.side} ${l.qty || 1}× ${l.type} $${l.strike} (${l.expiry_days}d)`}
              />
            ))}
          {altLegs?.length ? (
            <Line
              type={curveType}
              dataKey="alt"
              dot={false}
              isAnimationActive={false}
              stroke="var(--bronze, var(--amber))"
              strokeOpacity={0.7}
              strokeWidth={1.6}
              strokeDasharray="6 4"
              name="alt"
            />
          ) : null}
          <Line
            type={curveType}
            dataKey="total"
            dot={false}
            isAnimationActive={false}
            stroke="var(--amber-bright)"
            strokeWidth={2.4}
            name="total"
          />
          {computedBreakevens.map((b, i) => (
            <ReferenceDot
              key={`be${i}`}
              x={b}
              y={0}
              r={3.5}
              fill="var(--ink)"
              stroke="var(--bg)"
              strokeWidth={1.5}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
