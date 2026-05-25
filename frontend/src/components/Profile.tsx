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
import { getPatronProfile, setProfile } from "../lib/mcp";
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
    </>
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
