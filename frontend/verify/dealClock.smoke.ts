// Smoke test for the deal-wait status card's pure clock/ETA logic and the
// per-npub pending-deal key. The card promises a walk-away-safe wait; these lock
// the honest bits: mm:ss formatting, a countdown that never goes negative
// (says "wrapping up…" past the estimate), and a pending-claim key that is
// npub-scoped so a resumed deal can't leak across identities. Run via
// `npm run verify`.
import { etaLabel, fmtClock } from "../src/lib/dealClock";
import { PENDING_KEY_PREFIX, pendingDealKey } from "../src/lib/sessionKey";

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

// pending-deal key scoping
const A = "npub1aaaa";
const B = "npub1bbbb";
check("pending key is prefixed with the npub", pendingDealKey(A) === PENDING_KEY_PREFIX + A);
check("different npubs → different pending keys", pendingDealKey(A) !== pendingDealKey(B));
check("empty npub falls back to _guest", pendingDealKey("") === PENDING_KEY_PREFIX + "_guest");
check(
  "pending key is distinct from the session key namespace",
  PENDING_KEY_PREFIX !== "optionality:session:v1:",
);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
