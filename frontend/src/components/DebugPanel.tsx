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

// Auth and funding outcomes are situations, not faults. The service answered
// correctly; the patron has a step to take (sign in, top up). These SDK
// ErrorCode values render as a purple notice and stay out of the red count.
const NOTICE_CODE =
  /error_code\\?"\s*:\s*\\?"(npub_missing|proof_missing|proof_required|proof_refresh_needed|dpop_token_missing|oauth_not_yet_authorized|oauth_token_expired|upstream_auth_refresh_needed|insufficient_balance|authority_insufficient_balance|upstream_subscription_required|operator_llm_unfunded)\\?"/;

type Severity = "ok" | "notice" | "failure";

function severity(entry: DebugEntry): Severity {
  if (!isFailure(entry)) return "ok";
  return NOTICE_CODE.test(entry.message) ? "notice" : "failure";
}

const SEVERITY_STYLE: Record<Exclude<Severity, "ok">, { row: string; label: string; text: string; bold: boolean }> = {
  failure: { row: "rgba(69,10,10,0.6)", label: "#f87171", text: "#fca5a5", bold: true },
  notice: { row: "rgba(59,7,100,0.6)", label: "#d8b4fe", text: "#e9d5ff", bold: false },
};

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
  const errorCount = log.filter((e) => severity(e) === "failure").length;
  const noticeCount = log.filter((e) => severity(e) === "notice").length;

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
        <button
          onClick={() => setOpen(!open)}
          style={tab(errorCount > 0 ? "#b91c1c" : noticeCount > 0 ? "#7e22ce" : "#27272a")}
        >
          {open ? "Hide" : "Debug"} ({log.length}
          {errorCount > 0 ? ` · ${errorCount} err` : ""}
          {noticeCount > 0 ? ` · ${noticeCount} notice` : ""})
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
            const sev = severity(entry);
            const hl = sev === "ok" ? null : SEVERITY_STYLE[sev];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "2px 4px",
                  ...(hl ? { background: hl.row, borderRadius: 4 } : {}),
                }}
              >
                <span style={{ flexShrink: 0, color: "#52525b" }}>{entry.ts}</span>
                <span
                  style={{
                    width: 48,
                    flexShrink: 0,
                    fontWeight: hl?.bold ? 700 : 400,
                    color: hl?.label ?? TYPE_COLOR[entry.type],
                  }}
                >
                  {sev === "notice" ? "notice" : entry.type}
                  {sev === "failure" && entry.type !== "error" ? " !" : ""}
                </span>
                <span style={{ wordBreak: "break-all", color: hl?.text ?? "#d4d4d8" }}>
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
