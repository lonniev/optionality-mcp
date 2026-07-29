"""Tests for the bounded LLM call and its curated-situation error mapping.

These lock in the fix for the "frontend spins to the 10-minute ceiling" bug:
``call_llm`` must be bounded by the caller's job budget (so a stalled provider
fails fast) and must raise a refundable AsyncJobSituation the frontend can
render — never hang, never return a paid ``{"error": ...}``.

They also pin the reading of an EMPTY PROVIDER ACCOUNT. Every operator in the
estate used to match only one lab's wording, which that lab reports as a 400. A
model router reports the same condition as a 402 saying "Insufficient credits" —
so an exhausted account was curated as a passing blip, no operator alert, and a
patron told to retry something that could never succeed.
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from tollbooth import AsyncJobSituation
from tollbooth.llm_route import clamp_timeout

import llm
from llm import (
    call_llm,
    empty_output_situation,
    situation_from_status,
)


class _FakeResponse:
    def __init__(self, status: int, body: Any) -> None:
        self.status_code = status
        self._body = body

    def json(self) -> Any:
        if self._body is None:
            raise ValueError("not json")
        return self._body


def _fake_client(response: Any = None, raises: Exception | None = None) -> tuple[type, dict]:
    """An httpx.AsyncClient stand-in that records how it was constructed."""
    captured: dict[str, Any] = {}

    class _Client:
        def __init__(self, **kwargs: Any) -> None:
            captured.update(kwargs)

        async def __aenter__(self) -> Any:
            return self

        async def __aexit__(self, *_: object) -> None:
            return None

        async def post(self, url: str, **kwargs: Any) -> Any:
            captured["url"] = url
            captured.update(kwargs)
            if raises is not None:
                raise raises
            return response

    return _Client, captured


# -- the request itself -------------------------------------------------------

def test_web_search_tool_uses_current_variant_and_is_bounded() -> None:
    # Live scenarios stalled on the basic 20250305 variant with no cap; the
    # current dynamic-filtering variant + a max_uses bound is the fix.
    assert llm.WEB_SEARCH_TOOL["type"] == "web_search_20260209"
    assert llm.WEB_SEARCH_TOOL["name"] == "web_search"
    assert int(llm.WEB_SEARCH_TOOL["max_uses"]) >= 1


def test_clamp_timeout_bounds() -> None:
    assert clamp_timeout(None) == 210.0
    assert clamp_timeout(0) == 210.0
    assert clamp_timeout(-5) == 210.0
    assert clamp_timeout(5) == 30.0          # floor
    assert clamp_timeout(120) == 120.0
    assert clamp_timeout(10_000) == 900.0    # ceiling


def test_the_drill_draws_the_stronger_tier_and_the_tip_the_cheaper_one() -> None:
    """Dealing and judging are the product; a tip is a hint alongside it."""
    from tollbooth.llm_route import model_for
    assert model_for(llm.TIER_DRILL) != model_for(llm.TIER_TIP)


def test_request_carries_the_key_only_as_a_header() -> None:
    req = llm.build_llm_request(
        api_key="sk-secret", prompt="p", system="s", max_tokens=10, timeout_seconds=90,
    )
    assert req["headers"]["x-api-key"] == "sk-secret"
    assert req["timeout"] == 90.0
    assert "sk-secret" not in str(req["json"])       # never in the body
    assert "sk-secret" not in str(req["url"])


def test_web_search_rides_only_when_asked() -> None:
    plain = llm.build_llm_request(api_key="k", prompt="p", system="s", max_tokens=10)
    assert "tools" not in plain["json"]
    grounded = llm.build_llm_request(
        api_key="k", prompt="p", system="s", max_tokens=10, enable_web_search=True,
    )
    assert grounded["json"]["tools"][0]["name"] == "web_search"


def test_empty_prompt_raises() -> None:
    with pytest.raises(ValueError):
        llm.build_llm_request(api_key="k", prompt="   ", system="s", max_tokens=10)


# -- status → situation -------------------------------------------------------

def test_unfunded_maps_to_non_transient_situation() -> None:
    s = situation_from_status(400, "Your credit balance is too low")
    assert s.error_code == "operator_llm_unfunded"
    assert s.transient is False


@pytest.mark.parametrize("message", [
    "Insufficient credits. Add more using https://openrouter.ai/credits",
    "This request requires more credits than are available",
    "",  # a bare 402 from a metered LLM provider means exactly one thing
])
def test_a_model_routers_402_is_also_unfunded(message: str) -> None:
    """The regression. None of these share a word with the lab's 400 wording."""
    s = situation_from_status(402, message)
    assert s.error_code == "operator_llm_unfunded"
    assert s.transient is False


def test_a_retired_model_slug_is_permanent_not_retryable() -> None:
    s = situation_from_status(400, "x-ai/grok-9 is not a valid model ID")
    assert s.error_code == "operator_llm_model_unknown"
    assert s.transient is False


def test_auth_and_rate_limit_and_generic_mapping() -> None:
    assert situation_from_status(401, "bad key").error_code == "operator_llm_auth"
    assert situation_from_status(403, "forbidden").error_code == "operator_llm_auth"
    rl = situation_from_status(429, "slow down")
    assert rl.error_code == "upstream_rate_limited" and rl.transient is True
    g = situation_from_status(500, "boom")
    assert g.error_code == "llm_unavailable" and g.transient is True


def test_no_situation_leaks_the_raw_upstream_body() -> None:
    raw = "Your credit balance is too low — account acct_12345"
    assert raw not in situation_from_status(400, raw).message


def test_empty_output_situation_is_refundable() -> None:
    s = empty_output_situation()
    assert isinstance(s, AsyncJobSituation)
    assert s.error_code == "llm_empty"
    # to_response always marks the fare refunded — the wheel rolls back the debit.
    assert s.to_response()["refunded"] is True


# -- call_llm ----------------------------------------------------------------

async def test_call_llm_unconfigured_key_raises_situation() -> None:
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value=None)),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_llm("p", "s")
    assert ei.value.error_code == "operator_llm_unconfigured"
    assert ei.value.transient is False


async def test_call_llm_is_bounded_by_the_callers_job_budget() -> None:
    """A stalled provider must fail fast here rather than ride a client library's
    multi-minute default all the way to the frontend's poll ceiling."""
    client, captured = _fake_client(_FakeResponse(429, {"error": {"message": "rate limited"}}))
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_llm("p", "s", timeout_seconds=120)

    assert captured["timeout"] == 120.0
    assert ei.value.error_code == "upstream_rate_limited"


async def test_call_llm_transport_timeout_is_transient() -> None:
    client, _ = _fake_client(raises=httpx.ReadTimeout("too slow"))
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_llm("p", "s")
    assert ei.value.error_code == "upstream_timeout"
    assert ei.value.transient is True


async def test_call_llm_unreachable_provider_is_transient() -> None:
    client, _ = _fake_client(raises=httpx.ConnectError("no route"))
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_llm("p", "s")
    assert ei.value.error_code == "llm_transport"


async def test_call_llm_empty_output_raises_situation() -> None:
    client, _ = _fake_client(_FakeResponse(200, {"content": [{"type": "text", "text": "   "}]}))
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_llm("p", "s")
    assert ei.value.error_code == "llm_empty"


async def test_call_llm_returns_only_the_text_blocks() -> None:
    """A reasoning model interleaves thinking blocks; none of that is the answer.

    Observed shape from x-ai/grok-4.5: ``thinking`` carries a ``thinking`` key and
    ``redacted_thinking`` carries ``data`` — neither carries ``text`` — but the
    extractor selects on block TYPE so it stays correct if that ever changes.
    """
    body = {"content": [
        {"type": "thinking", "thinking": "let me weigh the greeks", "signature": "x"},
        {"type": "redacted_thinking", "data": "opaque"},
        {"type": "server_tool_use", "name": "web_search"},
        {"type": "text", "text": '{"score": 7}'},
    ]}
    client, _ = _fake_client(_FakeResponse(200, body))
    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
    ):
        out = await call_llm("p", "s")
    assert out == '{"score": 7}'


async def test_usage_is_journalled_against_the_model_that_answered() -> None:
    """Not against a module default, which may have moved since the call started."""
    body = {
        "content": [{"type": "text", "text": "ok"}],
        "usage": {"input_tokens": 87, "output_tokens": 18},
    }
    client, _ = _fake_client(_FakeResponse(200, body))
    recorded: dict[str, Any] = {}

    async def _record(_raw: Any, **kwargs: Any) -> None:
        recorded.update(kwargs)

    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        patch.object(llm, "_record_usage_from_json", AsyncMock(side_effect=_record)),
    ):
        await call_llm("p", "s", npub="npub1x", tool="judge_trade")

    expected_model = llm.build_llm_request(
        api_key="k", prompt="p", system="s", max_tokens=10,
    )["json"]["model"]
    assert recorded["tool"] == "judge_trade"
    assert recorded["npub"] == "npub1x"
    assert recorded["model"] == expected_model


# -- provider-reported cost --------------------------------------------------

def test_reported_cost_reads_the_providers_own_figure() -> None:
    """Recorded, not derived. Tokens from two models are not comparable money, so
    a local rate table goes wrong the moment the route changes model."""
    assert llm._reported_cost({"cost": 0.1345452}) == 0.1345452
    assert llm._reported_cost({"cost": "0.02"}) == 0.02


def test_absent_cost_is_unknown_never_free() -> None:
    """None and 0.0 are different claims. A provider that reports no cost must
    not be recorded as having served the call for nothing."""
    assert llm._reported_cost({}) is None
    assert llm._reported_cost({"cost": None}) is None
    assert llm._reported_cost({"cost": "not-a-number"}) is None


async def test_cost_is_journalled_with_the_call() -> None:
    body = {
        "content": [{"type": "text", "text": "ok"}],
        "usage": {"input_tokens": 35542, "output_tokens": 776, "cost": 0.1474},
    }
    client, _ = _fake_client(_FakeResponse(200, body))
    recorded: dict[str, Any] = {}

    async def _record(**kwargs: Any) -> None:
        recorded.update(kwargs)

    with (
        patch.object(llm, "_get_api_key", AsyncMock(return_value="k")),
        patch.object(httpx, "AsyncClient", client),
        patch("db.usage.record_call", AsyncMock(side_effect=_record)),
    ):
        await call_llm("p", "s", npub="npub1x", tool="deal_scenario")

    assert recorded["cost_usd"] == 0.1474
    assert recorded["input_tokens"] == 35542


async def test_shape_llm_text_journals_cost_on_the_detached_path_too() -> None:
    """Both execution paths must record the same things, or the Usage view
    silently under-reports whichever path the operator happens to be on."""
    raw = {"status": 200, "json": {
        "model": "x-ai/grok-4.5",
        "content": [{"type": "text", "text": "the answer"}],
        "usage": {"input_tokens": 11, "output_tokens": 22, "cost": 0.003},
    }}
    recorded: dict[str, Any] = {}

    async def _record(**kwargs: Any) -> None:
        recorded.update(kwargs)

    with patch("db.usage.record_call", AsyncMock(side_effect=_record)):
        text = await llm.shape_llm_text(raw, npub="npub1", tool="judge_trade")

    assert text == "the answer"
    assert recorded["cost_usd"] == 0.003
    assert recorded["model"] == "x-ai/grok-4.5"
