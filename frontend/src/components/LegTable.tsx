import type { TradeLeg } from "../types";

export default function LegTable({ legs, label }: { legs: TradeLeg[]; label: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <table className="leg-table">
        <thead>
          <tr><th>Side</th><th>Type</th><th>Strike</th><th>DTE</th><th>Premium</th><th>Qty</th></tr>
        </thead>
        <tbody>
          {legs.map((l, i) => (
            <tr key={i}>
              <td style={{ color: l.side === "long" ? "var(--jade)" : "var(--rust)" }}>{l.side}</td>
              <td>{l.type}</td>
              <td>${l.strike}</td>
              <td>{l.expiry_days}d</td>
              <td>${(l.premium || 0).toFixed(2)}</td>
              <td>{l.qty || 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
