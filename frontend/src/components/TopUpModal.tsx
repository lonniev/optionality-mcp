import { useEffect, useState } from "react";
import { checkBalance, parseSats } from "@tollbooth-dpyc/web";
import { useTopUp } from "@tollbooth-dpyc/web/react";

// Optionality's top-up sheet. The mechanics are the package's `useTopUp`:
// purchase_credits → an invoice → check_payment, polled while the tab is
// visible, with a manual check. This file is only how it looks.

const PRESET_AMOUNTS = [100, 500, 1000, 5000, 10000];

interface Props {
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export default function TopUpModal({ onClose, onBalanceUpdated }: Props) {
  const [amount, setAmount] = useState<string>("1000");
  // The balance in the header — read on open and again after a settlement.
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);

  async function readBalance(): Promise<void> {
    try {
      const r = await checkBalance();
      if (typeof r.balance_api_sats === "number") {
        setCurrentBalance(r.balance_api_sats);
        onBalanceUpdated?.(r.balance_api_sats);
      }
    } catch {
      // silent — the header just hides
    }
  }

  useEffect(() => {
    void readBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topUp = useTopUp({ onSettled: () => void readBalance() });
  const { state } = topUp;
  const sats = parseSats(amount);

  return (
    <div className="opt-scrim" style={STYLES.scrim} onClick={onClose}>
      <div className="opt-modal-card" style={STYLES.card} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.head}>
          Top Up — Buy Sats
          {currentBalance !== null && (
            <span style={STYLES.balanceTag}>{currentBalance.toLocaleString()} sats</span>
          )}
        </div>

        {state.phase === "idle" && (
          <>
            <div style={STYLES.label}>Choose amount</div>
            <div style={STYLES.chipRow}>
              {PRESET_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="opt-tap"
                  style={{
                    ...STYLES.chip,
                    ...(amount === String(v) ? STYLES.chipActive : {}),
                  }}
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={STYLES.inlineRow}>
              <span style={STYLES.inlinePrefix}>sats</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                step={50}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="opt-tap" style={STYLES.input}
              />
            </div>
            {state.message && <div style={{ ...STYLES.errorMsg, marginTop: 12 }}>{state.message}</div>}
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>Cancel</button>
              <button
                onClick={() => { if (sats !== null) topUp.create(sats); }}
                disabled={sats === null}
                className="opt-tap"
                style={{
                  ...STYLES.btnPrimary,
                  ...(sats === null ? STYLES.btnDisabled : {}),
                }}
              >
                Generate Invoice
              </button>
            </div>
            <p style={STYLES.fine}>
              Operator: Optionality MCP. Payment goes to the operator's BTCPay Server over
              Bitcoin Lightning. Your sats balance updates after settlement.
            </p>
          </>
        )}

        {state.phase === "creating" && (
          <div style={STYLES.spinner}>Generating Lightning invoice…</div>
        )}

        {state.phase === "awaiting" && (
          <>
            <div style={STYLES.label}>Pay this invoice</div>
            <div style={STYLES.invoiceCard}>
              <div style={STYLES.amountLine}>
                <b>{state.invoice.sats.toLocaleString()}</b>
                <span>sats</span>
              </div>
              {state.invoice.bolt11 && (
                <div style={STYLES.bolt}>
                  <code style={STYLES.boltCode}>{state.invoice.bolt11.slice(0, 80)}…</code>
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(state.invoice.bolt11 ?? "").catch(() => {});
                    }}
                    style={STYLES.copyBtn}
                  >
                    Copy bolt11
                  </button>
                </div>
              )}
              {state.invoice.checkoutLink && (
                <a
                  href={state.invoice.checkoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={STYLES.payLink}
                >
                  → Open BTCPay page
                </a>
              )}
              {state.status && <div style={STYLES.lastStatus}>{state.status}</div>}
            </div>
            <div style={STYLES.actions}>
              <button onClick={() => { topUp.cancel(); onClose(); }} className="opt-tap" style={STYLES.btnGhost}>Cancel</button>
              <button
                onClick={topUp.check}
                disabled={state.checking}
                className="opt-tap"
                style={{
                  ...STYLES.btnPrimary,
                  ...(state.checking ? STYLES.btnDisabled : {}),
                }}
              >
                {state.checking ? "Checking…" : "Check Payment"}
              </button>
            </div>
            <p style={STYLES.fine}>
              Pay from any Lightning wallet (Satoshi, Phoenix, Wallet of Satoshi, Mutiny, etc.).
              Settlement is usually instant, and this sheet notices it on its own.
            </p>
          </>
        )}

        {state.phase === "settled" && (
          <>
            <div style={STYLES.successHead}>✓ Payment settled</div>
            {state.credited > 0 && (
              <div style={STYLES.creditsGranted}>
                +{state.credited.toLocaleString()} sats credited
              </div>
            )}
            {currentBalance !== null && (
              <div style={STYLES.successBalance}>
                New balance
                <b>{currentBalance.toLocaleString()} sats</b>
              </div>
            )}
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnPrimary}>Done</button>
            </div>
          </>
        )}

        {state.phase === "failed" && (
          <>
            <div style={STYLES.errorMsg}>{state.message}</div>
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>Close</button>
              <button onClick={topUp.reset} className="opt-tap" style={STYLES.btnPrimary}>Try Again</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const STYLES: Record<string, React.CSSProperties> = {
  scrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    backdropFilter: "blur(4px)",
  },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    width: "100%",
    maxWidth: 460,
  },
  head: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 22,
    color: "var(--amber-bright)",
    marginBottom: 18,
  },
  balanceTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.05em",
    color: "var(--ink-soft)",
    background: "var(--bg-soft)",
    padding: "4px 8px",
    border: "1px solid var(--panel-edge)",
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "var(--amber)",
    marginBottom: 8,
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    background: "transparent",
    border: "1px solid var(--panel-edge)",
    color: "var(--ink-soft)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    padding: "5px 10px",
    cursor: "pointer",
    borderRadius: 4,
  },
  chipActive: {
    border: "1px solid var(--amber)",
    color: "var(--amber-bright)",
    background: "var(--amber-glow)",
  },
  inlineRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  inlinePrefix: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: "var(--ink-faint)",
  },
  input: {
    flex: 1,
    padding: "8px 10px",
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    color: "var(--ivory-bright)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    justifyContent: "flex-end",
  },
  btnGhost: {
    background: "transparent",
    color: "var(--ink-soft)",
    border: "1px solid var(--panel-edge)",
    padding: "8px 14px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  btnPrimary: {
    background: "var(--amber)",
    color: "var(--bg)",
    border: "1px solid var(--amber)",
    padding: "8px 14px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  fine: {
    fontSize: 11,
    color: "var(--ink-faint)",
    fontStyle: "italic",
    marginTop: 14,
    lineHeight: 1.5,
  },
  spinner: {
    fontSize: 12,
    color: "var(--ink-soft)",
    padding: "30px 0",
    textAlign: "center",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  invoiceCard: {
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    padding: 14,
  },
  amountLine: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 28,
    color: "var(--amber-bright)",
    marginBottom: 14,
  },
  bolt: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 10,
  },
  boltCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "var(--ink-soft)",
    wordBreak: "break-all",
    lineHeight: 1.4,
  },
  copyBtn: {
    alignSelf: "flex-start",
    background: "transparent",
    border: "1px solid var(--amber)",
    color: "var(--amber-bright)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    padding: "4px 10px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  payLink: {
    display: "inline-block",
    color: "var(--amber-bright)",
    textDecoration: "none",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: 4,
  },
  successHead: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 22,
    color: "var(--jade)",
    marginBottom: 14,
  },
  successBalance: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 11,
    color: "var(--ink-soft)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  errorMsg: {
    color: "var(--rust)",
    background: "rgba(184,85,58,0.08)",
    border: "1px solid var(--rust)",
    borderLeft: "3px solid var(--rust)",
    padding: 12,
    fontSize: 12,
    lineHeight: 1.5,
  },
  lastStatus: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px dashed var(--panel-edge)",
    fontSize: 11,
    color: "var(--amber)",
    fontStyle: "italic",
  },
  creditsGranted: {
    fontSize: 14,
    color: "var(--jade)",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 10,
  },
};
