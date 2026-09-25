import { useEffect, useState } from "react";
import { serviceStatus } from "@tollbooth-dpyc/web";
import { NpubGate } from "@tollbooth-dpyc/web/react";

/**
 * Optionality's sign-in screen: its own frame around the shared gate.
 *
 * Signing in — the npub DM challenge, the nsec session key, generating a key,
 * recent identities — is the package's `NpubGate`. What is Optionality's alone
 * sits around it: the trading-pit backdrop and brand, "Continue as Guest", and
 * the plain statement that a pasted nsec is also escrowed with the operator
 * (App's `onLogin` does the escrow).
 */
export default function SignInScreen({
  onLogin,
  onGuest,
  notice,
}: {
  onLogin: () => void;
  onGuest: () => void;
  notice?: string;
}) {
  // The operator's fingerprint, so the patron can check who sent the DM.
  // Non-fatal: without it the gate simply omits the hint.
  const [operatorHash, setOperatorHash] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    serviceStatus()
      .then((s) => {
        if (!cancelled && s?.operator_npub_hash) setOperatorHash(s.operator_npub_hash);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={STYLES.root}>
      <img src="/login-bg.jpg" alt="" aria-hidden="true" style={STYLES.backdrop} />
      <div style={STYLES.column}>
        <div style={STYLES.brand}>
          OPTIONALITY
          <small style={STYLES.brandSub}>Gamified Options Trading Consultant Trainer</small>
        </div>

        <div className="tb-host">
          <NpubGate onLogin={onLogin} operatorHash={operatorHash || undefined} notice={notice} />
        </div>

        <div style={STYLES.panel}>
          <p style={STYLES.formHint}>
            Signing in with an nsec? It stays in this browser to sign each call, and Optionality
            also keeps an encrypted copy so it can sign your DMs. Withdraw it any time from
            Profile. For an identity you keep self-custodied, sign in with your npub instead.
          </p>

          <div style={STYLES.guestDivider}>
            <span style={STYLES.guestDividerLine} />
            <span style={STYLES.guestDividerLabel}>or</span>
            <span style={STYLES.guestDividerLine} />
          </div>

          <button onClick={onGuest} style={STYLES.btnGhost}>
            Continue as Guest
          </button>
          <div style={STYLES.footnote}>
            Guests can browse the chooser, the briefing, and the sample assessment.
          </div>

          <div style={STYLES.brandFootnote}>
            Optionality<sup>™</sup> is an agentic options-trading game built on{" "}
            <a
              href="https://tollbooth-dpyc.com"
              target="_blank"
              rel="noopener noreferrer"
              style={STYLES.brandFootnoteLink}
            >
              Tollbooth-DPYC<sup>™</sup>
            </a>{" "}
            — Bitcoin Lightning micropayments and Nostr identity for AI agents.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline styles ─────────────────────────────────────────────────────────
// Palette references the CSS variables defined in src/index.css; the gate
// itself is drawn through the --tb-* tokens mapped there.

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
    padding: "32px 16px",
    position: "relative",
    overflow: "hidden",
  },
  // Kubrick's 1949 CBOT pit photo, Library of Congress, public domain.
  // Treatment: warm-amber sepia + slight blur + radial mask that feathers the
  // edges into the background. scale(1.08) crops the archival frame markers.
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
  column: {
    width: "100%",
    maxWidth: 460,
    position: "relative",
    zIndex: 1,
  },
  brand: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 500,
    fontSize: 28,
    letterSpacing: "0.04em",
    color: "var(--amber-bright)",
    textShadow: "0 0 24px var(--amber-glow)",
    textAlign: "center",
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
  panel: {
    padding: "0 16px",
    marginTop: 14,
  },
  formHint: {
    fontSize: 11,
    color: "var(--ink-faint)",
    lineHeight: 1.55,
    fontStyle: "italic",
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
  btnGhost: {
    width: "100%",
    background: "transparent",
    color: "var(--ink-soft)",
    border: "1px solid var(--panel-edge)",
    padding: "10px 12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    letterSpacing: "0.05em",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  footnote: {
    marginTop: 12,
    fontSize: 11,
    color: "var(--ink-faint)",
    fontStyle: "italic",
    textAlign: "center",
  },
  brandFootnote: {
    marginTop: 22,
    paddingTop: 16,
    borderTop: "1px solid var(--panel-edge)",
    fontSize: 11,
    color: "var(--ink-faint)",
    textAlign: "center",
    lineHeight: 1.55,
  },
  brandFootnoteLink: {
    color: "var(--amber-bright)",
    textDecoration: "none",
    fontWeight: 500,
  },
};
