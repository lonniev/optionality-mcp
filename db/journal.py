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

# Difficulty has a natural skill order; alphabetical sorting would scramble
# it (adept < apprentice < journeyman < …). This CASE ranks it so both
# row-sort and group-order on difficulty read as a skill ladder.
_DIFFICULTY_RANK = (
    "CASE difficulty "
    "WHEN 'apprentice' THEN 1 "
    "WHEN 'journeyman' THEN 2 "
    "WHEN 'adept' THEN 3 "
    "WHEN 'sovereign' THEN 4 "
    "WHEN 'mulligan' THEN 5 "
    "ELSE 9 END"
)

# Whitelisted sort columns. The caller-supplied `sort_col` is looked up
# here with a safe fallback — column expressions NEVER come from caller
# input, so an unknown value can't reach the query as raw SQL.
_SORT_MAP: dict[str, str] = {
    "created": "created_at",
    "updated": "updated_at",
    "symbol": "COALESCE(ticker, '~')",
    "historicity": "mode",
    "difficulty": _DIFFICULTY_RANK,
    "grade": "letter_grade",
    "score": "score",
    "status": "status",
}

# Whitelisted group dimensions and the expression each grouped row carries
# back as `group_key`.
_GROUP_MAP: dict[str, str] = {
    "none": "''",
    "historicity": "mode",
    "difficulty": "difficulty",
    "symbol": "COALESCE(ticker, '—')",
}

# Group ORDER BY uses the difficulty rank (not the bare text column) so
# difficulty groups also order as a skill ladder.
_GROUP_ORDER_MAP: dict[str, str] = {
    **_GROUP_MAP,
    "difficulty": _DIFFICULTY_RANK,
}


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
    group_by: str = "none",
    group_sort: str = "asc",
    sort_col: str = "created",
    sort_dir: str = "desc",
    page: int = 0,
    page_size: int = 25,
) -> dict[str, Any]:
    """Server-side filtered, grouped, sorted, paginated journal list.

    Sorting and grouping run in SQL so each page is a slice of the fully
    ordered dataset — not just a reordering of one already-fetched page.
    All ORDER BY / GROUP BY expressions come from the fixed whitelists
    (`_SORT_MAP`, `_GROUP_MAP`); caller input only selects a key, so an
    unknown `sort_col`/`group_by` falls back to a safe default rather than
    reaching the query as raw SQL.

    Args:
        status:     Optional lifecycle filter (``open``/``submitted``/``evaluated``/``abandoned``).
        group_by:   ``none`` | ``historicity`` | ``difficulty`` | ``symbol``.
        group_sort: Group order direction, ``asc`` | ``desc``.
        sort_col:   A key of `_SORT_MAP`. Row order within (each group of) the result.
        sort_dir:   Row order direction, ``asc`` | ``desc``.
        page:       0-indexed page number.
        page_size:  Rows per page (clamped 1..200).

    Returns a dict: ``{total, page, page_size, groups, entries}``. ``groups``
    is the per-group ``{key, count, avg_score}`` aggregate over the WHOLE
    filtered set (computed once, not paged); empty when ``group_by='none'``.
    """
    psize = max(1, min(200, page_size))
    pg = max(0, page)
    offset = pg * psize

    sort_expr = _SORT_MAP.get(sort_col, "created_at")
    row_dir = "DESC" if str(sort_dir).lower() == "desc" else "ASC"
    grp_dir = "DESC" if str(group_sort).lower() == "desc" else "ASC"

    grouped = group_by in _GROUP_MAP and group_by != "none"
    group_expr = _GROUP_MAP.get(group_by, "''") if grouped else "''"
    group_order_expr = _GROUP_ORDER_MAP.get(group_by, "''") if grouped else "''"

    # WHERE — npub always; status optional. Bound positionally as $1, $2…
    params: list[Any] = [npub]
    where = "npub = $1"
    if status:
        params.append(status)
        where += f" AND status = ${len(params)}"

    # ── Total (filtered, before pagination) ──
    total_row = await fetchrow(
        f"SELECT COUNT(*) AS n FROM journal_entries WHERE {where}",
        *params,
    )
    total = int(total_row["n"]) if total_row and total_row.get("n") is not None else 0

    # ── Group aggregates: every group, once — separate from the paged rows ──
    groups: list[dict[str, Any]] = []
    if grouped:
        group_rows = await fetch(
            f"""
            SELECT {group_expr} AS gk, COUNT(*) AS cnt, AVG(score) AS avg_score
            FROM journal_entries
            WHERE {where}
            GROUP BY {group_expr}
            ORDER BY {group_order_expr} {grp_dir}
            """,
            *params,
        )
        groups = [
            {
                "key": str(g.get("gk") if g.get("gk") is not None else ""),
                "count": int(g.get("cnt") or 0),
                "avg_score": (
                    float(g["avg_score"]) if g.get("avg_score") is not None else None
                ),
            }
            for g in group_rows
        ]

    # ── Paged rows. Within a grouping, order by group then the chosen sort;
    # created_at is the stable tiebreak. The idx_journal_npub_created index
    # covers the default sort; other sorts scan one patron's rows (small N). ──
    order_clause = (
        f"{group_order_expr} {grp_dir}, {sort_expr} {row_dir}, created_at DESC"
        if grouped
        else f"{sort_expr} {row_dir}, created_at DESC"
    )
    params.append(psize)
    limit_idx = len(params)
    params.append(offset)
    offset_idx = len(params)

    entries = await fetch(
        f"""
        SELECT id::text AS id, status, mode, difficulty, ticker, score, letter_grade,
               is_shared, created_at, updated_at, {group_expr} AS group_key
        FROM journal_entries
        WHERE {where}
        ORDER BY {order_clause}
        LIMIT ${limit_idx} OFFSET ${offset_idx}
        """,
        *params,
    )

    return {
        "total": total,
        "page": pg,
        "page_size": psize,
        "groups": groups,
        "entries": entries,
    }


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


async def recent_tickers(
    npub: str,
    sector: str | None = None,
    limit: int = 12,
) -> list[str]:
    """Distinct tickers from this patron's most recent journal entries.

    Ordered newest-first by each ticker's most recent appearance. When
    ``sector`` is provided, restrict to entries whose scenario JSON
    has a matching ``sector`` field (case-insensitive).

    The dealer uses this to tell the LLM "don't pick these tickers
    again" — without that exclusion list the model reflexively returns
    to a handful of training-data favorites (ICPT for biotech,
    NVDA for semis, MSTR for crypto-equity).
    """
    lim = max(1, min(50, limit))
    sec = (sector or "").strip().lower() or None
    if sec:
        rows = await fetch(
            "SELECT ticker, MAX(created_at) AS last_seen "
            "FROM journal_entries "
            "WHERE npub = $1 AND ticker IS NOT NULL "
            "AND LOWER(scenario->>'sector') = $2 "
            "GROUP BY ticker "
            "ORDER BY last_seen DESC "
            "LIMIT $3",
            npub, sec, lim,
        )
    else:
        rows = await fetch(
            "SELECT ticker, MAX(created_at) AS last_seen "
            "FROM journal_entries "
            "WHERE npub = $1 AND ticker IS NOT NULL "
            "GROUP BY ticker "
            "ORDER BY last_seen DESC "
            "LIMIT $2",
            npub, lim,
        )
    return [str(r.get("ticker")) for r in rows if r.get("ticker")]


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
