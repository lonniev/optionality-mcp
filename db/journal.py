"""Journal entry persistence — drafts, evaluations, list/get/delete.

The journal lifecycle has four states:

- ``open``       — scenario dealt, no trade submitted yet.
- ``submitted``  — trainee saved a draft trade proposal via ``save_draft``.
- ``evaluated``  — judge ran; ``evaluation`` JSONB and ``score`` populated.
- ``abandoned``  — trainee discarded the scenario without evaluating.

State transitions happen inside Phase-3 tool handlers; these functions are
deliberately low-level CRUD with no business rules of their own.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from db.neon import execute, fetch, fetchrow

logger = logging.getLogger(__name__)


async def open_entry(
    npub: str,
    mode: str,
    difficulty: str,
    scenario: dict[str, Any],
) -> str:
    """Insert a new ``open`` entry and return its UUID.

    Only mode + difficulty are recorded for downstream pricing/scoring
    decisions. The leaderboard's weighting query asks the live pricing
    model what those two values are worth at recompute time, so no
    per-entry price snapshot is stored.
    """
    ticker = (scenario.get("asset") or {}).get("ticker") or None
    row = await fetchrow(
        """
        INSERT INTO journal_entries (npub, status, mode, difficulty, scenario, ticker)
        VALUES ($1, 'open', $2, $3, $4::jsonb, $5)
        RETURNING id::text AS id
        """,
        npub,
        mode,
        difficulty,
        json.dumps(scenario),
        ticker,
    )
    if not row:
        raise RuntimeError("open_entry: INSERT … RETURNING returned no row")
    return str(row["id"])


async def save_draft(npub: str, entry_id: str, trade_proposal: str) -> None:
    """Persist a draft trade proposal without running the judge.

    Status stays ``open``. ``trade_proposal`` is the trainee's free-text
    trade — the judge parses it into structured legs when evaluation runs.
    """
    await execute(
        """
        UPDATE journal_entries
        SET trade_proposal = $3, updated_at = NOW()
        WHERE id = $2::uuid AND npub = $1
        """,
        npub,
        entry_id,
        trade_proposal,
    )


async def record_evaluation(
    npub: str,
    entry_id: str,
    trade_proposal: str,
    evaluation: dict[str, Any],
) -> None:
    """Commit the judge's verdict on a submitted trade.

    Transitions the entry from ``open``/``submitted`` to ``evaluated``,
    persists ``trade_legs``, ``evaluation``, ``score``, ``letter_grade``.
    """
    legs = evaluation.get("trade_legs")
    score = evaluation.get("overall_score")
    grade = evaluation.get("letter_grade")
    await execute(
        """
        UPDATE journal_entries
        SET status        = 'evaluated',
            trade_proposal = $3,
            trade_legs    = $4::jsonb,
            evaluation    = $5::jsonb,
            score         = $6,
            letter_grade  = $7,
            updated_at    = NOW()
        WHERE id = $2::uuid AND npub = $1
        """,
        npub,
        entry_id,
        trade_proposal,
        json.dumps(legs) if legs is not None else None,
        json.dumps(evaluation),
        score,
        grade,
    )


async def list_entries(
    npub: str,
    status: str | None = None,
    limit: int = 50,
    before: str | None = None,
) -> list[dict[str, Any]]:
    """Paginated list of a patron's journal entries, newest first.

    Args:
        status:   Optional filter: ``open``, ``submitted``, ``evaluated``, ``abandoned``.
        limit:    Max rows (1..200).
        before:   ISO timestamp; only entries with ``created_at < before`` are returned.
                  Used by the UI for "load more" pagination.
    """
    lim = max(1, min(200, limit))
    if status and before:
        return await fetch(
            """
            SELECT id::text AS id, status, mode, difficulty, ticker, score, letter_grade,
                   is_shared, created_at, updated_at
            FROM journal_entries
            WHERE npub = $1 AND status = $2 AND created_at < $3::timestamptz
            ORDER BY created_at DESC
            LIMIT $4
            """,
            npub, status, before, lim,
        )
    if status:
        return await fetch(
            """
            SELECT id::text AS id, status, mode, difficulty, ticker, score, letter_grade,
                   is_shared, created_at, updated_at
            FROM journal_entries
            WHERE npub = $1 AND status = $2
            ORDER BY created_at DESC
            LIMIT $3
            """,
            npub, status, lim,
        )
    if before:
        return await fetch(
            """
            SELECT id::text AS id, status, mode, difficulty, ticker, score, letter_grade,
                   is_shared, created_at, updated_at
            FROM journal_entries
            WHERE npub = $1 AND created_at < $2::timestamptz
            ORDER BY created_at DESC
            LIMIT $3
            """,
            npub, before, lim,
        )
    return await fetch(
        """
        SELECT id::text AS id, status, mode, difficulty, ticker, score, letter_grade,
               created_at, updated_at
        FROM journal_entries
        WHERE npub = $1
        ORDER BY created_at DESC
        LIMIT $2
        """,
        npub, lim,
    )


async def get_entry(npub: str, entry_id: str) -> dict[str, Any] | None:
    """Return the full journal entry including scenario + evaluation JSONB."""
    return await fetchrow(
        """
        SELECT id::text AS id, status, mode, difficulty, scenario, trade_proposal,
               trade_legs, evaluation, score, letter_grade, ticker,
               is_shared, tips_count, created_at, updated_at
        FROM journal_entries
        WHERE id = $2::uuid AND npub = $1
        """,
        npub, entry_id,
    )


async def delete_entry(npub: str, entry_id: str) -> bool:
    """Hard-delete the entry; returns ``True`` if a row was removed."""
    result = await execute(
        "DELETE FROM journal_entries WHERE id = $2::uuid AND npub = $1",
        npub, entry_id,
    )
    # Neon HTTP SQL API returns "rowCount" (capital C), not "rowcount".
    return (result.get("rowCount") or 0) > 0


async def increment_tips_count(npub: str, entry_id: str) -> int:
    """Bump tips_count for an open entry, return the new count.

    Returns 0 if the entry doesn't exist or isn't owned by this patron
    (caller treats this as a no-op).
    """
    row = await fetchrow(
        """
        UPDATE journal_entries
        SET tips_count = tips_count + 1, updated_at = NOW()
        WHERE id = $2::uuid AND npub = $1
        RETURNING tips_count
        """,
        npub, entry_id,
    )
    return int(row["tips_count"]) if row and row.get("tips_count") is not None else 0


async def set_shared(npub: str, entry_id: str, shared: bool) -> bool:
    """Toggle the patron's per-entry share flag.

    Only evaluated entries can be shared — pre-judgment drafts have no
    evaluation to compare against. Returns ``True`` if a row matched and
    was updated; ``False`` for missing / un-evaluated / wrong-owner.
    """
    result = await execute(
        """
        UPDATE journal_entries
        SET is_shared = $3, updated_at = NOW()
        WHERE id = $2::uuid AND npub = $1 AND status = 'evaluated'
        """,
        npub, entry_id, shared,
    )
    # Neon HTTP SQL API returns "rowCount" (capital C), not "rowcount".
    return (result.get("rowCount") or 0) > 0


async def list_shared_for(target_npub: str, limit: int = 20) -> list[dict[str, Any]]:
    """Return the target patron's shared, evaluated entries — newest first.

    Eager-loads ``evaluation``, ``trade_proposal``, ``trade_legs`` so the
    FE peer-view can expand a row without a second round trip. Limit is
    capped at 50 to keep the payload bounded.
    """
    lim = max(1, min(50, limit))
    return await fetch(
        """
        SELECT id::text AS id, mode, difficulty, ticker, score, letter_grade,
               trade_proposal, trade_legs, evaluation, created_at
        FROM journal_entries
        WHERE npub = $1 AND is_shared = TRUE AND status = 'evaluated'
        ORDER BY created_at DESC
        LIMIT $2
        """,
        target_npub, lim,
    )
