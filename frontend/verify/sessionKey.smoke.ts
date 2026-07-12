// Smoke test for per-npub Pit session scoping. Guards the fix for a scenario
// leaking across identities: the active-session localStorage key must be
// namespaced by npub (distinct per patron, guest fallback) and must differ from
// the pre-scoping global key that caused the leak. Run via `npm run verify`.
import {
  LEGACY_SESSION_KEY,
  SESSION_KEY_PREFIX,
  sessionKey,
} from "../src/lib/sessionKey";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}`, detail ?? ""); }
}

const A = "npub1aaaa";
const B = "npub1bbbb";

check("key is prefixed with the npub", sessionKey(A) === SESSION_KEY_PREFIX + A);
check("different npubs → different keys", sessionKey(A) !== sessionKey(B));
check("empty npub falls back to _guest", sessionKey("") === SESSION_KEY_PREFIX + "_guest");
check(
  "scoped key never equals the legacy global key (the leak source)",
  sessionKey(A) !== LEGACY_SESSION_KEY &&
    sessionKey("") !== LEGACY_SESSION_KEY,
);
check(
  "legacy key is the bare pre-scoping value",
  LEGACY_SESSION_KEY === "optionality:session:v1" &&
    SESSION_KEY_PREFIX.startsWith(LEGACY_SESSION_KEY),
);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
