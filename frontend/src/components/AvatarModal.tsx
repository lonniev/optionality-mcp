// Avatar chooser modal — the catalog is heavy, so it stays out of sight until
// the patron is actually picking. "Change avatar" opens this popup frame; the
// pick flows straight into the caller's state (reflected in its preview) and
// closing applies it. Persisting (Save Changes / Publish to Nostr) stays the
// caller's own explicit action, unchanged. Modal shell mirrors TopOffModal.

import React, { useEffect } from "react";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";

interface Props {
  /// Currently-selected avatar value (Iconify URL, emoji glyph, or custom URL).
  value: string;
  /// Fired on every pick — the caller updates its own draft state.
  onChange: (next: string) => void;
  /// Close the popup (Escape, backdrop click, ×, or Done).
  onClose: () => void;
  /// The patron's npub (forwarded to the picker for prop compatibility).
  npub?: string;
}

export default function AvatarModal({ value, onChange, onClose, npub }: Props) {
  // Escape closes — the conventional modal affordance.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      style={STYLES.scrim}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose your avatar"
    >
      <div style={STYLES.card} onClick={(e) => e.stopPropagation()}>
        <div style={STYLES.head}>
          <span>Choose your avatar</span>
          <button type="button" onClick={onClose} style={STYLES.close} title="Close" aria-label="Close">
            ×
          </button>
        </div>

        <AvatarPicker value={value} onChange={onChange} npub={npub} />

        <div style={STYLES.footer}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Avatar value={value} size={44} />
            <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>
              {value ? "Selected — close to apply." : "Nothing selected yet."}
            </span>
          </div>
          <button type="button" className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const STYLES: Record<string, React.CSSProperties> = {
  scrim: {
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
  card: {
    background: "var(--panel)",
    border: "1px solid var(--amber)",
    boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
    padding: "24px 26px",
    width: "100%",
    maxWidth: 560,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 22,
    color: "var(--amber-bright)",
    marginBottom: 18,
  },
  close: {
    background: "transparent",
    border: "none",
    color: "var(--ink-faint)",
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
    padding: "0 4px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid var(--panel-edge)",
  },
};
