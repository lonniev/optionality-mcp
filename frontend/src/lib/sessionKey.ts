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
