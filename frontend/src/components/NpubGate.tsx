import { useEffect, useState } from "react";

import {
  getStoredNpub,
  receiveNpubProof,
  requestNpubProof,
  serviceStatus,
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
/// Low-intensity SVG of an open-outcry trading pit — tiered concentric
/// terraces with stylized trader figures around the rings, ticker-tape
/// streamers across the top. Sits behind the login panel at ~10% opacity
/// so it reads as atmosphere, not subject. Pure inline SVG (no asset
/// pipeline coordination needed); colors reference CSS variables for
/// theme parity.
function PitBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.11,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <defs>
        <radialGradient id="pit-vignette" cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.45" />
          <stop offset="60%" stopColor="var(--amber)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Vignette glow centered on the pit floor */}
      <rect x="0" y="0" width="1200" height="800" fill="url(#pit-vignette)" />

      {/* Concentric tiered terraces — drawn as offset octagons giving the
          octagonal pit footprint familiar from CBOE / CME. */}
      <g
        stroke="var(--amber-bright)"
        strokeWidth="1.4"
        fill="none"
        opacity="0.85"
      >
        {[460, 360, 270, 190, 120].map((r, i) => {
          const cx = 600, cy = 470;
          // 8-sided octagon, slightly rotated for visual interest
          const pts = Array.from({ length: 8 }).map((_, k) => {
            const a = (Math.PI / 4) * k + Math.PI / 8;
            return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r * 0.55).toFixed(1)}`;
          });
          return (
            <polygon
              key={i}
              points={pts.join(" ")}
              strokeDasharray={i === 4 ? "0" : "3,4"}
              opacity={0.4 + i * 0.12}
            />
          );
        })}
      </g>

      {/* Trader figures scattered around the outer rings — simple
          two-circle silhouettes (head + torso) so they read as people
          without committing to detail at low opacity. */}
      <g fill="var(--ivory)" opacity="0.55">
        {([
          [220, 380, 12], [310, 540, 14], [430, 640, 13], [610, 680, 15],
          [780, 640, 14], [900, 540, 13], [990, 380, 14], [900, 280, 12],
          [780, 220, 13], [610, 200, 14], [430, 220, 13], [310, 280, 12],
          [380, 460, 10], [510, 590, 11], [690, 590, 11], [820, 460, 10],
          [380, 360, 10], [510, 280, 11], [690, 280, 11], [820, 360, 10],
        ] as Array<[number, number, number]>).map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle r={s * 0.45} cy={-s * 0.9} />
            <ellipse rx={s * 0.7} ry={s * 1.0} cy={s * 0.25} />
          </g>
        ))}
      </g>

      {/* Ticker-tape streamers across the upper third — three faint
          horizontal bands suggesting price feeds. */}
      <g
        stroke="var(--bronze)"
        strokeWidth="0.6"
        fill="none"
        opacity="0.6"
      >
        <path d="M0 80 Q300 70 600 84 T1200 78" />
        <path d="M0 120 Q300 132 600 116 T1200 124" />
        <path d="M0 158 Q300 150 600 162 T1200 154" strokeDasharray="2,6" />
      </g>

      {/* Pit-floor numerals — abstract three-character glyphs near each
          tier crest, evoking strike prices without being legible. */}
      <g
        fill="var(--amber)"
        opacity="0.32"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="11"
        textAnchor="middle"
      >
        <text x="600" y="220">·· ·· ··</text>
        <text x="600" y="710">·· ·· ··</text>
        <text x="180" y="470" transform="rotate(-90 180 470)">·· ··</text>
        <text x="1020" y="470" transform="rotate(90 1020 470)">·· ··</text>
      </g>
    </svg>
  );
}

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
      <PitBackdrop />
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
};
