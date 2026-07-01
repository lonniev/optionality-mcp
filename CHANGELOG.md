# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
