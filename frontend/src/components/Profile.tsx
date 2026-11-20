// Profile page — the package's AccountPage in Optionality's panels.
//
// AccountPage (@tollbooth-dpyc/web) owns the folding groups every DPYC site
// shares. You: the patron's Nostr kind-0 (the single, self-sovereign source
// of identity), theme, time zone, the session key (renders nothing unless
// this browser holds one), then the identity intro and language. Money: the
// wallet. This site: the Game Persona Key (nsec escrow). About: the build.
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
import { AccountPage, LanguageChooser, Tx, Wallet } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";

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
  const t = useT();
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
      profile={{ onPublished: mirrorToLeaderboard }}
      usage={false}
      timezone={{
        heading: <PanelTitle label={t("profile.tz.label")}>{t("profile.tz.title")}</PanelTitle>,
        intro: t("profile.tz.intro"),
        classNames: { select: "tz-select" },
      }}
      theme={{
        heading: <PanelTitle label={t("profile.theme.label")}>{t("profile.theme.title")}</PanelTitle>,
        intro: t("profile.theme.intro"),
        themes: ["dark", "light"],
        labels: { dark: t("profile.theme.dark"), light: t("profile.theme.light") },
        classNames: { root: "theme-toggle", chip: "theme-chip", active: "active" },
      }}
      panels={{
        you: (
          <>
            <div className="panel account-identity">
              <span className="panel-label">{t("profile.label")}</span>
              <h2 className="serif">{t("profile.title")}</h2>
              <p className="account-intro">{t("profile.intro")}</p>
            </div>
            <div className="panel tb-host">
              <span className="panel-label">{t("profile.language.label")}</span>
              <h2 className="serif">{t("profile.language.title")}</h2>
              <p className="account-intro">{t("profile.language.intro")}</p>
              <LanguageChooser classNames={{ root: "theme-toggle", chip: "theme-chip", active: "active" }} />
            </div>
          </>
        ),
        money: <Wallet />,
        site: <GamePersonaKeyPanel escrowed={escrowed} onChange={setEscrowed} />,
      }}
      build={{
        heading: (
          <>
            <span className="panel-label">{t("profile.build.label")}</span>
            <h2 className="serif">{t("profile.build.title")}</h2>
          </>
        ),
        intro: (
          <Tx ns={WORDS} k="profile.build.intro" components={{ i: <i /> }} />
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
        group: "account-group",
        groupSummary: "account-group-title",
        groupBody: "account-grid",
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
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [depositInput, setDepositInput] = useState("");
  const [showAck, setShowAck] = useState(false);
  const [ackText, setAckText] = useState("");
  const [withdrawn, setWithdrawn] = useState<string | null>(null);

  async function handleDeposit(): Promise<void> {
    const nsec = depositInput.trim();
    if (!nsec.startsWith("nsec1")) {
      setError(t("profile.key.notNsec"));
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
        setError(r.error || t("profile.key.depositFailed"));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleWithdraw(): Promise<void> {
    if (ackText !== WITHDRAW_ACKNOWLEDGMENT) {
      setError(t("profile.key.ackMismatch"));
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
        setError(r.error || t("profile.key.withdrawFailed"));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <span className="panel-label">{t("profile.key.label")}</span>
      <h2 className="serif">{t("profile.key.title")}</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 16, lineHeight: 1.6 }}>
        <Tx ns={WORDS} k="profile.key.intro" components={{ b: <b /> }} />
      </p>

      {!escrowed && (
        <>
          <FieldLabel>{t("profile.key.deposit")}</FieldLabel>
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
              {busy ? t("profile.key.encrypting") : t("profile.key.depositBtn")}
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
            {t("profile.key.held")}
          </div>
          {!showAck && (
            <div className="actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setShowAck(true); setAckText(""); setError(""); }}
              >
                {t("profile.key.withdraw")}
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
                {t("profile.key.ackIntro")}
              </div>
              <FieldLabel>{t("profile.key.ack")}</FieldLabel>
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
                  {t("profile.key.cancel")}
                </button>
                <button
                  className="btn"
                  onClick={() => void handleWithdraw()}
                  disabled={ackText !== WITHDRAW_ACKNOWLEDGMENT || busy}
                  style={{ opacity: ackText !== WITHDRAW_ACKNOWLEDGMENT || busy ? 0.5 : 1 }}
                >
                  {busy ? t("profile.key.withdrawing") : t("profile.key.confirm")}
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
            <Tx ns={WORDS} k="profile.key.copyNow" components={{ b: <b /> }} />
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
              {t("profile.key.copy")}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setWithdrawn(null)}
            >
              {t("profile.key.saved")}
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
