import { useEffect, useMemo, useState } from "react";
import type { OptionChainRow } from "../types";

interface OptionChainGuideProps {
  spot: number;
  chain: OptionChainRow[];
}

/// Compact button-triggered modal that shows the full option chain.
/// Mirrors SkewGuide's pattern so the scenario overview stays uncluttered
/// — the chain is one click away rather than dumped inline.
///
/// Layout follows the classic broker convention: Calls on the left,
/// Strike as the center anchor, Puts on the right. The strike row
/// closest to spot is highlighted as ATM so the trainee can orient
/// quickly.
export default function OptionChainGuide({ spot, chain }: OptionChainGuideProps) {
  const [open, setOpen] = useState<boolean>(false);

  // Escape closes; body scroll-lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

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

  if (!chain || chain.length === 0) return null;

  return (
    <div className="opt-chain-guide">
      <button
        type="button"
        className="ocg-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Pop up the full option chain — calls and puts at each strike across the available expirations"
      >
        <span className="ocg-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
        Option Chain
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
                Mid prices and deltas across the available expirations, computed
                from a Black-Scholes smile anchored by ATM, 25Δ-put, and
                25Δ-call volatilities. The row closest to spot
                (<strong>${spot.toFixed(2)}</strong>) is highlighted as ATM.
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
                        <th className="ocg-strike-head">Strike</th>
                        <th colSpan={2} className="ocg-side ocg-puts">Puts</th>
                      </tr>
                      <tr className="ocg-subhead">
                        <th>ΔC</th>
                        <th>Mid</th>
                        <th></th>
                        <th>Mid</th>
                        <th>ΔP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const isAtm = r.strike === atmStrike;
                        return (
                          <tr key={r.strike} className={isAtm ? "ocg-row-atm" : ""}>
                            <td className="ocg-delta">{r.call_delta.toFixed(2)}</td>
                            <td className="ocg-mid">{r.call_mid.toFixed(2)}</td>
                            <td className="ocg-strike">{r.strike}</td>
                            <td className="ocg-mid">{r.put_mid.toFixed(2)}</td>
                            <td className="ocg-delta">{r.put_delta.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          </div>
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
        .ocg-delta { text-align: right; color: var(--ink-soft); width: 14%; }
        .ocg-mid { text-align: right; color: var(--ink); width: 22%; }
        .ocg-strike {
          text-align: center;
          color: var(--amber);
          font-weight: 500;
          width: 28%;
          border-left: 1px solid var(--panel-edge);
          border-right: 1px solid var(--panel-edge);
        }

        .ocg-row-atm {
          background: color-mix(in srgb, var(--amber) 10%, transparent);
        }
        .ocg-row-atm .ocg-strike {
          color: var(--amber-bright);
          font-weight: 600;
        }
        .ocg-row-atm .ocg-mid,
        .ocg-row-atm .ocg-delta {
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}
