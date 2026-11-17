// DM Compose modal — Phase 2 of the patron-to-patron Nostr DM feature.
//
// Single-shot send: compose, sign via NIP-07, publish to the DPYC
// ecosystem relay set, report success, close. Not a chat interface —
// no thread view, no history. The recipient sees the DM in their
// Nostr client of choice (0xchat, Damus, Amethyst).
//
// Hard requirements communicated to the user when they don't apply:
//   - NIP-07 browser extension installed (no extension → install
//     prompt instead of a compose form).
//   - The shared relay set (dpyc-community/relays.json) is loaded — it
//     always resolves (baked-in fallback), so an empty list only means
//     it's still loading, not that the patron must configure anything.

import { useEffect, useState } from "react";
import {
  hasNip07,
  sendNip04DM,
  type RelayPublishResult,
} from "../lib/nostr";
import { getStoredNpub } from "@tollbooth-dpyc/web";
import { sendPatronDm } from "../lib/mcp";
import { shortNpub } from "@tollbooth-dpyc/web";
import { Avatar, Tx } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";

interface Props {
  target: { npub: string; displayName?: string | null; avatar?: string | null };
  relays: string[];
  /// True when Optionality holds the sender's nsec — DMs route through
  /// the BE escrow tool instead of requiring a NIP-07 browser
  /// extension. Falls back to NIP-07 (and the existing install
  /// notice) when false.
  escrowed: boolean;
  onClose: () => void;
}

type Stage =
  | { kind: "compose" }
  | { kind: "sending" }
  | { kind: "sent"; results: RelayPublishResult[]; successCount: number; eventId: string }
  | { kind: "error"; message: string };

const MAX_MESSAGE = 2000;

export default function DMComposeModal({ target, relays, escrowed, onClose }: Props) {
  const t = useT();
  const [text, setText] = useState<string>("");
  const [stage, setStage] = useState<Stage>({ kind: "compose" });
  const [nip07] = useState<boolean>(() => hasNip07());
  /// Which signing path is in play. Escrow takes precedence: if
  /// Optionality holds the sender's nsec, the BE signs and the
  /// patron doesn't need a browser extension. NIP-07 fallback covers
  /// self-custodied patrons on desktop. Neither path → install notice.
  const signingMode: "escrow" | "nip07" | "none" =
    escrowed ? "escrow" : nip07 ? "nip07" : "none";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage.kind !== "sending") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, onClose]);

  async function handleSend(): Promise<void> {
    if (!text.trim()) return;
    setStage({ kind: "sending" });
    try {
      if (signingMode === "escrow") {
        // BE signs with the escrowed nsec via the wheel's Secure
        // Courier. Per-relay status isn't surfaced by the BE today;
        // we display a generic "sent" with the BE's confirmation.
        const r = await sendPatronDm(target.npub, text.trim());
        if (r.success) {
          setStage({
            kind: "sent",
            results: [],
            successCount: 1,
            eventId: "<server-signed>",
          });
        } else {
          setStage({ kind: "error", message: r.error || t("dm.failed") });
        }
        return;
      }
      // NIP-07 path: client-side sign + publish.
      const r = await sendNip04DM({
        targetNpub: target.npub,
        plaintext: text.trim(),
        relays,
      });
      setStage({
        kind: "sent",
        results: r.relayResults,
        successCount: r.successCount,
        eventId: r.signedEventId,
      });
    } catch (e) {
      setStage({ kind: "error", message: (e as Error).message });
    }
  }

  const displayName = target.displayName || t("game.lb.anonymous");
  const isSelfDM = target.npub === getStoredNpub();

  return (
    <div className="opt-scrim" style={STYLES.scrim} onClick={() => stage.kind !== "sending" && onClose()}>
      <div className="opt-modal-card" style={STYLES.card} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.head}>{isSelfDM ? t("dm.titleSelf") : t("dm.title")}</div>

        <div style={STYLES.recipient}>
          <Avatar value={target.avatar} size={44} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, color: "var(--amber-bright)" }}>
              {displayName}{isSelfDM ? t("dm.you") : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
              {shortNpub(target.npub)}
            </div>
          </div>
        </div>

        {isSelfDM && (
          <div style={STYLES.selfNote}>
            {t("dm.selfNote")}
          </div>
        )}

        {signingMode === "none" && (
          <NoSignerNotice onClose={onClose} />
        )}

        {signingMode === "nip07" && relays.length === 0 && (
          <div style={STYLES.warn}>
            {t("dm.loading")}
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>{t("dm.close")}</button>
            </div>
          </div>
        )}

        {((signingMode === "escrow") ||
          (signingMode === "nip07" && relays.length > 0)) && stage.kind === "compose" && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_MESSAGE}
              placeholder={t("dm.placeholder")}
              style={STYLES.textarea}
              autoFocus
            />
            <div style={STYLES.charCount}>{text.length} / {MAX_MESSAGE}</div>

            <p style={STYLES.fine}>
              {signingMode === "escrow" ? (
                <Tx ns={WORDS} k="dm.escrowNote" components={{ b: <b /> }} />
              ) : (
                <Tx ns={WORDS} k="dm.nip07Note" vars={{ count: relays.length }} components={{ b: <b /> }} />
              )}
            </p>

            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>{t("dm.cancel")}</button>
              <button
                onClick={() => void handleSend()}
                disabled={!text.trim()}
                style={{ ...STYLES.btnPrimary, ...(!text.trim() ? STYLES.btnDisabled : {}) }}
              >
                {t("dm.send")}
              </button>
            </div>
          </>
        )}

        {stage.kind === "sending" && (
          <div style={STYLES.spinner}>{t("dm.sending")}</div>
        )}

        {stage.kind === "sent" && (
          <>
            <div style={{
              fontFamily: "Fraunces, serif",
              fontSize: 18,
              color: stage.successCount > 0 ? "var(--jade)" : "var(--rust)",
              marginBottom: 12,
            }}>
              {stage.successCount > 0 ? t("dm.sent") : t("dm.notAccepted")}
              {stage.results.length > 0 && (
                <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 8, letterSpacing: "0.1em" }}>
                  {t("dm.relays", { ok: stage.successCount, total: stage.results.length })}
                </span>
              )}
            </div>
            {stage.results.length > 0 && (
              <details style={{ marginBottom: 12 }}>
                <summary style={STYLES.detailsHead}>{t("dm.perRelay")}</summary>
                <div style={{ marginTop: 8 }}>
                  {stage.results.map((r) => (
                    <div key={r.url} style={STYLES.relayRow}>
                      <span style={{ color: r.ok ? "var(--jade)" : "var(--rust)" }}>
                        {r.ok ? "✓" : "✗"}
                      </span>
                      <code style={STYLES.relayUrl}>{r.url}</code>
                      <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
            <p style={STYLES.fine}>
              {stage.results.length > 0 ? (
                <Tx ns={WORDS} k="dm.eventNote" vars={{ id: stage.eventId.slice(0, 16) }}
                  components={{ id: <code style={{ fontSize: 10, color: "var(--ink-faint)" }} /> }} />
              ) : (
                t("dm.serverNote")
              )}
            </p>
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnPrimary}>{t("dm.done")}</button>
            </div>
          </>
        )}

        {stage.kind === "error" && (
          <>
            <div style={STYLES.errorMsg}>{stage.message}</div>
            <div style={STYLES.actions}>
              <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>{t("dm.close")}</button>
              <button
                onClick={() => setStage({ kind: "compose" })}
                className="opt-tap" style={STYLES.btnPrimary}
              >
                {t("dm.tryAgain")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NoSignerNotice({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <>
      <div style={STYLES.warn}>
        <Tx ns={WORDS} k="dm.install" components={{ b: <b /> }} />
      </div>
      <div style={STYLES.signerGrid}>
        <SignerLink
          name="Alby"
          url="https://getalby.com"
          blurb={t("dm.alby")}
        />
        <SignerLink
          name="nos2x"
          url="https://github.com/fiatjaf/nos2x"
          blurb={t("dm.nos2x")}
        />
        <SignerLink
          name="Flamingo"
          url="https://www.flamingo.me"
          blurb={t("dm.flamingo")}
        />
      </div>
      <div style={STYLES.actions}>
        <button onClick={onClose} className="opt-tap" style={STYLES.btnGhost}>{t("dm.close")}</button>
      </div>
    </>
  );
}

function SignerLink({ name, url, blurb }: { name: string; url: string; blurb: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={STYLES.signerCard}
    >
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: "var(--amber-bright)" }}>{name} →</div>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>{blurb}</div>
    </a>
  );
}

const STYLES: Record<string, React.CSSProperties> = {
  scrim: {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(0,0,0,0.65)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    width: "100%", maxWidth: 520,
  },
  head: {
    fontFamily: "Fraunces, Georgia, serif",
    fontSize: 22,
    color: "var(--amber-bright)",
    marginBottom: 14,
  },
  recipient: {
    display: "flex", alignItems: "center", gap: 12,
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    padding: "10px 12px",
    marginBottom: 18,
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    color: "var(--ivory-bright)",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 13,
    padding: "10px 12px",
    resize: "vertical",
  },
  charCount: {
    textAlign: "right", fontSize: 10, color: "var(--ink-faint)", marginTop: 4,
  },
  fine: {
    fontSize: 11, color: "var(--ink-faint)", fontStyle: "italic",
    marginTop: 12, lineHeight: 1.55,
  },
  actions: {
    display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end",
  },
  btnGhost: {
    background: "transparent",
    color: "var(--ink-soft)",
    border: "1px solid var(--panel-edge)",
    padding: "8px 14px",
    fontFamily: "JetBrains Mono, monospace",
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
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  btnDisabled: {
    opacity: 0.4, cursor: "not-allowed",
  },
  spinner: {
    fontSize: 12, color: "var(--ink-soft)",
    padding: "32px 0", textAlign: "center",
    letterSpacing: "0.15em", textTransform: "uppercase",
  },
  warn: {
    background: "rgba(212,163,91,0.08)",
    border: "1px solid var(--amber)",
    borderLeft: "3px solid var(--amber)",
    padding: 14,
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--ink)",
    marginBottom: 14,
  },
  signerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 8,
    marginBottom: 12,
  },
  signerCard: {
    display: "block",
    padding: "10px 12px",
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    textDecoration: "none",
  },
  detailsHead: {
    fontSize: 11, color: "var(--ink-soft)",
    letterSpacing: "0.15em", textTransform: "uppercase",
    cursor: "pointer",
  },
  relayRow: {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "JetBrains Mono, monospace", fontSize: 11,
    padding: "4px 0",
    color: "var(--ink-soft)",
  },
  relayUrl: {
    flex: 1, color: "var(--ink)", wordBreak: "break-all",
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
  selfNote: {
    background: "rgba(107,142,107,0.08)",
    border: "1px solid var(--jade)",
    borderLeft: "3px solid var(--jade)",
    padding: 10,
    fontSize: 11,
    lineHeight: 1.55,
    color: "var(--ink-soft)",
    marginBottom: 14,
    fontStyle: "italic",
  },
};
