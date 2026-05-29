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
# "mulligan" is the replay difficulty — when a patron picks a past
# evaluated entry from their Journal and asks to redo it, the wheel
# reissues the same scenario as a fresh play. Priced + leaderboard-
# weighted distinctly from the original difficulty levels.
_VALID_DIFFICULTIES = ("apprentice", "journeyman", "adept", "sovereign", "mulligan")


async def deal_scenario(
    npub: str,
    mode: str,
    difficulty: str,
    max_loss_usd: int | None = None,
    replay_entry_id: str | None = None,
    sector: str = "",
) -> dict[str, Any]:
    """Generate one scenario and open a journal entry. Returns scenario JSON + entry_id.

    Args:
        max_loss_usd: Optional risk envelope. When provided, the dealer scales
            account size and constraints so a thoughtful structure can be
            sized to fit. Some trainees reason more crisply about a $250
            trade than a $10,000 one; this lets them shape the scenario.
        replay_entry_id: Optional id of a previously-evaluated journal entry.
            When set, the dealer skips LLM generation and reuses that entry's
            scenario JSON as-is. mode is forced to "historical" and difficulty
            to "mulligan" so the new entry is priced + leaderboard-weighted
            distinctly from the original. The trainee gets to pitch a fresh
            trade on a scenario they've already seen — same setup, second
            look. The new play is journaled as its own entry.
    """
    # ── Replay branch ─────────────────────────────────────────────
    if replay_entry_id:
        original = await journal.get_entry(npub, replay_entry_id)
        if not original:
            return {
                "error": (
                    f"journal entry {replay_entry_id} not found for this patron, "
                    "or already deleted"
                )
            }
        scenario = original.get("scenario") or {}
        if not scenario:
            return {"error": "original entry has no scenario to replay"}

        # Force the replay's mode + difficulty so pricing and leaderboard
        # weighting reflect "second look" rather than the original setup.
        scenario["mode"] = "historical"
        if max_loss_usd is not None:
            scenario["max_loss_usd"] = max_loss_usd
        scenario["replay_of"] = replay_entry_id

        await patrons.upsert_patron(npub)
        entry_id = await journal.open_entry(
            npub=npub,
            mode="historical",
            difficulty="mulligan",
            scenario=scenario,
        )
        return {"entry_id": entry_id, "scenario": scenario, "replay_of": replay_entry_id}

    if mode not in _VALID_MODES:
        return {"error": f"invalid mode: {mode!r}. Choose one of {_VALID_MODES}"}
    if difficulty not in _VALID_DIFFICULTIES:
        return {"error": f"invalid difficulty: {difficulty!r}. Choose one of {_VALID_DIFFICULTIES}"}
    # Mulligan can't be a from-scratch generation — it only makes sense
    # paired with a replay_entry_id (caught above).
    if difficulty == "mulligan":
        return {
            "error": (
                "Mulligan difficulty is only valid for replays. "
                "Pass replay_entry_id to redo a past scenario, or pick "
                "apprentice / journeyman / adept / sovereign for a fresh deal."
            )
        }
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
    sector_clause = ""
    sector_clean = (sector or "").strip()
    if sector_clean:
        sector_clause = (
            f"\n\nSECTOR FOCUS: The trainee has requested a scenario in the "
            f"\"{sector_clean}\" sector. Pick a ticker, asset, or company that "
            f"genuinely belongs to that sector — not a tangential player. "
            f"Catalysts, relevant_facts, red_herrings, and constraints should "
            f"reflect the sector's actual dynamics (e.g., FDA decisions for "
            f"biotech, fab capex / TSMC-Samsung dynamics for semis, rate-curve "
            f"sensitivity for banks). If the requested sector genuinely has "
            f"no live options-trading dynamic worth drilling on for this "
            f"persona / mode, you may pick a closely-adjacent sector and "
            f"explain the substitution in the briefing — but only as a last "
            f"resort. Vary the SPECIFIC ticker from prior attempts within "
            f"the same sector."
        )
    prompt = (
        f"{mode_instr}\n\n"
        f'Generate ONE options drill scenario at difficulty level: "{difficulty}". '
        f'Set the "mode" field to "{mode}". Vary the asset class from any prior attempts. '
        f"Return JSON only."
        f"{risk_clause}"
        f"{sector_clause}"
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
    # Echo the requested sector so the FE can display it on the
    # scenario card and the judge can verify the LLM stayed on-topic.
    if sector_clean:
        scenario["sector"] = sector_clean

    entry_id = await journal.open_entry(
        npub=npub,
        mode=mode,
        difficulty=difficulty,
        scenario=scenario,
    )
    return {"entry_id": entry_id, "scenario": scenario}


# A clue question is a sentence or two. Anything much longer is either
# noise or an attempt to smuggle a bulk prompt onto the operator's
# Anthropic account behind the small clue fee — cap it before we ever
# pay for input tokens. The TIP_SYSTEM prompt is the second line of
# defense for off-topic (but short) questions.
MAX_TIP_QUESTION_CHARS = 500

# The clue desk carries conversation history so follow-on questions
# ("do you mean XYZ?") have context. The FE supplies that transcript,
# and tool input is adversarial, so we never trust its size: keep only
# the most recent turns and clip each field. This keeps follow-ups
# working without letting the history become a smuggling channel for a
# bulk prompt on the operator's account.
MAX_TIP_HISTORY_TURNS = 6
MAX_TIP_HISTORY_FIELD_CHARS = 800


def _coerce_history(history: Any) -> list[dict[str, str]]:
    """Normalize client-supplied tip history into capped {question, answer} turns.

    ``history`` arrives as a JSON-encoded array (the FE encodes it) or,
    defensively, an already-decoded list. Anything malformed degrades to
    "no history" rather than erroring — a missing transcript just means a
    context-free clue, not a failed request.
    """
    if isinstance(history, str):
        history = history.strip()
        if not history:
            return []
        try:
            import json

            history = json.loads(history)
        except (ValueError, TypeError):
            return []
    if not isinstance(history, list):
        return []
    turns: list[dict[str, str]] = []
    for item in history[-MAX_TIP_HISTORY_TURNS:]:
        if not isinstance(item, dict):
            continue
        q = str(item.get("question") or "").strip()[:MAX_TIP_HISTORY_FIELD_CHARS]
        a = str(item.get("answer") or "").strip()[:MAX_TIP_HISTORY_FIELD_CHARS]
        if q or a:
            turns.append({"question": q, "answer": a})
    return turns


async def ask_tip(
    npub: str,
    entry_id: str,
    question: str,
    history: Any = None,
) -> dict[str, Any]:
    """Return a non-spoiler Socratic hint for the open journal entry.

    Scope is the options scenario only: off-topic questions are turned
    away cheaply so the clue desk can't be used as a general LLM on the
    operator's account. ``history`` is the prior turns of this clue
    conversation so follow-on questions have context.
    """
    q = (question or "").strip()
    if not q:
        return {"tip": "Ask a question about this scenario to get a clue."}
    if len(q) > MAX_TIP_QUESTION_CHARS:
        return {
            "tip": (
                "Whoa — that's a long message for a quick clue. I already have "
                "our clue conversation here, so there's no need to paste it back. "
                "Just ask your new question briefly and clearly."
            )
        }
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
    transcript = ""
    turns = _coerce_history(history)
    if turns:
        lines: list[str] = []
        for t in turns:
            if t["question"]:
                lines.append(f"Trainee: {t['question']}")
            if t["answer"]:
                lines.append(f"Clue desk: {t['answer']}")
        transcript = (
            "Earlier in THIS clue conversation (most recent last):\n"
            + "\n".join(lines)
            + "\n\n"
        )
    prompt = (
        "The trainee has seen ONLY these scenario fields:\n"
        f"{visible}\n\n"
        f"{transcript}"
        f"Their new question: {q}\n\n"
        "Offer ONE Socratic nudge. Under 80 words. No specific strikes, structures, or directional bias."
    )
    try:
        text = await call_claude(
            prompt, prompts.TIP_SYSTEM, max_tokens=700,
            npub=npub, tool="ask_tip",
        )
    except ClaudeError as e:
        return {"error": str(e)}
    # Count this clue against the entry so the judge can apply a small
    # score penalty per clue used. Best-effort; failure shouldn't deny
    # the patron the answer they paid for.
    try:
        from db import journal as journal_db
        await journal_db.increment_tips_count(npub, entry_id)
    except Exception:
        pass
    return {"tip": text}
