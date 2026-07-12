// Smoke test for the deal-wait status card's pure clock/ETA logic. The card
// promises a walk-away-safe wait; these lock the honest bits: mm:ss formatting
// and a countdown that never goes negative (says "wrapping up…" past the
// estimate). Run via `npm run verify`.
import { etaLabel, fmtClock } from "../src/lib/dealClock";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}`, detail ?? ""); }
}

// fmtClock
check("0s → 0:00", fmtClock(0) === "0:00");
check("5s → 0:05 (zero-padded)", fmtClock(5) === "0:05");
check("65s → 1:05", fmtClock(65) === "1:05");
check("125.9s floors to 2:05", fmtClock(125.9) === "2:05");
check("negative clamps to 0:00", fmtClock(-9) === "0:00");

// etaLabel
check("no estimate → empty label", etaLabel(10, 0) === "");
check("mid-wait shows remaining", etaLabel(40, 240) === "~3:20 left");
check(
  "past the estimate says wrapping up, never negative",
  etaLabel(300, 240) === "wrapping up…",
);
check(
  "at the estimate says wrapping up (not 0:00 left)",
  etaLabel(240, 240) === "wrapping up…",
);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
