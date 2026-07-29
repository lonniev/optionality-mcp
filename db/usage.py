"""LLM usage tracking — recorded per messages call.

One row per outbound model invocation. Aggregations are computed at read
time so we don't double-write. Same transparency principle as taxsort's
`tax_api_usage` table: the patron should see exactly what their sats bought.

Rows carry the provider's OWN reported cost for the call, not an estimate
reconstructed from a price table. A model router returns ``usage.cost`` in USD
with the response, so the figure is authoritative and survives a model change —
which a token count does not, since tokens from two models are not comparable
money. Rows written before that column existed carry NULL and are reported as
unpriced rather than as zero.
"""

from typing import Any

from .neon import execute, fetch


async def record_call(
    npub: str,
    tool: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float | None = None,
) -> None:
    """Record one LLM messages call.

    Best-effort — if the insert fails (vault hiccup, schema not yet
    provisioned, etc.) the caller's response is not affected. Same
    pattern as `llm.call_llm`'s error tolerance — usage stats
    are a transparency feature, not a billing source of truth (the
    Tollbooth wheel handles the actual debit).

    ``cost_usd`` is what the provider said the call cost. ``None`` when the
    provider did not report one — recorded as unknown, never as free.
    """
    try:
        await execute(
            "INSERT INTO optionality_api_usage "
            "(npub, tool, model, input_tokens, output_tokens, cost_usd) "
            "VALUES ($1, $2, $3, $4, $5, $6)",
            npub or "",
            tool or "",
            model or "unknown",
            int(input_tokens),
            int(output_tokens),
            float(cost_usd) if cost_usd is not None else None,
        )
    except Exception:  # noqa: BLE001, S110
        # Don't let usage-tracking failures bubble up. The patron's
        # tool call already succeeded; the wheel's own debit already
        # ran. This is journaling only.
        pass


_SELECT = (
    "SELECT model, "
    "COUNT(*) AS runs, "
    "SUM(input_tokens) AS total_input_tokens, "
    "SUM(output_tokens) AS total_output_tokens, "
    "SUM(cost_usd) AS total_cost_usd, "
    "COUNT(cost_usd) AS priced_runs "
    "FROM optionality_api_usage "
)


async def get_usage_stats(npub: str = "") -> dict[str, Any]:
    """Aggregated all-time LLM usage per model. Scoped to `npub`
    when provided.

    Returns:
        {"models": [{"model", "runs", "total_calls", "total_input_tokens",
                      "total_output_tokens", "total_cost_usd", "priced_runs"}, …],
         "totals": {…}}

    ``priced_runs`` is how many of ``runs`` carried a provider cost, so a caller
    can say "$0.42 across 3 of 5 runs" instead of implying the other two were
    free. For sats-per-tool lifetime spend, the FE calls the wheel's
    ``account_statement`` (authoritative — includes every paid tool, not just
    LLM-burning ones).
    """
    tail = "GROUP BY model ORDER BY total_input_tokens DESC NULLS LAST"
    if npub:
        rows = await fetch(f"{_SELECT}WHERE npub = $1 {tail}", npub)
    else:
        rows = await fetch(f"{_SELECT}{tail}")

    models = [
        {
            "model": str(r["model"] or "unknown"),
            "runs": int(r["runs"] or 0),
            "total_calls": int(r["runs"] or 0),
            "total_input_tokens": int(r["total_input_tokens"] or 0),
            "total_output_tokens": int(r["total_output_tokens"] or 0),
            # None (not 0.0) when nothing in this group carried a cost — the FE
            # renders that as "—", because unknown and free are different claims.
            "total_cost_usd": (
                float(r["total_cost_usd"]) if r["total_cost_usd"] is not None else None
            ),
            "priced_runs": int(r["priced_runs"] or 0),
        }
        for r in rows
    ]

    priced = [m["total_cost_usd"] for m in models if m["total_cost_usd"] is not None]
    total_runs = sum(m["runs"] for m in models)
    total_cost = sum(priced) if priced else None
    total_priced_runs = sum(m["priced_runs"] for m in models)
    return {
        "models": models,
        "totals": {
            "runs": total_runs,
            "total_input_tokens": sum(m["total_input_tokens"] for m in models),
            "total_output_tokens": sum(m["total_output_tokens"] for m in models),
            "total_cost_usd": total_cost,
            "priced_runs": total_priced_runs,
            # What one drill actually costs to serve — the number that says
            # whether a tool's sats price covers its own compute.
            "avg_cost_usd": (
                total_cost / total_priced_runs
                if total_cost is not None and total_priced_runs
                else None
            ),
        },
    }
