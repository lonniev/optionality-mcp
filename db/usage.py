"""Claude API usage tracking — recorded per `messages.create` call.

One row per outbound model invocation. Aggregations are computed at read
time so we don't double-write. Same transparency principle as taxsort's
`tax_api_usage` table: the patron should see exactly what their sats bought.
"""

from typing import Any

from .neon import execute, fetch


async def record_call(
    npub: str,
    tool: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
) -> None:
    """Record one Claude `messages.create` call.

    Best-effort — if the insert fails (vault hiccup, schema not yet
    provisioned, etc.) the caller's response is not affected. Same
    pattern as `claude.complete_text`'s error tolerance — usage stats
    are a transparency feature, not a billing source of truth (the
    Tollbooth wheel handles the actual debit).
    """
    try:
        await execute(
            "INSERT INTO optionality_api_usage "
            "(npub, tool, model, input_tokens, output_tokens) "
            "VALUES ($1, $2, $3, $4, $5)",
            npub or "",
            tool or "",
            model or "unknown",
            int(input_tokens),
            int(output_tokens),
        )
    except Exception:  # noqa: BLE001, S110
        # Don't let usage-tracking failures bubble up. The patron's
        # tool call already succeeded; the wheel's own debit already
        # ran. This is journaling only.
        pass


async def get_usage_stats(npub: str = "") -> dict[str, Any]:
    """Aggregated all-time Claude API usage per model. Scoped to `npub`
    when provided.

    Returns:
        {"models": [{"model", "runs", "total_calls",
                      "total_input_tokens", "total_output_tokens"}, …]}

    For sats-per-tool lifetime spend, the FE calls the wheel's
    ``account_statement`` (authoritative — includes every paid tool,
    not just Claude-burning ones).
    """
    if npub:
        rows = await fetch(
            "SELECT model, "
            "COUNT(*) AS runs, "
            "SUM(input_tokens) AS total_input_tokens, "
            "SUM(output_tokens) AS total_output_tokens "
            "FROM optionality_api_usage "
            "WHERE npub = $1 "
            "GROUP BY model "
            "ORDER BY total_input_tokens DESC NULLS LAST",
            npub,
        )
    else:
        rows = await fetch(
            "SELECT model, "
            "COUNT(*) AS runs, "
            "SUM(input_tokens) AS total_input_tokens, "
            "SUM(output_tokens) AS total_output_tokens "
            "FROM optionality_api_usage "
            "GROUP BY model "
            "ORDER BY total_input_tokens DESC NULLS LAST",
        )
    return {
        "models": [
            {
                "model": str(r["model"] or "unknown"),
                "runs": int(r["runs"] or 0),
                "total_calls": int(r["runs"] or 0),
                "total_input_tokens": int(r["total_input_tokens"] or 0),
                "total_output_tokens": int(r["total_output_tokens"] or 0),
            }
            for r in rows
        ],
    }
