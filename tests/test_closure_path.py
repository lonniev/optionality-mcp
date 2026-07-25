"""Tests for the durable detached (closure) path of the LLM jobs.

These lock in the fix for "judge_trade never returned a terminal status": a
container recycle no longer orphans a job because the LLM call runs off a sealed
``http_request`` spec in a detached flow, and the result is settled back in the
MCP by each job's ``shape_result``. Both halves are unit-tested here without a
live Prefect executor — the wheel's own suite covers the SDK wiring.
"""

from __future__ import annotations

from datetime import UTC
from unittest.mock import AsyncMock, patch

import pytest
from tollbooth import AsyncJobSituation

import claude
from claude import (
    anthropic_error_message,
    build_anthropic_request,
    response_text_from_json,
    shape_llm_text,
    situation_from_status,
)

# ── request builder ──────────────────────────────────────────────────────────

def test_build_anthropic_request_shape_and_bounds() -> None:
    req = build_anthropic_request(
        api_key="sk-test", prompt="hello", system="SYS",
        max_tokens=1234, timeout_seconds=90,
    )
    assert req["method"] == "POST"
    assert req["url"] == claude._ANTHROPIC_ENDPOINT
    assert req["headers"]["x-api-key"] == "sk-test"
    assert req["headers"]["anthropic-version"] == "2023-06-01"
    assert req["json"]["model"] == claude.DEFAULT_MODEL
    assert req["json"]["max_tokens"] == 1234
    assert req["json"]["system"] == "SYS"
    assert req["json"]["messages"] == [{"role": "user", "content": "hello"}]
    assert "tools" not in req["json"]              # no web search unless asked
    assert req["timeout"] == 90.0                  # clamped job budget


def test_build_anthropic_request_web_search_and_empty_prompt() -> None:
    req = build_anthropic_request(
        api_key="k", prompt="q", system="s", max_tokens=100, enable_web_search=True,
    )
    assert req["json"]["tools"] == [claude.WEB_SEARCH_TOOL]
    with pytest.raises(ValueError):
        build_anthropic_request(api_key="k", prompt="   ", system="s", max_tokens=10)


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


def test_anthropic_error_message_extraction() -> None:
    assert anthropic_error_message(
        {"error": {"message": "credit balance too low"}}
    ) == "credit balance too low"
    assert anthropic_error_message({"nope": 1}) == ""
    assert anthropic_error_message("string body") == ""


# ── situation mapping (shared by both paths) ─────────────────────────────────

def test_situation_from_status_matches_provider_situation() -> None:
    # billing exhaustion is a 400 with a message match, non-transient + alertable
    unfunded = situation_from_status(400, "Your credit balance is too low")
    assert unfunded.error_code == "operator_llm_unfunded"
    assert unfunded.transient is False
    assert situation_from_status(401, "bad").error_code == "operator_llm_auth"
    rl = situation_from_status(429, "slow")
    assert rl.error_code == "upstream_rate_limited" and rl.transient is True
    generic = situation_from_status(500, "boom")
    assert generic.error_code == "llm_unavailable" and generic.transient is True


# ── shape_llm_text: settle a detached result ─────────────────────────────────

async def test_shape_llm_text_success_extracts_and_records_usage() -> None:
    raw = {"status": 200, "json": {
        "content": [{"type": "text", "text": "the answer"}],
        "usage": {"input_tokens": 11, "output_tokens": 22},
    }}
    with patch("db.usage.record_call", AsyncMock()) as rec:
        text = await shape_llm_text(raw, npub="npub1", tool="judge_trade")
    assert text == "the answer"
    rec.assert_awaited_once()
    assert rec.await_args.kwargs["input_tokens"] == 11
    assert rec.await_args.kwargs["output_tokens"] == 22


async def test_shape_llm_text_empty_2xx_raises_refundable() -> None:
    raw = {"status": 200, "json": {"content": [{"type": "text", "text": "  "}]}}
    with pytest.raises(AsyncJobSituation) as ei:
        await shape_llm_text(raw, npub="n", tool="t")
    assert ei.value.error_code == "llm_empty"


async def test_shape_llm_text_non_2xx_curates_situation() -> None:
    raw = {"status": 429, "json": {"error": {"message": "rate limited"}}}
    with pytest.raises(AsyncJobSituation) as ei:
        await shape_llm_text(raw, npub="n", tool="t")
    assert ei.value.error_code == "upstream_rate_limited"


async def test_shape_llm_text_unfunded_alerts_operator() -> None:
    raw = {"status": 400, "json": {"error": {"message": "credit balance too low"}}}
    with (
        patch.object(claude, "_alert_operator_provider_down", AsyncMock()) as alert,
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await shape_llm_text(raw, npub="n", tool="t")
    assert ei.value.error_code == "operator_llm_unfunded"
    alert.assert_awaited_once()   # non-transient provider-down DMs the operator


# ── per-job build_closure + shape_result ─────────────────────────────────────

async def test_judge_build_closure_bakes_request_and_shape_finalizes() -> None:
    from tools import judge

    entry = {"scenario": {"asset": {"ticker": "MARA"}}, "tips_count": 2}
    with patch("db.journal.get_entry", AsyncMock(return_value=entry)), patch.object(
        claude, "_get_api_key", AsyncMock(return_value="sk-op")
    ):
        spec = await judge.build_closure(
            npub="npub1", entry_id="e1", trade_proposal="SELL PUT SPREAD",
        )
    assert spec["op"] == "http_request"
    assert spec["request"]["headers"]["x-api-key"] == "sk-op"
    assert "SELL PUT SPREAD" in spec["request"]["json"]["messages"][0]["content"]

    # shape settles a completed run: parse eval JSON + persist + recompute
    raw = {"status": 200, "json": {"content": [
        {"type": "text", "text": '{"grade": "A", "score": 91}'}
    ]}}
    with patch("db.journal.record_evaluation", AsyncMock()) as rec, patch(
        "db.leaderboard.recompute_leaderboard", AsyncMock()
    ) as recomp, patch("db.usage.record_call", AsyncMock()):
        out = await judge.shape_result(
            raw, {"npub": "npub1", "entry_id": "e1", "trade_proposal": "SELL PUT SPREAD"},
        )
    assert out == {"entry_id": "e1", "evaluation": {"grade": "A", "score": 91}}
    rec.assert_awaited_once()
    recomp.assert_awaited_once()


async def test_judge_build_closure_missing_entry_raises_situation() -> None:
    from tools import judge

    with (
        patch("db.journal.get_entry", AsyncMock(return_value=None)),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await judge.build_closure(npub="n", entry_id="gone", trade_proposal="x")
    assert ei.value.error_code == "journal_entry_not_found"


async def test_deal_shape_result_opens_entry_once() -> None:
    from tools import dealer

    raw = {"status": 200, "json": {"content": [
        {"type": "text", "text": '{"asset": {"ticker": "NVDA"}, "the_question": "?"}'}
    ]}}
    with patch("db.journal.open_entry", AsyncMock(return_value="new-entry")) as open_e, patch(
        "tools.dealer.build_option_chain", return_value=None
    ), patch("db.usage.record_call", AsyncMock()):
        out = await dealer.deal_shape_result(
            raw, {"npub": "n", "mode": "historical", "difficulty": "adept",
                  "max_loss_usd": None, "sector": ""},
        )
    assert out["entry_id"] == "new-entry"
    assert out["scenario"]["mode"] == "historical"      # echoed
    open_e.assert_awaited_once()                          # exactly one journal entry


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


async def test_tip_shape_result_counts_clue() -> None:
    from tools import dealer

    raw = {"status": 200, "json": {"content": [{"type": "text", "text": "think theta"}]}}
    with patch("db.journal.increment_tips_count", AsyncMock()) as inc, patch(
        "db.usage.record_call", AsyncMock()
    ):
        out = await dealer.tip_shape_result(raw, {"npub": "n", "entry_id": "e1"})
    assert out == {"tip": "think theta"}
    inc.assert_awaited_once()


def test_precheck_tip_question_guards_degenerate_input() -> None:
    from tools.dealer import MAX_TIP_QUESTION_CHARS, precheck_tip_question

    assert precheck_tip_question("")["tip"]                       # empty → nudge
    assert precheck_tip_question("   ")["tip"]
    assert precheck_tip_question("x" * (MAX_TIP_QUESTION_CHARS + 1))["tip"]
    assert precheck_tip_question("What's the catalyst?") is None  # real → to LLM
