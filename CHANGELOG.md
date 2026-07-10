# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
