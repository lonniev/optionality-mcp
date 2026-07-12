// Per-npub localStorage key for the active Pit session — the paid, in-progress
// scenario that must survive a page reload until the round is finished.
//
// Namespaced by npub, exactly like the stats/history cache (storageKey), so
// switching identities on one browser can NEVER seat one patron's active
// scenario in another patron's Pit: the scenario's journal entry is npub-scoped,
// so a foreign scenario is un-judgeable ("journal_entry_not_found"). The
// pre-scoping GLOBAL key leaked precisely that; it's dropped on load as one-time
// cleanup (a legit in-progress drill survives as an `open` journal entry the
// patron can resume from the Journal — only unsaved draft text is lost).
export const SESSION_KEY_PREFIX = "optionality:session:v1:";
export const LEGACY_SESSION_KEY = "optionality:session:v1";

export function sessionKey(npub: string): string {
  return SESSION_KEY_PREFIX + (npub || "_guest");
}

// Per-npub key for a PAID scenario still being composed (a claim check in
// flight). Separate slot from the settled-session key above: a pending deal has
// no board yet, and it must be resumable on the next load so a reload / lost
// connection still settles the job and journals its `open` entry. Same npub
// scoping and "_guest" fallback so it can't leak across identities.
export const PENDING_KEY_PREFIX = "optionality:pending:v1:";

export function pendingDealKey(npub: string): string {
  return PENDING_KEY_PREFIX + (npub || "_guest");
}
