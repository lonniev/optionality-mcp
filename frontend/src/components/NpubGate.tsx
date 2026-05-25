import { useEffect, useState } from "react";

import {
  getStoredNpub,
  receiveNpubProof,
  requestNpubProof,
  serviceStatus,
  setGuestMode,
  setStoredNpub,
  setStoredProof,
} from "../lib/mcp";

/**
 * Sign-in gate. Wraps the whole app and forces the patron through the
 * npub-proof handshake before any paid Optionality tool can be reached.
 *
 * Flow (matches the wheel 0.25.0 proof tools):
 *
 *   1. Mount → call `service_status` to fetch the operator's npub
 *      fingerprint, so the user can verify the DM sender is genuine.
 *   2. User pastes their npub → click "Begin Sign-In" →
 *      `request_npub_proof(patron_npub)`. Server sends a Secure Courier
 *      DM and returns a `proof_token` (poison phrase like "rare-lake-49").
 *      Token is held in component state.
 *   3. User opens their Nostr client, finds the DM from the operator
 *      (fingerprint matches), and replies with any text. Their signature
 *      on that DM is the cryptographic proof of nsec ownership.
 *   4. User clicks "Finish Sign-In" → `receive_npub_proof(patron_npub)`.
 *      Server drains the relay, validates the reply, caches the proof
 *      server-side keyed by sha256(poison) + npub, and returns the same
 *      `proof_token`.
 *   5. Gate persists (npub, proof_token) to localStorage and calls
 *      `onAuthenticated`. App.tsx swaps in the main UI.
 *
 * Errors at any step are surfaced in-place; the user can retry without
 * leaving the gate.
 */
export default function NpubGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [input, setInput] = useState<string>(getStoredNpub());
  const [stage, setStage] = useState<"begin" | "awaiting-reply" | "checking">("begin");
  const [pendingProof, setPendingProof] = useState<string>("");
  const [pendingDuration, setPendingDuration] = useState<string>("");
  const [opFingerprint, setOpFingerprint] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    serviceStatus()
      .then((s) => {
        if (cancelled) return;
        if (s?.operator_npub_hash) setOpFingerprint(s.operator_npub_hash);
      })
      .catch(() => {
        // service_status failure is non-fatal for the gate UI; the user
        // can still attempt login. The operator-fingerprint hint just
        // won't render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmed = input.trim();
  const npubLooksValid = trimmed.startsWith("npub1") && trimmed.length >= 60;

  async function handleBegin(): Promise<void> {
    if (!npubLooksValid) {
      setError("Enter a valid npub1... key.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await requestNpubProof(trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (!result.proof_token) {
        setError("Server did not return a proof_token. Try again.");
        return;
      }
      setStoredNpub(trimmed);
      setPendingProof(result.proof_token);
      setStage("awaiting-reply");
    } catch (e) {
      setError(`Could not send proof challenge: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish(): Promise<void> {
    setBusy(true);
    setError("");
    setStage("checking");
    try {
      const result = await receiveNpubProof(trimmed);
      if (result.error) {
        setError(result.error);
        setStage("awaiting-reply");
        return;
      }
      const token = result.proof_token || pendingProof;
      if (!token) {
        setError("No proof_token returned. Resend the DM and try again.");
        setStage("awaiting-reply");
        return;
      }
      setStoredNpub(trimmed);
      setStoredProof(token);
      if (result.expires_in_seconds) {
        const hours = Math.floor(result.expires_in_seconds / 3600);
        setPendingDuration(hours > 0 ? `${hours}h` : `${Math.round(result.expires_in_seconds / 60)}m`);
      }
      onAuthenticated();
    } catch (e) {
      setError(`Verification failed: ${(e as Error).message}`);
      setStage("awaiting-reply");
    } finally {
      setBusy(false);
    }
  }

  function handleReset(): void {
    setStage("begin");
    setPendingProof("");
    setError("");
  }

  return (
    <div style={STYLES.root}>
      <img
        src="/login-bg.jpg"
        alt=""
        aria-hidden="true"
        style={STYLES.backdrop}
      />
      <div style={STYLES.panel}>
        <div style={STYLES.brand}>
          OPTIONALITY
          <small style={STYLES.brandSub}>Gamified Options Trading Consultant Trainer</small>
        </div>

        <h2 className="serif" style={STYLES.heading}>The desk requires identification.</h2>

        <p style={STYLES.prose}>
          Sign in with your Nostr identity. We&apos;ll send a Secure Courier DM to your npub;
          your signed reply proves ownership. No email. No password. No KYC.
        </p>

        {stage === "begin" && (
          <>
            <label style={STYLES.label} htmlFor="npub-input">Your patron npub</label>
            <input
              id="npub-input"
              type="text"
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && npubLooksValid && !busy) void handleBegin(); }}
              placeholder="npub1..."
              style={STYLES.input}
            />
            <button
              onClick={() => void handleBegin()}
              disabled={!npubLooksValid || busy}
              style={{ ...STYLES.btnPrimary, ...((!npubLooksValid || busy) ? STYLES.btnDisabled : {}) }}
            >
              {busy ? "Sending DM…" : "Begin Sign-In"}
            </button>
          </>
        )}

        {(stage === "awaiting-reply" || stage === "checking") && (
          <>
            <div style={STYLES.dmCard}>
              <div style={STYLES.dmHead}>DM sent — check your Nostr client.</div>
              <div style={STYLES.dmBody}>
                Reply with <em>any</em> text. Your signature on that DM is the proof.
              </div>
              {opFingerprint && (
                <div style={STYLES.dmHint}>
                  Verify the sender — operator fingerprint:&nbsp;
                  <span style={STYLES.mono}>🔒 {opFingerprint}</span>
                </div>
              )}
              {pendingProof && (
                <div style={STYLES.dmHint}>
                  Anti-replay token in the DM body:&nbsp;
                  <span style={STYLES.mono}>{pendingProof}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => void handleFinish()}
              disabled={busy}
              style={{ ...STYLES.btnPrimary, ...(busy ? STYLES.btnDisabled : {}) }}
            >
              {stage === "checking" || busy ? "Checking…" : "Finish Sign-In"}
            </button>

            <button
              onClick={() => void handleBegin()}
              disabled={busy}
              style={STYLES.btnGhost}
            >
              Resend DM
            </button>

            <button
              onClick={handleReset}
              disabled={busy}
              style={STYLES.btnTertiary}
            >
              Use a different npub
            </button>
          </>
        )}

        {error && <div style={STYLES.error}>{error}</div>}

        {pendingDuration && (
          <div style={STYLES.footnote}>Proof cached for ~{pendingDuration}.</div>
        )}

        <div style={STYLES.guestDivider}>
          <span style={STYLES.guestDividerLine} />
          <span style={STYLES.guestDividerLabel}>or</span>
          <span style={STYLES.guestDividerLine} />
        </div>

        <button
          onClick={() => {
            setGuestMode(true);
            onAuthenticated();
          }}
          style={STYLES.btnGhost}
        >
          Continue as Guest
        </button>
        <div style={STYLES.footnote}>
          Guests can browse the scenario chooser and the briefing.
          Dealing scenarios, judging trades, and tipping require a Nostr sign-in.
        </div>
      </div>
    </div>
  );
}

// ─── Inline styles ─────────────────────────────────────────────────────────
// Self-contained so the gate doesn't depend on Optionality being mounted.
// Palette references the CSS variables defined in src/index.css.

const STYLES: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "var(--bg)",
    backgroundImage:
      "radial-gradient(ellipse at top left, rgba(212,163,91,0.05), transparent 50%), " +
      "radial-gradient(ellipse at bottom right, rgba(164,69,58,0.04), transparent 50%)",
    color: "var(--ink)",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    position: "relative",
    overflow: "hidden",
  },
  panel: {
    background: "var(--panel)",
    border: "1px solid var(--panel-edge)",
    padding: "32px 36px",
    width: "100%",
    maxWidth: 460,
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(2px)",
  },
  // Kubrick's 1949 CBOT pit photo, Library of Congress, public domain.
  // Treatment: warm-amber sepia + slight blur + radial mask that
  // feathers the edges so the image dissolves into the background
  // rather than ending in a hard rectangle. scale(1.08) crops the
  // archival frame markers ("7" / "2.368") from the negative border.
  backdrop: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    opacity: 0.18,
    filter: "sepia(0.45) hue-rotate(-12deg) blur(0.4px) contrast(1.05)",
    transform: "scale(1.08)",
    pointerEvents: "none",
    zIndex: 0,
    maskImage: "radial-gradient(ellipse at center, black 35%, transparent 88%)",
    WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 88%)",
  },
  brand: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 500,
    fontSize: 28,
    letterSpacing: "0.04em",
    color: "var(--amber-bright)",
    textShadow: "0 0 24px var(--amber-glow)",
    marginBottom: 18,
  },
  brandSub: {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    fontWeight: 400,
    color: "var(--ink-faint)",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    marginTop: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: 500,
    color: "var(--ink)",
    marginBottom: 8,
    lineHeight: 1.2,
  },
  prose: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 14,
    lineHeight: 1.5,
    color: "var(--ink-soft)",
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "var(--ink-faint)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    color: "var(--ink)",
    padding: "10px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    marginBottom: 14,
    outline: "none",
  },
  btnPrimary: {
    width: "100%",
    background: "var(--amber)",
    color: "#1a1208",
    border: "none",
    padding: "12px 20px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  btnGhost: {
    width: "100%",
    background: "transparent",
    color: "var(--ink-soft)",
    border: "1px solid var(--panel-edge)",
    padding: "10px 20px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    cursor: "pointer",
    marginTop: 8,
  },
  btnTertiary: {
    width: "100%",
    background: "transparent",
    color: "var(--ink-faint)",
    border: "none",
    padding: "8px 0",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    cursor: "pointer",
    marginTop: 12,
  },
  dmCard: {
    background: "rgba(212,163,91,0.05)",
    borderLeft: "2px solid var(--amber)",
    padding: "14px 16px",
    marginBottom: 16,
  },
  dmHead: {
    fontSize: 13,
    color: "var(--amber-bright)",
    marginBottom: 6,
    fontWeight: 500,
  },
  dmBody: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 13,
    color: "var(--ink-soft)",
    lineHeight: 1.5,
    marginBottom: 10,
  },
  dmHint: {
    fontSize: 11,
    color: "var(--ink-faint)",
    marginTop: 6,
    lineHeight: 1.5,
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
    color: "var(--amber-bright)",
    fontWeight: 500,
  },
  error: {
    marginTop: 14,
    padding: "10px 14px",
    color: "var(--crimson)",
    background: "rgba(164,69,58,0.08)",
    borderLeft: "2px solid var(--crimson)",
    fontSize: 12,
    lineHeight: 1.5,
  },
  footnote: {
    marginTop: 12,
    fontSize: 11,
    color: "var(--ink-faint)",
    fontStyle: "italic",
    textAlign: "center",
  },
  guestDivider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "20px 0 14px",
  },
  guestDividerLine: {
    flex: 1,
    height: 1,
    background: "var(--panel-edge)",
  },
  guestDividerLabel: {
    fontSize: 10,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "var(--ink-faint)",
  },
};
