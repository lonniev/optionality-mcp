"""Runtime configuration for Optionality MCP.

Environment-driven settings. Secrets (operator nsec, BTCPay creds, the model
router key) are never stored here — they are delivered via Secure Courier and
vaulted by the tollbooth-dpyc wheel.
"""

from __future__ import annotations

import math

from pydantic_settings import BaseSettings, SettingsConfigDict

# ── Job budget rings ────────────────────────────────────────────────
#
# A drill's LLM budget sits inside one job attempt, which sits inside the
# detached runner's own timeout:
#
#     LLM read timeout  <  job attempt  <  runner timeout
#
# The middle ring is load-bearing twice over: ``max_runtime_seconds`` is both
# the attempt ceiling AND the staleness threshold the wheel uses to re-claim a
# job orphaned by a container recycle (see tollbooth.async_jobs).
#
# Invert the outer pair and the failure is specific and quiet: a runner that
# gives up while the row is still inside its own budget kills work nothing has
# given up on, and the drill simply hangs until the row goes stale and a second
# worker starts it over — which reads as slowness, not as a timeout.
#
# So only the attempt ceiling is authored; the runner timeout is computed from
# it. `modal_app.py` reads the computed value rather than restating a number,
# because Modal bakes that timeout in at DEPLOY time on a CI runner — a wrong
# value there is invisible to every in-process test.
JOB_ATTEMPT_MAX_S = 700
RING_SAFETY = 1.15


def runner_timeout_s() -> int:
    """The detached runner's ceiling — outermost, so the runner is never what
    kills a job the wheel still believes is in flight."""
    return math.ceil(JOB_ATTEMPT_MAX_S * RING_SAFETY)


class Settings(BaseSettings):
    """Optionality MCP runtime settings.

    Reads NEON_DATABASE_URL (provided by the Authority during operator
    onboarding) and any other non-secret runtime knobs.
    """

    neon_database_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
