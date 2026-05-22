"""Patron persistence — upsert, display name."""

from __future__ import annotations

import logging

from db.neon import execute, fetchrow

logger = logging.getLogger(__name__)

_MAX_DISPLAY_NAME_LEN = 32


async def upsert_patron(npub: str) -> None:
    """Idempotently create a patron row.

    Called automatically on the first state-changing tool call from a new
    npub. Safe to call repeatedly — ``ON CONFLICT DO NOTHING`` keeps existing
    rows untouched, preserving ``display_name`` and ``created_at``.
    """
    await execute(
        """
        INSERT INTO patrons (npub)
        VALUES ($1)
        ON CONFLICT (npub) DO NOTHING
        """,
        npub,
    )


async def get_patron(npub: str) -> dict | None:
    """Return the patron row or ``None`` if the npub has no record yet."""
    return await fetchrow("SELECT * FROM patrons WHERE npub = $1", npub)


def normalize_display_name(name: str) -> str:
    """Strip whitespace and enforce 1..32 char bounds. Unicode allowed.

    Raises ``ValueError`` on empty or over-long input — caller should surface
    that as a user-facing tool error.
    """
    cleaned = name.strip()
    if not cleaned:
        raise ValueError("display_name cannot be empty")
    if len(cleaned) > _MAX_DISPLAY_NAME_LEN:
        raise ValueError(
            f"display_name too long (max {_MAX_DISPLAY_NAME_LEN} chars, got {len(cleaned)})"
        )
    return cleaned


async def set_display_name(npub: str, name: str) -> str:
    """Set the patron's display name and propagate to the leaderboard cache.

    Returns the normalized name actually stored. The patron row is ensured
    to exist first so this works for a first-time caller. The propagation
    to ``leaderboard_stats`` is a no-op for patrons who have never been
    evaluated — they have no leaderboard row yet, and Task 14h45's
    ``recompute_leaderboard`` will pick up the display name from the
    ``patrons`` join when their first evaluation lands.
    """
    cleaned = normalize_display_name(name)
    await upsert_patron(npub)
    await execute(
        "UPDATE patrons SET display_name = $2 WHERE npub = $1",
        npub,
        cleaned,
    )
    await execute(
        "UPDATE leaderboard_stats SET display_name = $2, updated_at = NOW() WHERE npub = $1",
        npub,
        cleaned,
    )
    return cleaned
