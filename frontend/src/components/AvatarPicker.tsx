// Avatar chooser — DiceBear styles (deterministic per-npub) plus the
// legacy emoji-glyph palette as a secondary section.
//
// DiceBear (api.dicebear.com) serves free open-source SVG avatars by
// style + seed. Using the patron's npub as the seed makes each
// patron's avatar within a style stable across devices and sessions —
// no upload, no storage on our side, no moderation surface. The
// avatar VALUE stored in the patron profile is just the SVG URL.
//
// Existing emoji-glyph avatars from the prior picker keep working:
// Avatar.tsx auto-detects URL vs glyph and renders accordingly. The
// emoji grid remains here as a minimalist alternative.

import { useState } from "react";

import Avatar, { AVATAR_CHOICES } from "./Avatar";

interface AvatarPickerProps {
  /// Currently-selected avatar value (DiceBear URL or emoji glyph).
  value: string;
  /// Called when the user picks any option.
  onChange: (next: string) => void;
  /// The patron's npub — used as the deterministic seed for DiceBear
  /// styles so the same patron gets a stable avatar per style.
  npub: string;
}

/// Curated DiceBear styles. Each renders well at 32-80px and reads as
/// a distinct aesthetic. Full catalog at dicebear.com/styles.
const DICEBEAR_STYLES: ReadonlyArray<{ id: string; label: string; blurb: string }> = [
  { id: "personas", label: "Personas", blurb: "Clean illustrated portraits" },
  { id: "lorelei", label: "Lorelei", blurb: "Minimal faces, friendly" },
  { id: "notionists", label: "Sketch", blurb: "Notion-style hand drawn" },
  { id: "open-peeps", label: "Peeps", blurb: "Playful character art" },
  { id: "bottts", label: "Bots", blurb: "Robot faces — AI flavor" },
  { id: "pixel-art", label: "Pixel", blurb: "8-bit retro" },
  { id: "shapes", label: "Shapes", blurb: "Abstract geometry" },
  { id: "fun-emoji", label: "Fun", blurb: "Emoji-style faces" },
];

function dicebearUrl(style: string, seed: string): string {
  // SVG endpoint is free, no API key, no rate limit we hit in practice.
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

export default function AvatarPicker({ value, onChange, npub }: AvatarPickerProps) {
  const seed = npub || "anonymous";
  const [tab, setTab] = useState<"style" | "emoji">("style");

  // Each DiceBear style produces one URL for THIS patron's npub.
  // Selection is per-style — pick the style, the URL becomes the
  // avatar value. The npub-seeded URL is identity-stable across sessions.
  const styleOptions = DICEBEAR_STYLES.map((s) => ({
    ...s,
    url: dicebearUrl(s.id, seed),
  }));

  return (
    <div>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--panel-edge)" }}>
        <button
          type="button"
          onClick={() => setTab("style")}
          style={{
            padding: "6px 14px",
            background: "transparent",
            border: "none",
            borderBottom: tab === "style" ? "2px solid var(--amber)" : "2px solid transparent",
            color: tab === "style" ? "var(--amber-bright)" : "var(--ink-soft)",
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Generated
        </button>
        <button
          type="button"
          onClick={() => setTab("emoji")}
          style={{
            padding: "6px 14px",
            background: "transparent",
            border: "none",
            borderBottom: tab === "emoji" ? "2px solid var(--amber)" : "2px solid transparent",
            color: tab === "emoji" ? "var(--amber-bright)" : "var(--ink-soft)",
            cursor: "pointer",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          Emoji
        </button>
      </div>

      {tab === "style" && (
        <>
          <div style={{ color: "var(--ink-faint)", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>
            Each style is deterministically generated from your npub — pick a look you like; the avatar stays the same wherever you appear.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
            {styleOptions.map((opt) => {
              const selected = value === opt.url;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange(opt.url)}
                  title={opt.blurb}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: 10,
                    background: selected ? "var(--amber-glow)" : "var(--bg-soft)",
                    border: `1px solid ${selected ? "var(--amber)" : "var(--panel-edge)"}`,
                    cursor: "pointer",
                    transition: "border-color 120ms ease, background 120ms ease",
                  }}
                >
                  <Avatar value={opt.url} size={56} />
                  <span style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: selected ? "var(--amber-bright)" : "var(--ink-soft)",
                  }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {tab === "emoji" && (
        <>
          <div style={{ color: "var(--ink-faint)", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>
            Pick a single glyph — minimalist alternative to a generated avatar.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))", gap: 6 }}>
            {AVATAR_CHOICES.map((emoji) => {
              const selected = value === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onChange(emoji)}
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 24,
                    background: selected ? "var(--amber-glow)" : "transparent",
                    border: `1px solid ${selected ? "var(--amber)" : "var(--panel-edge)"}`,
                    cursor: "pointer",
                    transition: "border-color 120ms ease, background 120ms ease",
                  }}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Raw URL / glyph entry for power users */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-faint)", cursor: "pointer" }}>
          Custom (paste any image URL or glyph)
        </summary>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or a single emoji"
          style={{
            width: "100%",
            marginTop: 8,
            padding: "8px 10px",
            background: "var(--bg-soft)",
            border: "1px solid var(--panel-edge)",
            color: "var(--ink)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
          }}
        />
      </details>
    </div>
  );
}
