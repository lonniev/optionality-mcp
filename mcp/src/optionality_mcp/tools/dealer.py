"""Dealer tools — scenario composition and Socratic tips.

The dealer LLM emits scenarios that embed the red-herring mechanic. The
``deal_scenario`` tool also opens a journal entry so the trainee can save
drafts against it before the judge runs.
"""

from __future__ import annotations

import logging
from typing import Any

from optionality_mcp import prompts
from optionality_mcp.claude import call_claude, extract_json, ClaudeError
from optionality_mcp.persistence import journal, patrons

logger = logging.getLogger(__name__)

_VALID_MODES = ("historical", "fiction", "live")
_VALID_DIFFICULTIES = ("apprentice", "journeyman", "adept", "sovereign")


async def deal_scenario(npub: str, mode: str, difficulty: str) -> dict[str, Any]:
    """Generate one scenario and open a journal entry. Returns scenario JSON + entry_id."""
    if mode not in _VALID_MODES:
        return {"error": f"invalid mode: {mode!r}. Choose one of {_VALID_MODES}"}
    if difficulty not in _VALID_DIFFICULTIES:
        return {"error": f"invalid difficulty: {difficulty!r}. Choose one of {_VALID_DIFFICULTIES}"}

    await patrons.upsert_patron(npub)

    mode_instr = prompts.MODE_INSTRUCTIONS[mode]
    prompt = (
        f"{mode_instr}\n\n"
        f'Generate ONE options drill scenario at difficulty level: "{difficulty}". '
        f'Set the "mode" field to "{mode}". Vary the asset class from any prior attempts. '
        f"Return JSON only."
    )
    enable_web_search = mode == "live"
    max_tokens = 4000 if enable_web_search else 2500

    try:
        raw = await call_claude(
            prompt,
            prompts.SCENARIO_SYSTEM,
            max_tokens=max_tokens,
            enable_web_search=enable_web_search,
        )
    except ClaudeError as e:
        return {"error": str(e)}

    try:
        scenario = extract_json(raw)
    except ClaudeError as e:
        return {"error": str(e)}

    scenario["mode"] = mode  # belt-and-suspenders: ensure mode round-trips

    entry_id = await journal.open_entry(
        npub=npub,
        mode=mode,
        difficulty=difficulty,
        scenario=scenario,
    )
    return {"entry_id": entry_id, "scenario": scenario}


async def ask_tip(npub: str, entry_id: str, question: str) -> dict[str, Any]:
    """Return a non-spoiler Socratic hint for the open journal entry."""
    entry = await journal.get_entry(npub, entry_id)
    if not entry:
        return {"error": f"journal entry {entry_id} not found for this patron"}
    scenario = entry.get("scenario") or {}
    visible = {
        "ticker": (scenario.get("asset") or {}).get("ticker"),
        "macro_backdrop": scenario.get("macro_backdrop"),
        "catalyst": scenario.get("catalyst"),
        "key_levels": scenario.get("key_levels"),
        "constraints": scenario.get("constraints"),
        "the_question": scenario.get("the_question"),
        "iv_30d": (scenario.get("asset") or {}).get("iv_30d"),
        "spot": (scenario.get("asset") or {}).get("spot"),
    }
    prompt = (
        "The trainee has seen ONLY these scenario fields:\n"
        f"{visible}\n\n"
        f"Their question: {question}\n\n"
        "Offer ONE Socratic nudge. Under 80 words. No specific strikes, structures, or directional bias."
    )
    try:
        text = await call_claude(prompt, prompts.TIP_SYSTEM, max_tokens=400)
    except ClaudeError as e:
        return {"error": str(e)}
    return {"tip": text}
