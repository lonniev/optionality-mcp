// Avatar renderer — a single emoji-or-glyph in a bordered circle.
// Used everywhere we render a patron identity: leaderboard rows,
// (future) DM modal sender chip, the Profile preview, and the header
// brand spot.
//
// Picked emoji over an SVG icon set so users get a wide expressive
// palette without an asset pipeline. The Profile picker exposes a
// curated subset (trader/animal/symbol motifs) that read well at the
// sizes the leaderboard uses, but any single-glyph string the wheel
// stores will render — operators who want to roll their own picker
// later can swap AVATAR_CHOICES without breaking persisted data.

import { type CSSProperties } from "react";

export const AVATAR_CHOICES: string[] = [
  "🐂", "🐻", "🦂", "🦅", "🐺", "🦉",
  "🦊", "🐉", "🦄", "🐢", "🦈", "🦀",
  "🎩", "🎭", "🃏", "🎯", "🪙", "💎",
  "⚡", "🔥", "🌪️", "🌊", "🏔️", "🌋",
  "♟️", "♛", "🛡️", "⚔️", "🗝️", "📜",
];

interface Props {
  /// Emoji glyph or fallback initial. Empty / null renders a default
  /// silhouette glyph so the slot stays sized and clickable.
  value?: string | null;
  /// Size in pixels — height and width of the bordered circle.
  size?: number;
  /// onClick lets parent attach navigation / DM-send behavior. The
  /// component itself is content-only.
  onClick?: () => void;
  /// Title attribute for hover hints (e.g. "DM @<display_name>").
  title?: string;
  style?: CSSProperties;
}

/// Distinguish a URL (DiceBear, hosted image, or data: URI) from a
/// glyph (emoji / single character). URL-shaped avatars render as an
/// <img> filling the circle; everything else renders as text centered
/// in the circle, preserving the original emoji-picker behavior.
export function isAvatarUrl(value: string): boolean {
  return /^(https?:\/\/|data:image\/)/i.test(value);
}

export default function Avatar({ value, size = 40, onClick, title, style }: Props) {
  const raw = value && value.trim() ? value : "🃏";
  const urlMode = isAvatarUrl(raw);
  const fontSize = Math.round(size * 0.55);
  const clickable = !!onClick;
  return (
    <span
      onClick={onClick}
      title={title}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        background: "var(--bg-soft)",
        border: "1px solid var(--panel-edge)",
        color: "var(--amber-bright)",
        fontSize,
        lineHeight: 1,
        cursor: clickable ? "pointer" : "default",
        userSelect: "none",
        overflow: "hidden",
        transition: "border-color 120ms ease, transform 120ms ease",
        ...style,
      }}
      onMouseEnter={
        clickable
          ? (e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--amber)"; }
          : undefined
      }
      onMouseLeave={
        clickable
          ? (e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--panel-edge)"; }
          : undefined
      }
    >
      {urlMode ? (
        <img
          src={raw}
          alt=""
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        raw
      )}
    </span>
  );
}

/// Format an npub for compact display. Keeps the first 8 chars (bech32
/// prefix + a few signal chars) and the last 4 — enough to disambiguate
/// at a glance without dominating the row. Anything not bech32-shaped
/// passes through unchanged.
export function shortNpub(npub: string | null | undefined): string {
  if (!npub) return "";
  if (npub.length <= 16) return npub;
  return `${npub.slice(0, 8)}…${npub.slice(-4)}`;
}
