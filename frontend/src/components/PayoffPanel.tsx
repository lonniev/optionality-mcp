import { useMemo, useRef, useState } from "react";
import type { OptionChainRow, ProposedLeg, Scenario } from "../types";
import PayoffChart from "./PayoffChart";
import {
  PRESETS,
  buildPresetLegs,
  classifyStructure,
  describeOrderTicket,
  proposedToTradeLegs,
  summarizePayoff,
} from "../lib/payoff";
import { externalModelerFor } from "../lib/externalModeler";

interface PayoffPanelProps {
  ticker: string;
  spot: number;
  iv: number;          // decimal
  r?: number;
  legs: ProposedLeg[];
  chain: OptionChainRow[];
  scenario: Scenario | null;
  onLoadPreset: (next: ProposedLeg[]) => void;
}

/// Mounted inside ``OptionChainGuide`` beneath the existing legs +
/// net-premium footer. Renders only when legs exist (presets row is
/// always available though, collapsed by default).
export default function PayoffPanel({
  ticker,
  spot,
  iv,
  r = 0.045,
  legs,
  chain,
  scenario,
  onLoadPreset,
}: PayoffPanelProps) {
  const [presetsOpen, setPresetsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [confirmingPreset, setConfirmingPreset] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const tradeLegs = useMemo(() => proposedToTradeLegs(legs), [legs]);
  const stats = useMemo(() => summarizePayoff(tradeLegs, spot, iv, r), [tradeLegs, spot, iv, r]);
  const name = useMemo(() => classifyStructure(tradeLegs), [tradeLegs]);
  const multi = useMemo(() => new Set(legs.map((l) => l.dte)).size > 1, [legs]);

  const ticket = useMemo(
    () => (stats ? describeOrderTicket(tradeLegs, ticker, stats, name) : ""),
    [tradeLegs, ticker, stats, name],
  );

  // Second-opinion deep-link out to a rigorous external modeler. Only
  // "available" for a live scenario on a real, listed underlying whose
  // structure maps to a known strategy preset; historical/fiction/custom
  // fall back to a one-line reason (the in-app payoff already covers them).
  const modeler = useMemo(() => externalModelerFor(scenario, tradeLegs), [scenario, tradeLegs]);

  function loadPreset(label: string): void {
    if (legs.length > 0) {
      setConfirmingPreset(label);
      return;
    }
    const next = buildPresetLegs(label, scenario, chain);
    if (next.length) onLoadPreset(next);
  }

  function confirmLoadPreset(): void {
    if (!confirmingPreset) return;
    const next = buildPresetLegs(confirmingPreset, scenario, chain);
    if (next.length) onLoadPreset(next);
    setConfirmingPreset(null);
  }

  async function copyTicket(): Promise<void> {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket);
    } catch {
      if (taRef.current) {
        taRef.current.select();
        document.execCommand("copy");
      }
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const fmtMoney = (v: number) =>
    `${v < 0 ? "−" : ""}$${Math.abs(Math.round(v)).toLocaleString()}`;
  const fmtPx = (v: number) => `$${v.toFixed(2)}`;

  const evalCaption = stats
    ? multi
      ? `Profile at front expiration · ${stats.evalDTE} DTE · back legs valued via Black-Scholes`
      : `Profile at expiration · ${stats.evalDTE} DTE`
    : "";

  return (
    <div className="payoff-panel">
      {legs.length > 0 && stats && (
        <>
          {/* Structure name + headline */}
          <div className="pp-headline">
            <div className="pp-name">{name}</div>
            <div className="pp-summary">
              <span className={`pp-tag ${stats.netCredit >= 0 ? "credit" : "debit"}`}>
                {stats.netCredit >= 0 ? "credit" : "debit"} {fmtMoney(Math.abs(stats.netCredit))}
              </span>
              {evalCaption && <span className="pp-caption">{evalCaption}</span>}
            </div>
          </div>

          {/* Chart */}
          <div className="pp-chart">
            <PayoffChart
              legs={tradeLegs}
              spot={spot}
              iv={iv}
              r={r}
              evalDTE={stats.evalDTE}
              breakevens={stats.breakevens}
              height={300}
            />
          </div>

          {/* Stat ribbon */}
          <div className="pp-ribbon">
            <Stat
              label="Net Entry"
              value={fmtMoney(stats.netCredit)}
              sub={stats.netCredit >= 0 ? "credit received" : "debit paid"}
              color={stats.netCredit >= 0 ? "var(--jade)" : "var(--rust)"}
            />
            <Stat
              label="Max Profit"
              value={stats.profitUnbounded ? "Unlimited" : stats.maxP != null ? fmtMoney(stats.maxP) : "—"}
              color="var(--jade)"
            />
            <Stat
              label="Max Loss"
              value={stats.lossUnbounded ? "Unlimited" : stats.maxL != null ? fmtMoney(stats.maxL) : "—"}
              color="var(--rust)"
            />
            <Stat
              label="Reward : Risk"
              value={stats.rr != null ? `${stats.rr.toFixed(2)} : 1` : "—"}
              sub={stats.rr != null ? `${(stats.rr * 100).toFixed(0)}% RWR` : "undefined"}
              color="var(--amber-bright)"
            />
            <Stat
              label="Breakeven"
              value={stats.breakevens.length ? stats.breakevens.map(fmtPx).join(" · ") : "—"}
              color="var(--ink)"
              small
            />
          </div>

          {/* Second opinion — deep-link out to an external modeler for
              live Greeks / IV / probability, which Optionality doesn't
              rebuild. Available only when a real listed chain can be
              quoted; otherwise a muted note says why. */}
          {modeler.kind === "available" ? (
            <div className="pp-secondop">
              <a
                className="pp-secondop-link"
                href={modeler.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open this ${modeler.structureName} on ${modeler.provider.label} for live Greeks, IV, and probability`}
              >
                Verify on {modeler.provider.label} ↗
              </a>
              <span className="pp-secondop-note">
                live Greeks · IV · probability — on the real chain
              </span>
            </div>
          ) : (
            modeler.reason && (
              <div className="pp-secondop pp-secondop-muted">
                <span className="pp-secondop-note">{modeler.reason}</span>
              </div>
            )
          )}

          {/* Order ticket */}
          <div className="pp-ticket">
            <div className="pp-ticket-head">
              <span className="pp-ticket-title">Order Ticket</span>
              <button
                type="button"
                className="pp-copy"
                onClick={copyTicket}
                title="Copy this broker-style ticket to your clipboard"
              >
                {copied ? "copied ✓" : "copy"}
              </button>
            </div>
            <textarea
              ref={taRef}
              readOnly
              value={ticket}
              className="pp-ticket-text"
              spellCheck={false}
            />
          </div>
        </>
      )}

      {/* Presets — collapsed by default, available as a learning aid */}
      <div className="pp-presets">
        <button
          type="button"
          className="pp-presets-toggle"
          onClick={() => setPresetsOpen((o) => !o)}
        >
          <span className="pp-presets-chev">{presetsOpen ? "▾" : "▸"}</span>
          Try an example structure
          {!presetsOpen && legs.length === 0 && <span className="pp-presets-hint"> · examples to study, not to submit</span>}
        </button>
        {presetsOpen && (
          <>
            <div className="pp-presets-caption">
              Examples to study, not to submit. Premiums come from the actual chain — the same numbers you'd see if you tapped these strikes yourself.
            </div>
            <div className="pp-presets-grid">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="pp-preset"
                  onClick={() => loadPreset(p.label)}
                  title={p.description}
                >
                  <span className="pp-preset-label">{p.label}</span>
                  <span className="pp-preset-desc">{p.description}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preset confirm modal */}
      {confirmingPreset && (
        <div className="pp-confirm-scrim" onClick={() => setConfirmingPreset(null)}>
          <div className="pp-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="pp-confirm-title">Replace current legs?</div>
            <p className="pp-confirm-body">
              Loading <strong>{confirmingPreset}</strong> will replace your current {legs.length} leg{legs.length === 1 ? "" : "s"} with the preset's structure (premiums pulled from the live chain).
            </p>
            <div className="pp-confirm-actions">
              <button type="button" className="pp-confirm-cancel" onClick={() => setConfirmingPreset(null)}>
                Keep my legs
              </button>
              <button type="button" className="pp-confirm-go" onClick={confirmLoadPreset}>
                Replace with {confirmingPreset}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .payoff-panel {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 2px solid var(--panel-edge);
        }
        .pp-headline {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }
        .pp-name {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
        }
        .pp-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pp-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 9px;
          color: var(--bg);
          font-weight: 700;
        }
        .pp-tag.credit { background: var(--jade); }
        .pp-tag.debit { background: var(--rust); color: #fff; }
        .pp-caption {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--ink-faint);
          letter-spacing: 0.04em;
        }

        .pp-chart { margin-bottom: 14px; }

        .pp-secondop {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          padding: 10px 12px;
          background: var(--bg-soft);
          border: 1px solid var(--panel-edge);
          border-left: 3px solid var(--amber);
          border-radius: 8px;
        }
        .pp-secondop-muted {
          border-left-color: var(--panel-edge);
        }
        .pp-secondop-link {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: var(--amber);
          text-decoration: none;
          white-space: nowrap;
          transition: color 120ms;
        }
        .pp-secondop-link:hover { color: var(--amber-bright); }
        .pp-secondop-note {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          color: var(--ink-faint);
          letter-spacing: 0.03em;
          line-height: 1.5;
        }

        .pp-ribbon {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1px;
          background: var(--panel-edge);
          border: 1px solid var(--panel-edge);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .pp-ticket {
          background: var(--bg-soft);
          border: 1px solid var(--panel-edge);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .pp-ticket-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .pp-ticket-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .pp-copy {
          background: transparent;
          border: 1px solid var(--panel-edge);
          color: var(--amber);
          border-radius: 6px;
          padding: 4px 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: color 120ms, border-color 120ms;
        }
        .pp-copy:hover { color: var(--amber-bright); border-color: var(--amber); }

        .pp-ticket-text {
          width: 100%;
          box-sizing: border-box;
          min-height: 150px;
          resize: vertical;
          background: var(--bg);
          border: 1px solid var(--panel-edge);
          border-radius: 6px;
          color: var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          line-height: 1.6;
          padding: 10px 12px;
          outline: none;
          white-space: pre;
        }

        .pp-presets {
          border-top: 1px solid var(--panel-edge);
          padding-top: 12px;
        }
        .pp-presets-toggle {
          background: transparent;
          border: none;
          color: var(--ink-soft);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 0;
          cursor: pointer;
        }
        .pp-presets-toggle:hover { color: var(--amber-bright); }
        .pp-presets-chev {
          display: inline-block;
          width: 16px;
          color: var(--ink-faint);
        }
        .pp-presets-hint {
          color: var(--ink-faint);
          text-transform: none;
          letter-spacing: 0.04em;
          font-style: italic;
        }
        .pp-presets-caption {
          font-size: 11px;
          color: var(--ink-faint);
          font-style: italic;
          margin: 8px 0 12px;
        }
        .pp-presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 8px;
        }
        .pp-preset {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
          background: var(--bg-soft);
          border: 1px solid var(--panel-edge);
          border-radius: 6px;
          padding: 8px 10px;
          cursor: pointer;
          transition: border-color 120ms, background 120ms;
        }
        .pp-preset:hover {
          border-color: var(--amber);
          background: color-mix(in srgb, var(--amber) 6%, var(--bg-soft));
        }
        .pp-preset-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          color: var(--amber);
          letter-spacing: 0.04em;
        }
        .pp-preset-desc {
          font-size: 11px;
          color: var(--ink-soft);
          line-height: 1.4;
        }

        .pp-confirm-scrim {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .pp-confirm {
          background: var(--panel);
          border: 1px solid var(--amber);
          padding: 22px 26px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
        }
        .pp-confirm-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 18px;
          color: var(--amber-bright);
          margin-bottom: 10px;
        }
        .pp-confirm-body {
          font-size: 13px;
          color: var(--ink-soft);
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .pp-confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .pp-confirm-cancel,
        .pp-confirm-go {
          background: transparent;
          border: 1px solid var(--panel-edge);
          color: var(--ink-soft);
          padding: 8px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          border-radius: 4px;
        }
        .pp-confirm-go {
          border-color: var(--amber);
          color: var(--amber-bright);
        }
        .pp-confirm-cancel:hover { color: var(--ink); }
        .pp-confirm-go:hover { background: color-mix(in srgb, var(--amber) 14%, transparent); }
      `}</style>
    </div>
  );
}

function Stat(props: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div style={{ background: "var(--panel)", padding: "10px 12px" }}>
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
          marginBottom: 4,
        }}
      >
        {props.label}
      </div>
      <div
        style={{
          color: props.color,
          fontSize: props.small ? 12 : 16,
          fontWeight: 700,
          lineHeight: 1.2,
          fontFamily: "JetBrains Mono, monospace",
        }}
      >
        {props.value}
      </div>
      {props.sub && (
        <div style={{ color: "var(--ink-soft)", fontSize: 10, marginTop: 2 }}>
          {props.sub}
        </div>
      )}
    </div>
  );
}
