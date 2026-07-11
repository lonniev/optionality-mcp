"""Dealer tools — scenario composition and Socratic tips.

The dealer LLM emits scenarios that embed the red-herring mechanic. The
``deal_scenario`` tool also opens a journal entry so the trainee can save
drafts against it before the judge runs.

Each LLM tool is split into halves shared by both execution paths — an
in-process runner (survives nothing worse than the process) and a detached
closure (survives a container recycle):

* ``_prepare_*`` — validation + fetch + build the prompt (and, for the dealer,
  the mode-dependent LLM bounds). Runs in the runner AND in ``build_closure``.
* ``_finalize_*`` — parse the output + param-dependent DB side effects (open a
  journal entry, count a clue). Runs in the runner AND in ``shape_result``.

Each path runs each half exactly once, so a side effect fires once regardless
of where the LLM actually ran.
"""

from __future__ import annotations

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
from db import journal, patrons
from tools.options_chain import build_option_chain

logger = logging.getLogger(__name__)

_VALID_MODES = ("historical", "fiction", "live")
# "mulligan" is the replay difficulty — when a patron picks a past
# evaluated entry from their Journal and asks to redo it, the wheel
# reissues the same scenario as a fresh play. Priced + leaderboard-
# weighted distinctly from the original difficulty levels.
_VALID_DIFFICULTIES = ("apprentice", "journeyman", "adept", "sovereign", "mulligan")


def _invalid_input_situation(message: str) -> AsyncJobSituation:
    """Refundable: a malformed deal request (bad mode / difficulty / budget)."""
    return AsyncJobSituation(
        error_code="invalid_deal_request",
        message=f"{message} No fare was charged.",
        next_steps="Adjust the request and deal again.",
        transient=False,
    )


def _entry_not_found_situation() -> AsyncJobSituation:
    """Refundable: the journal entry a tip/replay references is gone."""
    return AsyncJobSituation(
        error_code="journal_entry_not_found",
        message="That scenario isn't in your journal anymore. No fare was charged.",
        next_steps="Deal a fresh scenario.",
        transient=False,
    )


# ── deal_scenario ────────────────────────────────────────────────────────────

async def replay_scenario(
    npub: str, replay_entry_id: str, max_loss_usd: int | None = None
) -> dict[str, Any]:
    """Reissue a past entry's scenario as a fresh play. Deterministic — no LLM.

    Runs synchronously in the ``deal_scenario`` tool (no claim check): there is
    no LLM round-trip to outlive a client timeout, so a detached job would only
    add latency. Returns the settled ``{status: done, result}`` envelope the
    frontend already handles for a redeemed claim.
    """
    original = await journal.get_entry(npub, replay_entry_id)
    if not original:
        raise _entry_not_found_situation()
    scenario = original.get("scenario") or {}
    if not scenario:
        raise _invalid_input_situation("The original entry has no scenario to replay.")

    # Force the replay's mode + difficulty so pricing and leaderboard
    # weighting reflect "second look" rather than the original setup.
    scenario["mode"] = "historical"
    if max_loss_usd is not None:
        scenario["max_loss_usd"] = max_loss_usd
    scenario["replay_of"] = replay_entry_id

    # Rebuild the option chain from the original scaffolds so a pre-chain
    # replay still surfaces a chain. (Re-computation is deterministic —
    # same scaffolds produce the same numbers.)
    chain = build_option_chain(scenario)
    if chain is not None:
        scenario["option_chain"] = chain

    await patrons.upsert_patron(npub)
    entry_id = await journal.open_entry(
        npub=npub,
        mode="historical",
        difficulty="mulligan",
        scenario=scenario,
    )
    return {
        "success": True,
        "status": "done",
        "result": {
            "entry_id": entry_id,
            "scenario": scenario,
            "replay_of": replay_entry_id,
        },
    }


async def _prepare_deal(
    npub: str,
    mode: str,
    difficulty: str,
    max_loss_usd: int | None,
    sector: str,
) -> dict[str, Any]:
    """Validate + build the fresh-deal prompt and its mode-dependent LLM bounds.

    Returns ``{prompt, system, max_tokens, enable_web_search, timeout_seconds}``,
    or raises a refundable situation on invalid input.
    """
    if mode not in _VALID_MODES:
        raise _invalid_input_situation(f"Invalid mode {mode!r}.")
    if difficulty not in _VALID_DIFFICULTIES:
        raise _invalid_input_situation(f"Invalid difficulty {difficulty!r}.")
    # Mulligan can't be a from-scratch generation — it only makes sense
    # paired with a replay_entry_id (handled by replay_scenario).
    if difficulty == "mulligan":
        raise _invalid_input_situation(
            "Mulligan difficulty is only valid for replays."
        )
    if max_loss_usd is not None and max_loss_usd <= 0:
        raise _invalid_input_situation("max_loss_usd must be positive when provided.")

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
            f"resort."
        )

    # Exclude tickers the trainee has seen recently so the LLM stops
    # reflex-picking its training-data favorites (ICPT for biotech,
    # MSTR for crypto-equity, etc.) and the trainee gets actual variety.
    # Sector-scoped when a sector is set; unscoped otherwise.
    recent = await journal.recent_tickers(
        npub=npub,
        sector=sector_clean or None,
        limit=12,
    )
    avoid_clause = ""
    if recent:
        avoid_clause = (
            f"\n\nAVOID THESE TICKERS — the trainee has recently been dealt "
            f"these in the {'same sector' if sector_clean else 'app'}: "
            f"{', '.join(recent)}. Pick a DIFFERENT name from the sector / "
            f"asset class. The above list is not exhaustive — there are many "
            f"liquid, options-tradeable names worth drilling in every sector, "
            f"and the goal is broad coverage over the trainee's career, not "
            f"the same two or three favorites."
        )
    prompt = (
        f"{mode_instr}\n\n"
        f'Generate ONE options drill scenario at difficulty level: "{difficulty}". '
        f'Set the "mode" field to "{mode}". Vary the asset class from any prior attempts. '
        f"Return JSON only."
        f"{risk_clause}"
        f"{sector_clause}"
        f"{avoid_clause}"
    )
    enable_web_search = mode == "live"
    # Bound the LLM call by the job budget: live mode runs Anthropic web_search
    # and legitimately takes longer; a plain generation should finish well
    # inside two minutes. A stall past this raises a refundable situation.
    return {
        "prompt": prompt,
        "system": prompts.SCENARIO_SYSTEM,
        "max_tokens": 4000 if enable_web_search else 2500,
        "enable_web_search": enable_web_search,
        "timeout_seconds": 240 if enable_web_search else 120,
    }


async def _finalize_deal(
    npub: str,
    mode: str,
    difficulty: str,
    max_loss_usd: int | None,
    sector: str,
    text: str,
) -> dict[str, Any]:
    """Parse the scenario, build the chain, open the journal entry."""
    try:
        scenario = extract_json(text)
    except ClaudeError as e:
        raise empty_output_situation() from e

    scenario["mode"] = mode  # belt-and-suspenders: ensure mode round-trips
    # Echo the operator-supplied risk budget into the scenario JSON so the
    # FE, the judge, and the journal all see the same envelope.
    if max_loss_usd is not None:
        scenario["max_loss_usd"] = max_loss_usd
    # Echo the requested sector so the FE can display it on the scenario
    # card and the judge can verify the LLM stayed on-topic.
    sector_clean = (sector or "").strip()
    if sector_clean:
        scenario["sector"] = sector_clean

    # Build the option chain from the dealer's scaffolds + the three
    # smile points. Trainee and judge both see this same chain — one
    # source of truth, no mental-model drift.
    chain = build_option_chain(scenario)
    if chain is not None:
        scenario["option_chain"] = chain

    entry_id = await journal.open_entry(
        npub=npub,
        mode=mode,
        difficulty=difficulty,
        scenario=scenario,
    )
    return {"entry_id": entry_id, "scenario": scenario}


async def deal_scenario(
    npub: str,
    mode: str,
    difficulty: str,
    max_loss_usd: int | None = None,
    replay_entry_id: str | None = None,
    sector: str = "",
) -> dict[str, Any]:
    """In-process runner (fresh generation only): prepare → LLM → finalize.

    Replays never reach a job — the ``deal_scenario`` tool handles them
    synchronously via ``replay_scenario``.
    """
    parts = await _prepare_deal(npub, mode, difficulty, max_loss_usd, sector)
    raw = await call_claude(
        parts["prompt"],
        parts["system"],
        max_tokens=parts["max_tokens"],
        enable_web_search=parts["enable_web_search"],
        npub=npub,
        tool="deal_scenario",
        timeout_seconds=parts["timeout_seconds"],
    )
    return await _finalize_deal(npub, mode, difficulty, max_loss_usd, sector, raw)


async def deal_build_closure(
    npub: str = "",
    mode: str = "",
    difficulty: str = "",
    max_loss_usd: int | None = None,
    sector: str = "",
    **_: Any,
) -> dict[str, Any]:
    """Detached path: bake the fresh-deal request into a sealed spec."""
    parts = await _prepare_deal(npub, mode, difficulty, max_loss_usd, sector)
    api_key = await require_api_key()
    return {
        "op": "http_request",
        "request": build_anthropic_request(
            api_key=api_key,
            prompt=parts["prompt"],
            system=parts["system"],
            max_tokens=parts["max_tokens"],
            enable_web_search=parts["enable_web_search"],
            timeout_seconds=parts["timeout_seconds"],
        ),
    }


async def deal_shape_result(
    raw: dict[str, Any] | None, params: dict[str, Any]
) -> dict[str, Any]:
    """Detached path: settle a completed run — extract the scenario, then finalize."""
    text = await shape_llm_text(raw, npub=params.get("npub", ""), tool="deal_scenario")
    return await _finalize_deal(
        params.get("npub", ""),
        params.get("mode", ""),
        params.get("difficulty", ""),
        params.get("max_loss_usd"),
        params.get("sector", "") or "",
        text,
    )


# ── ask_tip ──────────────────────────────────────────────────────────────────

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


def precheck_tip_question(question: str) -> dict[str, Any] | None:
    """Cheap, LLM-free guard for a degenerate clue question.

    Returns a canned ``{"tip": ...}`` payload when the question is empty or
    obviously oversized (a nudge, not an error — no LLM round-trip needed), or
    ``None`` when the question should go to the clue desk. The ``deal_scenario``
    tool short-circuits on a non-``None`` return, so a degenerate question never
    becomes a claim-check job.
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
    return None


async def _prepare_tip(
    npub: str, entry_id: str, question: str, history: Any
) -> str:
    """Build the clue prompt from the entry's visible fields + history.

    Assumes ``question`` already passed ``precheck_tip_question``. Raises a
    refundable situation when the referenced entry is gone.
    """
    entry = await journal.get_entry(npub, entry_id)
    if not entry:
        raise _entry_not_found_situation()
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
    return (
        "The trainee has seen ONLY these scenario fields:\n"
        f"{visible}\n\n"
        f"{transcript}"
        f"Their new question: {(question or '').strip()}\n\n"
        "Answer per your classification rules (educational / tactical / out-of-scope). "
        "No specific strikes, structures, or directional bias for THIS scenario."
    )


async def _finalize_tip(npub: str, entry_id: str, text: str) -> dict[str, Any]:
    """Count the clue against the entry (best-effort) and return it."""
    # A small per-clue judge penalty rides on this count; failure shouldn't
    # deny the patron the answer they paid for.
    try:
        from db import journal as journal_db
        await journal_db.increment_tips_count(npub, entry_id)
    except Exception:
        pass
    return {"tip": text}


async def ask_tip(
    npub: str,
    entry_id: str,
    question: str,
    history: Any = None,
) -> dict[str, Any]:
    """In-process runner: prepare → clue LLM → finalize."""
    prompt = await _prepare_tip(npub, entry_id, question, history)
    # Web search is available so a genuinely curious question can be answered
    # against a current, authoritative source, and the desk can recommend a real
    # link it actually found. A stall past the budget raises a refundable situation.
    text = await call_claude(
        prompt, prompts.TIP_SYSTEM, max_tokens=1500,
        enable_web_search=True,
        npub=npub, tool="ask_tip",
        timeout_seconds=120,
    )
    return await _finalize_tip(npub, entry_id, text)


async def tip_build_closure(
    npub: str = "",
    entry_id: str = "",
    question: str = "",
    history: Any = None,
    **_: Any,
) -> dict[str, Any]:
    """Detached path: bake the clue request into a sealed spec."""
    prompt = await _prepare_tip(npub, entry_id, question, history)
    api_key = await require_api_key()
    return {
        "op": "http_request",
        "request": build_anthropic_request(
            api_key=api_key,
            prompt=prompt,
            system=prompts.TIP_SYSTEM,
            max_tokens=1500,
            enable_web_search=True,
            timeout_seconds=120,
        ),
    }


async def tip_shape_result(
    raw: dict[str, Any] | None, params: dict[str, Any]
) -> dict[str, Any]:
    """Detached path: settle a completed run — extract the clue, then finalize."""
    text = await shape_llm_text(raw, npub=params.get("npub", ""), tool="ask_tip")
    return await _finalize_tip(
        params.get("npub", ""), params.get("entry_id", ""), text
    )
