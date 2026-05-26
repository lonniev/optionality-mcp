"""Journal CRUD tools — save drafts, list, get, delete."""

from __future__ import annotations

import logging
from typing import Any

from db import journal as journal_db
from db import leaderboard, patrons

logger = logging.getLogger(__name__)


async def save_draft(npub: str, entry_id: str, trade_proposal: str) -> dict[str, Any]:
    """Persist a draft trade proposal. Status stays ``open``."""
    await patrons.upsert_patron(npub)
    entry = await journal_db.get_entry(npub, entry_id)
    if not entry:
        return {"error": f"journal entry {entry_id} not found for this patron"}
    await journal_db.save_draft(npub, entry_id, trade_proposal)
    return {"entry_id": entry_id, "saved_at": "now"}


async def list_journal(
    npub: str,
    status: str | None = None,
    limit: int = 50,
    before: str | None = None,
) -> dict[str, Any]:
    """Paginated list of this patron's journal entries, newest first."""
    rows = await journal_db.list_entries(
        npub=npub,
        status=status or None,
        limit=limit,
        before=before or None,
    )
    return {
        "entries": [
            {
                "id": str(r["id"]),
                "status": r["status"],
                "mode": r["mode"],
                "difficulty": r["difficulty"],
                "ticker": r.get("ticker"),
                "score": r.get("score"),
                "letter_grade": r.get("letter_grade"),
                "is_shared": bool(r.get("is_shared") or False),
                "created_at": str(r.get("created_at") or ""),
                "updated_at": str(r.get("updated_at") or ""),
            }
            for r in rows
        ],
        "count": len(rows),
    }


async def get_journal(npub: str, entry_id: str) -> dict[str, Any]:
    """Return the full journal entry including scenario + evaluation."""
    entry = await journal_db.get_entry(npub, entry_id)
    if not entry:
        return {"error": f"journal entry {entry_id} not found for this patron"}
    return {"entry": entry}


async def delete_journal(npub: str, entry_id: str) -> dict[str, Any]:
    """Hard-delete an entry and rebuild the leaderboard cache."""
    removed = await journal_db.delete_entry(npub, entry_id)
    if not removed:
        return {"error": f"journal entry {entry_id} not found for this patron"}
    await leaderboard.recompute_leaderboard(npub)
    return {"entry_id": entry_id, "deleted": True}


async def share_entry(npub: str, entry_id: str, shared: bool = True) -> dict[str, Any]:
    """Toggle a patron's per-entry share flag.

    Only evaluated entries can be shared. Shared entries appear under
    the patron's row on the public Leaderboard for peer learning.
    """
    ok = await journal_db.set_shared(npub, entry_id, bool(shared))
    if not ok:
        return {"error": f"journal entry {entry_id} not found, not evaluated, or not owned by this patron"}
    return {"entry_id": entry_id, "is_shared": bool(shared)}


async def get_shared_entries(target_npub: str, limit: int = 20) -> dict[str, Any]:
    """Return the target patron's shared, evaluated entries — newest first.

    Free, public read. Eager-loads evaluation + trade proposal so the
    leaderboard's row-expansion can render the full peer assessment
    without a follow-up call.
    """
    if not target_npub or not isinstance(target_npub, str):
        return {"error": "target_npub is required"}
    rows = await journal_db.list_shared_for(target_npub=target_npub, limit=limit)
    return {
        "target_npub": target_npub,
        "entries": [
            {
                "id": str(r["id"]),
                "mode": r["mode"],
                "difficulty": r["difficulty"],
                "ticker": r.get("ticker"),
                "score": r.get("score"),
                "letter_grade": r.get("letter_grade"),
                "trade_proposal": r.get("trade_proposal"),
                "trade_legs": r.get("trade_legs"),
                "evaluation": r.get("evaluation"),
                "created_at": str(r.get("created_at") or ""),
            }
            for r in rows
        ],
        "count": len(rows),
    }
