"""Judge tool — evaluates a trainee's trade and updates the leaderboard cache.

The work is split into two halves shared by both execution paths:

* ``_prepare(...)`` — validation + fetch the entry + build the judge prompt.
  Runs in the in-process runner AND in ``build_closure`` (the detached path).
* ``_finalize(...)`` — parse the evaluation, persist it, recompute the
  leaderboard, return the result. Runs in the in-process runner AND in
  ``shape_result`` (settling a detached run). Each path runs each half exactly
  once, so the DB side effects fire once regardless of where the LLM ran.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import prompts
from claude import (
    ClaudeError,
    build_anthropic_request,
    call_claude,
    empty_output_situation,
    extract_json,
    require_api_key,
    shape_llm_text,
)
from tollbooth import AsyncJobSituation
from db import journal, leaderboard

logger = logging.getLogger(__name__)

# The judge's LLM bounds — one source of truth for both paths.
_MAX_TOKENS = 5500
_TIMEOUT_SECONDS = 240


def _entry_not_found_situation(entry_id: str) -> AsyncJobSituation:
    """Refundable: the scenario to judge is gone (deleted / wrong patron)."""
    return AsyncJobSituation(
        error_code="journal_entry_not_found",
        message="That scenario isn't in your journal anymore, so it can't be "
                "judged. No fare was charged.",
        next_steps="Deal a fresh scenario and pitch again.",
        transient=False,
    )


async def _prepare(npub: str, entry_id: str, trade_proposal: str) -> str:
    """Validate + build the judge prompt, or raise a refundable situation."""
    if not trade_proposal or not trade_proposal.strip():
        raise AsyncJobSituation(
            error_code="empty_trade_proposal",
            message="No trade pitch was provided, so there's nothing to judge. "
                    "No fare was charged.",
            next_steps="Write your trade pitch, then submit for judgement.",
            transient=False,
        )
    entry = await journal.get_entry(npub, entry_id)
    if not entry:
        raise _entry_not_found_situation(entry_id)
    scenario = entry.get("scenario") or {}
    clues_used = int(entry.get("tips_count") or 0)
    return (
        f"Scenario:\n{json.dumps(scenario)}\n\n"
        f"Trainee's proposed trade:\n{trade_proposal}\n\n"
        f"Clues the trainee requested during this scenario: {clues_used}\n\n"
        f"Return evaluation JSON only."
    )


async def _finalize(
    npub: str, entry_id: str, trade_proposal: str, text: str
) -> dict[str, Any]:
    """Parse the evaluation, persist it, recompute the leaderboard."""
    try:
        evaluation = extract_json(text)
    except ClaudeError as e:
        raise empty_output_situation() from e

    await journal.record_evaluation(
        npub=npub,
        entry_id=entry_id,
        trade_proposal=trade_proposal,
        evaluation=evaluation,
    )
    await leaderboard.recompute_leaderboard(npub)
    return {"entry_id": entry_id, "evaluation": evaluation}


async def judge_trade(npub: str, entry_id: str, trade_proposal: str) -> dict[str, Any]:
    """In-process runner: prepare → call the judge LLM → finalize."""
    prompt = await _prepare(npub, entry_id, trade_proposal)
    raw = await call_claude(
        prompt,
        prompts.EVAL_SYSTEM,
        max_tokens=_MAX_TOKENS,
        npub=npub,
        tool="judge_trade",
        timeout_seconds=_TIMEOUT_SECONDS,
    )
    return await _finalize(npub, entry_id, trade_proposal, raw)


async def build_closure(
    npub: str = "", entry_id: str = "", trade_proposal: str = "", **_: Any
) -> dict[str, Any]:
    """Detached path: bake the judge request into a sealed ``http_request`` spec."""
    prompt = await _prepare(npub, entry_id, trade_proposal)
    api_key = await require_api_key()
    return {
        "op": "http_request",
        "request": build_anthropic_request(
            api_key=api_key,
            prompt=prompt,
            system=prompts.EVAL_SYSTEM,
            max_tokens=_MAX_TOKENS,
            timeout_seconds=_TIMEOUT_SECONDS,
        ),
    }


async def shape_result(raw: dict[str, Any] | None, params: dict[str, Any]) -> dict[str, Any]:
    """Detached path: settle a completed run — extract the text, then finalize."""
    text = await shape_llm_text(raw, npub=params.get("npub", ""), tool="judge_trade")
    return await _finalize(
        params.get("npub", ""),
        params.get("entry_id", ""),
        params.get("trade_proposal", ""),
        text,
    )
