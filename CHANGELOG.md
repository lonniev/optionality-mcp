# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.0] — 2026-06-29

- **BREAKING**: rename tool possession-token parameter `proof` → `dpop_token`, in lockstep with `tollbooth-dpyc` 0.57.0 (unified Secure Courier possession token under one name; retired `proof_token`/`poison`/`proof` param). No backward-compat shims.
- chore: bump `tollbooth-dpyc[nostr]` pin `==0.53.1` → `==0.57.0`; regenerate `uv.lock`.
- chore: track `tollbooth-dpyc` 0.45.4 (latest SDK release)
- docs: add DPYC ecosystem section to README (full peer-repo list, including `cypher-mcp`)

## [0.1.0] — 2026-06-11

- feat: initial release — options analytics MCP Operator built on the `tollbooth-dpyc` SDK (`OperatorRuntime` + `register_standard_tools`)
- DPYC role: registered as an **Operator** under the North America Authority (via the New England Authority), member since 2026-05-23
- chore: tracking `tollbooth-dpyc` 0.44.15 (current SDK audit-hardened release)
