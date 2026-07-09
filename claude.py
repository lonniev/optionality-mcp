"""Server-side Anthropic client.

The operator's ``anthropic_api_key`` is stored in the wheel's credential
vault, vaulted by the operator's nsec. Fetched on demand via
``runtime.load_credentials``. The plaintext key never leaves this process
and is never logged.

Modeled after ``taxsort-mcp/tools/advisors.py::_get_api_key``.
"""

from __future__ import annotations

import json
import logging
import re
import threading
from typing import Any

import anthropic
from tollbooth import AsyncJobSituation

logger = logging.getLogger(__name__)

# Latest stable Sonnet. Per CLAUDE.md the family is 4.6.
DEFAULT_MODEL = "claude-sonnet-4-6"

# Anthropic-hosted server-side web search tool. The version string is fixed
# by Anthropic and must be updated when they release a new revision.
WEB_SEARCH_TOOL = {"type": "web_search_20250305", "name": "web_search"}

# Default LLM request timeout when the caller declares none. Generous for a
# web-search-augmented generation, but the caller's async-job budget is the
# real bound — every claim-check tool passes its own ``timeout_seconds`` so a
# stalled provider fails fast (a clean refundable situation) instead of riding
# the Anthropic SDK's 600s default all the way to the frontend's poll ceiling.
_DEFAULT_TIMEOUT = 210.0


def clamp_timeout(seconds: float | int | None) -> float:
    """Bound the LLM request timeout to a sane range (the job budget drives it)."""
    if not seconds or seconds <= 0:
        return _DEFAULT_TIMEOUT
    return float(max(30, min(int(seconds), 900)))


class ClaudeError(RuntimeError):
    """LLM call failed for a reason a tool handler should surface to the patron."""


def empty_output_situation() -> AsyncJobSituation:
    """A 2xx that yielded no usable text/JSON — a settled, refundable outcome."""
    return AsyncJobSituation(
        error_code="llm_empty",
        message="The AI returned no usable result for this request. No fare was charged.",
        next_steps="Please try again.",
        transient=True,
    )


def _provider_situation(exc: Exception) -> AsyncJobSituation:
    """Curate an Anthropic SDK error into a frontend-facing, refundable situation.

    The raw status + body stay operator-side (the wheel's logger / job row); the
    patron's frontend gets only a machine ``error_code``, safe human copy, and a
    ``transient`` flag. Anthropic reports billing exhaustion as a 400 with a
    "credit balance too low" message (not a 402), so we match on the message.
    """
    if isinstance(exc, anthropic.APITimeoutError):
        return AsyncJobSituation(
            error_code="upstream_timeout",
            message="The AI provider took too long to respond, so this request "
                    "couldn't be completed. No fare was charged.",
            next_steps="Please try again.",
            transient=True,
        )
    status = getattr(exc, "status_code", None)
    body = str(getattr(exc, "message", "") or exc).lower()
    if status in (400, 402) and any(
        s in body for s in ("credit balance", "purchase credits", "plans & billing", "billing")
    ):
        return AsyncJobSituation(
            error_code="operator_llm_unfunded",
            message="This service's AI provider is temporarily unavailable, so your "
                    "request couldn't be completed. No fare was charged.",
            next_steps="Please try again later.",
            transient=False,
        )
    if status in (401, 403):
        return AsyncJobSituation(
            error_code="operator_llm_auth",
            message="This service's AI access is misconfigured, so your request "
                    "couldn't be completed. No fare was charged.",
            next_steps="Please try again later.",
            transient=False,
        )
    if status == 429:
        return AsyncJobSituation(
            error_code="upstream_rate_limited",
            message="The AI provider is busy right now, so your request couldn't "
                    "be completed. No fare was charged.",
            next_steps="Try again in a minute.",
            transient=True,
        )
    return AsyncJobSituation(
        error_code="llm_unavailable",
        message="The AI provider couldn't complete this request right now. "
                "No fare was charged.",
        next_steps="Please try again.",
        transient=True,
    )


async def _alert_operator_provider_down(situation: AsyncJobSituation) -> None:
    """DM the operator (from the operator npub) that AI-backed drills are down.

    Almost always an unfunded Anthropic account. A self-DM surfaces in Pricing
    Studio, so the human running the operator sees "feed me" without watching
    logs. Best-effort: relay I/O runs on a daemon thread so the patron's
    fast-fail response is never delayed, and any failure is swallowed. Only
    definitive (non-transient) provider-down situations reach here.
    """
    try:
        from server import runtime

        operator_npub = runtime.operator_npub()
        courier = await runtime.courier()
        exchange = getattr(courier, "_exchange", None)
    except Exception:  # noqa: BLE001 — a courtesy alert never breaks the caller
        return
    if not operator_npub or exchange is None:
        return

    if situation.error_code == "operator_llm_unfunded":
        message = (
            "🎲 Optionality can't deal or judge drills\n\n"
            "Your Anthropic account is out of credits, so every paid drill "
            "(deal / clue / judge) is failing and the patron's fare is being "
            "refunded. Add credit at console.anthropic.com and drills resume "
            "automatically — no redeploy needed.\n\n"
            "A patron just hit this. No fare was charged."
        )
    else:
        message = (
            "🎲 Optionality can't deal or judge drills\n\n"
            "Your Anthropic API access was rejected (auth / misconfiguration), so "
            "paid drills can't run. Check the operator's Anthropic key, then "
            "drills resume.\n\n"
            "A patron just hit this. No fare was charged."
        )

    def _run() -> None:
        try:
            exchange.send_dm(operator_npub, message)
        except Exception:  # noqa: BLE001 — courtesy DM, non-blocking
            logger.debug("operator provider-down DM failed (courtesy)", exc_info=True)

    threading.Thread(target=_run, daemon=True).start()


async def _get_api_key() -> str | None:
    """Load the operator's ``anthropic_api_key`` from the vault.

    Returns ``None`` if the credential has not been delivered yet — caller
    should treat that as the "operator credentials not delivered" lifecycle
    state per CLAUDE.md, not as a hard error.
    """
    from server import runtime

    try:
        creds = await runtime.load_credentials(["anthropic_api_key"])
    except Exception as e:
        logger.warning("Could not load operator credentials: %s", e)
        return None
    key = creds.get("anthropic_api_key") if isinstance(creds, dict) else None
    return key if key else None


async def call_claude(
    prompt: str,
    system: str,
    max_tokens: int = 2500,
    *,
    enable_web_search: bool = False,
    model: str = DEFAULT_MODEL,
    npub: str = "",
    tool: str = "",
    timeout_seconds: float | int | None = None,
) -> str:
    """Call Claude with one user message and a system prompt; return the text.

    Raises a curated ``AsyncJobSituation`` for anything the patron should see —
    provider unfunded / misconfigured / busy, a stall, or empty output. The
    wheel's async-job runner catches it, refunds the fare, and surfaces the safe
    message to the frontend; the raw upstream detail stays operator-side.

    The call is bounded by ``timeout_seconds`` (the caller's job budget) with the
    SDK's own retries disabled, so a stalled provider fails fast here rather than
    riding the SDK's 600s default all the way to the frontend's poll ceiling.

    `npub` and `tool` (when provided) journal the call into
    ``optionality_api_usage`` for the Profile/Usage view. Best-effort —
    a usage-write failure does not affect the response.
    """
    api_key = await _get_api_key()
    if not api_key:
        raise AsyncJobSituation(
            error_code="operator_llm_unconfigured",
            message="This service's AI provider isn't configured yet, so your "
                    "request couldn't be completed. No fare was charged.",
            next_steps="Please try again later.",
            transient=False,
        )

    tools: list[dict[str, Any]] | None = [WEB_SEARCH_TOOL] if enable_web_search else None

    client = anthropic.AsyncAnthropic(
        api_key=api_key,
        max_retries=0,
        timeout=clamp_timeout(timeout_seconds),
    )
    try:
        if tools is not None:
            message = await client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
                tools=tools,
            )
        else:
            message = await client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
            )
    except AsyncJobSituation:
        raise
    except anthropic.APIError as e:
        situation = _provider_situation(e)
        if not situation.transient:
            await _alert_operator_provider_down(situation)
        raise situation from e
    except Exception as e:
        raise AsyncJobSituation(
            error_code="llm_transport",
            message="The AI provider couldn't be reached, so your request "
                    "couldn't be completed. No fare was charged.",
            next_steps="Please try again.",
            transient=True,
        ) from e

    # Record usage for the Profile/Usage view. Pull from the SDK's
    # `usage` object — fields are documented as `input_tokens` /
    # `output_tokens`. Best-effort; failures swallowed by record_call.
    try:
        usage_obj = getattr(message, "usage", None)
        in_tok = int(getattr(usage_obj, "input_tokens", 0) or 0)
        out_tok = int(getattr(usage_obj, "output_tokens", 0) or 0)
        if in_tok or out_tok:
            from db import usage as _usage
            await _usage.record_call(
                npub=npub,
                tool=tool,
                model=model,
                input_tokens=in_tok,
                output_tokens=out_tok,
            )
    except Exception:
        pass

    parts: list[str] = []
    for block in message.content or []:
        text = getattr(block, "text", None)
        if isinstance(text, str) and text.strip():
            parts.append(text)
    out = "\n".join(parts).strip()
    if not out:
        stop = getattr(message, "stop_reason", "?")
        logger.info("call_claude empty output (tool=%s, stop_reason=%s)", tool, stop)
        raise empty_output_situation()
    return out


def extract_json(text: str) -> dict[str, Any]:
    """Pull the first top-level JSON object out of an LLM response.

    The artifact's prompts ask for "STRICTLY a JSON object (no prose, no
    markdown fences)" — but in practice models occasionally wrap with code
    fences or prepend a line of prose. This is forgiving in the same way
    the browser-side ``extractJson`` was.

    Raises ``ClaudeError`` if no valid JSON object can be parsed.
    """
    cleaned = re.sub(r"```json\s*", "", text, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()
    first = cleaned.find("{")
    last = cleaned.rfind("}")
    if first == -1 or last == -1 or last <= first:
        raise ClaudeError(f"No JSON object in model output: {text[:240]!r}")
    candidate = cleaned[first:last + 1]
    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError as e:
        raise ClaudeError(f"JSON parse failed: {e}. Slice: {candidate[:240]!r}") from e
    if not isinstance(parsed, dict):
        raise ClaudeError(f"Expected JSON object, got {type(parsed).__name__}")
    return parsed
