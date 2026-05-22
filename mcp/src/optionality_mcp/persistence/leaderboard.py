"""Leaderboard write-through cache.

``leaderboard_stats`` is materialized — not a VIEW. ``recompute_leaderboard``
rebuilds a patron's row from their ``journal_entries`` on every state change
(every ``judge_trade`` commit, every ``delete_journal``). Reads are O(1) on a
single indexed row.

Streak threshold is 70 (encoded here, not in DDL).
"""

from __future__ import annotations

import json
import logging
from typing import Any

from optionality_mcp.persistence.neon import execute, fetch, fetchrow

logger = logging.getLogger(__name__)

STREAK_THRESHOLD = 70


def _compute_streaks(scores_desc: list[int]) -> tuple[int, int]:
    """Return ``(current_streak, longest_streak)`` from a desc-ordered score list.

    ``current_streak`` counts consecutive wins from index 0; breaks on the
    first sub-threshold entry. ``longest_streak`` is the max consecutive
    run anywhere in the history.
    """
    current = 0
    for s in scores_desc:
        if s >= STREAK_THRESHOLD:
            current += 1
        else:
            break

    longest = 0
    run = 0
    for s in scores_desc:
        if s >= STREAK_THRESHOLD:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
    return current, longest


def _bucket_counts(rows: list[dict[str, Any]], key: str) -> dict[str, dict[str, Any]]:
    """Group rows by ``key`` (e.g. ``mode`` or ``difficulty``) and return
    ``{value: {"played": N, "avg_score": X, "best_score": Y}}``.
    """
    buckets: dict[str, list[int]] = {}
    for r in rows:
        v = str(r.get(key) or "")
        buckets.setdefault(v, []).append(int(r.get("score") or 0))
    out: dict[str, dict[str, Any]] = {}
    for v, scores in buckets.items():
        if not scores:
            continue
        out[v] = {
            "played": len(scores),
            "avg_score": round(sum(scores) / len(scores), 2),
            "best_score": max(scores),
        }
    return out


async def recompute_leaderboard(npub: str) -> None:
    """Idempotently rebuild this patron's leaderboard row from their journal.

    Runs the underlying SELECT against ``journal_entries`` with
    ``status = 'evaluated'`` and writes the aggregated values to
    ``leaderboard_stats`` via UPSERT. Display name is pulled from
    ``patrons`` so renames propagate without a separate query.

    Caller is responsible for transaction boundaries — the consumer side
    (Phase-3 ``judge_trade`` and ``delete_journal`` tools) wraps both the
    journal mutation and this recompute in a single vault transaction.
    """
    rows = await fetch(
        """
        SELECT score, mode, difficulty, updated_at
        FROM journal_entries
        WHERE npub = $1 AND status = 'evaluated' AND score IS NOT NULL
        ORDER BY updated_at DESC
        """,
        npub,
    )

    patron = await fetchrow("SELECT display_name FROM patrons WHERE npub = $1", npub)
    display_name = (patron or {}).get("display_name")

    if not rows:
        # Delete any stale row so the leaderboard doesn't keep a zombie 0/0/0 entry.
        await execute(
            "DELETE FROM leaderboard_stats WHERE npub = $1",
            npub,
        )
        return

    scores_desc = [int(r["score"]) for r in rows]
    total_played = len(scores_desc)
    avg_score = round(sum(scores_desc) / total_played, 2)
    best_score = max(scores_desc)
    current_streak, longest_streak = _compute_streaks(scores_desc)
    last_played_at = rows[0]["updated_at"]
    by_mode = _bucket_counts(rows, "mode")
    by_difficulty = _bucket_counts(rows, "difficulty")

    await execute(
        """
        INSERT INTO leaderboard_stats
            (npub, display_name, total_played, avg_score, best_score,
             current_streak, longest_streak, last_played_at,
             by_mode, by_difficulty, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, NOW())
        ON CONFLICT (npub) DO UPDATE SET
            display_name   = EXCLUDED.display_name,
            total_played   = EXCLUDED.total_played,
            avg_score      = EXCLUDED.avg_score,
            best_score     = EXCLUDED.best_score,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            last_played_at = EXCLUDED.last_played_at,
            by_mode        = EXCLUDED.by_mode,
            by_difficulty  = EXCLUDED.by_difficulty,
            updated_at     = NOW()
        """,
        npub,
        display_name,
        total_played,
        avg_score,
        best_score,
        current_streak,
        longest_streak,
        last_played_at,
        json.dumps(by_mode),
        json.dumps(by_difficulty),
    )


_SORT_COLUMN: dict[str, str] = {
    "avg":     "avg_score DESC",
    "best":    "best_score DESC",
    "streak":  "current_streak DESC",
    "played":  "total_played DESC",
    "recent":  "last_played_at DESC NULLS LAST",
}


async def get_leaderboard(
    sort_by: str = "avg",
    limit: int = 25,
    mode: str | None = None,
    difficulty: str | None = None,
) -> list[dict[str, Any]]:
    """Return the global leaderboard, optionally scoped to a mode/difficulty bucket.

    For ``mode`` or ``difficulty`` scopes we read the JSONB bucket and sort
    by the bucket's avg/best/played. With no scope we sort by the top-level
    cached columns — O(1) on the index.
    """
    order = _SORT_COLUMN.get(sort_by, _SORT_COLUMN["avg"])
    lim = max(1, min(200, limit))

    if mode:
        return await fetch(
            f"""
            SELECT npub, display_name,
                   (by_mode->$1->>'played')::INT     AS scope_played,
                   (by_mode->$1->>'avg_score')::NUMERIC AS scope_avg_score,
                   (by_mode->$1->>'best_score')::INT AS scope_best_score,
                   total_played, avg_score, best_score, current_streak, longest_streak,
                   last_played_at
            FROM leaderboard_stats
            WHERE by_mode ? $1
            ORDER BY {order}
            LIMIT $2
            """,
            mode, lim,
        )
    if difficulty:
        return await fetch(
            f"""
            SELECT npub, display_name,
                   (by_difficulty->$1->>'played')::INT     AS scope_played,
                   (by_difficulty->$1->>'avg_score')::NUMERIC AS scope_avg_score,
                   (by_difficulty->$1->>'best_score')::INT AS scope_best_score,
                   total_played, avg_score, best_score, current_streak, longest_streak,
                   last_played_at
            FROM leaderboard_stats
            WHERE by_difficulty ? $1
            ORDER BY {order}
            LIMIT $2
            """,
            difficulty, lim,
        )

    return await fetch(
        f"""
        SELECT npub, display_name, total_played, avg_score, best_score,
               current_streak, longest_streak, last_played_at
        FROM leaderboard_stats
        ORDER BY {order}
        LIMIT $1
        """,
        lim,
    )


async def get_my_rank(npub: str, sort_by: str = "avg") -> dict[str, Any]:
    """Return this patron's leaderboard row plus their rank under the chosen sort."""
    order = _SORT_COLUMN.get(sort_by, _SORT_COLUMN["avg"])
    rank_row = await fetchrow(
        f"""
        WITH ranked AS (
            SELECT npub, RANK() OVER (ORDER BY {order}) AS rank
            FROM leaderboard_stats
        )
        SELECT rank FROM ranked WHERE npub = $1
        """,
        npub,
    )
    row = await fetchrow(
        "SELECT * FROM leaderboard_stats WHERE npub = $1",
        npub,
    )
    if not row:
        return {"npub": npub, "rank": None, "stats": None}
    return {
        "npub": npub,
        "rank": int(rank_row["rank"]) if rank_row else None,
        "stats": row,
    }
