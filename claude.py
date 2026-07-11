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

# Anthropic messages endpoint. The in-process path uses the SDK client; the
# durable detached path (see server.py's closure specs) bakes a fully-formed
# request to this URL into a sealed job spec that the generic long-runner flow
# executes outside the MCP container — so a container recycle can't orphan it.
_ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages"

# Anthropic-hosted server-side web search tool. ``web_search_20260209`` is the
# current dynamic-filtering variant (supported on Sonnet 4.6): it filters
# results server-side, so a "live" scenario resolves far faster than the basic
# ``20250305`` variant did. ``max_uses`` bounds the search rounds so a single
# deal can't fan out into an unbounded — and slow — chain of queries that
# stalls the whole job budget. (Do NOT also declare code_execution: dynamic
# filtering runs it under the hood.)
WEB_SEARCH_TOOL = {"type": "web_search_20260209", "name": "web_search", "max_uses": 5}

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


def anthropic_error_message(body: object) -> str:
    """Pull Anthropic's ``error.message`` from a raw response body, if present."""
    if isinstance(body, dict):
        err = body.get("error")
        if isinstance(err, dict):
            return str(err.get("message") or "")
    return ""


def situation_from_status(status: int | None, upstream_msg: str) -> AsyncJobSituation:
    """Curate an Anthropic HTTP status + error message into a frontend situation.

    Shared by the in-process SDK path (``_provider_situation``) and the detached
    closure path (each job's ``shape_result``), so both classify a provider
    failure identically. The raw status/body stay operator-side; the patron's
    frontend gets only a machine ``error_code``, safe copy, and a ``transient``
    flag. Anthropic reports billing exhaustion as a 400 with a "credit balance
    too low" message (not a 402), so we match on the message.
    """
    low = (upstream_msg or "").lower()
    if status in (400, 402) and any(
        s in low for s in ("credit balance", "purchase credits", "plans & billing", "billing")
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


def _provider_situation(exc: Exception) -> AsyncJobSituation:
    """Curate an Anthropic SDK error into a frontend-facing, refundable situation.

    The in-process peer of ``situation_from_status``: it pulls the status + body
    off the SDK exception, handling the timeout case (no status) specially, then
    delegates the status-code mapping so both execution paths agree.
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
    body = str(getattr(exc, "message", "") or exc)
    return situation_from_status(status, body)


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


async def require_api_key() -> str:
    """Load the operator's Anthropic key or raise the curated unconfigured situation.

    For the detached ``build_closure`` path, which bakes the key into the sealed
    request. Mirrors ``call_claude``'s in-process guard so a missing credential
    fails the same refundable way on either execution path.
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
    return api_key


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
    api_key = await require_api_key()

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


def build_anthropic_request(
    *,
    api_key: str,
    prompt: str,
    system: str,
    max_tokens: int,
    enable_web_search: bool = False,
    model: str = DEFAULT_MODEL,
    timeout_seconds: float | int | None = None,
) -> dict[str, Any]:
    """Build the fully-formed Anthropic messages request for the detached path.

    Returns a declarative, JSON-serializable request envelope (method, url,
    headers, json body, timeout) — the shape the durable long-runner's generic
    ``http_request`` op executes. The operator's ``api_key`` is baked in here,
    in-process, so the wheel can seal it into the closure before it ever leaves
    the server; it appears only as the ``x-api-key`` header. Issues the SAME call
    the in-process ``call_claude`` does (same model / tokens / system / tools),
    so both paths produce identical output. Raises ``ValueError`` on empty prompt.
    """
    if not prompt or not prompt.strip():
        raise ValueError("empty prompt")
    body: dict[str, Any] = {
        "model": model,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": prompt}],
    }
    if enable_web_search:
        body["tools"] = [WEB_SEARCH_TOOL]
    return {
        "method": "POST",
        "url": _ANTHROPIC_ENDPOINT,
        "headers": {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        "json": body,
        "timeout": clamp_timeout(timeout_seconds),
    }


def response_text_from_json(raw_json: dict[str, Any] | None) -> str:
    """Join the text blocks of a raw Anthropic messages response body.

    The detached path returns the HTTP JSON (a plain dict), not the SDK's typed
    message object, so ``content`` is a list of block dicts. Mirrors the block
    extraction in ``call_claude``. Returns "" when nothing usable came back.
    """
    parts: list[str] = []
    for block in (raw_json or {}).get("content") or []:
        if isinstance(block, dict):
            text = block.get("text")
            if isinstance(text, str) and text.strip():
                parts.append(text)
    return "\n".join(parts).strip()


async def _record_usage_from_json(
    raw_json: dict[str, Any] | None, *, npub: str, tool: str, model: str
) -> None:
    """Journal token usage from a raw Anthropic response (detached-path parity).

    Best-effort; a usage-write failure never affects the shaped result.
    """
    try:
        usage_obj = (raw_json or {}).get("usage") or {}
        in_tok = int(usage_obj.get("input_tokens") or 0)
        out_tok = int(usage_obj.get("output_tokens") or 0)
        if in_tok or out_tok:
            from db import usage as _usage
            await _usage.record_call(
                npub=npub, tool=tool, model=model,
                input_tokens=in_tok, output_tokens=out_tok,
            )
    except Exception:
        pass


async def shape_llm_text(
    raw: dict[str, Any] | None, *, npub: str = "", tool: str = "", model: str = DEFAULT_MODEL
) -> str:
    """Turn a detached long-runner result into the model's text, or raise.

    ``raw`` is the generic flow's return: ``{"status": <http_code>, "json": <body>}``.
    On 2xx, extract the text (and journal usage); on a 2xx with no usable text,
    raise the empty-output situation; on non-2xx, curate the upstream error into a
    refundable ``AsyncJobSituation`` via the shared ``situation_from_status`` — the
    raw status/body stay operator-side (Prefect logs). Symmetric with ``call_claude``.
    """
    raw = raw or {}
    status = raw.get("status")
    body = raw.get("json")
    if status == 200:
        text = response_text_from_json(body if isinstance(body, dict) else {})
        if not text:
            raise empty_output_situation()
        await _record_usage_from_json(body, npub=npub, tool=tool, model=model)
        return text
    situation = situation_from_status(
        status if isinstance(status, int) else None,
        anthropic_error_message(body),
    )
    if not situation.transient:
        await _alert_operator_provider_down(situation)
    raise situation


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
