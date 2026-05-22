"""Runtime configuration for Optionality MCP.

Environment-driven settings. Secrets (operator nsec, BTCPay creds, Anthropic
key) are never stored here — they are delivered via Secure Courier and vaulted
by the tollbooth-dpyc wheel.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Optionality MCP runtime settings.

    Reads NEON_DATABASE_URL (provided by the Authority during operator
    onboarding) and any other non-secret runtime knobs.
    """

    neon_database_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
