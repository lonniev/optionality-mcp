import { useEffect, useState } from "react";
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools";

import {
  forgetRecentLogin,
  getStoredNpub,
  getValidRecentLogins,
  receiveNpubProof,
  recordRecentLogin,
  requestNpubProof,
  serviceStatus,
  setGuestMode,
  setStoredNpub,
  setStoredProof,
  type RecentLogin,
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
/// One row in the "Recent identities" picker. Renders an npub
/// (truncated for line length), an "expires in N" hint, a primary
/// click-target that re-enters the app on the cached proof, and a
/// trash button to forget the entry without using it.
function RecentRow({
  entry,
  onUse,
  onForget,
  disabled,
}: {
  entry: RecentLogin;
  onUse: () => void;
  onForget: () => void;
  disabled: boolean;
}) {
  const remainingMs = entry.expiresAt - Date.now();
  const remainingMin = Math.max(0, Math.floor(remainingMs / 60000));
  const remainingHr = Math.floor(remainingMin / 60);
  const ttl =
    remainingHr >= 1 ? `${remainingHr}h ${remainingMin % 60}m` : `${remainingMin}m`;
  const npubShort = `${entry.npub.slice(0, 12)}…${entry.npub.slice(-6)}`;

  return (
    <div style={STYLES.recentRow}>
      <button
        onClick={onUse}
        disabled={disabled}
        style={STYLES.recentMain}
        title={`Sign in as ${entry.npub} using the cached proof_token`}
      >
        <span style={STYLES.recentNpub}>{npubShort}</span>
        <span style={STYLES.recentTtl}>{ttl} left</span>
      </button>
      <button
        onClick={onForget}
        disabled={disabled}
        style={STYLES.recentForget}
        title={`Remove this identity from the cache`}
      >
        ×
      </button>
    </div>
  );
}

/// Modal shown after "Generate Your Npub" — displays the freshly-minted
/// nsec/npub pair with copy-to-clipboard affordances and a link to a
/// Nostr client. The keys are never sent to the server; the user is
/// responsible for stashing the nsec in their own Nostr client before
/// closing.
function KeypairModal({
  generated,
  onClose,
  onCopy,
  onUseIt,
  onSignInDirectly,
}: {
  generated: { nsec: string; npub: string };
  onClose: () => void;
  onCopy: (text: string) => Promise<void>;
  onUseIt: () => void;
  /// "Skip the DM, sign in right now": stash the freshly-generated
  /// nsec in browser session storage, optionally escrow to BE, and
  /// land the user directly on The Pit. Skips the Nostr-client step.
  onSignInDirectly: () => Promise<void>;
}) {
  const [copiedNsec, setCopiedNsec] = useState(false);
  const [copiedNpub, setCopiedNpub] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [directError, setDirectError] = useState("");

  async function handleCopy(which: "nsec" | "npub"): Promise<void> {
    if (which === "nsec") {
      await onCopy(generated.nsec);
      setCopiedNsec(true);
      setTimeout(() => setCopiedNsec(false), 1800);
    } else {
      await onCopy(generated.npub);
      setCopiedNpub(true);
      setTimeout(() => setCopiedNpub(false), 1800);
    }
  }

  return (
    <div style={STYLES.modalScrim} onClick={onClose}>
      <div style={STYLES.modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.modalHead}>Your new Nostr identity</div>
        <p style={STYLES.modalProse}>
          Stash both keys in a password manager — your <b>npub</b> is the username, your
          <b> nsec</b> is the password. If you ever clear your browser or sign in on a new
          device, you can paste them back into the gate ("I have my nsec — sign in without
          a DM") and resume your games. The nsec is the secret; whoever holds it controls
          this identity, so don't share it.
        </p>

        <div style={STYLES.keyRow}>
          <label style={STYLES.keyLabel}>Public key (npub)</label>
          <div style={STYLES.keyValueRow}>
            <code style={STYLES.keyValue}>{generated.npub}</code>
            <button
              onClick={() => void handleCopy("npub")}
              style={STYLES.copyBtn}
            >
              {copiedNpub ? "✓" : "Copy"}
            </button>
          </div>
        </div>

        <div style={STYLES.keyRow}>
          <label style={{ ...STYLES.keyLabel, color: "var(--rust)" }}>
            Secret key (nsec) — never share
          </label>
          <div style={STYLES.keyValueRow}>
            <code style={{ ...STYLES.keyValue, color: "var(--rust)" }}>{generated.nsec}</code>
            <button
              onClick={() => void handleCopy("nsec")}
              style={STYLES.copyBtn}
            >
              {copiedNsec ? "✓" : "Copy"}
            </button>
          </div>
        </div>

        <div style={{
          background: "rgba(212,163,91,0.06)",
          border: "1px solid var(--amber)",
          borderLeft: "3px solid var(--amber)",
          padding: 12,
          fontSize: 12,
          lineHeight: 1.55,
          marginBottom: 14,
        }}>
          <b>Skip the DM &amp; sign in now.</b> Optionality can hold this brand-new
          nsec for you — we encrypt it in the operator vault and use it to sign
          your Nostr DMs on your behalf. iPad-friendly, one-click sign-in. The
          nsec also lives in this browser so the page can sign per-call identity
          proofs. <i>Don't pick this if the nsec above represents a real Nostr
          identity you want to keep self-custodied.</i>
        </div>

        {directError && (
          <div style={{
            color: "var(--rust)",
            background: "rgba(184,85,58,0.08)",
            border: "1px solid var(--rust)",
            borderLeft: "3px solid var(--rust)",
            padding: 10,
            fontSize: 12,
            marginBottom: 12,
          }}>{directError}</div>
        )}

        <div style={STYLES.modalActions}>
          <button
            onClick={async () => {
              setDirectError("");
              setSigningIn(true);
              try {
                await onSignInDirectly();
              } catch (e) {
                setDirectError((e as Error).message);
                setSigningIn(false);
              }
            }}
            disabled={signingIn}
            style={{ ...STYLES.btnPrimary, ...(signingIn ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
          >
            {signingIn ? "Signing in…" : "Sign In Directly"}
          </button>
        </div>

        <details style={{ marginTop: 20 }}>
          <summary style={{ fontSize: 11, color: "var(--ink-soft)", cursor: "pointer", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Self-custody alternatives
          </summary>
          <div style={{ marginTop: 10 }}>
            <p style={STYLES.modalProse}>
              Prefer to manage the nsec yourself? Stash it in a Nostr client like{" "}
              <a
                href="https://0xchat.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber-bright)" }}
              >
                0xchat
              </a>{" "}— then sign in via the standard DM challenge below.
            </p>
            <div style={STYLES.modalActions}>
              <button onClick={onClose} style={STYLES.btnTertiary}>
                I've saved both keys
              </button>
              <button onClick={onUseIt} style={STYLES.btnTertiary}>
                Use this npub for DM sign-in
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
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
  // Generate-keypair modal state. Both bech32 strings live in component
  // state only — never persisted, never sent to the server. The user is
  // expected to copy them to a Nostr client (0xchat, Damus, Amethyst) on
  // their own device before closing the modal.
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [generated, setGenerated] = useState<{ nsec: string; npub: string } | null>(null);
  // Snapshot of valid (unexpired) recent logins shown as a picker on
  // the gate. Refreshed when the user forgets a row or signs in fresh.
  const [recents, setRecents] = useState<RecentLogin[]>(() => getValidRecentLogins());

  /// Re-enter using a cached (npub, proof) tuple. No DM exchange — the
  /// server-side proof_token is still valid until expiresAt, so the
  /// patron can simply land in Optionality. The first paid call will
  /// re-validate; if the server's own cache has dropped the entry,
  /// callTool's auth-bounce path will evict the cache row and force a
  /// fresh DM exchange on the next try.
  function handleReuseRecent(entry: RecentLogin): void {
    setStoredNpub(entry.npub);
    setStoredProof(entry.proof);
    // Refresh lastUsed so MRU ordering reflects this re-entry.
    recordRecentLogin(entry.npub, entry.proof, Math.floor((entry.expiresAt - Date.now()) / 1000));
    onAuthenticated();
  }

  function handleForgetRecent(npub: string): void {
    forgetRecentLogin(npub);
    setRecents(getValidRecentLogins());
  }

  function handleGenerateKeypair(): void {
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    setGenerated({
      nsec: nip19.nsecEncode(sk),
      npub: nip19.npubEncode(pk),
    });
    setShowGenerator(true);
  }

  async function copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Older browsers / restricted contexts — fall through silently;
      // the user can still select-and-copy the visible text.
    }
  }

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

  // The single input field accepts either an npub or an nsec. Branch
  // on the prefix at submit time; users don't have to know which form
  // they're using.
  const inputIsNsec = trimmed.startsWith("nsec1") && trimmed.length > 8;
  const inputIsNpub = trimmed.startsWith("npub1") && trimmed.length >= 60;
  const inputLooksValid = inputIsNsec || inputIsNpub;

  /// Sign in with just an nsec. We derive the npub from it (so the
  /// patron doesn't have to paste both), stash the nsec in browser
  /// session storage, and best-effort escrow to the operator vault.
  /// Subsequent paid calls sign inline kind-27235 proofs from the
  /// session nsec (Tactic 2 in the wheel's verify_proof).
  async function handleNsecSignIn(): Promise<void> {
    setError("");
    const nsec = trimmed;
    let derivedNpub: string;
    try {
      const { getPublicKey, nip19 } = await import("nostr-tools");
      const decoded = nip19.decode(nsec);
      if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) {
        throw new Error("Not a bech32 nsec");
      }
      derivedNpub = nip19.npubEncode(getPublicKey(decoded.data));
    } catch (e) {
      setError("Couldn't read that nsec: " + (e as Error).message);
      return;
    }

    setBusy(true);
    try {
      const { setSessionNsec } = await import("../lib/sessionNsec");
      const { escrowNsec } = await import("../lib/mcp");
      setStoredNpub(derivedNpub);
      setSessionNsec(nsec);
      // Best-effort escrow — refuses cleanly if the operator already
      // holds this patron's nsec from a prior session.
      try {
        await escrowNsec(nsec);
      } catch (e) {
        console.warn("Escrow refresh failed (proceeding):", e);
      }
      setInput("");
      onAuthenticated();
    } catch (e) {
      setError("Sign-in failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
      if (!result.dpop_token) {
        setError("Server did not return a proof_token. Try again.");
        return;
      }
      setStoredNpub(trimmed);
      setPendingProof(result.dpop_token);
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
      const result = await receiveNpubProof(trimmed, pendingProof);
      if (result.error) {
        setError(result.error);
        setStage("awaiting-reply");
        return;
      }
      const token = result.dpop_token || pendingProof;
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
      // Cache this (npub, proof, expiresAt) tuple so a future return —
      // after sign-out or a cleared session — can skip the DM exchange
      // until the server-side proof_token actually expires.
      if (result.expires_in_seconds && result.expires_in_seconds > 0) {
        recordRecentLogin(trimmed, token, result.expires_in_seconds);
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

        {stage === "begin" && recents.length > 0 && (
          <div style={STYLES.recentBlock}>
            <div style={STYLES.recentLabel}>Recent identities</div>
            {recents.map((entry) => (
              <RecentRow
                key={entry.npub}
                entry={entry}
                onUse={() => handleReuseRecent(entry)}
                onForget={() => handleForgetRecent(entry.npub)}
                disabled={busy}
              />
            ))}
          </div>
        )}

        {stage === "begin" && (
          <>
            <label style={STYLES.label} htmlFor="key-input">
              Paste your npub or nsec
            </label>
            <input
              id="key-input"
              type={inputIsNsec ? "password" : "text"}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !inputLooksValid || busy) return;
                if (inputIsNsec) void handleNsecSignIn();
                else void handleBegin();
              }}
              placeholder="npub1… (DM challenge) or nsec1… (instant)"
              style={STYLES.input}
            />
            <button
              onClick={() => {
                if (inputIsNsec) void handleNsecSignIn();
                else void handleBegin();
              }}
              disabled={!inputLooksValid || busy}
              style={{ ...STYLES.btnPrimary, ...((!inputLooksValid || busy) ? STYLES.btnDisabled : {}) }}
            >
              {busy
                ? (inputIsNsec ? "Signing in…" : "Sending DM…")
                : inputIsNsec
                  ? "Sign In"
                  : inputIsNpub
                    ? "Send DM to Sign In"
                    : "Sign In"}
            </button>
            <div style={STYLES.formHint}>
              {inputIsNsec
                ? "Your nsec stays in this browser session. Optionality will also hold an encrypted copy so we can sign DMs on your behalf — withdraw any time from Profile."
                : "We send a Secure Courier DM to your npub. Reply from your Nostr client (0xchat / Damus) and your signature is the proof. No email. No password. No KYC."}
            </div>
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

        <div style={STYLES.altRow}>
          <button
            onClick={() => {
              setGuestMode(true);
              onAuthenticated();
            }}
            style={STYLES.btnGhostHalf}
          >
            Continue as Guest
          </button>
          <button
            onClick={handleGenerateKeypair}
            style={STYLES.btnGhostHalf}
          >
            Generate Your Npub
          </button>
        </div>
        <div style={STYLES.footnote}>
          Guests can browse the chooser, the briefing, and the sample assessment.
          Generating a keypair gives you a fresh Nostr identity to sign in with.
        </div>

        <div style={STYLES.brandFootnote}>
          Optionality<sup>™</sup> is an agentic options-trading game built on
          {" "}
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

        {showGenerator && generated && (
          <KeypairModal
            generated={generated}
            onClose={() => setShowGenerator(false)}
            onCopy={copy}
            onUseIt={() => {
              setInput(generated.npub);
              setShowGenerator(false);
            }}
            onSignInDirectly={async () => {
              // Skip the DM proof entirely. The wheel accepts inline
              // kind-27235 events as `proof` on every paid call
              // (Tactic 2 in identity_proof.verify_proof), so we
              // stash the nsec in browser session storage and the
              // mcp.ts callTool wrapper signs per-call proofs.
              const { setSessionNsec } = await import("../lib/sessionNsec");
              const { escrowNsec } = await import("../lib/mcp");
              setStoredNpub(generated.npub);
              setSessionNsec(generated.nsec);
              // Best-effort escrow so the BE can sign Nostr DMs on
              // the patron's behalf. The first escrow_nsec call uses
              // the new inline-proof path automatically. If escrow
              // fails (e.g. operator key not available), we still
              // proceed — patron can deposit later from Profile.
              try {
                await escrowNsec(generated.nsec);
              } catch (e) {
                // Surface in console but don't block sign-in.
                console.warn("Escrow during direct sign-in failed:", e);
              }
              setShowGenerator(false);
              onAuthenticated();
            }}
          />
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
  formHint: {
    marginTop: 10,
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
  altRow: {
    display: "flex",
    gap: 10,
  },
  btnGhostHalf: {
    flex: 1,
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
  modalScrim: {
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
  modalCard: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    padding: "28px 30px",
    width: "100%",
    maxWidth: 540,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHead: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 22,
    color: "var(--amber-bright)",
    marginBottom: 12,
  },
  modalProse: {
    fontSize: 13,
    color: "var(--ink)",
    lineHeight: 1.55,
    margin: "0 0 14px",
  },
  keyRow: {
    margin: "14px 0",
  },
  keyLabel: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "var(--amber)",
    marginBottom: 6,
  },
  keyValueRow: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  keyValue: {
    flex: 1,
    padding: "8px 10px",
    background: "var(--bg-soft)",
    border: "1px solid var(--panel-edge)",
    color: "var(--ivory-bright)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    wordBreak: "break-all",
    lineHeight: 1.5,
  },
  copyBtn: {
    minWidth: 56,
    padding: "0 12px",
    background: "transparent",
    border: "1px solid var(--amber)",
    color: "var(--amber-bright)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 18,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  recentBlock: {
    marginBottom: 18,
  },
  recentLabel: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "var(--amber)",
    marginBottom: 8,
  },
  recentRow: {
    display: "flex",
    gap: 6,
    marginBottom: 6,
  },
  recentMain: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "transparent",
    border: "1px solid var(--panel-edge)",
    color: "var(--ivory-bright)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "left",
  },
  recentNpub: {
    letterSpacing: "0.02em",
  },
  recentTtl: {
    fontSize: 10,
    color: "var(--amber)",
    letterSpacing: "0.05em",
  },
  recentForget: {
    width: 34,
    background: "transparent",
    border: "1px solid var(--panel-edge)",
    color: "var(--ink-faint)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 16,
    cursor: "pointer",
  },
  recentHint: {
    fontSize: 11,
    color: "var(--ink-faint)",
    fontStyle: "italic",
    marginTop: 6,
  },
};
