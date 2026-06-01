import { useEffect, useMemo, useState } from "react";
import type { OptionChainRow, ProposedLeg } from "../types";

interface OptionChainGuideProps {
  spot: number;
  chain: OptionChainRow[];
  /// Optional controlled-component shape: when both are provided, the
  /// parent owns the legs state and can persist it across modal
  /// close / page reload. When omitted, the guide manages its own
  /// internal legs state (good for the static Sample Assessment).
  legs?: ProposedLeg[];
  onLegsChange?: (next: ProposedLeg[]) => void;
}

type MenuKind = "call" | "put";
interface MenuAnchor {
  kind: MenuKind;
  row: OptionChainRow;
  x: number;
  y: number;
}

/// Compact button-triggered modal that shows the full option chain.
/// Mirrors SkewGuide's pattern so the scenario overview stays uncluttered.
/// Mids are tap-to-trade: clicking a Call mid or Put mid opens a small
/// inline menu (Buy / Sell / Remove) and the modal footer keeps a
/// running net-premium readout as the trainee builds a structure.
///
/// Layout follows the classic broker convention: Calls on the left,
/// Strike + smile IV as the center anchor, Puts on the right.
export default function OptionChainGuide({
  spot,
  chain,
  legs: controlledLegs,
  onLegsChange,
}: OptionChainGuideProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [internalLegs, setInternalLegs] = useState<ProposedLeg[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);

  // Controlled vs uncontrolled.
  const legs = controlledLegs ?? internalLegs;
  const setLegs = (next: ProposedLeg[]) => {
    if (onLegsChange) onLegsChange(next);
    else setInternalLegs(next);
  };

  // Escape closes; body scroll-lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuAnchor) setMenuAnchor(null);
        else setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, menuAnchor]);

  // Group rows by expiration once.
  const groups = useMemo(() => {
    const byExpiry = new Map<string, { dte: number; rows: OptionChainRow[] }>();
    for (const r of chain) {
      let entry = byExpiry.get(r.expiration);
      if (!entry) {
        entry = { dte: r.dte, rows: [] };
        byExpiry.set(r.expiration, entry);
      }
      entry.rows.push(r);
    }
    return Array.from(byExpiry.entries())
      .sort((a, b) => a[1].dte - b[1].dte)
      .map(([exp, { dte, rows }]) => ({
        exp,
        dte,
        rows: [...rows].sort((a, b) => a.strike - b.strike),
        atmStrike: rows.reduce(
          (best, r) => (Math.abs(r.strike - spot) < Math.abs(best - spot) ? r.strike : best),
          rows[0]?.strike ?? spot,
        ),
      }));
  }, [chain, spot]);

  /// Return the existing leg matching this position, or undefined.
  function findLeg(row: OptionChainRow, kind: MenuKind): ProposedLeg | undefined {
    return legs.find(
      (l) => l.expiration === row.expiration && l.strike === row.strike && l.type === kind,
    );
  }

  function openMenu(e: React.MouseEvent, row: OptionChainRow, kind: MenuKind) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setMenuAnchor({
      kind,
      row,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 4,
    });
  }

  function applyAction(side: "buy" | "sell" | "remove") {
    if (!menuAnchor) return;
    const { kind, row } = menuAnchor;
    const others = legs.filter(
      (l) => !(l.expiration === row.expiration && l.strike === row.strike && l.type === kind),
    );
    if (side === "remove") {
      setLegs(others);
    } else {
      const premium = kind === "call" ? row.call_mid : row.put_mid;
      setLegs([
        ...others,
        {
          expiration: row.expiration,
          dte: row.dte,
          strike: row.strike,
          type: kind,
          side,
          premium,
          qty: 1,
        },
      ]);
    }
    setMenuAnchor(null);
  }

  // Net premium: per share × qty × 100 (contract multiplier). Sell = +,
  // Buy = -. Positive net = credit, negative net = debit.
  const netPremium = legs.reduce(
    (acc, l) => acc + (l.side === "sell" ? 1 : -1) * l.premium * l.qty * 100,
    0,
  );
  const isCredit = netPremium >= 0;

  if (!chain || chain.length === 0) return null;

  return (
    <div className="opt-chain-guide">
      <button
        type="button"
        className="ocg-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Pop up the full option chain — tap a mid to buy / sell / remove"
      >
        <span className="ocg-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
        Option Chain
        {legs.length > 0 && (
          <span className="ocg-trigger-badge">
            {legs.length} leg{legs.length === 1 ? "" : "s"}
          </span>
        )}
      </button>

      {open && (
        <div className="ocg-scrim" onClick={() => setOpen(false)}>
          <div className="ocg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ocg-topbar">
              <button
                type="button"
                className="ocg-close"
                onClick={() => setOpen(false)}
                aria-label="Close chain"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>
            <div className="ocg-body">
              <h3 className="serif ocg-title">Option Chain</h3>
              <p className="ocg-lede">
                Tap a <strong>Call</strong> or <strong>Put</strong> mid to buy,
                sell, or remove a contract. The chain's mids and deltas are
                computed from a Black-Scholes smile anchored by ATM, 25Δ-put,
                and 25Δ-call volatilities. The IV column reads the smile at each
                strike — same IV used to price both the call and the put at
                that strike (the smile is one curve, not two). The row closest
                to spot (<strong>${spot.toFixed(2)}</strong>) is highlighted as
                ATM.
              </p>

              {groups.map(({ exp, dte, rows, atmStrike }) => (
                <section key={exp} className="ocg-section">
                  <div className="ocg-section-head">
                    <span className="ocg-exp">{exp}</span>
                    <span className="ocg-dte">{dte} DTE</span>
                  </div>
                  <table className="ocg-table">
                    <thead>
                      <tr>
                        <th colSpan={2} className="ocg-side ocg-calls">Calls</th>
                        <th colSpan={2} className="ocg-strike-head">Strike · IV</th>
                        <th colSpan={2} className="ocg-side ocg-puts">Puts</th>
                      </tr>
                      <tr className="ocg-subhead">
                        <th>ΔC</th>
                        <th>Mid</th>
                        <th>Strike</th>
                        <th>IV</th>
                        <th>Mid</th>
                        <th>ΔP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const isAtm = r.strike === atmStrike;
                        const callLeg = findLeg(r, "call");
                        const putLeg = findLeg(r, "put");
                        return (
                          <tr key={r.strike} className={isAtm ? "ocg-row-atm" : ""}>
                            <td className="ocg-delta">{r.call_delta.toFixed(2)}</td>
                            <td
                              className={`ocg-mid ocg-mid-tap ${callLeg ? `leg-${callLeg.side}` : ""}`}
                              onClick={(e) => openMenu(e, r, "call")}
                              title={callLeg ? `${callLeg.side === "buy" ? "LONG" : "SHORT"} 1 · click to change` : "Click to buy or sell this call"}
                            >
                              <span className="ocg-mid-val">{r.call_mid.toFixed(2)}</span>
                              {callLeg && (
                                <span className={`ocg-leg-chip chip-${callLeg.side}`}>
                                  {callLeg.side === "buy" ? "+1" : "−1"}
                                </span>
                              )}
                            </td>
                            <td className="ocg-strike">{r.strike}</td>
                            <td className="ocg-iv">{r.iv != null ? `${r.iv.toFixed(1)}%` : "—"}</td>
                            <td
                              className={`ocg-mid ocg-mid-tap ${putLeg ? `leg-${putLeg.side}` : ""}`}
                              onClick={(e) => openMenu(e, r, "put")}
                              title={putLeg ? `${putLeg.side === "buy" ? "LONG" : "SHORT"} 1 · click to change` : "Click to buy or sell this put"}
                            >
                              <span className="ocg-mid-val">{r.put_mid.toFixed(2)}</span>
                              {putLeg && (
                                <span className={`ocg-leg-chip chip-${putLeg.side}`}>
                                  {putLeg.side === "buy" ? "+1" : "−1"}
                                </span>
                              )}
                            </td>
                            <td className="ocg-delta">{r.put_delta.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              ))}

              {/* Legs + net premium footer */}
              <div className="ocg-footer">
                <div className="ocg-footer-head">
                  <span className="ocg-footer-title">Proposed structure</span>
                  {legs.length > 0 && (
                    <button
                      type="button"
                      className="ocg-clear"
                      onClick={() => setLegs([])}
                      title="Clear all legs"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {legs.length === 0 ? (
                  <div className="ocg-footer-empty">
                    No legs yet. Tap a Call or Put mid above to start building.
                  </div>
                ) : (
                  <>
                    <ul className="ocg-legs-list">
                      {legs
                        .slice()
                        .sort((a, b) => a.dte - b.dte || a.strike - b.strike)
                        .map((l, i) => (
                          <li key={i} className={`ocg-leg leg-${l.side}`}>
                            <span className="ocg-leg-side">
                              {l.side === "buy" ? "BUY" : "SELL"} {l.qty}
                            </span>
                            <span className="ocg-leg-spec">
                              ${l.strike}{l.type === "call" ? "C" : "P"} · {l.dte} DTE
                            </span>
                            <span className="ocg-leg-prem">
                              {l.side === "buy" ? "−" : "+"}${(l.premium * l.qty * 100).toFixed(2)}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <div className="ocg-net">
                      <span className="ocg-net-label">Net premium</span>
                      <span className={`ocg-net-val ${isCredit ? "credit" : "debit"}`}>
                        {isCredit ? "+" : "−"}${Math.abs(netPremium).toFixed(2)}{" "}
                        <span className="ocg-net-tag">{isCredit ? "credit" : "debit"}</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action menu — rendered as a sibling so it isn't clipped by
              the modal's overflow-y. */}
          {menuAnchor && (
            <div
              className="ocg-menu"
              style={{ top: menuAnchor.y, left: menuAnchor.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => applyAction("buy")} className="ocg-menu-btn ocg-menu-buy">
                Buy
              </button>
              <button type="button" onClick={() => applyAction("sell")} className="ocg-menu-btn ocg-menu-sell">
                Sell
              </button>
              {findLeg(menuAnchor.row, menuAnchor.kind) && (
                <button type="button" onClick={() => applyAction("remove")} className="ocg-menu-btn ocg-menu-remove">
                  Remove
                </button>
              )}
              <button type="button" onClick={() => setMenuAnchor(null)} className="ocg-menu-btn ocg-menu-cancel">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .ocg-trigger {
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
        .ocg-trigger:hover { color: var(--amber-bright); border-bottom-color: var(--amber-bright); }
        .ocg-chevron { color: var(--ink-faint); font-size: 11px; }
        .ocg-trigger-badge {
          margin-left: 6px;
          padding: 1px 6px;
          font-size: 9px;
          background: var(--amber);
          color: var(--bg);
          border-radius: 9px;
          font-weight: 600;
          letter-spacing: 0;
        }

        .ocg-scrim {
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
        .ocg-modal {
          position: relative;
          width: 80vw;
          max-width: 880px;
          height: 86vh;
          background: var(--panel);
          border: 1px solid var(--amber);
          box-shadow: 0 16px 56px rgba(0, 0, 0, 0.6);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ocg-topbar { position: sticky; top: 0; height: 0; z-index: 3; }
        .ocg-close {
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
        .ocg-close:hover { color: var(--amber-bright); border-color: var(--amber); }

        .ocg-body { padding: 22px 26px 30px; }
        .ocg-title {
          font-size: 24px;
          color: var(--ink);
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }
        .ocg-lede {
          color: var(--ink-soft);
          font-size: 13px;
          line-height: 1.55;
          margin-bottom: 20px;
        }

        .ocg-section { margin-bottom: 22px; }
        .ocg-section-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 4px 6px;
          border-bottom: 1px solid var(--panel-edge);
          margin-bottom: 4px;
        }
        .ocg-exp {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--amber);
          letter-spacing: 0.15em;
        }
        .ocg-dte {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--ink-faint);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .ocg-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }
        .ocg-table thead th {
          padding: 4px 8px;
          color: var(--ink-faint);
          font-weight: 400;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .ocg-side { text-align: center; padding-bottom: 0 !important; }
        .ocg-calls { color: var(--jade) !important; }
        .ocg-puts { color: var(--rust) !important; }
        .ocg-strike-head { text-align: center; color: var(--amber) !important; }
        .ocg-subhead th { padding-top: 0; padding-bottom: 6px; }

        .ocg-table tbody td {
          padding: 5px 8px;
          border-top: 1px solid var(--panel-edge);
        }
        .ocg-delta { text-align: right; color: var(--ink-soft); width: 12%; }
        .ocg-mid {
          text-align: right;
          color: var(--ink);
          width: 19%;
          position: relative;
        }
        .ocg-mid-tap {
          cursor: pointer;
          transition: background 120ms;
        }
        .ocg-mid-tap:hover {
          background: color-mix(in srgb, var(--amber) 8%, transparent);
        }
        .ocg-mid.leg-buy { background: color-mix(in srgb, var(--jade) 16%, transparent); }
        .ocg-mid.leg-sell { background: color-mix(in srgb, var(--rust) 16%, transparent); }
        .ocg-leg-chip {
          display: inline-block;
          margin-left: 6px;
          padding: 1px 6px;
          font-size: 9px;
          font-weight: 600;
          border-radius: 9px;
          letter-spacing: 0;
        }
        .chip-buy { background: var(--jade); color: var(--bg); }
        .chip-sell { background: var(--rust); color: #fff; }
        .ocg-strike {
          text-align: center;
          color: var(--amber);
          font-weight: 500;
          width: 14%;
          border-left: 1px solid var(--panel-edge);
        }
        .ocg-iv {
          text-align: center;
          color: var(--amber);
          font-weight: 500;
          width: 14%;
          border-right: 1px solid var(--panel-edge);
        }

        .ocg-row-atm {
          background: color-mix(in srgb, var(--amber) 10%, transparent);
        }
        .ocg-row-atm .ocg-strike,
        .ocg-row-atm .ocg-iv {
          color: var(--amber-bright);
          font-weight: 600;
        }
        .ocg-row-atm .ocg-mid,
        .ocg-row-atm .ocg-delta {
          color: var(--ink);
        }

        /* Menu */
        .ocg-menu {
          position: fixed;
          transform: translateX(-50%);
          z-index: 200;
          background: var(--panel);
          border: 1px solid var(--amber);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 110px;
        }
        .ocg-menu-btn {
          background: transparent;
          border: none;
          color: var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 7px 12px;
          text-align: left;
          cursor: pointer;
          transition: background 100ms;
        }
        .ocg-menu-btn:hover { background: var(--bg-soft); }
        .ocg-menu-buy:hover { background: color-mix(in srgb, var(--jade) 25%, transparent); }
        .ocg-menu-sell:hover { background: color-mix(in srgb, var(--rust) 25%, transparent); }
        .ocg-menu-remove { color: var(--ink-soft); }
        .ocg-menu-cancel { color: var(--ink-faint); font-size: 10px; }

        /* Footer */
        .ocg-footer {
          margin-top: 24px;
          padding: 14px 16px;
          border-top: 2px solid var(--panel-edge);
          background: var(--bg-soft);
        }
        .ocg-footer-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ocg-footer-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--amber);
        }
        .ocg-clear {
          background: transparent;
          border: 1px solid var(--panel-edge);
          color: var(--ink-faint);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          cursor: pointer;
        }
        .ocg-clear:hover { color: var(--rust); border-color: var(--rust); }

        .ocg-footer-empty {
          color: var(--ink-faint);
          font-size: 12px;
          font-style: italic;
          padding: 6px 0;
        }

        .ocg-legs-list {
          list-style: none;
          padding: 0;
          margin: 0 0 10px;
        }
        .ocg-leg {
          display: grid;
          grid-template-columns: 90px 1fr auto;
          gap: 12px;
          padding: 6px 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          border-left: 3px solid var(--panel-edge);
          margin-bottom: 3px;
          background: var(--panel);
        }
        .ocg-leg.leg-buy { border-left-color: var(--jade); }
        .ocg-leg.leg-sell { border-left-color: var(--rust); }
        .ocg-leg-side { font-weight: 600; letter-spacing: 0.1em; }
        .ocg-leg.leg-buy .ocg-leg-side { color: var(--jade); }
        .ocg-leg.leg-sell .ocg-leg-side { color: var(--rust); }
        .ocg-leg-spec { color: var(--ink); }
        .ocg-leg-prem { color: var(--ink-soft); text-align: right; }

        .ocg-net {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 8px 8px 0;
          border-top: 1px solid var(--panel-edge);
        }
        .ocg-net-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-soft);
        }
        .ocg-net-val {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 22px;
          font-weight: 500;
        }
        .ocg-net-val.credit { color: var(--jade); }
        .ocg-net-val.debit { color: var(--rust); }
        .ocg-net-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
}
