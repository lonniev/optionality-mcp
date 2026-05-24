"""Dealer tools — scenario composition and Socratic tips.

The dealer LLM emits scenarios that embed the red-herring mechanic. The
``deal_scenario`` tool also opens a journal entry so the trainee can save
drafts against it before the judge runs.
"""

from __future__ import annotations

import logging
from typing import Any

import prompts
from claude import call_claude, extract_json, ClaudeError
from db import journal, patrons

logger = logging.getLogger(__name__)

_VALID_MODES = ("historical", "fiction", "live")
_VALID_DIFFICULTIES = ("apprentice", "journeyman", "adept", "sovereign")


async def deal_scenario(
    npub: str,
    mode: str,
    difficulty: str,
    max_loss_usd: int | None = None,
) -> dict[str, Any]:
    """Generate one scenario and open a journal entry. Returns scenario JSON + entry_id.

    Args:
        max_loss_usd: Optional risk envelope. When provided, the dealer scales
            account size and constraints so a thoughtful structure can be
            sized to fit. Some trainees reason more crisply about a $250
            trade than a $10,000 one; this lets them shape the scenario.
    """
    if mode not in _VALID_MODES:
        return {"error": f"invalid mode: {mode!r}. Choose one of {_VALID_MODES}"}
    if difficulty not in _VALID_DIFFICULTIES:
        return {"error": f"invalid difficulty: {difficulty!r}. Choose one of {_VALID_DIFFICULTIES}"}
    if max_loss_usd is not None and max_loss_usd <= 0:
        return {"error": f"max_loss_usd must be positive when provided; got {max_loss_usd!r}"}

    await patrons.upsert_patron(npub)

    mode_instr = prompts.MODE_INSTRUCTIONS[mode]
    risk_clause = ""
    if max_loss_usd is not None:
        risk_clause = (
            f"\n\nRISK ENVELOPE: The trainee has declared a max-loss budget "
            f"of ${max_loss_usd:,} for this trade. Build the scenario so a "
            f"well-chosen structure can be sized to fit that envelope. The "
            f'"constraints" field MUST state this max-loss budget explicitly '
            f"and pair it with a plausible account size (typical convention: "
            f"max-loss per trade ≈ 1–3% of account, so an account around "
            f"${max(max_loss_usd * 33, max_loss_usd + 5000):,} fits). "
            f"Don't reduce difficulty just because the budget is small — "
            f"keep the macro, the catalyst, and the red-herring mechanic "
            f"as challenging as the persona demands."
        )
    prompt = (
        f"{mode_instr}\n\n"
        f'Generate ONE options drill scenario at difficulty level: "{difficulty}". '
        f'Set the "mode" field to "{mode}". Vary the asset class from any prior attempts. '
        f"Return JSON only."
        f"{risk_clause}"
    )
    enable_web_search = mode == "live"
    max_tokens = 4000 if enable_web_search else 2500

    try:
        raw = await call_claude(
            prompt,
            prompts.SCENARIO_SYSTEM,
            max_tokens=max_tokens,
            enable_web_search=enable_web_search,
            npub=npub,
            tool="deal_scenario",
        )
    except ClaudeError as e:
        return {"error": str(e)}

    try:
        scenario = extract_json(raw)
    except ClaudeError as e:
        return {"error": str(e)}

    scenario["mode"] = mode  # belt-and-suspenders: ensure mode round-trips
    # Echo the operator-supplied risk budget into the scenario JSON so the
    # FE, the judge, and the journal all see the same envelope.
    if max_loss_usd is not None:
        scenario["max_loss_usd"] = max_loss_usd

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
        text = await call_claude(
            prompt, prompts.TIP_SYSTEM, max_tokens=400,
            npub=npub, tool="ask_tip",
        )
    except ClaudeError as e:
        return {"error": str(e)}
    return {"tip": text}
