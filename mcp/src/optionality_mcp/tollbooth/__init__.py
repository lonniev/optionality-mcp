"""Optionality-specific Tollbooth glue.

## Authentication wiring (Task 14h30)

There is no custom witness-key middleware in this package — there does not
need to be one. The wheel's ``OperatorRuntime`` and
``register_standard_tools(mcp, "optionality", runtime, ...)`` (called in
``optionality_mcp.server``) already provide:

- Schnorr signature verification of the ``proof`` parameter on every
  ``@runtime.paid_tool`` call (hot path; no relay round-trip).
- Balance lookup + atomic debit against the patron's pre-funded
  ``api_sats`` balance (hot path).
- Insufficient-credits and invalid-proof error responses (standardized).

To monetize a new Optionality tool, decorate it::

    @tool
    @runtime.paid_tool(capability_uuid("deal_scenario"))
    async def deal_scenario(npub: str = "", proof: str = "", ...): ...

That is the entirety of the auth wiring for every one of Optionality's
domain tools. The wheel — not this package — is the source of truth for
witness-key / sk_K, dual-signature verification, and Nostr replaceable
event revocation.

## Cold-path Oracle integration (Task 14h35)

``oracle.py`` exposes :func:`check_npub_not_banned` for use by cold-path
flows that admit new patrons (e.g. before creating a row in
``patrons`` for a never-before-seen npub). It MUST NOT be called from
the hot tool-call path — see the module docstring there.
"""
