"""Leaderboard read tools + display-name setter."""

from __future__ import annotations

import logging
from typing import Any

from optionality_mcp.persistence import leaderboard as lb
from optionality_mcp.persistence import patrons

logger = logging.getLogger(__name__)


async def get_leaderboard(
    npub: str,
    sort_by: str = "avg",
    limit: int = 25,
    scope: str = "",
) -> dict[str, Any]:
    """Return the global leaderboard, optionally scoped to a mode/difficulty bucket.

    ``scope`` is a free-form filter of the form ``"mode=historical"`` or
    ``"difficulty=adept"``. Anything else is ignored (returns the unscoped
    global board).
    """
    del npub  # billing-only arg
    mode: str | None = None
    difficulty: str | None = None
    if scope:
        s = scope.strip().lower()
        if s.startswith("mode="):
            mode = s.split("=", 1)[1] or None
        elif s.startswith("difficulty="):
            difficulty = s.split("=", 1)[1] or None
    rows = await lb.get_leaderboard(
        sort_by=sort_by,
        limit=limit,
        mode=mode,
        difficulty=difficulty,
    )
    return {"sort_by": sort_by, "scope": scope or "all", "rows": rows, "count": len(rows)}


async def get_my_rank(npub: str, sort_by: str = "avg") -> dict[str, Any]:
    """Return the caller's leaderboard row plus ordinal rank under ``sort_by``."""
    return await lb.get_my_rank(npub, sort_by=sort_by)


async def set_display_name(npub: str, name: str) -> dict[str, Any]:
    """Set the caller's display name. Surfaces on the leaderboard."""
    await patrons.upsert_patron(npub)
    try:
        cleaned = await patrons.set_display_name(npub, name)
    except ValueError as e:
        return {"error": str(e)}
    return {"display_name": cleaned}
