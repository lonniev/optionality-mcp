// Profile page — the package's AccountPage in Optionality's panels.
//
// AccountPage (@tollbooth-dpyc/web) owns the order every DPYC site shares:
// the patron's Nostr kind-0 (the single, self-sovereign source of identity),
// the session key (renders nothing unless this browser holds one), time
// zone, theme, coupons and build. Optionality's own panel — the Game Persona
// Key (nsec escrow) — sits after the theme, where Preferences used to end.
// Usage has its own tab here, so the page's usage section is off.
//
// On publish, the name, avatar and bio are mirrored into Optionality's store so
// the leaderboard + DM addressing keep rendering them fast (no live relay fetch
// per row); the DB is a derived cache, not an editable identity surface.

import { useEffect, useState, type ReactNode } from "react";
import {
  WITHDRAW_ACKNOWLEDGMENT,
  escrowNsec,
  getPatronProfile,
  setProfile,
  withdrawNsec,
} from "../lib/mcp";
import type { Kind0 } from "@tollbooth-dpyc/web";
import { AccountPage } from "@tollbooth-dpyc/web/react";

/// A panel heading in the site's shape: the small amber tab on the border,
/// then the serif title.
function PanelTitle({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="panel-label">{label}</span>
      {children}
    </>
  );
}

export default function ProfileTab({ npub }: { npub: string }) {
  // The only app-local profile state this page still needs is the nsec-escrow
  // custody flag — it can't live on Nostr, and it drives the Game Persona Key
  // panel. Identity (name/avatar/bio) lives on Nostr.
  const [escrowed, setEscrowed] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await getPatronProfile();
        if (typeof r.profile?.escrowed === "boolean") setEscrowed(r.profile.escrowed);
      } catch {
        /* silent — the escrow panel defaults to the deposit path */
      }
    })();
  }, []);

  return (
    <AccountPage
      npub={npub}
      heading={null}
      before={
        <div className="panel account-identity">
          <span className="panel-label">Profile</span>
          <h2 className="serif">Your self-sovereign identity.</h2>
          <p className="account-intro">
            Your profile lives in your Nostr kind-0 metadata — read from relays and shown in every Nostr
            client. Edits are signed in your browser and relayed; your key never leaves this device.
          </p>
        </div>
      }
      profile={{ onPublished: mirrorToLeaderboard }}
      usage={false}
      timezone={{
        heading: <PanelTitle label="Time zone">Every clock, one zone.</PanelTitle>,
        intro: "Every date on Optionality follows this zone. Local to this browser — nothing here is published or shared.",
        classNames: { select: "tz-select" },
      }}
      theme={{
        heading: <PanelTitle label="Preferences">How Optionality looks to you.</PanelTitle>,
        intro: "Local to this browser — nothing here is published or shared.",
        themes: ["dark", "light"],
        labels: { dark: "🌑 Dark", light: "☀ Light" },
        classNames: { root: "theme-toggle", chip: "theme-chip", active: "active" },
      }}
      between={{ theme: <GamePersonaKeyPanel escrowed={escrowed} onChange={setEscrowed} /> }}
      coupons={{
        heading: (
          <>
            <span className="panel-label">My Coupons</span>
            <h2 className="serif">Codes that ride along.</h2>
          </>
        ),
        intro:
          "Redeem an operator code once. The discount applies automatically on subsequent paid tool calls until the per-patron cap or the calendar window expires.",
        empty:
          "No coupons redeemed yet. Operators distribute codes via Twitter, email, the welcome page, or DM — paste the code above to claim its discount.",
        formHeading: "Redeem a code",
        listHeading: "Active",
        placeholder: "FRESHMAN, EARLYBIRD…",
        redeemLabel: "🎟 Redeem",
        forgetLabel: "🗑",
        classNames: {
          root: "panel",
          intro: "coupons-intro",
          form: "coupons-form",
          input: "coupons-input",
          chip: "btn coupons-chip",
          subheading: "coupons-subheading",
          message: "coupons-message",
          ok: "ok",
          error: "err",
          loading: "coupons-note",
          empty: "coupons-note",
          list: "coupons-list",
          row: "coupons-row",
          name: "coupons-name",
          discount: "coupons-discount",
          meta: "coupons-meta",
          active: "coupons-active",
        },
      }}
      build={{
        heading: (
          <>
            <span className="panel-label">Build &amp; License</span>
            <h2 className="serif">Open source, private commerce.</h2>
          </>
        ),
        intro: (
          <>
            Optionality and Tollbooth-DPYC<sup>™</sup> ship as open source under the Apache
            License 2.0 — anyone can read the code, fork it, run their own operator. The{" "}
            <i>services</i> hosted on top of that code are private commerce: each operator
            sets their own tolls and pricing model; patrons pre-fund a Lightning balance
            and pay per-call. The protocol is shared; the businesses on it are not.
          </>
        ),
        frontend: {
          version: __APP_VERSION__,
          commit: __BUILD_COMMIT__,
          builtAt: __BUILD_TIME__,
          source: "https://github.com/lonniev/optionality-mcp",
        },
        classNames: {
          root: "panel",
          intro: "build-intro",
          section: "build-section",
          row: "build-row",
          label: "build-label",
          value: "build-value",
          link: "build-link",
        },
      }}
      classNames={{
        root: "tb-host account-page",
        section: "panel",
        sectionHeading: "serif",
        sectionIntro: "account-intro",
      }}
    />
  );
}

/// Mirror a just-published kind-0 into Optionality's store. The draft keeps a
/// glyph avatar (kind-0 drops it, since a Nostr picture must be a URL), so the
/// leaderboard still shows it. Best-effort — never blocks the publish.
function mirrorToLeaderboard(profile: Kind0): void {
  void setProfile({
    display_name: profile.display_name ?? "",
    avatar: profile.picture ?? "",
    bio: profile.about ?? "",
  }).catch(() => { /* cache mirror is best-effort */ });
}

// ──────────────────────────────────────────────────────────────────
// Game Persona Key — opt-in nsec escrow + withdraw
//
// Two states:
//   - Not escrowed: paste-form to deposit a freshly-generated nsec
//     (Optionality validates it derives to the proven npub, then
//     AES-encrypts and stores in Neon).
//   - Escrowed: status + Withdraw button. Withdraw requires the user
//     to type the exact acknowledgment phrase (defense against
//     accidental click). On success the nsec returns once, copyable;
//     Optionality forgets it.
//
// Trade-off framed honestly in the UI: this only makes sense for
// game-scoped personas. Don't paste your real Nostr nsec here.

function GamePersonaKeyPanel({
  escrowed,
  onChange,
}: {
  escrowed: boolean;
  onChange: (next: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [depositInput, setDepositInput] = useState("");
  const [showAck, setShowAck] = useState(false);
  const [ackText, setAckText] = useState("");
  const [withdrawn, setWithdrawn] = useState<string | null>(null);

  async function handleDeposit(): Promise<void> {
    const nsec = depositInput.trim();
    if (!nsec.startsWith("nsec1")) {
      setError("That doesn't look like a bech32 nsec1… string.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await escrowNsec(nsec);
      if (r.success) {
        setDepositInput("");
        onChange(true);
      } else {
        setError(r.error || "Deposit failed.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw(): Promise<void> {
    if (ackText !== WITHDRAW_ACKNOWLEDGMENT) {
      setError("Acknowledgment phrase doesn't match exactly.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await withdrawNsec(ackText);
      if (r.success && r.nsec) {
        setWithdrawn(r.nsec);
        setShowAck(false);
        setAckText("");
        onChange(false);
      } else {
        setError(r.error || "Withdrawal failed.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <span className="panel-label">Game Persona Key</span>
      <h2 className="serif">Nsec custody</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16, lineHeight: 1.6 }}>
        If you generated your npub fresh for Optionality, you can hand the nsec to the operator
        so the BE signs Nostr DMs on your behalf — no signer extension needed (iPad-friendly).
        The nsec is encrypted at rest with AES-256-GCM. <b>Don't paste your real Nostr identity
        here</b> — only fresh game personas.
      </p>

      {!escrowed && (
        <>
          <FieldLabel>Deposit a nsec</FieldLabel>
          <input
            type="password"
            value={depositInput}
            onChange={(e) => setDepositInput(e.target.value)}
            placeholder="nsec1..."
            style={{
              width: "100%",
              background: "var(--bg-soft)",
              border: "1px solid var(--panel-edge)",
              color: "var(--ivory-bright)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          />
          <div className="actions">
            <button
              className="btn"
              disabled={!depositInput.trim() || busy}
              onClick={() => void handleDeposit()}
              style={{ opacity: !depositInput.trim() || busy ? 0.5 : 1 }}
            >
              {busy ? "Encrypting…" : "Deposit"}
            </button>
          </div>
        </>
      )}

      {escrowed && !withdrawn && (
        <>
          <div style={{
            background: "rgba(107,142,107,0.08)",
            border: "1px solid var(--jade)",
            borderLeft: "3px solid var(--jade)",
            padding: 12,
            fontSize: 13,
            marginBottom: 14,
          }}>
            ✓ Held by Optionality (encrypted in vault). DMs to other patrons route through the
            BE signer — no browser extension needed.
          </div>
          {!showAck && (
            <div className="actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setShowAck(true); setAckText(""); setError(""); }}
              >
                Withdraw &amp; self-custody
              </button>
            </div>
          )}
          {showAck && (
            <>
              <div style={{
                background: "rgba(184,85,58,0.06)",
                border: "1px solid var(--rust)",
                borderLeft: "3px solid var(--rust)",
                padding: 12,
                fontSize: 12,
                lineHeight: 1.55,
                marginBottom: 12,
              }}>
                Type the phrase below exactly to confirm — the nsec will display once for you to
                copy, then Optionality forgets it. After withdrawal you'll need a Nostr signer
                extension (Alby, nos2x) to send DMs.
              </div>
              <FieldLabel>Acknowledgment</FieldLabel>
              <input
                type="text"
                value={ackText}
                onChange={(e) => setAckText(e.target.value)}
                placeholder={WITHDRAW_ACKNOWLEDGMENT}
                style={{
                  width: "100%",
                  background: "var(--bg-soft)",
                  border: "1px solid var(--panel-edge)",
                  color: "var(--ivory-bright)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                  padding: "10px 12px",
                  marginBottom: 12,
                }}
              />
              <div className="actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => { setShowAck(false); setAckText(""); setError(""); }}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={() => void handleWithdraw()}
                  disabled={ackText !== WITHDRAW_ACKNOWLEDGMENT || busy}
                  style={{ opacity: ackText !== WITHDRAW_ACKNOWLEDGMENT || busy ? 0.5 : 1 }}
                >
                  {busy ? "Withdrawing…" : "Confirm Withdrawal"}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {withdrawn && (
        <>
          <div style={{
            background: "rgba(212,163,91,0.08)",
            border: "1px solid var(--amber)",
            borderLeft: "3px solid var(--amber)",
            padding: 14,
            fontSize: 12,
            marginBottom: 14,
            lineHeight: 1.6,
          }}>
            <b>Copy your nsec now.</b> Optionality has deleted it from its vault. This is the
            only time it will be shown. Stash it in a Nostr client (0xchat, Damus, Amber) or a
            password manager.
          </div>
          <code style={{
            display: "block",
            padding: "10px 12px",
            background: "var(--bg-soft)",
            border: "1px solid var(--rust)",
            color: "var(--rust)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            wordBreak: "break-all",
            marginBottom: 8,
          }}>
            {withdrawn}
          </code>
          <div className="actions">
            <button
              className="btn"
              onClick={() => {
                void navigator.clipboard.writeText(withdrawn).catch(() => {});
              }}
            >
              Copy
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setWithdrawn(null)}
            >
              I've saved it
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="error" style={{ marginTop: 12 }}>{error}</div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: "var(--amber)",
        marginBottom: 6,
        marginTop: 6,
      }}
    >
      {children}
    </div>
  );
}
