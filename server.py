"""Optionality MCP — server entry point.

A FastMCP SSE server that backs the Optionality options-trading drill UI.
Deploy marker: list_journal sort/group/page schema (2026-06-08).
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

from tollbooth.credential_templates import (
    LONGRUNNER_CREDENTIAL_FIELDS,
    CredentialTemplate,
    FieldSpec,
)
from tollbooth.runtime import OperatorRuntime, register_standard_tools
from tollbooth.tool_identity import STANDARD_IDENTITIES, ToolIdentity, capability_uuid
from tollbooth.version import resolve_service_version

__version__ = resolve_service_version("optionality-mcp", __file__)

logger = logging.getLogger(__name__)


_NPUB_DOC = "Required. Your Nostr public key (npub1...) for credit billing."

NpubField = Annotated[str, Field(description=_NPUB_DOC)]


mcp = FastMCP(
    "optionality-mcp",
    instructions=(
        "Optionality MCP — an AI-judged options trading drill, monetized "
        "via Tollbooth DPYC Bitcoin Lightning micropayments.\n\n"
        "## What it does\n"
        "The Firm composes options trading opportunities; the trainee writes "
        "a free-text trade pitch; a judge LLM evaluates the pitch across five "
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


# Frozen UUIDs — declared once at tool birth and never changed.
# Renaming function names, capability labels, or any display field
# below leaves the pricing-model rows in Neon keyed correctly.
DEAL_SCENARIO_UUID         = "3aaf11e4-1594-570d-9a6f-f45dab0ecf0f"
ASK_TIP_UUID               = "b25f82c6-a414-52bd-b829-90fbbc340afa"
JUDGE_TRADE_UUID           = "2d4f4988-8199-5753-9ed2-17f458b0d17a"
FETCH_SCENARIO_UUID        = "3977ac56-6e16-5916-bf36-267a6529dc87"
FETCH_TIP_UUID             = "f7b8cb59-fc29-53d4-ae64-9c902f9f3415"
FETCH_JUDGEMENT_UUID       = "cf4dedc4-90b3-5dcb-b097-b0c9148d84bf"
SAVE_DRAFT_UUID            = "54060513-452a-5846-a68b-3aa5c973a0f5"
LIST_JOURNAL_UUID          = "df86ea6b-4361-59db-a2ac-c30d1bf81abb"
GET_JOURNAL_UUID           = "c28c0078-f58e-55da-ae61-15ff0f9e8641"
DELETE_JOURNAL_UUID        = "bfd56e01-77b7-5b7b-b2fc-c81bef985a25"
SHARE_ENTRY_UUID           = "6accf6b4-617e-5727-9337-1df52729c116"
GET_SHARED_ENTRIES_UUID    = "d3d20dc0-20de-59ac-9188-22b472fd82a1"
GET_LEADERBOARD_UUID       = "e6605c8c-190f-57c8-9754-ca0ab1e8fc5e"
GET_MY_RANK_UUID           = "d8817936-afa5-5e6a-a919-ce71a3500dae"
SET_DISPLAY_NAME_UUID      = "a57d69bb-79cf-5f2a-9b15-031589d7d62d"
GET_PATRON_PROFILE_UUID    = "fcf05c7e-40c6-5347-ac2c-71e6cceb9607"
SET_PROFILE_UUID           = "0f1d5cbb-3277-5d9b-bbc3-4ad17779c80d"
ESCROW_NSEC_UUID           = "60f0f7dc-d669-5b91-a742-6d1e21f16730"
WITHDRAW_NSEC_UUID         = "7dff25a2-ac19-551f-882f-33a69a0b429d"
SEND_PATRON_DM_UUID        = "e42208e1-1d24-5bdb-b72f-22f5d14a92aa"
GET_ESCROW_STATUS_UUID     = "156997e1-eea3-544a-a1b2-cd80491aaefe"
GET_API_USAGE_STATS_UUID   = "3d10ca59-8279-5c98-af7d-301bf469c6c1"


_DOMAIN_TOOLS: list[ToolIdentity] = [
    # ---- Dealer (heavy LLM)
    # Pricing: base 1 sat × difficulty × historicity. Apprentice/Fiction
    # = 1 sat (cheapest dry-run); Sovereign/Live = 1 × 4 × 10 = 40 sats
    # (real-tape regime-change drill, expensive Anthropic web_search call).
    # The FE renders the effective price via check_price(tool_kwargs) so
    # the patron sees what their selections cost before committing.
    ToolIdentity(
        tool_id=DEAL_SCENARIO_UUID,
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
                # Replay an evaluated entry as a fresh mulligan attempt.
                # Not a starting choice in The Pit — only reached via
                # "Redo Again" on a journal row. Priced as a parity tier
                # with apprentice so the patron isn't double-charged for
                # the same scenario at a premium rate.
                ("mulligan", 1.0),
            )),
            ("mode", (
                ("fiction", 1.0),
                ("historical", 5.0),
                ("live", 10.0),
            )),
        ),
    ),
    ToolIdentity(
        tool_id=ASK_TIP_UUID,
        capability="ask_tip",
        category="write",
        intent="Get a Socratic, non-spoiler hint on the open scenario",
    ),
    # ---- Judge (heavy LLM)
    ToolIdentity(
        tool_id=JUDGE_TRADE_UUID,
        capability="judge_trade",
        category="heavy",
        intent="Evaluate the trainee's trade across five dimensions and parse trade legs",
    ),
    # ---- Claim-check companions. The three LLM tools above return a
    # claim check instead of the end item (the LLM round-trip outlives
    # client timeouts); these free companions redeem the claim. Fee was
    # already assessed on the start call — collecting the output is free.
    ToolIdentity(
        tool_id=FETCH_SCENARIO_UUID,
        capability="fetch_scenario",
        category="free",
        intent="Redeem a deal_scenario claim check for the generated scenario",
    ),
    ToolIdentity(
        tool_id=FETCH_TIP_UUID,
        capability="fetch_tip",
        category="free",
        intent="Redeem an ask_tip claim check for the Socratic hint",
    ),
    ToolIdentity(
        tool_id=FETCH_JUDGEMENT_UUID,
        capability="fetch_judgement",
        category="free",
        intent="Redeem a judge_trade claim check for the evaluation",
    ),
    # ---- Journal CRUD (Neon)
    # Flat 1 sat — covers a single Neon round-trip; transparent fee for
    # parking an in-progress draft.
    ToolIdentity(
        tool_id=SAVE_DRAFT_UUID,
        capability="save_draft",
        category="write",
        intent="Persist a draft trade proposal without running the judge",
        pricing_hint_value=1,
    ),
    ToolIdentity(
        tool_id=LIST_JOURNAL_UUID,
        capability="list_journal",
        category="read",
        intent="Paginated list of the patron's past journal entries",
    ),
    ToolIdentity(
        tool_id=GET_JOURNAL_UUID,
        capability="get_journal",
        category="read",
        intent="Fetch a single journal entry including scenario + evaluation",
    ),
    ToolIdentity(
        tool_id=DELETE_JOURNAL_UUID,
        capability="delete_journal",
        category="write",
        intent="Hard-delete a journal entry and recompute the leaderboard",
    ),
    ToolIdentity(
        tool_id=SHARE_ENTRY_UUID,
        capability="share_entry",
        category="write",
        intent="Toggle a journal entry's share flag so peers can see it under the patron's leaderboard row",
        pricing_hint_value=0,
    ),
    ToolIdentity(
        tool_id=GET_SHARED_ENTRIES_UUID,
        capability="get_shared_entries",
        category="read",
        intent="List a target patron's shared, evaluated entries — public peer-learning read",
        pricing_hint_value=0,
    ),
    # ---- Leaderboard
    ToolIdentity(
        tool_id=GET_LEADERBOARD_UUID,
        capability="get_leaderboard",
        category="read",
        intent="Global leaderboard with optional mode/difficulty scope",
    ),
    ToolIdentity(
        tool_id=GET_MY_RANK_UUID,
        capability="get_my_rank",
        category="read",
        intent="The caller's rank and stats under a chosen sort",
    ),
    ToolIdentity(
        tool_id=SET_DISPLAY_NAME_UUID,
        capability="set_display_name",
        category="write",
        intent="Set the caller's display name on the leaderboard",
    ),
    # ---- Profile (avatar / bio / relays) — free reads and writes so a
    # patron setting up their profile doesn't burn sats they meant to
    # use playing. Visible on the leaderboard and the soon-to-arrive
    # patron-to-patron Nostr DM affordance.
    ToolIdentity(
        tool_id=GET_PATRON_PROFILE_UUID,
        capability="get_patron_profile",
        category="free",
        intent="Read the caller's profile — display name, avatar, bio, preferred relays",
    ),
    ToolIdentity(
        tool_id=SET_PROFILE_UUID,
        capability="set_profile",
        category="free",
        intent="Update any subset of the caller's profile fields",
    ),
    # ---- Opt-in nsec escrow + operator-signed DMs. Lets patrons who
    # generate a fresh game-persona keypair hand the nsec to Optionality
    # so the operator can sign Nostr DMs on their behalf (iPad-friendly,
    # no signer-extension required). Same custody posture as Anthropic
    # api_key — AES-256-GCM at rest, decrypted only in-process during
    # signing. See tools/escrow.py for the full trade-off discussion.
    ToolIdentity(
        tool_id=ESCROW_NSEC_UUID,
        capability="escrow_nsec",
        category="free",
        intent="Deposit a freshly-generated nsec for operator-managed Nostr signing",
    ),
    ToolIdentity(
        tool_id=WITHDRAW_NSEC_UUID,
        capability="withdraw_nsec",
        category="free",
        intent="Return the plaintext nsec once and remove it from operator storage",
    ),
    ToolIdentity(
        tool_id=SEND_PATRON_DM_UUID,
        capability="send_patron_dm",
        category="write",
        intent="Sign and publish a Nostr DM as the patron using the escrowed nsec",
        # 5 sats per DM: pays for the operator's relay fan-out plus a
        # mild anti-spam friction. Operators can override in Studio.
        pricing_hint_value=5,
    ),
    ToolIdentity(
        tool_id=GET_ESCROW_STATUS_UUID,
        capability="get_escrow_status",
        category="free",
        intent="Quick presence check for whether the patron has an escrowed nsec",
    ),
    # ---- Transparency — free so checking the usage view doesn't itself
    # cost sats. Matches taxsort-mcp's pricing for the parallel tool.
    ToolIdentity(
        tool_id=GET_API_USAGE_STATS_UUID,
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
        version=3,
        description=(
            "Operator credentials for Anthropic Claude (dealer + judge LLM "
            "calls) and BTCPay Lightning (patron credit purchases). Optional "
            "dpyc-longrunner fields enable durable detached execution of the "
            "LLM jobs (survives a container recycle)."
        ),
        fields={
            **LONGRUNNER_CREDENTIAL_FIELDS,
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
    dpop_token: str = "",
    max_loss_usd: int | None = None,
    replay_entry_id: str | None = None,
    sector: str = "",
) -> dict[str, Any]:
    """Generate a fresh options trading scenario and open a journal entry.

    Args:
        mode: ``historical`` | ``fiction`` | ``live`` — controls how the
            Firm grounds the scenario. ``live`` uses Anthropic's web_search
            tool and costs more tokens.
        difficulty: ``apprentice`` | ``journeyman`` | ``adept`` | ``sovereign``
            for a fresh opportunity; ``mulligan`` only paired with replay_entry_id.
        max_loss_usd: Optional per-trade risk envelope in USD. When set, the
            Firm sizes the constraints (account size, sizing limits) so a
            thoughtful structure can fit the budget. Useful for trainees who
            reason better about $250 than $10,000 versions of the same trade.
        replay_entry_id: Optional id of an evaluated journal entry. When set,
            the wheel reissues that entry's scenario as a new play, forcing
            mode="historical" and difficulty="mulligan". Skips the LLM call —
            no new generation cost, just the operator's toll per the pricing
            model. The new play is journaled as its own entry; the original
            is untouched.
        sector: Optional market-sector hint (e.g., ``"biotech"``, ``"semis"``,
            ``"banks"``). When set, the Firm picks the underlying ticker from
            that sector and tailors catalysts / relevant_facts / red_herrings
            to its dynamics. Empty string = no constraint, Firm picks freely.
            Ignored on replays (the original scenario's ticker is reused).

    Returns a **claim check**, not the scenario — generation outlives MCP
    client timeouts, so it runs concurrently. Redeem the ``claim_check``
    with ``optionality_fetch_scenario``, polling until ``status`` is
    ``done``. Results expire after a short while; start a new request if
    your claim expires.

    A **replay** (``replay_entry_id`` set) is deterministic — no LLM — so it
    returns the settled result directly (``status: "done"`` with no claim
    check) instead of a claim to poll.
    """
    if replay_entry_id:
        from tools.dealer import replay_scenario
        return await replay_scenario(
            npub=npub, replay_entry_id=replay_entry_id, max_loss_usd=max_loss_usd
        )
    # Budget-aware poll cadence: live mode runs web_search and takes longer.
    # Mirrors the LLM timeout the runner enforces (tools/dealer.py).
    expected = 300 if mode == "live" else 120
    resp = await runtime.start_async_job(
        "deal_scenario",
        npub,
        {
            "npub": npub,
            "mode": mode,
            "difficulty": difficulty,
            "max_loss_usd": max_loss_usd,
            "sector": sector,
        },
        tool_id=DEAL_SCENARIO_UUID,
        # Live + web_search on a cold Prefect Managed worker (~40-50s spin-up)
        # legitimately runs several minutes; give the job room to finish before
        # the watchdog reclaims it, and keep a finished result claimable long
        # enough for a patron who wandered off to come back for it.
        max_runtime_seconds=420,
        result_ttl_seconds=1200,
        expected_seconds=expected,
    )
    # Echo the time budget to the client only while there's a claim to wait on,
    # so the waiting UI can show an honest ETA countdown (the Firm's estimate,
    # not a ceiling). A synchronous terminal response has nothing to wait for.
    if resp.get("status") == "pending":
        resp.setdefault("expected_seconds", expected)
    return resp


@tool
@runtime.paid_tool(capability_uuid("fetch_scenario"))
async def fetch_scenario(
    claim_check: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Redeem a deal_scenario claim check.

    Free. While ``status`` is ``running``, wait ``poll_after_seconds`` and
    call again. When ``done``, ``result`` holds the deal_scenario response
    (``entry_id`` + ``scenario``). ``expired`` means the claim is unknown
    or its result aged out — start a new deal_scenario request.
    """
    return await runtime.fetch_async_job(claim_check, npub)


@tool
@runtime.paid_tool(capability_uuid("ask_tip"))
async def ask_tip(
    entry_id: str,
    question: str,
    history: str = "",
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Get a non-spoiler Socratic hint for an open journal entry.

    history is an optional JSON-encoded array of prior {question, answer}
    turns from this clue conversation, so follow-on questions have
    context. The wheel caps it hard, so oversupplying gains nothing.

    Returns a **claim check**, not the hint. Redeem the ``claim_check``
    with ``optionality_fetch_tip``, polling until ``status`` is ``done``.

    A degenerate question (empty or oversized) needs no LLM, so it returns a
    settled ``{status: "done"}`` nudge directly instead of a claim to poll.
    """
    from tools.dealer import precheck_tip_question
    canned = precheck_tip_question(question)
    if canned is not None:
        return {"success": True, "status": "done", "result": canned}
    return await runtime.start_async_job(
        "ask_tip",
        npub,
        {
            "npub": npub,
            "entry_id": entry_id,
            "question": question,
            "history": history,
        },
        tool_id=ASK_TIP_UUID,
        max_runtime_seconds=180,
        result_ttl_seconds=900,
        expected_seconds=120,
    )


@tool
@runtime.paid_tool(capability_uuid("fetch_tip"))
async def fetch_tip(
    claim_check: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Redeem an ask_tip claim check.

    Free. While ``status`` is ``running``, wait ``poll_after_seconds`` and
    call again. When ``done``, ``result`` holds the ask_tip response
    (``tip``). ``expired`` means the claim is unknown or its result aged
    out — ask again.
    """
    return await runtime.fetch_async_job(claim_check, npub)


@tool
@runtime.paid_tool(capability_uuid("judge_trade"))
async def judge_trade(
    entry_id: str,
    trade_proposal: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Evaluate the trainee's trade. Persists evaluation, parses legs, recomputes leaderboard.

    Returns a **claim check**, not the evaluation. Redeem the
    ``claim_check`` with ``optionality_fetch_judgement``, polling until
    ``status`` is ``done``.
    """
    return await runtime.start_async_job(
        "judge_trade",
        npub,
        {
            "npub": npub,
            "entry_id": entry_id,
            "trade_proposal": trade_proposal,
        },
        tool_id=JUDGE_TRADE_UUID,
        max_runtime_seconds=360,
        result_ttl_seconds=900,
        expected_seconds=240,
    )


@tool
@runtime.paid_tool(capability_uuid("fetch_judgement"))
async def fetch_judgement(
    claim_check: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Redeem a judge_trade claim check.

    Free. While ``status`` is ``running``, wait ``poll_after_seconds`` and
    call again. When ``done``, ``result`` holds the judge_trade response
    (``entry_id`` + ``evaluation``). ``expired`` means the claim is
    unknown or its result aged out — submit the trade again.
    """
    return await runtime.fetch_async_job(claim_check, npub)


@tool
@runtime.paid_tool(capability_uuid("save_draft"))
async def save_draft(
    entry_id: str,
    trade_proposal: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Persist a draft trade proposal without running the judge."""
    from tools.journal import save_draft as _impl
    return await _impl(npub=npub, entry_id=entry_id, trade_proposal=trade_proposal)


@tool
@runtime.paid_tool(capability_uuid("list_journal"))
async def list_journal(
    status: str = "",
    group_by: str = "none",
    group_sort: str = "asc",
    sort_col: str = "created",
    sort_dir: str = "desc",
    page: int = 0,
    page_size: int = 25,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Server-side sorted, grouped, paginated list of the caller's journal.

    Sorting and grouping are done in SQL, so each page is a slice of the
    fully-ordered dataset. Returns ``{total, page, page_size, groups,
    entries}``; ``groups`` carries per-group counts over the whole set.

    Args:
        status:     Optional. ``open`` | ``submitted`` | ``evaluated`` | ``abandoned``.
        group_by:   ``none`` | ``historicity`` | ``difficulty`` | ``symbol``.
        group_sort: Group order, ``asc`` | ``desc``.
        sort_col:   ``created`` | ``updated`` | ``symbol`` | ``historicity`` |
                    ``difficulty`` | ``grade`` | ``score`` | ``status``.
        sort_dir:   Row order, ``asc`` | ``desc``.
        page:       0-indexed page number.
        page_size:  Rows per page (1..200, default 25).
    """
    from tools.journal import list_journal as _impl
    return await _impl(
        npub=npub,
        status=status or None,
        group_by=group_by,
        group_sort=group_sort,
        sort_col=sort_col,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
    )


@tool
@runtime.paid_tool(capability_uuid("get_journal"))
async def get_journal(
    entry_id: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Return the full journal entry including scenario + evaluation."""
    from tools.journal import get_journal as _impl
    return await _impl(npub=npub, entry_id=entry_id)


@tool
@runtime.paid_tool(capability_uuid("delete_journal"))
async def delete_journal(
    entry_id: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Hard-delete a journal entry and recompute the leaderboard cache."""
    from tools.journal import delete_journal as _impl
    return await _impl(npub=npub, entry_id=entry_id)


@tool
@runtime.paid_tool(capability_uuid("share_entry"))
async def share_entry(
    entry_id: str,
    shared: bool = True,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Toggle a journal entry's share flag.

    Shared, evaluated entries appear under the patron's row on the
    public Leaderboard for peer learning. Priced at 0 sats — the social
    value of sharing is the point, not the revenue.

    Args:
        entry_id: UUID of the journal entry to toggle.
        shared:   True to share, False to unshare. Defaults to True.
    """
    from tools.journal import share_entry as _impl
    return await _impl(npub=npub, entry_id=entry_id, shared=shared)


@tool
async def get_shared_entries(
    target_npub: str,
    limit: int = 20,
) -> dict[str, Any]:
    """List a target patron's shared evaluated entries — newest first.

    Public, free read: anyone (including guests) can browse the trades
    a leaderboard peer has chosen to share. Eager-loads the evaluation
    and trade proposal so the FE can render the full assessment with
    no follow-up call. No npub/proof envelope — this is a bootstrap-style
    tool the FE invokes without identity injection.

    Args:
        target_npub: Whose shared entries to fetch.
        limit:       Max rows (1..50, default 20).
    """
    from tools.journal import get_shared_entries as _impl
    return await _impl(target_npub=target_npub, limit=limit)


@tool
@runtime.paid_tool(capability_uuid("get_leaderboard"))
async def get_leaderboard(
    sort_by: str = "avg",
    limit: int = 25,
    scope: str = "",
    npub: NpubField = "",
    dpop_token: str = "",
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
    dpop_token: str = "",
) -> dict[str, Any]:
    """The caller's leaderboard row plus their ordinal rank under ``sort_by``."""
    from tools.leaderboard import get_my_rank as _impl
    return await _impl(npub=npub, sort_by=sort_by)


@tool
@runtime.paid_tool(capability_uuid("set_display_name"))
async def set_display_name(
    name: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Set the caller's display name on the leaderboard. 1..32 chars, unicode allowed."""
    from tools.leaderboard import set_display_name as _impl
    return await _impl(npub=npub, name=name)


@tool
@runtime.paid_tool(capability_uuid("get_patron_profile"))
async def get_patron_profile(
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Return the caller's profile — display_name, avatar, bio, relays."""
    from tools.profile import get_patron_profile as _impl
    return await _impl(npub=npub)


@tool
@runtime.paid_tool(capability_uuid("set_profile"))
async def set_profile(
    display_name: str | None = None,
    avatar: str | None = None,
    bio: str | None = None,
    relays: str | None = None,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Update any subset of the caller's profile fields.

    Args:
        display_name: 1..32 chars, unicode allowed. Surfaces on leaderboard.
        avatar: Short token (single emoji glyph or alphanumeric tag).
        bio: 0..500 chars of free-form text. Empty string clears it.
        relays: JSON-stringified list of wss:// relay URLs (max 12).

    Any field left as ``None`` is a no-op — only fields explicitly
    provided get overwritten. Returns the full profile after the update
    so the caller can reconcile in one round-trip.
    """
    from tools.profile import set_profile as _impl
    return await _impl(
        npub=npub,
        display_name=display_name,
        avatar=avatar,
        bio=bio,
        relays=relays,
    )


@tool
@runtime.paid_tool(capability_uuid("escrow_nsec"))
async def escrow_nsec(
    nsec: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Deposit a freshly-generated nsec for operator-managed Nostr signing.

    Trade-off: sovereignty for UX. Optionality holds the nsec encrypted
    in Neon (AES-256-GCM, key derived from operator nsec). Until you
    withdraw it, the operator can sign Nostr DMs on your behalf. Use
    this only for fresh game-persona keypairs — never for an existing
    Nostr identity that lives elsewhere.

    The nsec MUST derive to the same npub that authenticated this call,
    or the deposit is rejected.
    """
    from tools.escrow import escrow_nsec as _impl
    return await _impl(npub=npub, nsec_bech32=nsec)


@tool
@runtime.paid_tool(capability_uuid("withdraw_nsec"))
async def withdraw_nsec(
    acknowledgment: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Return the plaintext nsec once and remove it from operator storage.

    Required acknowledgment string (exact match):
    "I understand I am now solely responsible for this nsec."

    After this call you regain full self-custody; the operator forgets
    the key. You're now responsible for stashing it in a Nostr client
    (0xchat, Damus, Amber) and signing DMs locally via NIP-07.
    """
    from tools.escrow import withdraw_nsec as _impl
    return await _impl(npub=npub, acknowledgment=acknowledgment)


@tool
@runtime.paid_tool(capability_uuid("send_patron_dm"))
async def send_patron_dm(
    target_npub: str,
    message: str,
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Sign and publish a Nostr DM as the patron, using the escrowed nsec.

    The patron's escrowed nsec is loaded, decrypted in-process, used to
    sign a kind-4 NIP-04 DM + a kind-1059 NIP-17 gift wrap, broadcast
    via the operator's relay pool, then the plaintext drops out of
    scope. The DM's `pubkey` is the patron's own — recipients see it
    as authored by the patron, not relayed.

    Returns {"success": True, "sender_npub", "target_npub"} on the
    happy path; {"success": False, "error"} on validation or send
    failure.
    """
    from tools.escrow import send_patron_dm as _impl
    return await _impl(npub=npub, target_npub=target_npub, message=message)


@tool
@runtime.paid_tool(capability_uuid("get_escrow_status"))
async def get_escrow_status(
    npub: NpubField = "",
    dpop_token: str = "",
) -> dict[str, Any]:
    """Return ``{"escrowed": bool}`` — whether Optionality holds the
    patron's nsec. Free; the FE polls this to render Withdraw vs
    Deposit affordances on the Profile page."""
    from tools.escrow import get_escrow_status as _impl
    return await _impl(npub=npub)


@tool
@runtime.paid_tool(capability_uuid("get_api_usage_stats"))
async def get_api_usage_stats(
    npub: NpubField = "",
    dpop_token: str = "",
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


# ---------------------------------------------------------------------------
# Claim-check job runners — the slow LLM work behind deal_scenario,
# ask_tip, and judge_trade. Registration by name (not closure) is what
# lets a fresh container resume a job orphaned by a serverless recycle.
# ---------------------------------------------------------------------------

from tools import dealer as _dealer  # noqa: E402
from tools import judge as _judge  # noqa: E402

# In-process runners resume a job orphaned by a serverless recycle only when a
# fresh container next polls it — fragile. The closure specs register the
# durable detached path for the SAME kind: once the operator couriers the
# dpyc-longrunner creds, the wheel auto-installs the Prefect executor and the
# LLM call runs OUTSIDE the request container, so a recycle can't orphan it.
# Until then the in-process runner serves (no regression). Each job's side
# effects live in a shared _finalize half, so they fire exactly once on
# whichever path runs — never both.
runtime.register_job_runner("deal_scenario", _dealer.deal_scenario)
runtime.register_job_runner("ask_tip", _dealer.ask_tip)
runtime.register_job_runner("judge_trade", _judge.judge_trade)

runtime.register_job_spec(
    "deal_scenario", _dealer.deal_build_closure, _dealer.deal_shape_result
)
runtime.register_job_spec(
    "ask_tip", _dealer.tip_build_closure, _dealer.tip_shape_result
)
runtime.register_job_spec(
    "judge_trade", _judge.build_closure, _judge.shape_result
)


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
