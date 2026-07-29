"""Server-side LLM client for the drill.

The operator's ``llm_api_key`` is stored in the wheel's credential vault, vaulted
by the operator's nsec. Fetched on demand via ``runtime.load_credentials``. The
plaintext key never leaves this process and is never logged.

Where those calls GO — which provider, which model, which account pays — is
``tollbooth.llm_route``'s decision, not this module's. What stays here is what
makes a *drill* good: the usage journal, the JSON coercion the prompts depend on,
and the operator alert.

This module used to be ``claude.py``, and its docstring recorded that it had been
"Modeled after ``taxsort-mcp/tools/advisors.py``" — one of three near-identical
copies of the same provider plumbing across the estate. The wheel owns that now.

One request shape, one execution path. The in-process path previously used the
``anthropic`` SDK client while the detached path built a raw HTTP envelope, so
every provider behaviour had to be understood — and every provider failure
classified — twice. That divergence is exactly how the unfunded-account bug
survived: two classifiers, both matching only one vendor's wording. Both paths now
build the same envelope and read the same reply.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx
from tollbooth import AsyncJobSituation
from tollbooth.llm_route import (
    TIER_READER,
    TIER_WRITER,
    build_messages_request,
    error_message,
    llm_failure_situation,
    resolve_route,
    web_search_tool,
)

logger = logging.getLogger(__name__)

# Dealing a scenario and judging a pitch are the product. Both compose reasoned
# prose the patron is asked to trust, and a live deal grounds itself with web
# search — so both draw the stronger tier. Tips are short answers to a question
# already in front of the patron, so they draw the cheaper one.
TIER_DRILL = TIER_WRITER
TIER_TIP = TIER_READER

# Server-side web search, in its dynamic-filtering variant: the provider filters
# results server side, so a "live" scenario resolves far faster than the basic
# variant did. ``max_uses`` bounds the search ROUNDS — the dominant latency cost of
# a live deal: the model writes a query, the provider runs the search AND spins up
# a code-execution sandbox to dynamic-filter the results, then the model reads and
# may search again. Three rounds cover a live scenario (ticker + catalyst +
# price/IV); five just added minutes. (Do NOT also declare code_execution:
# dynamic filtering runs it under the hood.)
_WEB_SEARCH_ROUNDS = 3
WEB_SEARCH_TOOL = web_search_tool(_WEB_SEARCH_ROUNDS)


class LlmError(RuntimeError):
    """LLM call failed for a reason a tool handler should surface to the patron."""


def empty_output_situation() -> AsyncJobSituation:
    """A 2xx that yielded no usable text/JSON — a settled, refundable outcome."""
    return AsyncJobSituation(
        error_code="llm_empty",
        message="The AI returned no usable result for this request. No fare was charged.",
        next_steps="Please try again.",
        transient=True,
    )


def situation_from_status(status: int | None, upstream_msg: str) -> AsyncJobSituation:
    """Curate a provider HTTP status + error message into a frontend situation.

    Delegates the reading to the wheel, which knows that providers announce an
    empty account differently — a lab as a 400 naming the credit balance, a model
    router as a 402 reading "Insufficient credits". Only the fallback wording is
    ours, because "your request" is language this service can use and the wheel
    cannot. The raw status/body stay operator-side.
    """
    return llm_failure_situation(
        status=status,
        message=upstream_msg,
        fallback_code="llm_unavailable",
        fallback_message="The AI provider couldn't complete this request right now. "
                         "No fare was charged.",
    )


async def _alert_operator_provider_down(situation: AsyncJobSituation) -> None:
    """DM the operator (from the operator npub) that AI-backed drills are down.

    Almost always an empty provider account. A self-DM surfaces in Pricing Studio,
    so the human running the operator sees "feed me" without watching logs.
    Best-effort: relay I/O runs on a daemon thread so the patron's fast-fail
    response is never delayed, and any failure is swallowed. Only definitive
    (non-transient) provider-down situations reach here.
    """
    import threading

    try:
        from server import runtime

        operator_npub = runtime.operator_npub()
        courier = await runtime.courier()
        exchange = getattr(courier, "_exchange", None)
    except Exception:  # noqa: BLE001 — a courtesy alert never breaks the caller
        return
    if not operator_npub or exchange is None:
        return

    # No vendor console is named: which provider the key belongs to is the
    # operator's configuration, and naming last year's lab would send them to the
    # wrong billing page.
    if situation.error_code == "operator_llm_unfunded":
        message = (
            "🎲 Optionality can't deal or judge drills\n\n"
            "The account behind the operator's llm_api_key is out of credits, so "
            "every paid drill (deal / clue / judge) is failing and the patron's "
            "fare is being refunded. Top it up with your model router and drills "
            "resume automatically — no redeploy needed.\n\n"
            "A patron just hit this. No fare was charged."
        )
    elif situation.error_code == "operator_llm_model_unknown":
        message = (
            "🎲 Optionality can't deal or judge drills\n\n"
            "The provider no longer offers the model this service is configured "
            "for — usually a marketplace renaming or retiring it. Point "
            "TOLLBOOTH_LLM_MODEL_* at a current slug and restart. Retrying will "
            "not clear this on its own.\n\n"
            "A patron just hit this. No fare was charged."
        )
    else:
        message = (
            "🎲 Optionality can't deal or judge drills\n\n"
            "Your AI provider rejected this service's access (auth / "
            "misconfiguration), so paid drills can't run. Check the operator's "
            "llm_api_key, then drills resume.\n\n"
            "A patron just hit this. No fare was charged."
        )

    def _run() -> None:
        try:
            exchange.send_dm(operator_npub, message)
        except Exception:  # courtesy DM — never breaks the caller
            logger.debug("operator provider-down DM failed (courtesy)", exc_info=True)

    threading.Thread(target=_run, daemon=True).start()


async def _get_api_key() -> str | None:
    """Load the operator's ``llm_api_key`` from the vault.

    Returns ``None`` if the credential has not been delivered yet — caller should
    treat that as the "operator credentials not delivered" lifecycle state per
    CLAUDE.md, not as a hard error.
    """
    from server import runtime

    try:
        creds = await runtime.load_credentials(["llm_api_key"])
    except Exception as e:  # noqa: BLE001
        logger.warning("Could not load operator credentials: %s", e)
        return None
    key = creds.get("llm_api_key") if isinstance(creds, dict) else None
    return key if key else None


async def require_api_key() -> str:
    """Load the operator's LLM key or raise the curated unconfigured situation.

    For the detached ``build_closure`` path, which bakes the key into the sealed
    request. Mirrors ``call_llm``'s in-process guard so a missing credential fails
    the same refundable way on either execution path.
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


def build_llm_request(
    *,
    api_key: str,
    prompt: str,
    system: str,
    max_tokens: int,
    enable_web_search: bool = False,
    tier: str = TIER_DRILL,
    timeout_seconds: float | None = None,
) -> dict[str, Any]:
    """Build the fully-formed messages request.

    Returns a declarative, JSON-serializable request envelope (method, url,
    headers, json body, timeout) — the shape the durable long-runner's generic
    ``http_request`` op executes, and the same envelope ``call_llm`` posts
    in-process, so both paths issue an identical call. The operator's ``api_key``
    is baked in here, in-process, so the wheel can seal it into the closure before
    it ever leaves the server; it appears only as the ``x-api-key`` header.

    ``api_key`` is explicit rather than looked up because it names the provider
    ACCOUNT this work bills to — giving the drill and the tip separate accounts is
    a different key at the call site, not a change here.

    Raises ``ValueError`` on empty prompt.
    """
    if not prompt or not prompt.strip():
        raise ValueError("empty prompt")
    return build_messages_request(
        resolve_route(api_key=api_key, tier=tier),
        system=system,
        user=prompt,
        max_tokens=max_tokens,
        tools=[WEB_SEARCH_TOOL] if enable_web_search else None,
        timeout_seconds=timeout_seconds,
    )


def response_text_from_json(raw_json: dict[str, Any] | None) -> str:
    """Join the text blocks of a raw messages response body.

    ``content`` is a list of block dicts. Only ``text`` blocks are joined, so a
    reasoning model's ``thinking`` / ``redacted_thinking`` blocks — and any
    ``server_tool_use`` block from a web search — never reach the patron. Returns
    "" when nothing usable came back.
    """
    parts: list[str] = []
    for block in (raw_json or {}).get("content") or []:
        if isinstance(block, dict) and block.get("type") == "text":
            text = block.get("text")
            if isinstance(text, str) and text.strip():
                parts.append(text)
    return "\n".join(parts).strip()


async def _record_usage_from_json(
    raw_json: dict[str, Any] | None, *, npub: str, tool: str, model: str
) -> None:
    """Journal token usage from a raw response for the Profile/Usage view.

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
    except Exception:  # noqa: BLE001, S110
        pass


def _model_of(request: dict[str, Any]) -> str:
    """The model a built request will actually ask for — journalled with usage so
    the Profile view attributes tokens to the model that produced them, not to a
    module default that may have moved."""
    body = request.get("json")
    if isinstance(body, dict):
        return str(body.get("model") or "unknown")
    return "unknown"


async def call_llm(
    prompt: str,
    system: str,
    max_tokens: int = 2500,
    *,
    enable_web_search: bool = False,
    tier: str = TIER_DRILL,
    npub: str = "",
    tool: str = "",
    timeout_seconds: float | None = None,
) -> str:
    """Run one prompt with a system prompt; return the text.

    Raises a curated ``AsyncJobSituation`` for anything the patron should see —
    provider unfunded / misconfigured / busy, a stall, or empty output. The
    wheel's async-job runner catches it, refunds the fare, and surfaces the safe
    message to the frontend; the raw upstream detail stays operator-side.

    The call is bounded by ``timeout_seconds`` (the caller's job budget) with no
    client retries, so a stalled provider fails fast here rather than riding a
    client library's multi-minute default all the way to the frontend's poll
    ceiling.

    ``npub`` and ``tool`` (when provided) journal the call into
    ``optionality_api_usage`` for the Profile/Usage view. Best-effort — a
    usage-write failure does not affect the response.
    """
    request = build_llm_request(
        api_key=await require_api_key(),
        prompt=prompt,
        system=system,
        max_tokens=max_tokens,
        enable_web_search=enable_web_search,
        tier=tier,
        timeout_seconds=timeout_seconds,
    )

    try:
        async with httpx.AsyncClient(timeout=request["timeout"]) as client:
            resp = await client.post(
                request["url"], headers=request["headers"], json=request["json"],
            )
    except httpx.TimeoutException as e:
        raise AsyncJobSituation(
            error_code="upstream_timeout",
            message="The AI provider took too long to respond, so this request "
                    "couldn't be completed. No fare was charged.",
            next_steps="Please try again.",
            transient=True,
        ) from e
    except Exception as e:  # transport, DNS, TLS
        raise AsyncJobSituation(
            error_code="llm_transport",
            message="The AI provider couldn't be reached, so your request "
                    "couldn't be completed. No fare was charged.",
            next_steps="Please try again.",
            transient=True,
        ) from e

    try:
        body = resp.json()
    except ValueError:  # a non-JSON error body still carries a status
        body = None

    if resp.status_code != 200:
        situation = situation_from_status(resp.status_code, error_message(body))
        if not situation.transient:
            await _alert_operator_provider_down(situation)
        raise situation

    out = response_text_from_json(body if isinstance(body, dict) else {})
    if not out:
        stop = (body or {}).get("stop_reason", "?") if isinstance(body, dict) else "?"
        logger.info("call_llm empty output (tool=%s, stop_reason=%s)", tool, stop)
        raise empty_output_situation()

    await _record_usage_from_json(
        body, npub=npub, tool=tool, model=_model_of(request),
    )
    return out


async def shape_llm_text(
    raw: dict[str, Any] | None, *, npub: str = "", tool: str = "", model: str = "",
) -> str:
    """Turn a detached long-runner result into the model's text, or raise.

    ``raw`` is the generic flow's return: ``{"status": <http_code>, "json": <body>}``.
    On 2xx, extract the text (and journal usage); on a 2xx with no usable text,
    raise the empty-output situation; on non-2xx, curate the upstream error into a
    refundable ``AsyncJobSituation`` — the raw status/body stay operator-side
    (Prefect logs). Symmetric with ``call_llm``.
    """
    raw = raw or {}
    status = raw.get("status")
    body = raw.get("json")
    if status == 200:
        text = response_text_from_json(body if isinstance(body, dict) else {})
        if not text:
            raise empty_output_situation()
        await _record_usage_from_json(
            body, npub=npub, tool=tool,
            # The detached reply names the model that answered; falling back to the
            # caller's hint keeps the journal honest if it ever doesn't.
            model=str((body or {}).get("model") or model or "unknown"),
        )
        return text
    situation = situation_from_status(
        status if isinstance(status, int) else None,
        error_message(body),
    )
    if not situation.transient:
        await _alert_operator_provider_down(situation)
    raise situation


def extract_json(text: str) -> dict[str, Any]:
    """Pull the first top-level JSON object out of an LLM response.

    The artifact's prompts ask for "STRICTLY a JSON object (no prose, no markdown
    fences)" — but in practice models occasionally wrap with code fences or prepend
    a line of prose. This is forgiving in the same way the browser-side
    ``extractJson`` was.

    Raises ``LlmError`` if no valid JSON object can be parsed.
    """
    cleaned = re.sub(r"```json\s*", "", text, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()
    first = cleaned.find("{")
    last = cleaned.rfind("}")
    if first == -1 or last == -1 or last <= first:
        raise LlmError(f"No JSON object in model output: {text[:240]!r}")
    candidate = cleaned[first:last + 1]
    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError as e:
        raise LlmError(f"JSON parse failed: {e}. Slice: {candidate[:240]!r}") from e
    if not isinstance(parsed, dict):
        raise LlmError(f"Expected JSON object, got {type(parsed).__name__}")
    return parsed
