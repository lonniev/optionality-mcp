-- Optionality MCP — canonical schema (documentation only).
--
-- This file is the authoritative DDL reference for the three Optionality
-- domain tables. It is NOT executed by any migration runner. Schema is
-- created lazily at runtime via persistence/neon.py::_ensure_domain_schema,
-- which uses the wheel's NeonVault.vault._t() schema-prefix helper to keep
-- each operator's tables in its own Postgres role/schema.
--
-- The runtime DDL adds the operator's schema prefix to every table name
-- (e.g. "optionality_patrons" becomes "op_<role>__optionality_patrons" or
-- similar — see tollbooth-dpyc.vaults.neon for the exact format).
--
-- Keep this file in lock-step with neon.py::_ensure_domain_schema.

CREATE TABLE IF NOT EXISTS optionality_patrons (
    npub          TEXT        PRIMARY KEY,
    display_name  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS optionality_journal_entries (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    npub           TEXT        NOT NULL REFERENCES optionality_patrons(npub) ON DELETE CASCADE,
    status         TEXT        NOT NULL,        -- 'open' | 'submitted' | 'evaluated' | 'abandoned'
    mode           TEXT        NOT NULL,        -- 'historical' | 'fiction' | 'live'
    difficulty     TEXT        NOT NULL,        -- 'apprentice' | 'journeyman' | 'adept' | 'sovereign'
    scenario       JSONB       NOT NULL,
    trade_proposal TEXT,
    trade_legs     JSONB,
    evaluation     JSONB,
    score          INT,
    letter_grade   TEXT,
    ticker         TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_npub_created
    ON optionality_journal_entries(npub, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_npub_status
    ON optionality_journal_entries(npub, status);

CREATE TABLE IF NOT EXISTS optionality_leaderboard_stats (
    npub            TEXT        PRIMARY KEY REFERENCES optionality_patrons(npub) ON DELETE CASCADE,
    display_name    TEXT,
    total_played    INT         NOT NULL DEFAULT 0,
    avg_score       NUMERIC(5,2) NOT NULL DEFAULT 0,
    best_score      INT         NOT NULL DEFAULT 0,
    current_streak  INT         NOT NULL DEFAULT 0,
    longest_streak  INT         NOT NULL DEFAULT 0,
    last_played_at  TIMESTAMPTZ,
    by_mode         JSONB       NOT NULL DEFAULT '{}'::JSONB,
    by_difficulty   JSONB       NOT NULL DEFAULT '{}'::JSONB,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_avg
    ON optionality_leaderboard_stats(avg_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_best
    ON optionality_leaderboard_stats(best_score DESC);
