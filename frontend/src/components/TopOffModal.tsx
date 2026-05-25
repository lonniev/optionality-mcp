import { useEffect, useState } from "react";
import {
  checkBalance,
  checkPayment,
  purchaseCredits,
  type CheckPaymentResult,
  type PurchaseCreditsResult,
} from "../lib/mcp";

// State machine for the modal:
//
//   idle ──pick amount──▶ purchasing ─┬─ ✓ ──▶ invoice (show QR + checkout link)
//                                     └─ ✗ ──▶ error (with retry)
//
//   invoice ──Check Payment──▶ checking ─┬─ settled ──▶ paid (show new balance)
//                                        └─ pending ──▶ back to invoice
//
// Mirrors AuthorityTopOffSheet's flow from the Pricing Studio iOS app.

type Stage =
  | { kind: "idle" }
  | { kind: "purchasing" }
  | { kind: "invoice"; result: PurchaseCreditsResult }
  | { kind: "checking"; result: PurchaseCreditsResult }
  | { kind: "paid"; balance: number; result: PurchaseCreditsResult }
  | { kind: "error"; message: string };

const PRESET_AMOUNTS = [100, 500, 1000, 5000, 10000];

interface Props {
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export default function TopOffModal({ onClose, onBalanceUpdated }: Props) {
  const [amount, setAmount] = useState<string>("1000");
  const [stage, setStage] = useState<Stage>({ kind: "idle" });

  // Best-effort current balance for the header — informational only.
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await checkBalance();
        if (!cancelled && typeof r.balance === "number") setCurrentBalance(r.balance);
      } catch {
        // silent — header just hides
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function parsedAmount(): number {
    const n = parseInt(amount, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  async function handlePurchase(): Promise<void> {
    const sats = parsedAmount();
    if (sats <= 0) {
      setStage({ kind: "error", message: "Pick a positive sats amount." });
      return;
    }
    setStage({ kind: "purchasing" });
    try {
      const result = await purchaseCredits(sats);
      if (result.error || (result.success === false && !result.invoice_id)) {
        setStage({ kind: "error", message: result.error || "Purchase failed." });
        return;
      }
      if (!result.invoice_id) {
        setStage({ kind: "error", message: "Server returned no invoice_id." });
        return;
      }
      setStage({ kind: "invoice", result });
    } catch (e) {
      setStage({ kind: "error", message: (e as Error).message });
    }
  }

  async function handleCheckPayment(): Promise<void> {
    if (stage.kind !== "invoice") return;
    const invoiceId = stage.result.invoice_id;
    if (!invoiceId) return;
    const result = stage.result;
    setStage({ kind: "checking", result });
    try {
      const payment: CheckPaymentResult = await checkPayment(invoiceId);
      if (payment.error) {
        setStage({ kind: "error", message: payment.error });
        return;
      }
      if (payment.settled) {
        // Settled — pull the fresh balance for display + parent notification.
        let newBalance = payment.balance;
        if (typeof newBalance !== "number") {
          try {
            const bal = await checkBalance();
            newBalance = bal.balance;
          } catch { /* fall through */ }
        }
        const balance = typeof newBalance === "number" ? newBalance : 0;
        if (onBalanceUpdated) onBalanceUpdated(balance);
        setStage({ kind: "paid", balance, result });
        return;
      }
      // Still pending — bounce back to the invoice view.
      setStage({ kind: "invoice", result });
    } catch (e) {
      setStage({ kind: "error", message: (e as Error).message });
    }
  }

  function handleRetry(): void {
    setStage({ kind: "idle" });
  }

  return (
    <div style={STYLES.scrim} onClick={onClose}>
      <div style={STYLES.card} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.head}>
          Top Off — Buy Sats
          {currentBalance !== null && (
            <span style={STYLES.balanceTag}>{currentBalance.toLocaleString()} sats</span>
          )}
        </div>

        {stage.kind === "idle" && (
          <>
            <div style={STYLES.label}>Choose amount</div>
            <div style={STYLES.chipRow}>
              {PRESET_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
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
                style={STYLES.input}
              />
            </div>
            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnGhost}>Cancel</button>
              <button
                onClick={() => void handlePurchase()}
                disabled={parsedAmount() <= 0}
                style={{
                  ...STYLES.btnPrimary,
                  ...(parsedAmount() <= 0 ? STYLES.btnDisabled : {}),
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

        {stage.kind === "purchasing" && (
          <div style={STYLES.spinner}>Generating Lightning invoice…</div>
        )}

        {(stage.kind === "invoice" || stage.kind === "checking") && (
          <>
            <div style={STYLES.label}>Pay this invoice</div>
            <div style={STYLES.invoiceCard}>
              <div style={STYLES.amountLine}>
                <b>{parsedAmount().toLocaleString()}</b>
                <span>sats</span>
              </div>
              {(stage.result.lightning_invoice || stage.result.payment_request) && (
                <div style={STYLES.bolt}>
                  <code style={STYLES.boltCode}>
                    {(stage.result.lightning_invoice || stage.result.payment_request)?.slice(0, 80)}…
                  </code>
                  <button
                    onClick={() => {
                      const v = stage.result.lightning_invoice || stage.result.payment_request || "";
                      void navigator.clipboard.writeText(v).catch(() => {});
                    }}
                    style={STYLES.copyBtn}
                  >
                    Copy bolt11
                  </button>
                </div>
              )}
              {stage.result.checkout_link && (
                <a
                  href={stage.result.checkout_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={STYLES.payLink}
                >
                  → Open BTCPay page
                </a>
              )}
            </div>
            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnGhost}>Cancel</button>
              <button
                onClick={() => void handleCheckPayment()}
                disabled={stage.kind === "checking"}
                style={{
                  ...STYLES.btnPrimary,
                  ...(stage.kind === "checking" ? STYLES.btnDisabled : {}),
                }}
              >
                {stage.kind === "checking" ? "Checking…" : "Check Payment"}
              </button>
            </div>
            <p style={STYLES.fine}>
              Pay from any Lightning wallet (Satoshi, Phoenix, Wallet of Satoshi, Mutiny, etc.) then
              tap Check Payment. Settlement is usually instant.
            </p>
          </>
        )}

        {stage.kind === "paid" && (
          <>
            <div style={STYLES.successHead}>✓ Payment settled</div>
            <div style={STYLES.successBalance}>
              New balance
              <b>{stage.balance.toLocaleString()} sats</b>
            </div>
            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnPrimary}>Done</button>
            </div>
          </>
        )}

        {stage.kind === "error" && (
          <>
            <div style={STYLES.errorMsg}>{stage.message}</div>
            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnGhost}>Close</button>
              <button onClick={handleRetry} style={STYLES.btnPrimary}>Try Again</button>
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
    padding: 20,
    backdropFilter: "blur(4px)",
  },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    padding: "26px 28px",
    width: "100%",
    maxWidth: 460,
    maxHeight: "90vh",
    overflowY: "auto",
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
};
