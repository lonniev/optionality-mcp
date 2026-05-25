// Session nsec — the freshly-generated key from "Generate Your Npub +
// Sign In Directly" path, used in-browser to sign kind-27235 identity
// proofs per paid tool call (Tactic 2 in the wheel's identity_proof).
//
// Scope of storage and the matching threat model is named explicitly
// in the gate when the user picks this path:
//
//   - Stored AES-encryption-free in localStorage under a fixed key.
//     XSS on this origin can exfiltrate it. We accept that risk for
//     the convenience of single-click sign-in on iPad; users who
//     want stronger isolation can stay on the NIP-07 path (their
//     extension keeps the nsec out of page memory entirely).
//   - Persisted only so a reload survives. Cleared on sign-out and
//     on the "Withdraw to clipboard" flow in Profile.
//   - Optionality the operator ALSO has this nsec encrypted in Neon
//     once the user deposits it via escrow_nsec — those are two
//     copies of the same custody decision.
//
// The browser stores it as a bech32 nsec1… string for symmetry with
// what the user is offered to copy. nostr-tools converts to the
// Uint8Array secp256k1 scalar each signing call.

import { getPublicKey, nip19 } from "nostr-tools";

const STORAGE_KEY = "optionality:session_nsec:v1";

export function getSessionNsec(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSessionNsec(nsecBech32: string): void {
  // Best-effort validation — refuse to persist a malformed token.
  if (!nsecBech32 || !nsecBech32.startsWith("nsec1")) {
    throw new Error("Expected a bech32 nsec1… string");
  }
  try {
    nip19.decode(nsecBech32);
  } catch (e) {
    throw new Error(`Invalid nsec: ${(e as Error).message}`);
  }
  window.localStorage.setItem(STORAGE_KEY, nsecBech32);
}

export function clearSessionNsec(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/// Decode the cached nsec to its 32-byte secp256k1 scalar, the form
/// nostr-tools' finalizeEvent wants. Throws if not set or malformed.
export function getSessionNsecBytes(): Uint8Array {
  const nsec = getSessionNsec();
  if (!nsec) throw new Error("No session nsec set");
  const decoded = nip19.decode(nsec);
  if (decoded.type !== "nsec" || !(decoded.data instanceof Uint8Array)) {
    throw new Error("Stored value is not a valid nsec");
  }
  return decoded.data;
}

export function hasSessionNsec(): boolean {
  return !!getSessionNsec();
}

/// Return the bech32 npub corresponding to the stored session nsec, or
/// null if the nsec is absent or malformed. Used to verify that the
/// session-cached nsec actually belongs to the currently-signed-in
/// patron before signing an inline proof with it. Stale entries from
/// a prior "Sign In Directly" attempt would otherwise produce
/// signatures with the wrong pubkey → "Invalid identity proof" on
/// every paid call.
export function sessionNsecNpub(): string | null {
  try {
    const sk = getSessionNsecBytes();
    const pk = getPublicKey(sk);
    return nip19.npubEncode(pk);
  } catch {
    return null;
  }
}
