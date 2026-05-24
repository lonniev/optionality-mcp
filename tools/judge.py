"""Judge tool — evaluates a trainee's trade and updates the leaderboard cache."""

from __future__ import annotations

import json
import logging
from typing import Any

import prompts
from claude import call_claude, extract_json, ClaudeError
from db import journal, leaderboard

logger = logging.getLogger(__name__)


async def judge_trade(npub: str, entry_id: str, trade_proposal: str) -> dict[str, Any]:
    """Run the judge LLM and commit results. Transitions the entry to ``evaluated``."""
    if not trade_proposal or not trade_proposal.strip():
        return {"error": "trade_proposal cannot be empty"}

    entry = await journal.get_entry(npub, entry_id)
    if not entry:
        return {"error": f"journal entry {entry_id} not found for this patron"}
    scenario = entry.get("scenario") or {}

    prompt = (
        f"Scenario:\n{json.dumps(scenario)}\n\n"
        f"Trainee's proposed trade:\n{trade_proposal}\n\n"
        f"Return evaluation JSON only."
    )

    try:
        raw = await call_claude(
            prompt,
            prompts.EVAL_SYSTEM,
            max_tokens=5500,
            npub=npub,
            tool="judge_trade",
        )
    except ClaudeError as e:
        return {"error": str(e)}

    try:
        evaluation = extract_json(raw)
    except ClaudeError as e:
        return {"error": str(e)}

    await journal.record_evaluation(
        npub=npub,
        entry_id=entry_id,
        trade_proposal=trade_proposal,
        evaluation=evaluation,
    )
    await leaderboard.recompute_leaderboard(npub)

    return {"entry_id": entry_id, "evaluation": evaluation}
