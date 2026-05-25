"""Patron persistence — upsert, display name, avatar / bio / relays profile."""

from __future__ import annotations

import json
import logging
from typing import Any

from db.neon import execute, fetchrow

logger = logging.getLogger(__name__)

_MAX_DISPLAY_NAME_LEN = 32
_MAX_BIO_LEN = 500
_MAX_AVATAR_LEN = 16     # one emoji glyph (with possible ZWJ sequence) or a short token
_MAX_RELAYS = 12
_MAX_RELAY_URL_LEN = 200


async def upsert_patron(npub: str) -> None:
    """Idempotently create a patron row.

    Called automatically on the first state-changing tool call from a new
    npub. Safe to call repeatedly — ``ON CONFLICT DO NOTHING`` keeps existing
    rows untouched, preserving any profile fields and ``created_at``.
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


def normalize_bio(bio: str) -> str:
    """Strip whitespace and enforce 0..500 char bound. Empty bio allowed (clears it)."""
    cleaned = bio.strip()
    if len(cleaned) > _MAX_BIO_LEN:
        raise ValueError(
            f"bio too long (max {_MAX_BIO_LEN} chars, got {len(cleaned)})"
        )
    return cleaned


def normalize_avatar(avatar: str) -> str:
    """Validate the avatar token. One emoji glyph or a short alphanumeric tag."""
    cleaned = avatar.strip()
    if not cleaned:
        raise ValueError("avatar cannot be empty")
    if len(cleaned) > _MAX_AVATAR_LEN:
        raise ValueError(
            f"avatar too long (max {_MAX_AVATAR_LEN} chars, got {len(cleaned)})"
        )
    return cleaned


def normalize_relays(relays: list[Any] | str) -> list[str]:
    """Validate a relay list. Accepts a list of wss:// URLs, deduplicates, caps at 12.

    A JSON-string input is parsed so the FE can pass relays through as a
    serialized array without an extra unmarshalling step on the wire.
    """
    if isinstance(relays, str):
        try:
            relays = json.loads(relays)
        except json.JSONDecodeError as e:
            raise ValueError(f"relays JSON parse failed: {e}") from e
    if not isinstance(relays, list):
        raise ValueError("relays must be a list of relay URLs")
    cleaned: list[str] = []
    seen: set[str] = set()
    for r in relays:
        if not isinstance(r, str):
            raise ValueError(f"relay entries must be strings; got {type(r).__name__}")
        url = r.strip()
        if not url:
            continue
        if not (url.startswith("wss://") or url.startswith("ws://")):
            raise ValueError(f"relay URL must start with wss:// or ws://; got {url!r}")
        if len(url) > _MAX_RELAY_URL_LEN:
            raise ValueError(f"relay URL too long (max {_MAX_RELAY_URL_LEN} chars)")
        if url in seen:
            continue
        seen.add(url)
        cleaned.append(url)
        if len(cleaned) >= _MAX_RELAYS:
            break
    return cleaned


async def set_display_name(npub: str, name: str) -> str:
    """Set the patron's display name and propagate to the leaderboard cache.

    Returns the normalized name actually stored. The patron row is ensured
    to exist first so this works for a first-time caller. The propagation
    to ``leaderboard_stats`` is a no-op for patrons who have never been
    evaluated — they have no leaderboard row yet, and ``recompute_leaderboard``
    will pick up the display name from the ``patrons`` join when their first
    evaluation lands.
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


async def set_avatar(npub: str, avatar: str) -> str:
    """Set the patron's avatar token. Propagates to the leaderboard cache."""
    cleaned = normalize_avatar(avatar)
    await upsert_patron(npub)
    await execute(
        "UPDATE patrons SET avatar = $2 WHERE npub = $1",
        npub,
        cleaned,
    )
    await execute(
        "UPDATE leaderboard_stats SET avatar = $2, updated_at = NOW() WHERE npub = $1",
        npub,
        cleaned,
    )
    return cleaned


async def set_bio(npub: str, bio: str) -> str:
    """Set the patron's bio text. Empty string clears it. Not propagated to the
    leaderboard (bio isn't shown there — it's profile-only).
    """
    cleaned = normalize_bio(bio)
    await upsert_patron(npub)
    await execute(
        "UPDATE patrons SET bio = $2 WHERE npub = $1",
        npub,
        cleaned or None,
    )
    return cleaned


async def set_relays(npub: str, relays: list[Any] | str) -> list[str]:
    """Replace the patron's preferred relay list. Validated + deduped + capped."""
    cleaned = normalize_relays(relays)
    await upsert_patron(npub)
    await execute(
        "UPDATE patrons SET relays = $2::jsonb WHERE npub = $1",
        npub,
        json.dumps(cleaned) if cleaned else None,
    )
    return cleaned


async def get_profile(npub: str) -> dict[str, Any]:
    """Return the patron's profile fields as a plain dict.

    Always returns a result — first call from a fresh npub triggers an
    upsert so the patron row exists. Empty / null fields surface as None
    so the FE can render "unset" affordances cleanly.
    """
    await upsert_patron(npub)
    row = await fetchrow(
        "SELECT npub, display_name, avatar, bio, relays, created_at "
        "FROM patrons WHERE npub = $1",
        npub,
    )
    if not row:
        # Defensive — upsert above should have created the row.
        return {
            "npub": npub,
            "display_name": None,
            "avatar": None,
            "bio": None,
            "relays": [],
        }
    relays_raw = row.get("relays")
    if isinstance(relays_raw, str):
        try:
            relays_list = json.loads(relays_raw)
        except json.JSONDecodeError:
            relays_list = []
    elif isinstance(relays_raw, list):
        relays_list = relays_raw
    else:
        relays_list = []
    return {
        "npub": row["npub"],
        "display_name": row.get("display_name"),
        "avatar": row.get("avatar"),
        "bio": row.get("bio"),
        "relays": relays_list,
        "created_at": row.get("created_at"),
    }
