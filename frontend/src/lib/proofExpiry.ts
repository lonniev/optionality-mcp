// Central predicate for "this soft MCP payload means the npub-proof is
// gone — bounce to the sign-in gate."
//
// Kept dependency-free (no SDK / DOM imports) so it stays unit-testable in
// isolation; both mcp.ts and App.tsx consume it. This exact check has
// regressed as a case-sensitivity bug — an UPPERCASE compare against the
// wheel's lowercase ErrorCode ("proof_refresh_needed") — which silently
// failed every paid call instead of re-presenting the gate. The dedicated
// test in verify/proofExpiry.smoke.ts guards against that recurring.

/// Fired on the window when a definitively expired/missing npub-proof is
/// detected. App listens and drops to the gate so a lapsed proof bounces
/// even when the failing call is a background read that swallows its own
/// error (profile / rank / coupons hydration).
export const PROOF_EXPIRED_EVENT = "optionality:proof-expired";

/// Wheel ErrorCode values (lowercase snake_case) meaning the proof cache
/// entry is gone and the patron must re-sign. The wheel emits these
/// lowercase; we normalize the payload's code before matching.
const PROOF_EXPIRY_CODES = new Set(["proof_required", "proof_refresh_needed"]);

/// True when a soft MCP payload ({success:false, error_code:...}, no
/// isError flag) signals an expired/missing proof that must bounce the
/// patron to the sign-in gate.
export function isProofExpiryPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  if (p.success !== false) return false;
  return PROOF_EXPIRY_CODES.has(String(p.error_code ?? "").toLowerCase());
}
