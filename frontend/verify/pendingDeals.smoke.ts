// Smoke test for the "Scenarios in Preparation" queue reducers. A patron can
// fire several deals at once; these lock the invariants that keep them from
// clobbering each other or leaking across identities: npub-scoped keys, upsert
// is idempotent by claim check, remove is exact, and prune drops only
// day-stale crumbs. Run via `npm run verify`.
import type { PendingDeal } from "../src/types";
import {
  LEGACY_PENDING_KEY_PREFIX,
  PENDING_LIST_KEY_PREFIX,
  legacyPendingDealKey,
  pendingDealsKey,
  prunePending,
  removePending,
  upsertPending,
} from "../src/lib/pendingDeals";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) console.log(`  ok   ${name}`);
  else { failures++; console.log(`  FAIL ${name}`, detail ?? ""); }
}

const mk = (claim: string, startedAt = 1000): PendingDeal => ({
  claimCheck: claim,
  mode: "live",
  difficulty: "apprentice",
  startedAt,
  expectedSeconds: 240,
});

// key scoping
const A = "npub1aaaa";
const B = "npub1bbbb";
check("list key is prefixed with the npub", pendingDealsKey(A) === PENDING_LIST_KEY_PREFIX + A);
check("different npubs → different keys", pendingDealsKey(A) !== pendingDealsKey(B));
check("empty npub falls back to _guest", pendingDealsKey("") === PENDING_LIST_KEY_PREFIX + "_guest");
check("v2 list key differs from the superseded v1 slot", PENDING_LIST_KEY_PREFIX !== LEGACY_PENDING_KEY_PREFIX);
check("legacy key helper uses the v1 prefix", legacyPendingDealKey(A) === LEGACY_PENDING_KEY_PREFIX + A);

// upsert
const two = upsertPending(upsertPending([], mk("c1")), mk("c2"));
check("two distinct claims → two entries", two.length === 2);
check(
  "re-upserting a claim updates in place, no duplicate",
  upsertPending(two, mk("c1", 9999)).length === 2,
);
check(
  "upsert keeps the newest fields for a claim",
  upsertPending(two, mk("c1", 9999)).find((p) => p.claimCheck === "c1")?.startedAt === 9999,
);

// remove
check("remove drops exactly the named claim", removePending(two, "c1").map((p) => p.claimCheck).join() === "c2");
check("remove of an absent claim is a no-op", removePending(two, "nope").length === 2);

// prune
const now = 1_000_000_000;
const mixed = [mk("fresh", now - 60_000), mk("stale", now - 25 * 60 * 60 * 1000)];
check("prune keeps fresh, drops day-stale", prunePending(mixed, now).map((p) => p.claimCheck).join() === "fresh");

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
