// Per-npub queue of scenarios still being composed by the Firm — "Scenarios in
// Preparation". A patron can fire several deals at once (each a paid claim
// check), wander off, and come back to claim any that have finished from their
// Journal. Persisted as a LIST (v2) so concurrent deals don't clobber each
// other; the 0.6.4 single-slot (v1) is dropped on load.
//
// Pure reducers here (dep-free, smoke-tested); the localStorage read/write and
// the background pollers live in the component.
import type { PendingDeal } from "../types";

export const PENDING_LIST_KEY_PREFIX = "optionality:pending:v2:";
// The superseded single-object slot, cleared once on load.
export const LEGACY_PENDING_KEY_PREFIX = "optionality:pending:v1:";

export function pendingDealsKey(npub: string): string {
  return PENDING_LIST_KEY_PREFIX + (npub || "_guest");
}

export function legacyPendingDealKey(npub: string): string {
  return LEGACY_PENDING_KEY_PREFIX + (npub || "_guest");
}

/// Add or replace a deal by its claim check (idempotent — re-adding the same
/// claim updates in place rather than duplicating). Newest sorts last.
export function upsertPending(list: PendingDeal[], d: PendingDeal): PendingDeal[] {
  return [...list.filter((p) => p.claimCheck !== d.claimCheck), d];
}

export function removePending(list: PendingDeal[], claim: string): PendingDeal[] {
  return list.filter((p) => p.claimCheck !== claim);
}

/// Drop crumbs so old their result has surely aged out server-side (result_ttl
/// is minutes; a day-old claim is corrupt/abandoned). Keeps merely-recent ones
/// so the server, not the client, decides "expired".
export function prunePending(list: PendingDeal[], nowMs: number): PendingDeal[] {
  const DAY_MS = 24 * 60 * 60 * 1000;
  return list.filter((p) => nowMs - p.startedAt <= DAY_MS);
}
