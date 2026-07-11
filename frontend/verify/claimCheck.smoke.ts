// Smoke test for claim-check terminal resolution. Guards the contract that a
// slow-tool START response can be terminal on arrival — a deterministic replay
// or a degenerate-input nudge returns `done` with NO claim check, and a
// pre-flight rejection returns `error` — so the poller must short-circuit
// instead of throwing "no claim check returned". Run via `npm run verify`.
import { claimTerminalOutcome } from "../src/lib/claimCheck";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}`, detail ?? ""); }
}
function throws(name: string, fn: () => unknown, mustInclude?: string) {
  try {
    fn();
    failures++;
    console.log(`  FAIL ${name} (did not throw)`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (mustInclude && !msg.includes(mustInclude)) {
      failures++;
      console.log(`  FAIL ${name} (message lacked ${JSON.stringify(mustInclude)})`, msg);
    } else {
      console.log(`  ok   ${name}`);
    }
  }
}

// Synchronous done (replay / degenerate-input nudge) → return the result.
const done = claimTerminalOutcome<{ entry_id: string }>({
  status: "done",
  result: { entry_id: "replay-1" },
});
check("done → value", done !== "pending" && done.value.entry_id === "replay-1", done);

// Running (or no status yet) → keep polling.
check("running → pending", claimTerminalOutcome({ status: "running" }) === "pending");
check("no status → pending", claimTerminalOutcome({}) === "pending");
// done WITHOUT a result is not terminal (guards a half-written row).
check("done-without-result → pending", claimTerminalOutcome({ status: "done" }) === "pending");

// Error → throw the curated situation, joining message + next steps.
throws(
  "error → throws message + next_steps",
  () => claimTerminalOutcome({ status: "error", error: "AI provider is unfunded.", next_steps: "Try again later." }),
  "Try again later.",
);
throws(
  "error without message → throws refunded default",
  () => claimTerminalOutcome({ status: "error" }),
  "refunded",
);

// Expired → throw the retry hint.
throws(
  "expired → throws",
  () => claimTerminalOutcome({ status: "expired", next_steps: "Start a new request." }),
  "Start a new request.",
);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
