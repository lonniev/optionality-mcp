# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.7.0 — 2026-08-22

### Fixed — drills run detached again; they had not since 2026-08-06

Optionality carried `tollbooth-dpyc[nostr,prefect]` from 2026-07-12, when the
`[prefect]` extra was added precisely so durable jobs would reach detached
compute. On 2026-08-06 a routine dependency bump to 0.82.0 rewrote the pin to
`[nostr]` — the SDK had deleted the Prefect executor that day — and **nothing
replaced it**. `uv.lock` shed the Prefect tree and no `[modal]` extra was ever
added.

For sixteen days every `deal_scenario`, `judge_trade` and `ask_tip` ran
in-process on a stateless front. A container recycle mid-call orphaned the job:
the row stays `running` until it goes stale, then a second worker starts the
drill over on a fresh budget the trainee had already given up on. That is the
exact failure the durable-jobs work fixed a month earlier, silently
reintroduced.

Nothing was red, because the wheel degrades on purpose — no extra, no executor,
jobs still run. `service_status` said so plainly the whole time
(`detached_executor_resolved: false`, `modal_app: null`,
`durable_across_recycles: false`); nobody was reading it.

- Pin moves to `tollbooth-dpyc[nostr,modal]`.
- New `modal_app.py` — a *place to run*, not a second implementation. The
  wheel's `ModalExecutor` spawns the operator's already-registered runner
  unchanged, which is why no sealed closure, op vocabulary or interpreter flow
  is involved. One mounted secret, `TOLLBOOTH_NOSTR_OPERATOR_NSEC`; everything
  downstream of identity is discovered over Nostr, so the container holds
  exactly what Horizon holds and no more.
- New `deploy-modal.yml`, with a paths filter deliberately wider than the image:
  the image mounts source at *deploy* time, so a source change without a
  redeploy leaves Modal running code that exists nowhere else. eXcalibur shipped
  a release that reached Horizon and not Modal, and the container quietly
  enforced the old budget for a day.

### Added — the job budget rings are computed, not restated

`config.py` now authors one number, `JOB_ATTEMPT_MAX_S`, and derives the
detached runner's ceiling from it. `max_runtime_seconds` is load-bearing twice —
attempt ceiling *and* the wheel's re-claim threshold — so a runner timeout
inside it kills work nothing has given up on, and the drill hangs until the row
goes stale rather than failing. Modal bakes that timeout in at deploy time on a
CI runner, where a wrong literal is invisible to every in-process test, so
`tests/test_modal_app.py` asserts the nesting and forbids a literal outright.

The same tests guard two contracts nothing else covers: the app name must match
the vaulted `modal_app_name` (rename it without re-couriering and every drill
falls back in-process while status reports an executor installed), and every
module in this flat project's `py-modules`/`packages` must be mounted (miss one
and the container fails at import, inside a job, on the operator's dime).

### Note — detached execution is still OFF until the operator provisions it

This change makes optionality *able* to run detached. It does not turn it on.
Three vaulted fields (`modal_token_id`, `modal_token_secret`, `modal_app_name`)
are what flip the runtime over, and they arrive by Secure Courier. Until then
drills run in-process exactly as they do today — correct, just not durable.

## 0.6.15 — 2026-08-17

### Changed — track tollbooth-dpyc 0.86.0 (GitHub-free bootstrap)

Picks up the GitHub-free operator bootstrap: relays and Authority resolution now come from the Oracle via MCP, so this operator no longer reads the dpyc-community registry on GitHub — closing the fleet-wide bootstrap SPOF.

## 0.6.14 — 2026-08-10

### Changed — track tollbooth-dpyc 0.85.0

Picks up the shared param-default binding: a schema's declared `default` was honoured on
only one of the two routes into a dynamic tool, so an omitted optional parameter could reach
a backend unbound and fail with nothing the caller could act on.

### Changed — CI carries the fleet's entrypoint check

0.6.13 added `tests/test_entrypoint_imports.py` here, ahead of the fleet-wide rule. That rule
now exists as a CI step enforced by the doctrine linter, so this repo carries it like every
other rather than being the one place that solved the problem its own way. The test stays: it
also asserts the three job runners are registered, which is this repo's own regression, not
the fleet's invariant.

## 0.6.13 — 2026-08-09

### Fixed — the service had not deployed since 2026-08-05

`server.py` called `runtime.register_job_spec(...)` at module scope. tollbooth-dpyc
**0.82.0** deleted that method along with the whole closure apparatus. Horizon builds by
running `fastmcp inspect server.py:mcp`, which imports the module — so every build since
that pin landed died with `AttributeError: 'OperatorRuntime' object has no attribute
'register_job_spec'`, and the deployment went on serving the last image that had built:
commit `6bbcd100`, SDK 0.81.0, eighteen commits and four days behind `main`.

Nothing about this was visible from the repository. The commit-phase suite was green
throughout, because **no test imported `server`** — the suite could not fail for the reason
production was broken. The deploy-verify role saw only that the served sha had not moved
and filed "Deploy did not land"; it never reads the build log, which is the one artifact
naming the cause. Handed that symptom, Engineering matched it to the known stale-wheel-layer
gotcha and wrote a deploy-marker nudge. Fifteen of those merged, green, between Aug 6 and
Aug 9. None could have worked: the module could not be imported, so no marker could change
the outcome.

### Removed — the closure apparatus, in full

The detached path is gone from this repo as it is from the SDK:
`deal_build_closure`/`deal_shape_result`, `tip_build_closure`/`tip_shape_result`,
`judge.build_closure`/`judge.shape_result`, and `llm.shape_llm_text`, which existed only to
settle their results.

That pair existed because a generic Prefect flow could not run this module's code, so a
request had to be sealed into data and the answer re-interpreted afterwards — two
implementations of one job, kept in step by hand. Detached compute now spawns the runner
itself, so `register_job_runner` is the entire registration and each job has one
implementation and one path through its side effects. `_prepare_*` and `_finalize_*` remain
as names for the steps either side of the model call, no longer as a seam between two paths.

Also removed: the deploy-marker line and `tests/test_deploy_marker.py`. That test asserted
the marker string contained sha prefixes hardcoded in the test itself — both edited in the
same commit — so it could only ever confirm a docstring had been rewritten. It was green for
every one of the fifteen nudges.

### Added — the entrypoint is now imported at commit time

`tests/test_entrypoint_imports.py` imports `server` exactly as `fastmcp inspect` does, and
asserts the three job runners are registered and callable. A bare import is most of the
value: anything registered at module scope is checked the moment it is written, rather than
at build time on a machine whose logs no workflow reads. Verified by reverting `server.py`
alone — both tests fail with the original `AttributeError` at line 897.

Also added `.github/workflows/release.yml`, absent until now, which is why twelve tags
produced zero GitHub Releases; and `doctrine-lint.yml`, so the doctrine tripwires run on
this repo's pull requests as they do across the fleet.

### Changed — track tollbooth-dpyc 0.84.1

Picks up the fix for `check_authority_balance`, which signed its proof for one tool name
while calling another and so failed for every operator.

## 0.6.12 — 2026-07-16

### Changed — track tollbooth-dpyc 0.63.3

- Bumped the pinned SDK to 0.63.3 (npub-proof challenge DM now stamps the request time). Also cuts a release for changes accumulated since the last tag.

## [Unreleased]

### Fixed — a live sovereign deal could not finish inside its own budget

A live deal's LLM budget was 360s, sized when `max_uses: 3` bounded the scenario to three
web searches. **Measured 2026-07-28: a model router silently drops that cap.** A request
declaring `max_uses: 1` ran *eight* searches; one declaring 3 ran *eleven* — on an xAI
model and on an Anthropic model alike. The declaration is forwarded, the bound is not.

So a live sovereign deal ran past 360s, the read timed out, and the patron watched the
poll ceiling instead of getting a scenario.

Budgets are resized against the real distribution rather than the old cap: the LLM read
timeout goes 360s → **600s**, `max_runtime_seconds` 420 → **700** (it must stay above the
read timeout, or a slow-but-alive call is reclaimed mid-flight instead of failing into a
refundable situation), and the live poll cadence 300s → 480s. `llm.py` now says plainly
that `max_uses` is decorative on this route, so nobody sizes anything against it again.

**Capping the search count was tried and rejected.** The model obeys a prompt-level "at
most twice" where it ignores `max_uses` — and then answers the rest from training data,
emitting a scenario dated a year in the past with no signal it had done so. For a trading
drill that is worse than failing.

### Changed — LIVE mode hunts a shopping list instead of browsing

The old instruction ("find market conditions, recent news, and active catalysts") named no
finish line, so every answer invited another query — eleven searches and ~35k input tokens
for one scenario, since it is search *results*, not the prompt, that fill the context.

`SCENARIO_LIVE` now names the six facts a live scenario actually needs, the order to get
them (broad once → narrow to one ticker → stop), and what needs no research at all (option
chains, analyst targets, red-herring material). It stops the model answering from memory,
and tells it what to do when a fact won't come: estimate from the regime and say so in
`skew_note`, rather than substituting a remembered price or searching forever.

### Added — the Usage view reports what the provider actually billed

`optionality_api_usage` gains a `cost_usd` column, written from the provider's own
per-call figure. The browser previously reconstructed cost from a bundled rate table; that
was fine while one model was hardwired, and wrong the moment the route can change model,
because tokens from two models are not comparable money.

Rows predating the column carry NULL and are rendered as estimates, explicitly labelled —
never silently blended with measured figures. `null` means unknown, never free.

`get_api_usage_stats` gains a `totals` block including **`avg_cost_usd`** — what one
scenario, clue or verdict costs to serve, which is the figure that says whether a tool's
sats price covers its own compute. The Usage page surfaces it as a "Cost per call" tile
and a per-model "Per call" figure.

The sats-equivalent tile's $100K/BTC constant is now labelled as the fixed reference rate
it has always been, rather than reading as today's spot.

### Changed — LLM calls route through a model router, and the wheel decides which

`claude.py` is now `llm.py`. Its docstring recorded that it had been *"Modeled after
`taxsort-mcp/tools/advisors.py`"* — one of three near-identical copies of the same
provider plumbing across the estate, each pinning `api.anthropic.com`, each declaring its
own web-search tool, two carrying a byte-identical `clamp_timeout`. That is a wheel
concern and now lives in `tollbooth.llm_route` (SDK 0.74.0). What stays here is what makes
a *drill* good: the prompts, the usage journal, and the JSON coercion they depend on.

Dealing and judging draw the **writer** tier — both compose reasoned prose the patron is
asked to trust, and a live deal grounds itself with web search. Tips draw the **reader**
tier: a hint alongside a scenario already in front of the patron. Changing either model is
an environment variable and a restart, not a release.

**One request shape, one execution path.** The in-process path used the `anthropic` SDK
client while the detached closure path built a raw HTTP envelope, so every provider
behaviour had to be understood — and every provider failure classified — twice, by
`_provider_situation` and `situation_from_status`. Both now build the same envelope and
read the same reply, and `_provider_situation` is gone. The `anthropic` package is no
longer a dependency.

**The vaulted credential is renamed `anthropic_api_key` → `llm_api_key`, with no
compatibility shim.** The operator must redeliver it via Secure Courier — already required
to change providers, so the rename costs nothing extra.

### Fixed — an exhausted AI account was reported as a passing blip

Both classifiers decided the provider had run out of money by matching one lab's wording
(`credit balance`, `purchase credits`, `plans & billing`), because that lab reports an
empty account as a **400**. A model router reports the same condition as a **402** reading
*"Insufficient credits"* — matching none of those needles.

So an exhausted account was curated as `llm_unavailable`, `transient: True`: the
operator's "feed me" DM never fired, and patrons were told to retry a drill that could
never succeed until someone noticed the balance. The wheel's classifier now reads both
providers' wording and treats a bare 402 from a metered LLM provider as unfunded. A model
slug the provider no longer offers is newly distinguished as permanent rather than
retryable — the signature of a marketplace retiring a model under a running deployment.

The operator DM was also telling them to add credit at `console.anthropic.com` whatever
provider the key belonged to. It now points at the account behind `llm_api_key` without
naming a vendor console the operator may not have.

### Changed — usage is journalled against the model that actually answered

`record_call` was passed the module's default model rather than the model named in the
reply. That was harmless while one model was hardwired; with the model now configurable it
would have mis-attributed every row after a change, and the Profile/Usage view compares
token counts across models. Both paths now read the model from the response.

## [0.7.2] — 2026-08-22

### Changed — track tollbooth-dpyc 0.87.3

Recovering an orphaned job now uses the detached executor it was
dispatched to. The recovery path never resolved the executor, so a
job orphaned by a container recycle was retried in-process on the
new front — bypassing the detached runner precisely when it was
the point.

## [0.7.1] — 2026-08-22

### Changed — track tollbooth-dpyc 0.87.2

An object argument a client serialised as a JSON string is now parsed
rather than refused as `dict_type`. Fixes `update_post` rejecting a
large patch and `update_design_text` rejecting a multi-key edits
object.

## [0.6.16] — 2026-08-22

### Changed — track tollbooth-dpyc 0.87.1

Picks up the relay-reliability work: `COURIER_RELAY_UNREACHABLE` so an
unreachable pinned rendezvous is no longer reported as the patron never
replying, relay-failure reporting to the Oracle, and a publish that counts
only when the relay acknowledges that exact event.

## [0.6.11] — 2026-07-12

### Changed — "Top Off" → "Top Up" (DPYC vocabulary)

- Optionality used "Top Off" for the buy-sats action; the DPYC ecosystem term is **"Top Up"**. Corrected every user-facing string (buttons, titles, aria-labels, Welcome copy, the tool label) and, to avoid naming drift, renamed the internals to match: `TopOffModal.tsx` → `TopUpModal.tsx`, `topOffOpen`/`setTopOffOpen` → `topUpOpen`/`setTopUpOpen`, and the `onTopOff` prop → `onTopUp`.

## [0.6.10] — 2026-07-12

### Changed — faster LIVE deals: fewer web-search rounds

- **`web_search max_uses` 5 → 3.** A performance study found the dominant cost of a live deal is the search fan-out: each round has the model write a query, Anthropic run the search *and* spin up a code-execution sandbox to dynamic-filter results (the `web_search_20260209` variant), then read and possibly search again. Five sequential rounds added minutes; three cover a live scenario (ticker + catalyst + price/IV). The model (`claude-sonnet-4-6`, thinking-off) and the ~2.6K-token prompt were confirmed *not* to be the bottleneck. Tunable in `claude.py` if grounding depth suffers.

## [0.6.9] — 2026-07-12

### Fixed — LIVE deals no longer time out before they finish composing

- **Widened the timeout budget end-to-end for live + web_search.** A detached LIVE deal has to absorb a Prefect Managed worker cold-start (~40-50s) BEFORE the LLM even runs, then a multi-round web_search generation — which was blowing past the 360s client ceiling (and the 240s HTTP read timeout was cutting real calls short → Prefect flow `ReadTimeout`). Raised: the per-attempt LLM HTTP timeout 240→**360s**, the job `max_runtime` 300→**420s**, the result TTL 900→**1200s** (more time to come back and claim), the declared `expected_seconds` 240→**300s**, and the frontend poll ceiling 360→**600s**. A long ceiling is safe now that "Scenarios in Preparation" lets a patron wander off — nobody's blocked watching a spinner. Also trimmed a per-catalyst "verify via search" nudge from the 0.6.8 date grounding that could multiply search rounds; the date is still firmly asserted.

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
