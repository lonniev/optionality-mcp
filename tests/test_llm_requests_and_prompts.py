"""Tests for the LLM request builder, error curation, and prompt preparation.

These once covered a second, detached execution path: the LLM call ran off a
sealed ``http_request`` spec in a generic Prefect flow, and the result was
settled back by each job's ``shape_result``. That apparatus existed only because
the flow could not run this module's code. tollbooth-dpyc 0.82.0 deleted it when
detached compute moved to Modal, which spawns the runner itself, so the tests
for the sealed spec and its settling half went with it.

What remains is the machinery both paths always shared and the single path still
uses: building a well-formed provider request, curating an upstream failure into
a refundable situation, and preparing prompts.
"""

from __future__ import annotations

from datetime import UTC
from unittest.mock import AsyncMock, patch

import pytest
from tollbooth.llm_route import error_message

import llm
from llm import (
    build_llm_request,
    response_text_from_json,
    situation_from_status,
)

# ── request builder ──────────────────────────────────────────────────────────

def test_build_llm_request_shape_and_bounds() -> None:
    from tollbooth.llm_route import model_for, resolve_route

    req = build_llm_request(
        api_key="sk-test", prompt="hello", system="SYS",
        max_tokens=1234, timeout_seconds=90,
    )
    assert req["method"] == "POST"
    assert req["url"] == resolve_route(api_key="x").endpoint
    assert req["headers"]["x-api-key"] == "sk-test"
    assert req["headers"]["anthropic-version"] == "2023-06-01"
    assert req["json"]["model"] == model_for(llm.TIER_DRILL)
    assert req["json"]["max_tokens"] == 1234
    assert req["json"]["system"] == "SYS"
    assert req["json"]["messages"] == [{"role": "user", "content": "hello"}]
    assert "tools" not in req["json"]              # no web search unless asked
    assert req["timeout"] == 90.0                  # clamped job budget


def test_build_llm_request_web_search_and_empty_prompt() -> None:
    req = build_llm_request(
        api_key="k", prompt="q", system="s", max_tokens=100, enable_web_search=True,
    )
    assert req["json"]["tools"] == [llm.WEB_SEARCH_TOOL]
    with pytest.raises(ValueError):
        build_llm_request(api_key="k", prompt="   ", system="s", max_tokens=10)


# ── raw-response parsing ─────────────────────────────────────────────────────

def test_response_text_from_json_joins_text_blocks() -> None:
    body = {"content": [
        {"type": "text", "text": "one"},
        {"type": "tool_use", "id": "x"},          # non-text block ignored
        {"type": "text", "text": "two"},
    ]}
    assert response_text_from_json(body) == "one\ntwo"
    assert response_text_from_json({"content": []}) == ""
    assert response_text_from_json(None) == ""


def test_error_message_extraction() -> None:
    assert error_message(
        {"error": {"message": "credit balance too low"}}
    ) == "credit balance too low"
    assert error_message({"nope": 1}) == ""
    assert error_message("string body") == ""


# ── situation mapping (shared by both paths) ─────────────────────────────────

def test_situation_from_status_reads_either_providers_wording() -> None:
    # One lab reports an empty account as a 400 naming the credit balance; a model
    # router reports it as a 402 saying "Insufficient credits". Both are the same
    # condition, and both must be non-transient + alertable.
    assert situation_from_status(402, "Insufficient credits").error_code == "operator_llm_unfunded"
    unfunded = situation_from_status(400, "Your credit balance is too low")
    assert unfunded.error_code == "operator_llm_unfunded"
    assert unfunded.transient is False
    assert situation_from_status(401, "bad").error_code == "operator_llm_auth"
    rl = situation_from_status(429, "slow")
    assert rl.error_code == "upstream_rate_limited" and rl.transient is True
    generic = situation_from_status(500, "boom")
    assert generic.error_code == "llm_unavailable" and generic.transient is True


async def test_prepare_deal_live_grounds_prompt_in_the_real_date() -> None:
    """LIVE mode must assert the operator's real date so the model can't anchor
    to its training cutoff and date a scenario a year in the past."""
    from datetime import datetime

    from tools import dealer

    today_iso = datetime.now(UTC).strftime("%Y-%m-%d")

    with patch("db.patrons.upsert_patron", AsyncMock()), patch(
        "db.journal.recent_tickers", AsyncMock(return_value=[]),
    ):
        live = await dealer._prepare_deal("n", "live", "apprentice", None, "energy")

    assert live["enable_web_search"] is True
    assert today_iso in live["prompt"]                       # the real date is asserted
    assert f"current as of {today_iso}" in live["prompt"]    # web_search anchored to it
    assert "trust it over your training data" in live["prompt"]

    with patch("db.patrons.upsert_patron", AsyncMock()), patch(
        "db.journal.recent_tickers", AsyncMock(return_value=[]),
    ):
        hist = await dealer._prepare_deal("n", "historical", "adept", None, "")

    assert hist["enable_web_search"] is False
    assert today_iso in hist["prompt"]                       # date still provided…
    assert "trust it over your training data" not in hist["prompt"]  # …but no live clause


def test_precheck_tip_question_guards_degenerate_input() -> None:
    from tools.dealer import MAX_TIP_QUESTION_CHARS, precheck_tip_question

    assert precheck_tip_question("")["tip"]                       # empty → nudge
    assert precheck_tip_question("   ")["tip"]
    assert precheck_tip_question("x" * (MAX_TIP_QUESTION_CHARS + 1))["tip"]
    assert precheck_tip_question("What's the catalyst?") is None  # real → to LLM


# ── live-mode budget: sized against an UNBOUNDED search fan-out ──────────────

async def test_live_budget_covers_the_search_tail_not_the_median() -> None:
    """`max_uses` is dropped by the model router (measured 2026-07-28: a request
    declaring 1 ran eight searches). The 360s budget was sized when that cap held,
    and a live sovereign deal timed out against it. The budget must now cover the
    tail, and must stay under the job's max_runtime so a genuine stall still fails
    into a refundable situation rather than being reclaimed mid-flight."""
    from unittest.mock import AsyncMock, patch

    from tools import dealer

    with patch("db.patrons.upsert_patron", AsyncMock()), patch(
        "db.journal.recent_tickers", AsyncMock(return_value=[])
    ):
        live = await dealer._prepare_deal(
            npub="n", mode="live", difficulty="sovereign", max_loss_usd=None, sector="",
        )
        dry = await dealer._prepare_deal(
            npub="n", mode="historical", difficulty="sovereign", max_loss_usd=None, sector="",
        )

    assert live["enable_web_search"] is True
    assert dry["enable_web_search"] is False
    # Longer than the observed tail, and well past the old 360s that timed out.
    assert live["timeout_seconds"] >= 600
    # A dry generation does no searching and must not inherit the grounded budget.
    assert dry["timeout_seconds"] <= 180


def test_live_prompt_names_the_facts_and_forbids_answering_from_memory() -> None:
    """Capping the search COUNT was tried and rejected — the model obeys, then
    fills the gaps from training data and dates the scenario a year stale without
    saying so. The instruction must instead name what to find and when to stop."""
    import prompts

    live = prompts.MODE_INSTRUCTIONS["live"]
    assert live is prompts.SCENARIO_LIVE
    low = live.lower()
    assert "stop" in low                      # an explicit finish line
    assert "stale" in low                     # names the failure it is preventing
    assert "do not search for" in low         # excludes what needs no research
    # An honest gap beats a confident wrong number.
    assert "skew_note" in live
