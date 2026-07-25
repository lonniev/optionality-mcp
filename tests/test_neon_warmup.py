"""Tests for the Neon cold-start warm-up retry in db/neon.py.

Neon autosuspends when idle; the first query after a nap can miss the vault
client's timeout while the compute wakes. These lock in that a transient
timeout is ridden out (so a deal isn't killed by a cold DB), a genuine query
error is never retried, and an unwakeable Neon surfaces as a curated, refundable
``service_warming_up`` situation rather than a raw httpx timeout.
"""

from __future__ import annotations

import httpx
import pytest
from tollbooth import AsyncJobSituation

from db import neon


async def test_warmup_retries_transient_then_succeeds(monkeypatch) -> None:
    monkeypatch.setattr(neon, "_NEON_WARMUP_BACKOFFS", (0.0, 0.0, 0.0, 0.0))
    calls = {"n": 0}

    async def op() -> dict:
        calls["n"] += 1
        if calls["n"] < 3:
            raise httpx.ConnectTimeout("neon cold")
        return {"rows": [{"ok": 1}]}

    out = await neon._run_with_warmup(op, "test")
    assert out == {"rows": [{"ok": 1}]}
    assert calls["n"] == 3  # failed twice, succeeded on the third


async def test_warmup_exhausted_raises_service_warming_up(monkeypatch) -> None:
    monkeypatch.setattr(neon, "_NEON_WARMUP_BACKOFFS", (0.0, 0.0))
    calls = {"n": 0}

    async def op() -> dict:
        calls["n"] += 1
        raise httpx.ReadTimeout("still cold")

    with pytest.raises(AsyncJobSituation) as ei:
        await neon._run_with_warmup(op, "test")
    assert ei.value.error_code == "service_warming_up"
    assert ei.value.transient is True
    # to_response marks the fare refunded — the wheel rolls back the debit
    assert ei.value.to_response()["refunded"] is True
    assert calls["n"] == 3  # len(backoffs) + 1 attempts


async def test_real_query_error_is_not_retried(monkeypatch) -> None:
    monkeypatch.setattr(neon, "_NEON_WARMUP_BACKOFFS", (0.0, 0.0, 0.0, 0.0))
    calls = {"n": 0}

    async def op() -> dict:
        calls["n"] += 1
        raise ValueError("syntax error at or near")

    with pytest.raises(ValueError):
        await neon._run_with_warmup(op, "test")
    assert calls["n"] == 1  # non-transient → immediate, no warm-up


async def test_execute_rides_out_cold_vault(monkeypatch) -> None:
    """End-to-end: execute() retries across a vault whose first touch times out."""
    monkeypatch.setattr(neon, "_NEON_WARMUP_BACKOFFS", (0.0,))

    class _Vault:
        _schema_prefix = ""

        def __init__(self) -> None:
            self.n = 0

        async def _execute(self, q, params):
            self.n += 1
            if self.n == 1:
                raise httpx.ConnectTimeout("neon cold")
            return {"rows": [{"ok": 1}]}

    v = _Vault()

    async def fake_get_vault():
        return v

    monkeypatch.setattr(neon, "_get_vault", fake_get_vault)
    monkeypatch.setattr(neon, "_vault", v)  # so _qualify() sees a prefix

    out = await neon.execute("SELECT 1")
    assert out == {"rows": [{"ok": 1}]}
    assert v.n == 2  # first attempt timed out, second succeeded
