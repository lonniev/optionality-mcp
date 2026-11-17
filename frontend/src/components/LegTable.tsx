import type { TradeLeg } from "../types";
import { useT, type MessageKey, type Translate } from "../i18n";

/// A leg's side or type in the reader's language; a word this table doesn't know shows as sent.
const legWord = (t: Translate, w: string): string =>
  ["long", "short", "call", "put"].includes(w) ? t(`legs.${w}` as MessageKey) : w;

export default function LegTable({ legs, label }: { legs: TradeLeg[]; label: string }) {
  const t = useT();
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <table className="leg-table">
        <thead>
          <tr><th>{t("legs.side")}</th><th>{t("legs.type")}</th><th>{t("legs.strike")}</th><th>{t("legs.dte")}</th><th>{t("legs.premium")}</th><th>{t("legs.qty")}</th></tr>
        </thead>
        <tbody>
          {legs.map((l, i) => (
            <tr key={i}>
              <td style={{ color: l.side === "long" ? "var(--jade)" : "var(--rust)" }}>{legWord(t, l.side)}</td>
              <td>{legWord(t, l.type)}</td>
              <td>${l.strike}</td>
              <td>{t("legs.days", { days: l.expiry_days })}</td>
              <td>${(l.premium || 0).toFixed(2)}</td>
              <td>{l.qty || 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
