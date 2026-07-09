// On-screen MCP activity log — a fixed bottom bar that shows every MCP
// call/result/error so a patron (or the operator) can see what the FE is
// actually doing. Invaluable for "the deal just spins and then the page
// reloads" — the claim-check start, each fetch poll, and the terminal
// status/refund all land here. Self-contained inline styles so it matches the
// dark Pit theme without depending on the global stylesheet.

import { useState, type CSSProperties } from "react";
import { clearDebug, useDebugLog, type DebugEntry } from "../lib/debugLog";

const TYPE_COLOR: Record<DebugEntry["type"], string> = {
  info: "#38bdf8",
  call: "#fbbf24",
  result: "#4ade80",
  error: "#f87171",
};

function isFailure(entry: DebugEntry): boolean {
  if (entry.type === "error") return true;
  if (entry.type === "result") {
    const m = entry.message;
    return m.includes('"success":false') || m.includes('"error"') || m.includes("error_code");
  }
  return false;
}

function tab(bg: string): CSSProperties {
  return {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    background: bg,
    padding: "4px 12px",
    fontSize: 12,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export default function DebugPanel() {
  const log = useDebugLog();
  const [open, setOpen] = useState(false);
  const errorCount = log.filter(isFailure).length;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none", // let the page beneath stay clickable
      }}
    >
      <div style={{ display: "flex", gap: 4, paddingRight: 12, pointerEvents: "auto" }}>
        {open && (
          <button onClick={clearDebug} style={tab("#3f3f46")}>
            Clear
          </button>
        )}
        <button onClick={() => setOpen(!open)} style={tab(errorCount > 0 ? "#b91c1c" : "#27272a")}>
          {open ? "Hide" : "Debug"} ({log.length}
          {errorCount > 0 ? ` · ${errorCount} err` : ""})
        </button>
      </div>
      {open && (
        <div
          style={{
            pointerEvents: "auto",
            maxHeight: 256,
            width: "100%",
            overflowY: "auto",
            borderTop: "1px solid #3f3f46",
            background: "rgba(9,9,11,0.96)",
            padding: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            backdropFilter: "blur(4px)",
          }}
        >
          {log.length === 0 && <div style={{ color: "#71717a" }}>No MCP activity yet.</div>}
          {log.map((entry, i) => {
            const failed = isFailure(entry);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "2px 4px",
                  ...(failed ? { background: "rgba(69,10,10,0.6)", borderRadius: 4 } : {}),
                }}
              >
                <span style={{ flexShrink: 0, color: "#52525b" }}>{entry.ts}</span>
                <span
                  style={{
                    width: 48,
                    flexShrink: 0,
                    fontWeight: failed ? 700 : 400,
                    color: failed ? "#f87171" : TYPE_COLOR[entry.type],
                  }}
                >
                  {entry.type}
                  {failed && entry.type !== "error" ? " !" : ""}
                </span>
                <span style={{ wordBreak: "break-all", color: failed ? "#fca5a5" : "#d4d4d8" }}>
                  {entry.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
