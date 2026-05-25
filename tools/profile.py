"""Profile read + write tools — patron display name, avatar, bio, relays."""

from __future__ import annotations

import logging
from typing import Any

from db import patrons

logger = logging.getLogger(__name__)


async def get_patron_profile(npub: str) -> dict[str, Any]:
    """Return the caller's profile (display_name, avatar, bio, relays).

    Free. Always returns a result — first call from a fresh npub triggers
    an upsert so the row exists with NULL profile fields ready to be set.
    """
    profile = await patrons.get_profile(npub)
    return {"success": True, "profile": profile}


async def set_profile(
    npub: str,
    *,
    display_name: str | None = None,
    avatar: str | None = None,
    bio: str | None = None,
    relays: list[Any] | str | None = None,
) -> dict[str, Any]:
    """Update any subset of the caller's profile fields.

    Nil arguments are no-ops — only fields explicitly provided get
    overwritten. Each field has its own validator in ``db.patrons`` and
    raises ``ValueError`` on bad input; we collect those into ``errors``
    so the FE can surface them all at once rather than one round-trip
    per field.
    """
    errors: dict[str, str] = {}
    updated: dict[str, Any] = {}

    if display_name is not None:
        try:
            updated["display_name"] = await patrons.set_display_name(npub, display_name)
        except ValueError as e:
            errors["display_name"] = str(e)

    if avatar is not None:
        try:
            updated["avatar"] = await patrons.set_avatar(npub, avatar)
        except ValueError as e:
            errors["avatar"] = str(e)

    if bio is not None:
        try:
            updated["bio"] = await patrons.set_bio(npub, bio)
        except ValueError as e:
            errors["bio"] = str(e)

    if relays is not None:
        try:
            updated["relays"] = await patrons.set_relays(npub, relays)
        except ValueError as e:
            errors["relays"] = str(e)

    if errors and not updated:
        return {"success": False, "errors": errors}

    profile = await patrons.get_profile(npub)
    return {
        "success": True,
        "updated": list(updated.keys()),
        "errors": errors or None,
        "profile": profile,
    }
