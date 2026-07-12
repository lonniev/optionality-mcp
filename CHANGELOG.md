# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.6.8] — 2026-07-12

### Fixed — LIVE scenarios are now grounded in the real current date

- **The deal prompt asserts the operator's real date.** A LIVE drill was dating itself "TODAY, JUNE 23, 2025" — over a year stale — because the prompt told the model to use "the date you found via web search," and with no anchor the model fell back to its training cutoff. The server knows the date, so `_prepare_deal` now injects it ("The real current date is July 12, 2026 (2026-07-12)…") and, for LIVE mode, instructs the model to trust it over its priors, `web_search` for catalysts current as of that date, and set `date_context` / `today_date` to it (never an earlier year). `prompts.py` guidance updated to match. Historical/fiction are unaffected beyond also being told the real date.

## [0.6.7] — 2026-07-12

### Fixed — an impatient patron can no longer rack up duplicate paid deals

- **A re-entrancy lock + a confirm gate protect the wallet.** With concurrent deals (0.6.5), nothing stopped a patron who tapped "Be Challenged" several times — while each scenario composes in the background for minutes — from paying a fresh toll each time (observed: four identical live deals queued in ~16s). Now a rapid double-tap can't fire two deals before the first registers, and once anything is already composing the primary button becomes **"Deal Another"** and requires an explicit confirm ("Each scenario is a separate N-sat toll") before spending again.
- **The Pit's Briefing screen shows what's already cooking.** When deals are in preparation, a pulsing "N scenarios already being prepared — Watch ›" affordance sits under the deal button, so a patron who left the wait sees their in-flight work (and can jump back to it) instead of an idle screen that invites re-dealing. The first deal is still frictionless.

## [0.6.6] — 2026-07-12

### Fixed — the 0.6.5 queue migration no longer orphans an in-flight scenario

- **A 0.6.4 single-slot pending crumb is now MIGRATED into the v2 list, not dropped.** 0.6.5's `loadPendingDeals` removed the superseded `optionality:pending:v1:<npub>` key without reading it — so a scenario that was still composing when the 0.6.5 frontend first loaded lost its claim, and because a detached job only settles + journals when a client polls its claim, it never reached the Journal (a lost, paid deal). Load now merges the legacy crumb into the queue before retiring the key, so a reload resumes and settles it. (Recovery is still bounded by the job's result TTL — a claim whose result has already aged out server-side can't be revived.)

## [0.6.5] — 2026-07-12

### Added — "Scenarios in Preparation": fire off several deals, claim them later

- **Concurrent deals.** Dealing a scenario no longer blocks on the (minutes-long) composition — the claim is queued and a background poller settles it. A patron can fire several at once; each is polled independently and settles into its own `open` journal entry. The pending queue is persisted per-npub as a **list** (`optionality:pending:v2:<npub>`, superseding the 0.6.4 single slot) so concurrent deals survive a reload without clobbering each other.
- **A "Scenarios in Preparation" table at the top of the Journal.** Each in-flight scenario shows its assignment (mode · difficulty), a live elapsed clock, an ETA, and its claim id. Clicking a row re-opens the "Reading the Tape" screen for that production. This fixes the dead end where "Claim in Journal" (tapped before a scenario was ready) landed on nothing — the Journal now shows what's still cooking, and each finished one drops out of the list and appears below as an open entry to resume and pitch.
- The lone-deal happy path is unchanged: deal one, watch it compose, and it seats straight into the Pit to pitch when ready. `mcp.ts` now exposes `startDeal` (start-only, returns the claim) alongside the existing `resumeDealClaim` (the shared background poller); pure queue reducers live in `lib/pendingDeals.ts` with a dep-free `verify:pending` smoke test. The Journal also auto-refreshes when a background deal settles while the tab is open.

## [0.6.4] — 2026-07-12

### Added — a walk-away-safe waiting card for the (multi-minute) deal

- **The deal-wait scene now shows a live status card** — what the Firm is preparing (mode · difficulty), the claim id, an elapsed clock, and an ETA countdown — instead of an open-ended spinner. A live-mode scenario runs web search and can take a few minutes; the card makes that wait legible. The old "expect 15–30s" footer (long untrue) is gone.
- **A deal in flight is now durable: you can leave the page and claim it later.** The claim check is persisted per-npub the instant it's accepted (`optionality:pending:v1:<npub>`), and on the next load the app resumes polling it — which is also what *settles* the detached job and writes its `open` journal entry. So a reload, a dropped connection, or closing the tab mid-compose no longer abandons the paid scenario: it lands in the Journal, ready to pitch. A "Claim in Journal" button on the card takes you straight there while the deal finishes composing in the background (never cancels, never re-charges). The crumb is cleared the moment the claim reaches a terminal state; a claim that aged out surfaces the refunded "deal a fresh one" nudge.
- The operator now echoes its honest time budget (`expected_seconds`) on the `deal_scenario` claim-check response so the card's ETA is the Firm's real estimate, not a client guess. Pure clock/ETA logic lives in `lib/dealClock.ts` with a dep-free `verify:dealclock` smoke test (mm:ss, a countdown that says "wrapping up…" past the estimate rather than going negative, and npub-scoped pending keys).

## [0.6.3] — 2026-07-12

### Fixed — durable jobs actually reach Prefect now (the `[prefect]` extra was missing)

- **Pinned `tollbooth-dpyc[nostr,prefect]==0.62.4`** — previously `[nostr]` only. The long-runner creds (`prefect_api_url`, `prefect_api_key`, `closure_seal_key`) were all vaulted and `service_status` reported the operator fully configured, but the `prefect` runtime that `PrefectClosureExecutor` needs was **never installed** in the operator image. So every drill's `_ensure_async_executor` probe failed to construct the executor and the job ran in-process → a container recycle mid-LLM-call left it stuck `running` → the FE gave up after 360s (`deal_scenario`/`judge_trade` "server never returned a terminal status", `recovered:true`). No flow run ever reached the `dpyc-job-flow/dpyc-jobs` deployment (last run predated every failed drill). Adding the `[prefect]` extra installs the runtime; the next drill installs the detached executor and settles durably. No optionality code change.
- SDK 0.62.4 also hardens this failure mode so it degrades loudly (in-process + `service_status.durable_jobs.detached_executor_error`) instead of silently crashing the first drill on each container.

## [0.6.2] — 2026-07-11

### Fixed — the detached executor now activates reliably on cold containers

- Pinned `tollbooth-dpyc[nostr]==0.62.3`. A live `deal_scenario` was observed timing out `job_timed_out` while running in-process (`recovered:true`) even though the detached Prefect executor was active elsewhere in the fleet — a container that hit a transient cold-vault failure on its first job was permanently pinned to in-process execution (SDK `_ensure_async_executor` cached the miss). 0.62.3 retries the probe on a transient failure, so every container installs the detached executor once its vault is reachable. No optionality code change.

## [0.6.1] — 2026-07-11

### Fixed — a scenario can no longer sit in The Pit without a journal entry

- **The active-session cache is now scoped per-npub.** The Pit's in-progress scenario is cached in `localStorage` so a paid drill survives a reload — but the key was a single GLOBAL `optionality:session:v1`, not namespaced by npub (unlike the per-identity stats cache). So switching identities on one browser could seat the previous patron's scenario in the new patron's Pit; since a journal entry is npub-scoped, judging it failed with `journal_entry_not_found`. The key is now `optionality:session:v1:<npub>` (`lib/sessionKey.ts`), and the legacy global key is dropped on load. A legit in-progress drill survives as an `open` journal entry the patron can resume from the Journal — only unsaved draft text is lost.
- **An orphaned scenario self-heals at pitch time instead of rejecting into a void.** If a deal never durably persisted (e.g. one caught mid-redeploy) the scenario can linger in localStorage with no matching entry. Submitting a pitch now detects the wheel's refundable `journal_entry_not_found` situation — the claim-check poller propagates the curated `error_code` on a new `ClaimCheckError` (`lib/claimCheck.ts`) — clears the dead board, and returns the patron to deal a fresh, properly-journaled scenario. The fare was already refunded server-side; no paid `get_journal` reconciliation is added (validating a cache must not cost sats).
- New dep-free smoke tests `verify:sessionkey` and expanded `verify:claimcheck` lock the npub scoping and the `error_code` propagation.

## [0.6.0] — 2026-07-11

### Changed — SDK pin

- Pinned `tollbooth-dpyc[nostr]==0.62.2` for the durable async-job shape callback (`shape_result(raw, params)`).

### Fixed — the LLM jobs survive a container recycle (durable detached execution)

- **`judge_trade` / `deal_scenario` / `ask_tip` now register a durable closure path, not just an in-process runner.** The reported failure — `judge_trade` polling "running" for 17 minutes then "client gave up after 360s — server never returned a terminal status" — was a Horizon container recycle killing the in-process asyncio task mid-LLM-call: nothing survived to write a terminal state, so the row stayed `running` until a later poll re-kicked a *fresh* 360s attempt the frontend had already abandoned. Each job now also registers a `build_closure` + `shape_result` spec (via SDK 0.62.2). Once the operator couriers the optional `dpyc-longrunner` creds (`prefect_api_url`, `prefect_api_key`, `closure_seal_key` — now in the operator credential template, v3), the wheel runs the LLM call in a detached Prefect flow **outside** the request container, so a recycle can't orphan it. Until then the in-process runner serves unchanged (no regression).
- **Each job's side effects live in one shared `_finalize` half**, called by the in-process runner AND by `shape_result` when settling a detached run — so opening a journal entry / recording an evaluation / counting a clue fires exactly once on whichever path runs, never twice.
- **`claude.py` gains the declarative request path**: `build_anthropic_request` (bakes the operator key for the wheel to seal), `shape_llm_text` (extracts the model text from the detached HTTP result, records usage, and curates a non-2xx into a refundable situation via the shared `situation_from_status`). `_provider_situation` (in-process) now delegates to the same mapper, so both paths classify a provider failure identically.
- **A degenerate clue question and a scenario replay no longer spin up a claim-check job.** `ask_tip` returns its LLM-free nudge synchronously, and a replay (deterministic — no LLM) returns the settled entry directly (`status:"done"`, no claim to poll). The frontend's poller (`claimCheck.ts`, extracted + smoke-tested via `npm run verify:claimcheck`) short-circuits on a terminal start response, and `startAndPoll` reuses that resolver for the poll loop.
- **A pre-flight rejection is now a clean refund.** A missing journal entry or invalid deal request raised while building the job settles as a curated, refundable situation (SDK 0.62.2) instead of a paid `{"error": ...}` dict.

### Fixed — a lapsed npub-proof now bounces to the sign-in gate

- **An expired npub-proof no longer silently fails every call.** The wheel returns `{success:false, error_code:"proof_refresh_needed"}` when the proof cache lapses, but the FE compared the code against UPPERCASE strings — so the match never fired and paid calls just failed in place instead of re-presenting the gate (the same case-sensitivity bug fixed earlier in eXcalibur). The check now normalizes the wheel's lowercase ErrorCode.
- **The bounce is global, not per-call.** Detection is centralized in a new dependency-free `frontend/src/lib/proofExpiry.ts` (`isProofExpiryPayload`), and on a lapse `mcp.ts` fires a `PROOF_EXPIRED_EVENT` that `App` listens for — so the patron is returned to the gate even when the failing call is a background hydration read (profile / rank / coupons) that swallows its own error. Regression-guarded by `frontend/verify/proofExpiry.smoke.ts` (`npm run verify:proof`).

### Added — "second opinion" deep-link to an external options modeler

- **The Payoff Lab can now hand a built structure to a rigorous external modeler.** Optionality draws the expiration payoff in-app (pure intrinsic-value math, no chain needed), but deliberately doesn't rebuild the market-derived layer — live Greeks, IV surface, probability-of-profit — which needs a *real, quoted* contract to anchor. When one exists, the Payoff Panel shows a **Verify on OptionStrat ↗** link.
- **The deep-link is fully pre-filled.** The exact structure — every leg's strike, expiration, call/put, long/short, and quantity — is encoded into an OptionStrat build URL (leg-token scheme verified against a real share link), so the target opens with the trainee's position already built against the underlying's live chain, not just the strategy template. If a leg lacks an expiration date, it falls back to InsiderFinance's Options Profit Calculator (strategy + ticker; strikes re-selected there). The URL carries only public market identifiers (ticker, strategy, strikes, expiries) — nothing from the vault.
- **Applicability is mode-gated, matching what a chain-driven modeler can actually quote.** Only `live` scenarios get the link. `historical` (the modeler shows today's chain, not the scenario's past date) and `fiction` (the underlying doesn't exist to be quoted) instead show a one-line note explaining that the in-app payoff is authoritative for that case. Structures with no single-strategy preset (calendars, diagonals, custom N-leg) likewise fall back to the note.
- New pure module `frontend/src/lib/externalModeler.ts` (provider registry with OptionStrat full-prefill + InsiderFinance fallback, applicability gate, structure→slug map), covered by a dependency-free smoke test that byte-matches a real OptionStrat share URL — runnable with `npm run verify:modeler`.

## [0.5.0] — 2026-07-10

### Changed — one profile, sourced from Nostr

- **The Profile page no longer has two identity editors.** It had an app-local "Your identity at Optionality" editor (name/avatar/bio saved to Optionality's DB) *and* a "Nostr Profile" kind-0 editor — redundant. The app-local editor is gone. The Nostr panel (now titled **Profile**) is the single, self-sovereign identity surface: it reads your kind-0 from relays and publishes kind-0.
- **Publishing mirrors your identity to the leaderboard cache.** On a successful publish, the FE also copies name/avatar/bio into Optionality's store (best-effort) so the leaderboard and patron-to-patron DM addressing keep rendering names/avatars fast, without a live relay fetch per row. Nostr is the source of truth; Optionality's DB is a derived cache, not an editable identity surface. (A glyph avatar — which can't be a kind-0 `picture` URL — still mirrors so the leaderboard shows it.)

### Removed — patron relay selection

- The per-patron **Nostr Relays** editor is gone. The DPYC ecosystem now agrees on one relay set published at `dpyc-community/relays.json` (the same single source the wheel's relay registry reads). A new `getEcosystemRelays()` helper fetches it (with a baked-in fallback so it never blocks), and the NIP-07 patron-to-patron DM path publishes to that shared set instead of a per-patron list.

### Note

- With identity sourced from Nostr, editing your profile now requires a signer (an in-browser session key or a NIP-07 extension). An npub-only session with no signer is read-only for profile edits — the panel disables Publish and says so.

## [0.4.0] — 2026-07-10

### Changed — the avatar chooser is now a popup, not an always-open catalog

- **"Change avatar" opens a modal.** The Iconify avatar catalog used to sit open inline on both the Profile page and the Nostr Profile panel — heavy, and in your face even when you weren't choosing. Now each spot shows your current avatar next to a **Change avatar** button; clicking it opens a focused popup (`AvatarModal`) with the picker and a live preview, and closing applies your pick. The popup closes on Done, ×, backdrop click, or Escape. Persisting is still your explicit **Save Changes** / **Publish to Nostr** — unchanged.
- **Picker polish** carried in from eXcalibur's nicer version, kept in Optionality's sharp amber/mono skin: a denser icon grid and segmented amber tabs (replacing the thin underline). The picker's redundant inline preview moved into the modal footer.
- The frontend build version is now unified with the release version (it had been frozen at a placeholder), so the Build & License panel reflects each shipped build.

## [0.3.4] — 2026-07-09

### Changed
- **Bumped `tollbooth-dpyc` to `0.62.1`** — security-hardening batch: invoice-owner check on credit settlement, GCM credential vault, encrypted self-provisioning ledger, and no plaintext audit.

## [0.3.3] — 2026-07-09

### Fixed
- **`live`-mode scenarios no longer stall to the runtime cap.** Confirmed via the new trace: non-live deals (fiction / historical) complete in ~20s, but `live` mode rode the full 300s budget and refunded — Anthropic `web_search` was fanning out into a slow, unbounded chain of queries on the basic `web_search_20250305` variant.

### Changed
- **Upgraded web search to the current dynamic-filtering variant** (`web_search_20250305` → `web_search_20260209`, the one recommended for Sonnet 4.6) and **bounded it with `max_uses: 5`**, so a live deal (and clue) resolves quickly instead of stalling on unbounded search rounds.
- **Raised the frontend claim-check ceiling 330s → 360s.** A job's `started_at` is offset from the patron's click (a cold-Neon claim can lag ~40s), so the wheel's 300s cap can fire ~340s after the click — just past the old 330s ceiling, so a timed-out deal gave up silently instead of showing the refund message.

## [0.3.2] — 2026-07-09

### Added
- **On-screen MCP diagnostic trace ("Debug" panel).** A fixed bottom bar (ported from eXcalibur / taxsort) showing every MCP call, result, and error the FE makes — so a deal that spins is no longer invisible. It logs the claim-check lifecycle explicitly: `deal_scenario` accepted with a claim id, each `fetch_scenario` poll's status (`running` → `done`/`error`), the curated terminal situation (`service_warming_up`, `operator_llm_unfunded`, `upstream_timeout`, …), and the client-side give-up if the server never returns a terminal status. Present in both the sign-in gate and the app; the toggle turns red with an error count when something fails.

## [0.3.1] — 2026-07-09

### Fixed
- **A Neon cold-start no longer kills a deal / clue / judge.** Neon autosuspends when idle; the first DB touch on a cold compute (e.g. `deal_scenario`'s `upsert_patron`) could miss the vault client's timeout while Neon woke, and the wheel's short generic retries all landed inside that wake window → the job failed and the fare was refunded even though Neon came up seconds later.

### Changed
- **`db/neon.py` rides out the cold-start.** `execute` / `executemany` now retry transient httpx timeouts (`ConnectTimeout` / `ReadTimeout` / `ConnectError` / …) across Neon's wake window (~1+2+4+8s), covering both vault acquisition and the query. A genuine query error is never retried. If Neon still won't answer, the operation raises a curated, refundable `service_warming_up` `AsyncJobSituation` ("the database is waking up, try again in a few seconds") instead of a raw timeout — so the async-job runner refunds and the frontend shows a clean retry hint.

## [0.3.0] — 2026-07-09

### Fixed
- **Deal / clue / judge no longer spin to the frontend's poll ceiling on a stalled AI provider.** `call_claude` built its Anthropic client with no timeout, so a stalled call (usually the operator's Anthropic account out of credits, or `live`-mode web search) inherited the SDK's 600s default — which coincided with the frontend's 600s claim-check ceiling, leaving the job `running` for the full ten minutes with the fare debited and never refunded.

### Changed
- **`call_claude` is now bounded by the job budget and disables SDK retries** (`timeout_seconds` per call — 120s standard / 240s live for deal & judge, 120s for clues — with `max_retries=0` so a hang can't be multiplied). A stall now fails fast.
- **LLM failures raise a curated, refundable `AsyncJobSituation`** instead of a paid `{"error": ...}`: the wheel refunds the fare and the frontend renders a safe message + next steps. Mapped codes: `operator_llm_unfunded`, `operator_llm_auth`, `upstream_rate_limited`, `upstream_timeout`, `llm_empty`, `operator_llm_unconfigured`.
- **Operator gets a self-DM** (surfaces in Pricing Studio) on a definitive provider-down situation — "your Anthropic account is out of credits", so the human running the operator sees it without watching logs.
- **Frontend claim-check polling** probes early (first wait ≤8s so fast failures surface in seconds), lowers its ceiling 600s→330s, and threads the situation's `next_steps` into the surfaced error.
- Budget-aware poll cadence via `expected_seconds` on each async job.

### Added
- `tests/test_claude_situations.py` — timeout clamping, provider-error → situation mapping, and empty-output handling.

## [0.2.4] — 2026-07-01

### Changed — "The Pit" icon is now the proper Material Symbols person_raised_hand

- Replaced the earlier custom / head-grafted silhouette with the official Material Symbols `person_raised_hand` glyph (24px) — a clean person with one raised arm. Fixes the "headless / elephant trunk" look properly with a common icon rather than a bespoke path.

## [0.2.3] — 2026-07-01

### Fixed — "The Pit" nav icon was headless (looked like an elephant's trunk)

- The `MI_PERSON` glyph used for the "The Pit" tab was a two-arms-raised silhouette with no head circle, so the raised arms read as an elephant raising its trunk. Added the head (centred above the shoulders, in the clear gap between the arms) so it reads as a person raising their hand.

## [0.2.2] — 2026-06-30

### Added — Nostr kind-0 profile (self-sovereign identity, like eXcalibur)

- New "Nostr Profile" panel on the Profile page: discovers the patron's kind-0 metadata from Nostr (via the operator's free `get_nostr_profile`) and lets them edit + publish a CLIENT-signed kind-0 (`publish_nostr_profile`) visible in every Nostr client. Fields: display name, lud16, NIP-05, website, about, avatar. Signing happens in-browser (session nsec via nostr-tools `finalizeEvent`, or a NIP-07 extension) — the key never reaches the backend; the wheel only verifies + relays. Read-only when no signer is present.
- This is distinct from the existing app-local "identity at Optionality" panel (leaderboard alias/avatar/bio in Optionality's own DB). Frontend-only; the backend tools already ship in the wheel.

## [0.2.1] — 2026-06-30

### Fixed — frontend adopts the wheel dpop_token rename (was broken against its own operator)

- The 0.2.0 rename renamed the BACKEND tool params (`proof` → `dpop_token`) but never touched the frontend, so every proof-gated call from the web app failed server-side validation (`proof` unexpected / `dpop_token` missing). Fixed the wire keys: the paid-call envelope now sends `dpop_token` (was `proof`), `receive_npub_proof` sends `dpop_token` (was `poison`), and the login reads `dpop_token` (was `proof_token`). Internal cache keys/values unchanged (users stay signed in).

## [0.2.0] — 2026-06-29

- **BREAKING**: rename tool possession-token parameter `proof` → `dpop_token`, in lockstep with `tollbooth-dpyc` 0.57.0 (unified Secure Courier possession token under one name; retired `proof_token`/`poison`/`proof` param). No backward-compat shims.
- chore: bump `tollbooth-dpyc[nostr]` pin `==0.53.1` → `==0.57.0`; regenerate `uv.lock`.
- chore: track `tollbooth-dpyc` 0.45.4 (latest SDK release)
- docs: add DPYC ecosystem section to README (full peer-repo list, including `cypher-mcp`)

## [0.1.0] — 2026-06-11

- feat: initial release — options analytics MCP Operator built on the `tollbooth-dpyc` SDK (`OperatorRuntime` + `register_standard_tools`)
- DPYC role: registered as an **Operator** under the North America Authority (via the New England Authority), member since 2026-05-23
- chore: tracking `tollbooth-dpyc` 0.44.15 (current SDK audit-hardened release)
