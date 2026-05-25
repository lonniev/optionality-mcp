// DM Compose modal — Phase 2 of the patron-to-patron Nostr DM feature.
//
// Single-shot send: compose, sign via NIP-07, publish to the sender's
// configured relays, report success, close. Not a chat interface —
// no thread view, no history. The recipient sees the DM in their
// Nostr client of choice (0xchat, Damus, Amethyst).
//
// Hard requirements communicated to the user when they don't apply:
//   - NIP-07 browser extension installed (no extension → install
//     prompt instead of a compose form).
//   - At least one relay configured in Profile (no relays → "configure
//     relays" message). The relay list is owned by the sender's
//     Profile, not pulled from the recipient.

import { useEffect, useState } from "react";
import {
  hasNip07,
  sendNip04DM,
  type RelayPublishResult,
} from "../lib/nostr";
import { getStoredNpub } from "../lib/mcp";
import Avatar, { shortNpub } from "./Avatar";

interface Props {
  target: { npub: string; displayName?: string | null; avatar?: string | null };
  relays: string[];
  onClose: () => void;
}

type Stage =
  | { kind: "compose" }
  | { kind: "sending" }
  | { kind: "sent"; results: RelayPublishResult[]; successCount: number; eventId: string }
  | { kind: "error"; message: string };

const MAX_MESSAGE = 2000;

export default function DMComposeModal({ target, relays, onClose }: Props) {
  const [text, setText] = useState<string>("");
  const [stage, setStage] = useState<Stage>({ kind: "compose" });
  const [nip07] = useState<boolean>(() => hasNip07());

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

  const displayName = target.displayName || "Anonymous";
  const isSelfDM = target.npub === getStoredNpub();

  return (
    <div style={STYLES.scrim} onClick={() => stage.kind !== "sending" && onClose()}>
      <div style={STYLES.card} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.head}>{isSelfDM ? "Send DM to Yourself" : "Send DM"}</div>

        <div style={STYLES.recipient}>
          <Avatar value={target.avatar} size={44} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, color: "var(--amber-bright)" }}>
              {displayName}{isSelfDM ? " (you)" : ""}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
              {shortNpub(target.npub)}
            </div>
          </div>
        </div>

        {isSelfDM && (
          <div style={STYLES.selfNote}>
            Self-DM: the message lands in your own Nostr client's inbox. Useful for
            verifying your NIP-07 signer + relay path end-to-end without pinging a peer.
          </div>
        )}

        {!nip07 && (
          <NoSignerNotice onClose={onClose} />
        )}

        {nip07 && relays.length === 0 && (
          <div style={STYLES.warn}>
            No Nostr relays configured. Open <b>Profile → Nostr Relays</b> and add at least one
            (we recommend <code>wss://relay.damus.io</code>).
            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnGhost}>Close</button>
            </div>
          </div>
        )}

        {nip07 && relays.length > 0 && stage.kind === "compose" && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_MESSAGE}
              placeholder="Type a single message — recipient sees it in their Nostr client."
              style={STYLES.textarea}
              autoFocus
            />
            <div style={STYLES.charCount}>{text.length} / {MAX_MESSAGE}</div>

            <p style={STYLES.fine}>
              Signed locally by your NIP-07 extension (your nsec never reaches Optionality).
              Published to <b>{relays.length}</b> relay{relays.length === 1 ? "" : "s"} from your
              Profile.
            </p>

            <div style={STYLES.actions}>
              <button onClick={onClose} style={STYLES.btnGhost}>Cancel</button>
              <button
                onClick={() => void handleSend()}
                disabled={!text.trim()}
                style={{ ...STYLES.btnPrimary, ...(!text.trim() ? STYLES.btnDisabled : {}) }}
              >
                Sign &amp; Send
              </button>
            </div>
          </>
        )}

        {stage.kind === "sending" && (
          <div style={STYLES.spinner}>Encrypting, signing, broadcasting…</div>
        )}

        {stage.kind === "sent" && (
          <>
            <div style={{
              fontFamily: "Fraunces, serif",
              fontSize: 18,
              color: stage.successCount > 0 ? "var(--jade)" : "var(--rust)",
              marginBottom: 12,
            }}>
              {stage.successCount > 0 ? "✓ Sent" : "✗ Not Accepted"}
              <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 8, letterSpacing: "0.1em" }}>
                {stage.successCount} / {stage.results.length} relays
              </span>
            </div>
            <details style={{ marginBottom: 12 }}>
              <summary style={STYLES.detailsHead}>Per-relay results</summary>
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
            <p style={STYLES.fine}>
              Event id <code style={{ fontSize: 10, color: "var(--ink-faint)" }}>{stage.eventId.slice(0, 16)}…</code>
              {" "}— the recipient sees this in any Nostr client that subscribes to one of these relays.
            </p>
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
              <button
                onClick={() => setStage({ kind: "compose" })}
                style={STYLES.btnPrimary}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NoSignerNotice({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div style={STYLES.warn}>
        <b>Install a Nostr signer extension</b> to send DMs. Optionality never sees your nsec —
        the extension signs the DM in its own sandbox and the encrypted message goes straight
        to relays.
      </div>
      <div style={STYLES.signerGrid}>
        <SignerLink
          name="Alby"
          url="https://getalby.com"
          blurb="Browser extension + iOS / Android. Includes a Lightning wallet too."
        />
        <SignerLink
          name="nos2x"
          url="https://github.com/fiatjaf/nos2x"
          blurb="Minimal Chrome / Firefox extension. NIP-07 only, no wallet."
        />
        <SignerLink
          name="Flamingo"
          url="https://www.flamingo.me"
          blurb="iOS / desktop wrapper around your nsec; exposes NIP-07 to web pages."
        />
      </div>
      <div style={STYLES.actions}>
        <button onClick={onClose} style={STYLES.btnGhost}>Close</button>
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
    padding: 20, backdropFilter: "blur(4px)",
  },
  card: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    padding: "26px 28px",
    width: "100%", maxWidth: 520,
    maxHeight: "90vh", overflowY: "auto",
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
