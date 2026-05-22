import type { Evaluation } from "../types";

export default function FactsLedger({ evaluation }: { evaluation: Evaluation | null }) {
  const integrated = evaluation?.facts_integrated || [];
  const missed = evaluation?.facts_missed || [];
  const caught = evaluation?.red_herrings_caught || [];
  const followed = evaluation?.red_herrings_followed || [];

  if (!integrated.length && !missed.length && !caught.length && !followed.length) {
    return null;
  }

  return (
    <>
      <h3 className="serif">Facts Ledger</h3>
      <div className="ledger-grid">
        <div className="ledger-col integrated">
          <div className="ledger-head"><span className="ledger-mark">{"✓"}</span> Facts you integrated</div>
          {integrated.length ? (
            <ul>{integrated.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">None — try citing the relevant facts directly.</div>}
        </div>

        <div className="ledger-col missed">
          <div className="ledger-head"><span className="ledger-mark">{"○"}</span> Relevant facts you missed</div>
          {missed.length ? (
            <ul>{missed.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">Clean sweep — you addressed the facts that mattered.</div>}
        </div>

        <div className="ledger-col caught">
          <div className="ledger-head"><span className="ledger-mark">{"⚑"}</span> Red herrings you set aside</div>
          {caught.length ? (
            <ul>{caught.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">None noted.</div>}
        </div>

        <div className="ledger-col followed">
          <div className="ledger-head"><span className="ledger-mark">{"✕"}</span> Red herrings that pulled your thesis</div>
          {followed.length ? (
            <ul>{followed.map((f, i) => <li key={i}>{f}</li>)}</ul>
          ) : <div className="ledger-empty">None — you kept noise out of the thesis.</div>}
        </div>
      </div>
    </>
  );
}
