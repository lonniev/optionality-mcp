// Avatar chooser — paginated catalog of SVG emoji avatars served from
// the Iconify REST API, plus the legacy emoji-glyph palette and a
// custom-URL fallback.
//
// Iconify (api.iconify.design) is a free public REST endpoint that
// indexes hundreds of icon collections including high-quality emoji
// sets (Microsoft Fluent, Twemoji, Google Noto, OpenMoji). For each
// chosen collection we fetch the name list once via /collection,
// then paginate through it 24-at-a-time. The SVGs themselves are
// fetched on-demand by the browser as each <img> tile mounts —
// lazy-loaded, cached, never bundled in our FE.
//
// The patron's profile stores only the ONE SVG URL they picked.
// Nothing else from the catalog persists on our side.
//
// Avatar.tsx auto-detects URL-shaped values so existing emoji-glyph
// avatars from the previous picker continue to render unchanged.

import { useEffect, useState } from "react";

import Avatar, { AVATAR_CHOICES } from "./Avatar";

interface AvatarPickerProps {
  /// Currently-selected avatar value (Iconify URL, emoji glyph, or custom URL).
  value: string;
  /// Called when the user picks any option.
  onChange: (next: string) => void;
  /// The patron's npub. Unused now — kept for prop compatibility with
  /// callers that pass it. Future privacy-aware modes might want it.
  npub?: string;
}

interface IconifyCollection {
  prefix: string;
  label: string;
  blurb: string;
}

/// Curated short list of emoji collections that work well as avatars.
/// All are free, MIT/CC-licensed, and indexed by Iconify.
const COLLECTIONS: ReadonlyArray<IconifyCollection> = [
  { prefix: "fluent-emoji-flat", label: "Fluent", blurb: "Microsoft Fluent, flat style" },
  { prefix: "twemoji", label: "Twemoji", blurb: "Twitter's emoji set" },
  { prefix: "noto", label: "Noto", blurb: "Google's expressive emojis" },
  { prefix: "openmoji", label: "OpenMoji", blurb: "Community-designed, CC-BY-SA" },
  { prefix: "emojione-v1", label: "EmojiOne", blurb: "Classic web-emoji style" },
];

const PAGE_SIZE = 24;

function iconifySvgUrl(prefix: string, name: string): string {
  return `https://api.iconify.design/${prefix}/${name}.svg`;
}

export default function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [tab, setTab] = useState<"catalog" | "emoji">("catalog");
  const [collection, setCollection] = useState<string>(COLLECTIONS[0].prefix);
  const [iconNames, setIconNames] = useState<string[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch the full icon-name list for the selected collection. Cheap
  // JSON (~50-200KB per collection). One fetch per collection-switch,
  // browser caches subsequent visits.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setIconNames([]);
    setPage(0);

    void fetch(`https://api.iconify.design/collection?prefix=${collection}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Iconify returned ${r.status}`);
        return r.json();
      })
      .then((data: { uncategorized?: string[]; categories?: Record<string, string[]> }) => {
        if (!alive) return;
        // Iconify returns icon names grouped under "categories" plus a
        // possible "uncategorized" bucket. Flatten everything in display
        // order so paging is stable.
        const names: string[] = [];
        if (data.categories) {
          for (const cat of Object.keys(data.categories)) {
            for (const name of data.categories[cat]) names.push(name);
          }
        }
        if (data.uncategorized) {
          for (const name of data.uncategorized) names.push(name);
        }
        setIconNames(names);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError((e as Error).message);
        setLoading(false);
      });

    return () => { alive = false; };
  }, [collection]);

  const totalPages = Math.max(1, Math.ceil(iconNames.length / PAGE_SIZE));
  const visibleIcons = iconNames.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--panel-edge)" }}>
        <button
          type="button"
          onClick={() => setTab("catalog")}
          style={tabStyle(tab === "catalog")}
        >
          Catalog
        </button>
        <button
          type="button"
          onClick={() => setTab("emoji")}
          style={tabStyle(tab === "emoji")}
        >
          Glyphs
        </button>
      </div>

      {tab === "catalog" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
              Style:
            </label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              style={{
                background: "var(--bg-soft)",
                border: "1px solid var(--panel-edge)",
                color: "var(--ink)",
                padding: "4px 8px",
                fontSize: 12,
              }}
            >
              {COLLECTIONS.map((c) => (
                <option key={c.prefix} value={c.prefix}>{c.label} — {c.blurb}</option>
              ))}
            </select>
            {!loading && !error && iconNames.length > 0 && (
              <span style={{ fontSize: 11, color: "var(--ink-faint)", marginLeft: "auto" }}>
                {iconNames.length.toLocaleString()} icons · page {page + 1} of {totalPages}
              </span>
            )}
          </div>

          {loading && (
            <div className="loading" style={{ display: "block", padding: "20px 0" }}>Loading catalog</div>
          )}

          {error && (
            <div className="error" style={{ marginBottom: 12 }}>
              Couldn't reach Iconify: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 8 }}>
                {visibleIcons.map((name) => {
                  const url = iconifySvgUrl(collection, name);
                  const selected = value === url;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onChange(url)}
                      title={name.replace(/-/g, " ")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        padding: 6,
                        background: selected ? "var(--amber-glow)" : "var(--bg-soft)",
                        border: `1px solid ${selected ? "var(--amber)" : "var(--panel-edge)"}`,
                        cursor: "pointer",
                        transition: "border-color 120ms ease, background 120ms ease",
                      }}
                    >
                      <img
                        src={url}
                        alt={name}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                      />
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 11, opacity: page === 0 ? 0.4 : 1 }}
                >
                  ← Previous
                </button>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--ink-soft)" }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 11, opacity: page >= totalPages - 1 ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </>
      )}

      {tab === "emoji" && (
        <>
          <div style={{ color: "var(--ink-faint)", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>
            Pick a single glyph — minimalist alternative to the catalog.
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

      {/* Live preview of the currently-selected avatar */}
      {value && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar value={value} size={56} />
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            Currently selected. Tap Save below to apply.
          </div>
        </div>
      )}
    </div>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid var(--amber)" : "2px solid transparent",
    color: active ? "var(--amber-bright)" : "var(--ink-soft)",
    cursor: "pointer",
    fontSize: 12,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  };
}
