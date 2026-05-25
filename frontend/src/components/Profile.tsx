// Profile page — patron edits their identity surface: alias, avatar,
// bio, theme, and preferred Nostr relays. All wheel-persisted fields
// (alias, avatar, bio, relays) round-trip through get_patron_profile +
// set_profile. Theme lives in localStorage via lib/theme so it applies
// instantly without a server round-trip.
//
// Designed to render in a single panel — no tabs-within-tabs. Fields
// are dirty-tracked locally and committed via a single "Save Changes"
// button so users can edit several fields and save them in one round
// trip.

import { useEffect, useState } from "react";
import {
  WITHDRAW_ACKNOWLEDGMENT,
  escrowNsec,
  getPatronProfile,
  setProfile,
  withdrawNsec,
} from "../lib/mcp";
import { useTheme, type Theme } from "../lib/theme";
import type { PatronProfile } from "../types";
import Avatar, { AVATAR_CHOICES, shortNpub } from "./Avatar";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

export default function ProfileTab({ npub }: { npub: string }) {
  const [theme, setTheme] = useTheme();
  const [profile, setProfileState] = useState<PatronProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Local-edit form state. Only committed to the server on Save.
  const [aliasInput, setAliasInput] = useState<string>("");
  const [avatarInput, setAvatarInput] = useState<string>("");
  const [bioInput, setBioInput] = useState<string>("");
  const [relayInputs, setRelayInputs] = useState<string[]>([]);
  const [newRelay, setNewRelay] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await getPatronProfile();
        if (r.profile) {
          setProfileState(r.profile);
          setAliasInput(r.profile.display_name ?? "");
          setAvatarInput(r.profile.avatar ?? "");
          setBioInput(r.profile.bio ?? "");
          setRelayInputs(r.profile.relays.length ? r.profile.relays : DEFAULT_RELAYS);
        } else {
          setError(r.error ?? "Couldn't load profile.");
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty =
    profile === null
      ? false
      : aliasInput !== (profile.display_name ?? "") ||
        avatarInput !== (profile.avatar ?? "") ||
        bioInput !== (profile.bio ?? "") ||
        JSON.stringify(relayInputs) !== JSON.stringify(profile.relays);

  async function handleSave(): Promise<void> {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const patch: {
        display_name?: string;
        avatar?: string;
        bio?: string;
        relays?: string[];
      } = {};
      if (aliasInput !== (profile.display_name ?? "")) patch.display_name = aliasInput;
      if (avatarInput !== (profile.avatar ?? "")) patch.avatar = avatarInput;
      if (bioInput !== (profile.bio ?? "")) patch.bio = bioInput;
      if (JSON.stringify(relayInputs) !== JSON.stringify(profile.relays)) {
        patch.relays = relayInputs;
      }
      const r = await setProfile(patch);
      if (r.profile) {
        setProfileState(r.profile);
        // Reconcile inputs with the canonical server values (e.g. the
        // server may strip whitespace from the alias).
        setAliasInput(r.profile.display_name ?? "");
        setAvatarInput(r.profile.avatar ?? "");
        setBioInput(r.profile.bio ?? "");
        setRelayInputs(r.profile.relays);
        setSavedAt(Date.now());
      }
      if (r.errors && Object.keys(r.errors).length > 0) {
        const msg = Object.entries(r.errors).map(([k, v]) => `${k}: ${v}`).join("; ");
        setError(msg);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleAddRelay(): void {
    const trimmed = newRelay.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("wss://") && !trimmed.startsWith("ws://")) {
      setError("Relay URL must start with wss:// or ws://");
      return;
    }
    if (relayInputs.includes(trimmed)) {
      setError("Relay already in your list.");
      return;
    }
    setRelayInputs((prev) => [...prev, trimmed]);
    setNewRelay("");
    setError("");
  }

  function handleRemoveRelay(url: string): void {
    setRelayInputs((prev) => prev.filter((r) => r !== url));
  }

  if (loading) {
    return (
      <div className="panel">
        <span className="panel-label">Profile</span>
        <div className="loading" style={{ display: "block", padding: "20px 0" }}>
          Loading your profile…
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="panel">
        <span className="panel-label">Profile</span>
        <h2 className="serif">Your identity at Optionality.</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 12, marginTop: 6, marginBottom: 18 }}>
          What other patrons see on the leaderboard — and what the soon-arriving
          patron-to-patron Nostr DMs will use to address you.
        </p>

        {/* Preview card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          background: "var(--bg-soft)",
          border: "1px solid var(--panel-edge)",
          padding: "14px 16px",
          marginBottom: 22,
        }}>
          <Avatar value={avatarInput} size={48} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: "var(--amber-bright)" }}>
              {aliasInput || "Anonymous"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "JetBrains Mono, monospace" }}>
              {shortNpub(npub)}
            </div>
            {bioInput && (
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>
                {bioInput}
              </div>
            )}
          </div>
        </div>

        <FieldLabel>Alias</FieldLabel>
        <input
          type="text"
          maxLength={32}
          value={aliasInput}
          onChange={(e) => setAliasInput(e.target.value)}
          placeholder="how the leaderboard names you"
          style={INPUT_STYLE}
        />

        <FieldLabel>Avatar</FieldLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {AVATAR_CHOICES.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setAvatarInput(emoji)}
              style={{
                background: avatarInput === emoji ? "var(--amber-glow)" : "transparent",
                border: `1px solid ${avatarInput === emoji ? "var(--amber)" : "var(--panel-edge)"}`,
                borderRadius: 6,
                width: 40,
                height: 40,
                fontSize: 22,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        <FieldLabel>Bio</FieldLabel>
        <textarea
          maxLength={500}
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
          placeholder="one paragraph — strategy, signature trade, why you trade. (optional)"
          style={{ ...INPUT_STYLE, minHeight: 90, fontFamily: "JetBrains Mono, monospace" }}
        />
        <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: -8, marginBottom: 16, textAlign: "right" }}>
          {bioInput.length} / 500
        </div>

        <FieldLabel>Theme</FieldLabel>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {(["dark", "light"] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              style={{
                flex: 1,
                background: theme === t ? "var(--amber-glow)" : "transparent",
                border: `1px solid ${theme === t ? "var(--amber)" : "var(--panel-edge)"}`,
                color: theme === t ? "var(--amber-bright)" : "var(--ink-soft)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                padding: "10px 14px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {t === "dark" ? "🌑 Dark" : "☀ Light"}
            </button>
          ))}
        </div>

        <FieldLabel>Nostr Relays</FieldLabel>
        <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: -4, marginBottom: 8, fontStyle: "italic" }}>
          Your preferred relays for the upcoming patron-to-patron DM feature.
          Up to 12. The defaults below work for most patrons.
        </p>
        <div style={{ marginBottom: 8 }}>
          {relayInputs.map((url) => (
            <div
              key={url}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "var(--bg-soft)",
                border: "1px solid var(--panel-edge)",
                marginBottom: 4,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, color: "var(--ink-soft)", wordBreak: "break-all" }}>{url}</span>
              <button
                type="button"
                onClick={() => handleRemoveRelay(url)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ink-faint)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                title="Remove this relay"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <input
            type="text"
            value={newRelay}
            onChange={(e) => setNewRelay(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRelay(); } }}
            placeholder="wss://relay.example.com"
            style={{ ...INPUT_STYLE, marginBottom: 0, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleAddRelay}
            disabled={!newRelay.trim()}
            style={{
              background: "transparent",
              border: "1px solid var(--amber)",
              color: "var(--amber-bright)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              padding: "8px 14px",
              cursor: newRelay.trim() ? "pointer" : "not-allowed",
              opacity: newRelay.trim() ? 1 : 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Add
          </button>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: 12 }}>{error}</div>
        )}
        {savedAt && !dirty && (
          <div style={{ color: "var(--jade)", fontSize: 12, marginBottom: 12, letterSpacing: "0.1em" }}>
            ✓ Saved {new Date(savedAt).toLocaleTimeString()}
          </div>
        )}

        <div className="actions">
          <button
            className="btn"
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
            style={{ opacity: dirty && !saving ? 1 : 0.5 }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <GamePersonaKeyPanel
        escrowed={profile?.escrowed ?? false}
        onChange={(next) => {
          if (!profile) return;
          setProfileState({ ...profile, escrowed: next });
        }}
      />
    </>
  );
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

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-soft)",
  border: "1px solid var(--panel-edge)",
  color: "var(--ivory-bright)",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 13,
  padding: "10px 12px",
  marginBottom: 16,
};

function FieldLabel({ children }: { children: React.ReactNode }) {
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
