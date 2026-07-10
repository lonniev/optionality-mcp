// Nostr profile (kind-0) panel — the self-sovereign home for the patron's
// avatar + contact info, discovered FROM Nostr. Reads the latest kind-0 via the
// operator MCP (the wheel does the relay I/O); edits publish a new CLIENT-signed
// kind-0 (session nsec or NIP-07) that's visible in every Nostr client. Distinct
// from the app-local "identity at Optionality" panel above it — that's the
// leaderboard alias/avatar/bio in Optionality's own DB; this is the patron's
// canonical Nostr metadata.

import React, { useEffect, useState } from "react";
import Avatar, { isAvatarUrl } from "./Avatar";
import AvatarModal from "./AvatarModal";
import { setProfile } from "../lib/mcp";
import { canSignProfile, fetchProfile, publishProfile, type Kind0 } from "../lib/nostrProfile";

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
    <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 6, marginTop: 6 }}>
      {children}
    </div>
  );
}

export default function NostrProfilePanel({ npub }: { npub: string }) {
  const [picture, setPicture] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("");
  const [nip05, setNip05] = useState("");
  const [lud16, setLud16] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const signer = canSignProfile();

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetchProfile(npub)
      .then((p: Kind0 | null) => {
        if (!live || !p) return;
        setPicture(p.picture ?? "");
        setDisplayName(p.display_name || p.name || "");
        setAbout(p.about ?? "");
        setNip05(p.nip05 ?? "");
        setLud16(p.lud16 ?? "");
        setWebsite(p.website ?? "");
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [npub]);

  async function publish() {
    setPublishing(true);
    setMsg(null);
    const emojiAvatar = picture && !isAvatarUrl(picture);
    const content: Kind0 = {
      name: displayName,
      display_name: displayName,
      about,
      nip05,
      lud16,
      website,
      // kind-0 picture is a URL; an emoji glyph stays Optionality-local.
      picture: emojiAvatar ? "" : picture,
    };
    try {
      const r = await publishProfile(content);
      const note = emojiAvatar ? " (Emoji avatar kept local — a Nostr picture must be a URL.)" : "";
      if (r.error) {
        setMsg({ tone: "err", text: r.error });
      } else {
        const ok = r.ok ?? 0;
        setMsg({
          tone: ok > 0 ? "ok" : "err",
          text: (ok > 0 ? `Published to ${ok}/${r.total} relays.` : "No relay accepted the event.") + note,
        });
        if (ok > 0) {
          // Mirror the just-published identity into Optionality's store so the
          // leaderboard + DM addressing render this name/avatar without a live
          // relay fetch per row. Nostr is the source of truth; the DB is a
          // derived cache. A glyph avatar (kept out of kind-0 because a picture
          // must be a URL) still mirrors here so the leaderboard shows it.
          void setProfile({
            display_name: displayName,
            avatar: picture,
            bio: about,
          }).catch(() => { /* cache mirror is best-effort, never blocks publish */ });
        }
      }
    } catch (e) {
      setMsg({ tone: "err", text: (e as Error).message });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <span className="panel-label">Profile</span>
      <h2 className="serif">Your self-sovereign identity.</h2>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: -4, marginBottom: 16, lineHeight: 1.5 }}>
        Your profile lives in your Nostr kind-0 metadata — read from relays and shown in every Nostr
        client. Edits are signed in your browser and relayed; your key never leaves this device.
        Optionality mirrors your name and avatar so the leaderboard can address you.
      </p>

      {loading ? (
        <div className="loading" style={{ display: "block", padding: "16px 0" }}>Reading from relays…</div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <Avatar value={picture} size={48} />
            <button type="button" className="btn btn-ghost" onClick={() => setShowPicker(true)}>
              Change avatar
            </button>
          </div>
          {showPicker && (
            <AvatarModal
              value={picture}
              onChange={setPicture}
              onClose={() => setShowPicker(false)}
              npub={npub}
            />
          )}

          <FieldLabel>Display name</FieldLabel>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Satoshi" style={INPUT_STYLE} />

          <FieldLabel>Lightning address (lud16)</FieldLabel>
          <input value={lud16} onChange={(e) => setLud16(e.target.value)} placeholder="you@walletofsatoshi.com" style={INPUT_STYLE} />

          <FieldLabel>NIP-05</FieldLabel>
          <input value={nip05} onChange={(e) => setNip05(e.target.value)} placeholder="name@domain.com" style={INPUT_STYLE} />

          <FieldLabel>Website</FieldLabel>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" style={INPUT_STYLE} />

          <FieldLabel>About</FieldLabel>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={2} placeholder="A short bio…" style={{ ...INPUT_STYLE, minHeight: 72, resize: "none" }} />

          {msg && (
            <div className={msg.tone === "ok" ? "success" : "error"} style={{ marginBottom: 12 }}>
              {msg.text}
            </div>
          )}

          <div className="actions" style={{ alignItems: "center" }}>
            <button
              type="button"
              className="btn"
              onClick={publish}
              disabled={publishing || !signer}
              title={signer ? "Sign and publish your kind-0 to relays" : "Needs a session-key login or a NIP-07 extension"}
            >
              {publishing ? "Publishing…" : "Publish to Nostr"}
            </button>
            {!signer && (
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }} title="Sign in with a session key or a NIP-07 extension to publish.">
                Read-only — sign in with a key to publish.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
