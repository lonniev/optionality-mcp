"""Optionality domain persistence on top of the wheel's NeonVault.

Pattern modeled on ``taxsort-mcp/db/neon.py``:

- Domain tables are namespaced inside the operator's Neon schema by the
  wheel's ``vault._t(...)`` helper. We additionally prefix bare table names
  with ``optionality_`` to avoid collision with any other operator's tables
  if a database happens to be shared.
- ``_ensure_domain_schema(vault)`` runs idempotent ``CREATE TABLE IF NOT
  EXISTS`` on first vault use. This matches every other DPYC operator —
  there is no separate migration runner.
- ``execute()``/``fetch()``/``fetchrow()`` are thin wrappers that auto-rewrite
  bare table names to their schema-qualified form before dispatching to the
  vault.

Task 14h25 originally called for ``persistence/migrations/0001_initial.sql``
plus a separate ``asyncpg`` pool. The DPYC canonical (TaxSort, thebrain-mcp)
does not use either — schema is inline DDL through the vault. We honor the
spirit of the task by writing the canonical DDL as ``migrations/0001_initial.sql``
(documentation only) and execute it inline here.
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

_vault: Any = None
_schema_done: bool = False

# Bare table name → schema-qualified renamed version. The wheel's vault._t()
# is then applied on top, so the final form is "<schema_prefix>optionality_X".
_DOMAIN_TABLES: dict[str, str] = {
    "patrons": "optionality_patrons",
    "journal_entries": "optionality_journal_entries",
    "leaderboard_stats": "optionality_leaderboard_stats",
}


async def _get_vault() -> Any:
    """Obtain the operator's NeonVault, lazy-initializing schema on first use."""
    global _vault, _schema_done
    if _vault is None:
        from server import runtime

        _vault = await runtime.vault()
        logger.info(
            "Vault obtained, schema_prefix=%s",
            getattr(_vault, "_schema_prefix", ""),
        )
    if not _schema_done:
        _schema_done = True
        try:
            await _ensure_domain_schema(_vault)
            logger.info("Optionality domain schema ensured")
        except Exception as e:
            logger.error("Domain schema init failed: %s", e)
            _schema_done = False
    return _vault


def _qualify(query: str) -> str:
    """Rewrite bare domain table names with schema-qualified renamed versions."""
    if not _vault:
        return query
    prefix = getattr(_vault, "_schema_prefix", "")
    q = query
    for bare, renamed in _DOMAIN_TABLES.items():
        q = re.sub(rf'(?<![.\w]){bare}(?=[\s(,;)]|$)', f"{prefix}{renamed}", q)
    return q


async def _ensure_domain_schema(vault: Any) -> None:
    """Create Optionality's three domain tables idempotently."""
    t = vault._t

    stmts = [
        f"CREATE TABLE IF NOT EXISTS {t('optionality_patrons')} ("
        "npub TEXT PRIMARY KEY, "
        "display_name TEXT, "
        "avatar TEXT, "
        "bio TEXT, "
        "relays JSONB, "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",

        # Idempotent ALTERs for existing deployments — patrons created
        # before the profile columns existed get NULLs which the FE
        # treats as "unset". IF NOT EXISTS keeps this safe on re-runs.
        f"ALTER TABLE {t('optionality_patrons')} ADD COLUMN IF NOT EXISTS avatar TEXT",
        f"ALTER TABLE {t('optionality_patrons')} ADD COLUMN IF NOT EXISTS bio TEXT",
        f"ALTER TABLE {t('optionality_patrons')} ADD COLUMN IF NOT EXISTS relays JSONB",

        # Opt-in nsec escrow — AES-256-GCM ciphertext of the patron's
        # nsec, encrypted with a key derived from the OPERATOR's nsec
        # via HKDF. AAD binds the row to the patron's npub so a leak +
        # row swap doesn't decrypt under a different patron's identity.
        # NULL = patron is self-custodied (default).
        f"ALTER TABLE {t('optionality_patrons')} ADD COLUMN IF NOT EXISTS escrowed_nsec_b64 TEXT",

        f"CREATE TABLE IF NOT EXISTS {t('optionality_journal_entries')} ("
        "id UUID PRIMARY KEY DEFAULT gen_random_uuid(), "
        f"npub TEXT NOT NULL REFERENCES {t('optionality_patrons')}(npub) ON DELETE CASCADE, "
        "status TEXT NOT NULL, "
        "mode TEXT NOT NULL, "
        "difficulty TEXT NOT NULL, "
        "scenario JSONB NOT NULL, "
        "trade_proposal TEXT, "
        "trade_legs JSONB, "
        "evaluation JSONB, "
        "score INT, "
        "letter_grade TEXT, "
        "ticker TEXT, "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), "
        "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",

        f"CREATE INDEX IF NOT EXISTS idx_journal_npub_created "
        f"ON {t('optionality_journal_entries')}(npub, created_at DESC)",

        f"CREATE INDEX IF NOT EXISTS idx_journal_npub_status "
        f"ON {t('optionality_journal_entries')}(npub, status)",

        # is_shared: patron opts in per-entry to expose that pitch +
        # evaluation under their leaderboard row, so peers can compare.
        f"ALTER TABLE {t('optionality_journal_entries')} "
        f"ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT FALSE",

        # tips_count: number of ask_tip calls the trainee made on this
        # entry. Surfaced to the judge so it can apply a score penalty
        # ("paid for clues" → small ding on overall_score).
        f"ALTER TABLE {t('optionality_journal_entries')} "
        f"ADD COLUMN IF NOT EXISTS tips_count INT NOT NULL DEFAULT 0",

        f"CREATE INDEX IF NOT EXISTS idx_journal_shared "
        f"ON {t('optionality_journal_entries')}(npub, is_shared) "
        f"WHERE is_shared = TRUE",

        # NOTE: effective_price_sats column was added briefly in 0.1.8
        # but is no longer used — the leaderboard now queries the live
        # pricing model at recompute time instead of snapshotting per
        # entry. The column lingers harmlessly in deploys that ran the
        # 0.1.8 migration; we just stopped reading and writing it.

        f"CREATE TABLE IF NOT EXISTS {t('optionality_leaderboard_stats')} ("
        f"npub TEXT PRIMARY KEY REFERENCES {t('optionality_patrons')}(npub) ON DELETE CASCADE, "
        "display_name TEXT, "
        "avatar TEXT, "
        "total_played INT NOT NULL DEFAULT 0, "
        "avg_score NUMERIC(5,2) NOT NULL DEFAULT 0, "
        "best_score INT NOT NULL DEFAULT 0, "
        "current_streak INT NOT NULL DEFAULT 0, "
        "longest_streak INT NOT NULL DEFAULT 0, "
        "last_played_at TIMESTAMPTZ, "
        "by_mode JSONB NOT NULL DEFAULT '{}'::JSONB, "
        "by_difficulty JSONB NOT NULL DEFAULT '{}'::JSONB, "
        "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",

        f"CREATE INDEX IF NOT EXISTS idx_leaderboard_avg "
        f"ON {t('optionality_leaderboard_stats')}(avg_score DESC)",

        f"CREATE INDEX IF NOT EXISTS idx_leaderboard_best "
        f"ON {t('optionality_leaderboard_stats')}(best_score DESC)",

        # Idempotent backfill for the avatar column on existing
        # deployments — leaderboard read picks it up automatically.
        f"ALTER TABLE {t('optionality_leaderboard_stats')} ADD COLUMN IF NOT EXISTS avatar TEXT",

        # Difficulty-weighted scoring — like diving's degree-of-difficulty
        # multiplier. recompute_leaderboard computes weighted_score =
        # raw_score × DIFFICULTY_WEIGHT[difficulty] and rolls up the
        # per-patron weighted average + best. Default leaderboard sort
        # switches to weighted_avg so a hard pitch scored well outranks
        # an easy one scored well.
        f"ALTER TABLE {t('optionality_leaderboard_stats')} ADD COLUMN IF NOT EXISTS weighted_avg NUMERIC(8,2) NOT NULL DEFAULT 0",
        f"ALTER TABLE {t('optionality_leaderboard_stats')} ADD COLUMN IF NOT EXISTS weighted_best NUMERIC(8,2) NOT NULL DEFAULT 0",
        f"CREATE INDEX IF NOT EXISTS idx_leaderboard_weighted_avg "
        f"ON {t('optionality_leaderboard_stats')}(weighted_avg DESC)",
        f"CREATE INDEX IF NOT EXISTS idx_leaderboard_weighted_best "
        f"ON {t('optionality_leaderboard_stats')}(weighted_best DESC)",

        # Per-patron Claude API usage. One row per outbound `messages.create`,
        # written by `claude.complete_text` after the response lands. Surfaces
        # in the FE's Profile/Usage view so the patron sees exactly what their
        # sats bought — same transparency principle as taxsort-mcp's
        # `tax_api_usage` table.
        f"CREATE TABLE IF NOT EXISTS {t('optionality_api_usage')} ("
        "id BIGSERIAL PRIMARY KEY, "
        "npub TEXT, "
        "tool TEXT, "
        "model TEXT NOT NULL, "
        "input_tokens INT NOT NULL DEFAULT 0, "
        "output_tokens INT NOT NULL DEFAULT 0, "
        "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())",

        f"CREATE INDEX IF NOT EXISTS idx_api_usage_npub_created "
        f"ON {t('optionality_api_usage')}(npub, created_at DESC)",
    ]
    for stmt in stmts:
        try:
            await vault._execute(stmt)
        except Exception as e:
            logger.error("Schema DDL failed: %s\nSQL: %s", e, stmt[:200])


async def execute(query: str, *args: Any) -> dict[str, Any]:
    v = await _get_vault()
    q = _qualify(query)
    logger.debug("execute: %s | args=%s", q[:150], list(args)[:3])
    return await v._execute(q, list(args))


async def fetch(query: str, *args: Any) -> list[dict[str, Any]]:
    result = await execute(query, *args)
    return result.get("rows", [])


async def fetchrow(query: str, *args: Any) -> dict[str, Any] | None:
    rows = await fetch(query, *args)
    return rows[0] if rows else None


async def executemany(query: str, args_list: list[list[Any]]) -> None:
    v = await _get_vault()
    q = _qualify(query)
    for args in args_list:
        await v._execute(q, list(args))
