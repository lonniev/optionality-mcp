// Guest mode — Optionality's own, so it lives beside the site and not in the
// shared sign-in package.
//
// "Continue as Guest" on the gate reaches the scenario chooser and the free
// preview surfaces (check_price, the briefing, the sample assessment); every
// paid call stays gated. No npub, no proof, no journal / leaderboard / usage.
// Persisted so a reload survives, and cleared on sign-out.

const GUEST_STORAGE_KEY = "optionality:guest";

export function isGuestMode(): boolean {
  return window.localStorage.getItem(GUEST_STORAGE_KEY) === "1";
}

export function setGuestMode(on: boolean): void {
  if (on) window.localStorage.setItem(GUEST_STORAGE_KEY, "1");
  else window.localStorage.removeItem(GUEST_STORAGE_KEY);
}

/// Stable per-browser guest identifier — 8-char hex, generated on first
/// call, persisted so a returning guest sees the same handle. Used to address
/// the patron-as-guest in the Welcome / guest-pass copy ("Welcome Guest
/// Trader <hash>") without inventing an npub for someone who hasn't signed in.
const GUEST_ID_KEY = "optionality:guest-id:v1";

export function getGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing && /^[0-9a-f]{8}$/.test(existing)) return existing;
  const bytes = new Uint8Array(4);
  window.crypto.getRandomValues(bytes);
  const id = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}
