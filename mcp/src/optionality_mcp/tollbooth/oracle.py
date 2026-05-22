"""Cold-path Oracle ban-list helper.

Only called from:

- ``purchase_credits`` cold path (before issuing a Lightning invoice).
- First-time patron upsert (before a brand-new npub enters our ``patrons``
  table).

Never called from the hot tool-call path — that path is gated by Schnorr
proof verification + balance debit via the wheel's ``@runtime.paid_tool``,
which already runs in microseconds and must not pay a relay round-trip.

The actual MCP-to-MCP call is delegated to the wheel's ``OracleClient``.
"""

from __future__ import annotations

import logging
import os

from tollbooth.oracle_client import OracleClient, OracleClientError

logger = logging.getLogger(__name__)

# FastMCP Cloud convention for service endpoints.
_DEFAULT_ORACLE_URL = "https://dpyc-oracle.fastmcp.app/mcp"


class PatronBannedError(RuntimeError):
    """Raised when the Oracle reports an npub is community-banned.

    Surface this to callers as a clear refusal — the npub will not be issued
    credits and will not be entered into the operator's patron table.
    """


def _oracle_url() -> str:
    return os.environ.get("OPTIONALITY_ORACLE_URL", _DEFAULT_ORACLE_URL)


async def check_npub_not_banned(npub: str) -> None:
    """Raise ``PatronBannedError`` if the npub is on the DPYC ban list.

    Connection or transport errors are LOGGED and treated as "not banned" —
    we prefer to fail open on Oracle availability rather than block paying
    customers when a free advisory service is down. The community ban
    mechanism is advisory-only by design (per the DPYC governance model);
    if the Oracle is unreachable, the operator's own balance/proof checks
    still gate every monetized action.
    """
    client = OracleClient(_oracle_url())
    try:
        result = await client.call_tool("check_ban_status", {"npub": npub})
    except OracleClientError as e:
        logger.warning(
            "Oracle ban-list unreachable (%s) — proceeding for npub %s. "
            "This is fail-open by policy; balance + proof checks still gate "
            "every monetized action.",
            e, npub[:12] + "...",
        )
        return

    banned = bool(result.get("banned") or result.get("is_banned"))
    if banned:
        reason = result.get("reason") or "community ban"
        logger.info("Refusing service to banned npub %s: %s", npub[:12] + "...", reason)
        raise PatronBannedError(reason)
