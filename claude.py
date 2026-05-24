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
from typing import Any

import anthropic

logger = logging.getLogger(__name__)

# Latest stable Sonnet. Per CLAUDE.md the family is 4.6.
DEFAULT_MODEL = "claude-sonnet-4-6"

# Anthropic-hosted server-side web search tool. The version string is fixed
# by Anthropic and must be updated when they release a new revision.
WEB_SEARCH_TOOL = {"type": "web_search_20250305", "name": "web_search"}


class ClaudeError(RuntimeError):
    """LLM call failed for a reason a tool handler should surface to the patron."""


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
) -> str:
    """Call Claude with one user message and a system prompt; return the text.

    Raises ``ClaudeError`` for situations the patron should see: missing key,
    empty response, transport failure. The error message is suitable for
    inclusion in a tool's error dict.

    `npub` and `tool` (when provided) journal the call into
    ``optionality_api_usage`` for the Profile/Usage view. Best-effort —
    a usage-write failure does not affect the response.
    """
    api_key = await _get_api_key()
    if not api_key:
        raise ClaudeError(
            "Operator's Anthropic API key has not been delivered yet. "
            "The operator must vault `anthropic_api_key` via Secure Courier "
            "before this tool can serve patrons."
        )

    tools: list[dict[str, Any]] | None = [WEB_SEARCH_TOOL] if enable_web_search else None

    client = anthropic.AsyncAnthropic(api_key=api_key)
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
    except anthropic.APIError as e:
        raise ClaudeError(f"Anthropic API error: {e}") from e
    except Exception as e:
        raise ClaudeError(f"LLM transport error: {e}") from e

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
        raise ClaudeError(f"Empty model output (stop_reason={stop}).")
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
