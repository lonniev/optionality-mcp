"""Optionality MCP — server entry point.

A FastMCP SSE server that backs the Optionality options-trading drill UI.
All eleven domain tools are registered below; per-tool logic lives in
``tools.*``. Auth, balance, pricing, and proof verification
come from the wheel via ``register_standard_tools`` and ``@runtime.paid_tool``.

Run locally:
    python -m server

Deploy on FastMCP Cloud:
    See ./fastmcp.json at the repo root.
"""

from __future__ import annotations

import logging
from typing import Annotated, Any

from fastmcp import FastMCP
from pydantic import Field

from tollbooth.credential_templates import CredentialTemplate, FieldSpec
from tollbooth.runtime import OperatorRuntime, register_standard_tools
from tollbooth.tool_identity import STANDARD_IDENTITIES, ToolIdentity, capability_uuid

__version__ = "0.1.0"

logger = logging.getLogger(__name__)


_NPUB_DOC = "Required. Your Nostr public key (npub1...) for credit billing."

NpubField = Annotated[str, Field(description=_NPUB_DOC)]


mcp = FastMCP(
    "optionality-mcp",
    instructions=(
        "Optionality MCP — an AI-judged options trading drill, monetized "
        "via Tollbooth DPYC Bitcoin Lightning micropayments.\n\n"
        "## What it does\n"
        "A dealer LLM composes options trading scenarios; the trainee writes "
        "a free-text trade; a judge LLM evaluates the trade across five "
        "dimensions, parses it into structured legs, and emits a Facts Ledger "
        "showing fact-integration discipline. Three historicity modes "
        "(historical, fiction, live) and four difficulty personas.\n\n"
        "## Onboarding\n"
        "Call optionality_get_operator_onboarding_status to check operator "
        "readiness. Operator credentials (Anthropic API key + BTCPay) are "
        "delivered via Secure Courier — call "
        "optionality_request_credential_channel to start.\n\n"
        "## Pricing\n"
        "Tool prices are set dynamically by the operator's pricing model. "
        "Use optionality_check_price to preview costs and "
        "optionality_check_balance to see your balance."
    ),
)


_DOMAIN_TOOLS: list[ToolIdentity] = [
    # ---- Dealer (heavy LLM)
    ToolIdentity(
        capability="deal_scenario",
        category="heavy",
        intent="Generate a fresh options trading scenario and open a journal entry",
    ),
    ToolIdentity(
        capability="ask_tip",
        category="write",
        intent="Get a Socratic, non-spoiler hint on the open scenario",
    ),
    # ---- Judge (heavy LLM)
    ToolIdentity(
        capability="judge_trade",
        category="heavy",
        intent="Evaluate the trainee's trade across five dimensions and parse trade legs",
    ),
    # ---- Journal CRUD (Neon)
    ToolIdentity(
        capability="save_draft",
        category="write",
        intent="Persist a draft trade proposal without running the judge",
    ),
    ToolIdentity(
        capability="list_journal",
        category="read",
        intent="Paginated list of the patron's past journal entries",
    ),
    ToolIdentity(
        capability="get_journal",
        category="read",
        intent="Fetch a single journal entry including scenario + evaluation",
    ),
    ToolIdentity(
        capability="delete_journal",
        category="write",
        intent="Hard-delete a journal entry and recompute the leaderboard",
    ),
    # ---- Leaderboard
    ToolIdentity(
        capability="get_leaderboard",
        category="read",
        intent="Global leaderboard with optional mode/difficulty scope",
    ),
    ToolIdentity(
        capability="get_my_rank",
        category="read",
        intent="The caller's rank and stats under a chosen sort",
    ),
    ToolIdentity(
        capability="set_display_name",
        category="write",
        intent="Set the caller's display name on the leaderboard",
    ),
    # ---- Transparency
    ToolIdentity(
        capability="get_api_usage_stats",
        category="read",
        intent="Aggregated Claude API token usage per model, scoped to the caller",
    ),
]

TOOL_REGISTRY: dict[str, ToolIdentity] = {ti.tool_id: ti for ti in _DOMAIN_TOOLS}


runtime = OperatorRuntime(
    tool_registry={**STANDARD_IDENTITIES, **TOOL_REGISTRY},
    operator_credential_template=CredentialTemplate(
        service="optionality-mcp-operator",
        version=2,
        description=(
            "Operator credentials for Anthropic Claude (dealer + judge LLM "
            "calls) and BTCPay Lightning (patron credit purchases)."
        ),
        fields={
            "anthropic_api_key": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "Operator's Anthropic API key. Used for server-side "
                    "Claude calls when patrons invoke `deal_scenario`, "
                    "`judge_trade`, or `ask_tip`."
                ),
            ),
            "btcpay_host": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "URL of the operator's BTCPay Server (e.g. "
                    "https://btcpay.example.com)."
                ),
            ),
            "btcpay_api_key": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "BTCPay Server API key. Generate in BTCPay under "
                    "Account > Manage Account > API Keys."
                ),
            ),
            "btcpay_store_id": FieldSpec(
                required=True,
                sensitive=True,
                description="BTCPay Store ID (Stores > Settings > General).",
            ),
        },
    ),
    operator_credential_greeting=(
        "Hi — I'm Optionality MCP, an AI-judged options trading drill. "
        "You (or your AI agent) requested a credential channel."
    ),
    service_name="Optionality MCP",
    credential_validator=None,
)


tool = register_standard_tools(
    mcp,
    "optionality",
    runtime,
    service_name="optionality-mcp",
    service_version=__version__,
)


# ---------------------------------------------------------------------------
# Domain tools — thin shells that delegate to tools.*
# ---------------------------------------------------------------------------


@tool
@runtime.paid_tool(capability_uuid("deal_scenario"))
async def deal_scenario(
    mode: str,
    difficulty: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Generate a fresh options trading scenario and open a journal entry.

    Args:
        mode: ``historical`` | ``fiction`` | ``live`` — controls how the
            dealer LLM grounds the scenario. ``live`` uses Anthropic's
            web_search tool and costs more tokens.
        difficulty: ``apprentice`` | ``journeyman`` | ``adept`` | ``sovereign``.
    """
    from tools.dealer import deal_scenario as _impl
    return await _impl(npub=npub, mode=mode, difficulty=difficulty)


@tool
@runtime.paid_tool(capability_uuid("ask_tip"))
async def ask_tip(
    entry_id: str,
    question: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Get a non-spoiler Socratic hint for an open journal entry."""
    from tools.dealer import ask_tip as _impl
    return await _impl(npub=npub, entry_id=entry_id, question=question)


@tool
@runtime.paid_tool(capability_uuid("judge_trade"))
async def judge_trade(
    entry_id: str,
    trade_proposal: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Evaluate the trainee's trade. Persists evaluation, parses legs, recomputes leaderboard."""
    from tools.judge import judge_trade as _impl
    return await _impl(npub=npub, entry_id=entry_id, trade_proposal=trade_proposal)


@tool
@runtime.paid_tool(capability_uuid("save_draft"))
async def save_draft(
    entry_id: str,
    trade_proposal: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Persist a draft trade proposal without running the judge."""
    from tools.journal import save_draft as _impl
    return await _impl(npub=npub, entry_id=entry_id, trade_proposal=trade_proposal)


@tool
@runtime.paid_tool(capability_uuid("list_journal"))
async def list_journal(
    status: str = "",
    limit: int = 50,
    before: str = "",
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Paginated list of the caller's journal entries, newest first.

    Args:
        status:  Optional. ``open`` | ``submitted`` | ``evaluated`` | ``abandoned``.
        limit:   1..200 (default 50).
        before:  Optional ISO timestamp for "load more" pagination.
    """
    from tools.journal import list_journal as _impl
    return await _impl(npub=npub, status=status or None, limit=limit, before=before or None)


@tool
@runtime.paid_tool(capability_uuid("get_journal"))
async def get_journal(
    entry_id: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Return the full journal entry including scenario + evaluation."""
    from tools.journal import get_journal as _impl
    return await _impl(npub=npub, entry_id=entry_id)


@tool
@runtime.paid_tool(capability_uuid("delete_journal"))
async def delete_journal(
    entry_id: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Hard-delete a journal entry and recompute the leaderboard cache."""
    from tools.journal import delete_journal as _impl
    return await _impl(npub=npub, entry_id=entry_id)


@tool
@runtime.paid_tool(capability_uuid("get_leaderboard"))
async def get_leaderboard(
    sort_by: str = "avg",
    limit: int = 25,
    scope: str = "",
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Global leaderboard ordered by ``sort_by``.

    Args:
        sort_by: ``avg`` | ``best`` | ``streak`` | ``played`` | ``recent``.
        limit:   1..200 (default 25).
        scope:   Optional filter ``"mode=historical"`` or
            ``"difficulty=adept"`` to restrict to one bucket of the cache.
    """
    from tools.leaderboard import get_leaderboard as _impl
    return await _impl(npub=npub, sort_by=sort_by, limit=limit, scope=scope)


@tool
@runtime.paid_tool(capability_uuid("get_my_rank"))
async def get_my_rank(
    sort_by: str = "avg",
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """The caller's leaderboard row plus their ordinal rank under ``sort_by``."""
    from tools.leaderboard import get_my_rank as _impl
    return await _impl(npub=npub, sort_by=sort_by)


@tool
@runtime.paid_tool(capability_uuid("set_display_name"))
async def set_display_name(
    name: str,
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Set the caller's display name on the leaderboard. 1..32 chars, unicode allowed."""
    from tools.leaderboard import set_display_name as _impl
    return await _impl(npub=npub, name=name)


@tool
@runtime.paid_tool(capability_uuid("get_api_usage_stats"))
async def get_api_usage_stats(
    npub: NpubField = "",
    proof: str = "",
) -> dict[str, Any]:
    """Aggregated Claude API token usage for this patron's calls.

    Returns ``{"models": [{"model", "runs", "total_calls",
    "total_input_tokens", "total_output_tokens"}, ...]}``. One row per
    distinct model the patron's tool calls have invoked. The FE multiplies
    by Anthropic's published per-million pricing to show estimated USD
    cost and the sats equivalent — same transparency view as taxsort-mcp.
    """
    from db.usage import get_usage_stats
    return await get_usage_stats(npub=npub)


def main() -> None:
    """Main entry point for the server."""
    from tollbooth import validate_operator_tools

    missing = validate_operator_tools(mcp, "optionality")
    if missing:
        import sys

        print(
            f"⚠ Missing base-catalog tools: {', '.join(missing)}",
            file=sys.stderr,
        )
    mcp.run()


if __name__ == "__main__":
    main()
