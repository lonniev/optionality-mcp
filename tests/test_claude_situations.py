"""Tests for the bounded LLM call and its curated-situation error mapping.

These lock in the fix for the "frontend spins to the 10-minute ceiling" bug:
call_claude must be bounded by the caller's job budget (so a stalled provider
fails fast) and must raise a refundable AsyncJobSituation the frontend can
render — never hang, never return a paid ``{"error": ...}``.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import anthropic
import pytest
from tollbooth import AsyncJobSituation

import claude
from claude import (
    _provider_situation,
    call_claude,
    clamp_timeout,
    empty_output_situation,
)


def _status_error(status: int, message: str) -> anthropic.APIStatusError:
    """Build an APIStatusError without constructing a real httpx response."""

    class _E(anthropic.APIStatusError):
        def __init__(self, sc: int, msg: str) -> None:
            self.status_code = sc
            self.message = msg

    return _E(status, message)


def test_web_search_tool_uses_current_variant_and_is_bounded() -> None:
    # Live scenarios stalled on the basic 20250305 variant with no cap; the
    # current dynamic-filtering variant + a max_uses bound is the fix.
    assert claude.WEB_SEARCH_TOOL["type"] == "web_search_20260209"
    assert claude.WEB_SEARCH_TOOL["name"] == "web_search"
    assert int(claude.WEB_SEARCH_TOOL["max_uses"]) >= 1


def test_clamp_timeout_bounds() -> None:
    assert clamp_timeout(None) == 210.0
    assert clamp_timeout(0) == 210.0
    assert clamp_timeout(-5) == 210.0
    assert clamp_timeout(5) == 30.0          # floor
    assert clamp_timeout(120) == 120.0
    assert clamp_timeout(10_000) == 900.0    # ceiling


def test_timeout_maps_to_transient_situation() -> None:
    s = _provider_situation(anthropic.APITimeoutError(request=None))
    assert s.error_code == "upstream_timeout"
    assert s.transient is True


def test_unfunded_maps_to_non_transient_situation() -> None:
    s = _provider_situation(_status_error(400, "Your credit balance is too low"))
    assert s.error_code == "operator_llm_unfunded"
    assert s.transient is False


def test_auth_and_rate_limit_and_generic_mapping() -> None:
    assert _provider_situation(_status_error(401, "bad key")).error_code == "operator_llm_auth"
    assert _provider_situation(_status_error(403, "forbidden")).error_code == "operator_llm_auth"
    rl = _provider_situation(_status_error(429, "slow down"))
    assert rl.error_code == "upstream_rate_limited" and rl.transient is True
    g = _provider_situation(_status_error(500, "boom"))
    assert g.error_code == "llm_unavailable" and g.transient is True


def test_empty_output_situation_is_refundable() -> None:
    s = empty_output_situation()
    assert isinstance(s, AsyncJobSituation)
    assert s.error_code == "llm_empty"
    # to_response always marks the fare refunded — the wheel rolls back the debit.
    assert s.to_response()["refunded"] is True


async def test_call_claude_unconfigured_key_raises_situation() -> None:
    with (
        patch.object(claude, "_get_api_key", AsyncMock(return_value=None)),
        pytest.raises(AsyncJobSituation) as ei,
    ):
        await call_claude("p", "s")
    assert ei.value.error_code == "operator_llm_unconfigured"
    assert ei.value.transient is False


async def test_call_claude_provider_error_raises_situation_and_disables_retries() -> None:
    captured: dict[str, object] = {}

    class _FakeMessages:
        async def create(self, **_: object) -> object:
            raise _status_error(429, "rate limited")

    class _FakeClient:
        def __init__(self, **kwargs: object) -> None:
            captured.update(kwargs)
            self.messages = _FakeMessages()

    with patch.object(claude, "_get_api_key", AsyncMock(return_value="k")), patch.object(
        anthropic, "AsyncAnthropic", _FakeClient
    ), pytest.raises(AsyncJobSituation) as ei:
        await call_claude("p", "s", timeout_seconds=120)

    # A stalled/failing provider must not be multiplied by SDK retries, and the
    # per-request timeout must be the caller's clamped job budget.
    assert captured["max_retries"] == 0
    assert captured["timeout"] == 120.0
    assert ei.value.error_code == "upstream_rate_limited"


async def test_call_claude_empty_output_raises_situation() -> None:
    class _Block:
        text = "   "

    class _Msg:
        content = [_Block()]  # noqa: RUF012 — test mock, not a real mutable class default
        usage = None
        stop_reason = "end_turn"

    class _FakeMessages:
        async def create(self, **_: object) -> object:
            return _Msg()

    class _FakeClient:
        def __init__(self, **_: object) -> None:
            self.messages = _FakeMessages()

    with patch.object(claude, "_get_api_key", AsyncMock(return_value="k")), patch.object(
        anthropic, "AsyncAnthropic", _FakeClient
    ), pytest.raises(AsyncJobSituation) as ei:
        await call_claude("p", "s")
    assert ei.value.error_code == "llm_empty"
