import type { Evaluation } from "../types";
import { useT } from "../i18n";

export default function FactsLedger({ evaluation }: { evaluation: Evaluation | null }) {
  const t = useT();
  const integrated = evaluation?.facts_integrated || [];
  const missed = evaluation?.facts_missed || [];
  const caught = evaluation?.red_herrings_caught || [];
  const followed = evaluation?.red_herrings_followed || [];

  if (!integrated.length && !missed.length && !caught.length && !followed.length) {
    return null;
  }

  return (
    <>
      <h3 className="serif">{t("ledger.title")}</h3>
      <div className="ledger-grid">
        <div className="ledger-col integrated">
          <div className="ledger-head"><span className="ledger-mark">{"✓"}</span> {t("ledger.integrated")}</div>
          {integrated.length ? (
            <ul>{integrated.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">{t("ledger.integratedNone")}</div>}
        </div>

        <div className="ledger-col missed">
          <div className="ledger-head"><span className="ledger-mark">{"○"}</span> {t("ledger.missed")}</div>
          {missed.length ? (
            <ul>{missed.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">{t("ledger.missedNone")}</div>}
        </div>

        <div className="ledger-col caught">
          <div className="ledger-head"><span className="ledger-mark">{"⚑"}</span> {t("ledger.caught")}</div>
          {caught.length ? (
            <ul>{caught.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">{t("ledger.caughtNone")}</div>}
        </div>

        <div className="ledger-col followed">
          <div className="ledger-head"><span className="ledger-mark">{"✕"}</span> {t("ledger.followed")}</div>
          {followed.length ? (
            <ul>{followed.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">{t("ledger.followedNone")}</div>}
        </div>
      </div>
    </>
  );
}
