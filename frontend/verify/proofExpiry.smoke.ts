// Smoke test for the proof-expiry predicate. Guards the recurring
// case-sensitivity regression (UPPERCASE compare vs the wheel's lowercase
// ErrorCode) that silently failed every paid call instead of bouncing to
// the sign-in gate. Run via `npm run verify:modeler` (bundled esbuild).
import { isProofExpiryPayload, PROOF_EXPIRED_EVENT } from "../src/lib/proofExpiry";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}`, detail ?? ""); }
}

// The exact payload from the field report — lowercase, must bounce.
check(
  "lowercase proof_refresh_needed → bounce",
  isProofExpiryPayload({ success: false, error_code: "proof_refresh_needed", error: "…" }),
);
check(
  "lowercase proof_required → bounce",
  isProofExpiryPayload({ success: false, error_code: "proof_required" }),
);

// Case-insensitive: an UPPERCASE code must STILL bounce (the regression).
check(
  "UPPERCASE PROOF_REFRESH_NEEDED → bounce (regression guard)",
  isProofExpiryPayload({ success: false, error_code: "PROOF_REFRESH_NEEDED" }),
);
check(
  "MixedCase Proof_Required → bounce",
  isProofExpiryPayload({ success: false, error_code: "Proof_Required" }),
);

// Must NOT bounce on unrelated / successful / malformed payloads.
check("success:true + proof code → no bounce", !isProofExpiryPayload({ success: true, error_code: "proof_required" }));
check("unrelated error → no bounce", !isProofExpiryPayload({ success: false, error_code: "insufficient_balance" }));
check("no error_code → no bounce", !isProofExpiryPayload({ success: false, error: "boom" }));
check("proof-ish but not a bounce code → no bounce", !isProofExpiryPayload({ success: false, error_code: "proof_invalid" }));
check("string payload → no bounce", !isProofExpiryPayload("proof_refresh_needed"));
check("null payload → no bounce", !isProofExpiryPayload(null));
check("empty object → no bounce", !isProofExpiryPayload({}));

// Event name is stable (App.tsx listens on this exact string).
check("event name is stable", PROOF_EXPIRED_EVENT === "optionality:proof-expired");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
