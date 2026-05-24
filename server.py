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

__version__ = "0.1.1"

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
    # Pricing: base 1 sat × difficulty × historicity. Apprentice/Fiction
    # = 1 sat (cheapest dry-run); Sovereign/Live = 1 × 4 × 10 = 40 sats
    # (real-tape regime-change drill, expensive Anthropic web_search call).
    # The FE renders the effective price via check_price(tool_kwargs) so
    # the patron sees what their selections cost before committing.
    ToolIdentity(
        capability="deal_scenario",
        category="heavy",
        intent="Generate a fresh options trading scenario and open a journal entry",
        pricing_hint_value=1,
        pricing_hint_multipliers=(
            ("difficulty", (
                ("apprentice", 1.0),
                ("journeyman", 2.0),
                ("adept", 3.0),
                ("sovereign", 4.0),
            )),
            ("mode", (
                ("fiction", 1.0),
                ("historical", 5.0),
                ("live", 10.0),
            )),
        ),
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
    # Flat 1 sat — covers a single Neon round-trip; transparent fee for
    # parking an in-progress draft.
    ToolIdentity(
        capability="save_draft",
        category="write",
        intent="Persist a draft trade proposal without running the judge",
        pricing_hint_value=1,
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
    # ---- Transparency — free so checking the usage view doesn't itself
    # cost sats. Matches taxsort-mcp's pricing for the parallel tool.
    ToolIdentity(
        capability="get_api_usage_stats",
        category="free",
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
# Temporary diagnostic — remove after multiplier seed bug is resolved
# ---------------------------------------------------------------------------


@tool
async def _debug_pricing_seed() -> dict[str, Any]:
    """One-shot diagnostic: trace multiplier flow through the PricingModel round-trip."""
    import json
    from tollbooth.runtime import _build_initial_pricing_model
    from tollbooth.pricing_model import PricingModel

    deal_id = capability_uuid("deal_scenario")
    out: dict[str, Any] = {}

    seed = _build_initial_pricing_model(runtime, "optionality-mcp")
    seed_deal = next((t for t in json.loads(seed)["tools"] if t["tool_id"] == deal_id), None)
    out["1_seed_has_multipliers"] = bool(seed_deal and seed_deal.get("multipliers"))

    model = PricingModel.from_json(seed, model_id="", operator=runtime.operator_npub() or "")
    deal_tp = next((tp for tp in model.tools if tp.tool_id == deal_id), None)
    out["2_after_from_json_multipliers_attr"] = repr(getattr(deal_tp, "multipliers", "TP_MISSING"))
    out["2_toolprice_class"] = type(deal_tp).__name__ if deal_tp else None
    out["2_toolprice_fields"] = list(deal_tp.__dataclass_fields__.keys()) if deal_tp else None

    stored_json = model.to_json()
    out["3_stored_json_has_multipliers_string"] = "multipliers" in stored_json
    stored_deal = next((t for t in json.loads(stored_json)["tools"] if t["tool_id"] == deal_id), None)
    out["3_stored_deal_entry"] = stored_deal

    model2 = PricingModel.from_json(stored_json)
    deal_tp2 = next((tp for tp in model2.tools if tp.tool_id == deal_id), None)
    out["4_reread_multipliers"] = repr(getattr(deal_tp2, "multipliers", "TP_MISSING"))
    out["4_to_dict"] = deal_tp2.to_dict() if deal_tp2 else None

    # Step 5: write to Neon via the pricing store, read back, compare
    try:
        vault = await runtime.vault()
        from tollbooth.pricing_store import PricingModelStore
        store = PricingModelStore(neon_vault=vault)
        await store.ensure_schema()

        model.operator = runtime.operator_npub()
        model.name = "DEBUG-MULTIPLIER-PROBE"
        new_id = await store.create_model(model)
        out["5_neon_create_returned_id"] = new_id

        # Read the row back raw
        raw = await vault._execute(
            f"SELECT model_json FROM {store._t('operator_pricing_models')} WHERE id = $1::uuid",
            [new_id],
        )
        rows = raw.get("rows", [])
        if rows:
            mj = rows[0]["model_json"]
            out["5_neon_model_json_type"] = type(mj).__name__
            if isinstance(mj, str):
                parsed = json.loads(mj)
            else:
                parsed = mj
            neon_deal = next((t for t in parsed.get("tools", []) if t.get("tool_id") == deal_id), None)
            out["5_neon_deal_entry"] = neon_deal
            out["5_neon_deal_has_multipliers"] = bool(neon_deal and neon_deal.get("multipliers"))

        # Clean up the debug row
        await vault._execute(
            f"DELETE FROM {store._t('operator_pricing_models')} WHERE id = $1::uuid",
            [new_id],
        )
        out["5_cleanup"] = "ok"
    except Exception as e:
        out["5_error"] = f"{type(e).__name__}: {e}"

    return out


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
