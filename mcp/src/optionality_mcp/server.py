"""Optionality MCP — server entry point.

A FastMCP SSE server that backs the Optionality options-trading drill UI.
This file is the scaffold only. Domain tools (dealer, judge, ask-tip,
journal CRUD, leaderboard) are added by their respective Phase-3 tasks.

Run locally:
    python -m optionality_mcp.server

Deploy on FastMCP Cloud:
    See ../fastmcp.json at the repo root.
"""

from __future__ import annotations

import logging

from fastmcp import FastMCP

from tollbooth.credential_templates import CredentialTemplate, FieldSpec
from tollbooth.credential_validators import validate_btcpay_creds
from tollbooth.runtime import OperatorRuntime, register_standard_tools
from tollbooth.tool_identity import STANDARD_IDENTITIES, ToolIdentity

from optionality_mcp import __version__

logger = logging.getLogger(__name__)


mcp = FastMCP(
    "optionality-mcp",
    instructions=(
        "Optionality MCP — an AI-judged options trading drill, monetized "
        "via Tollbooth DPYC Bitcoin Lightning micropayments.\n\n"
        "## What it does\n"
        "A dealer LLM composes options trading scenarios; the trainee writes "
        "a free-text trade; a judge LLM evaluates the trade across five "
        "dimensions, parses it into structured legs, and emits a Facts Ledger "
        "showing fact-integration discipline. Three historicity modes "
        "(historical, fiction, live) and four difficulty personas.\n\n"
        "## Onboarding\n"
        "Call optionality_get_operator_onboarding_status to check operator "
        "readiness. Operator credentials (BTCPay) are delivered via Secure "
        "Courier — call optionality_request_credential_channel to start.\n\n"
        "## Pricing\n"
        "Tool prices are set dynamically by the operator's pricing model. "
        "Use optionality_check_price to preview costs and "
        "optionality_check_balance to see your balance."
    ),
)


# Domain tool registry — empty at scaffold time. Phase 3 tasks register their
# tools by appending ToolIdentity entries here and decorating their async
# handlers with ``@runtime.paid_tool(capability_uuid("..."))``.
_DOMAIN_TOOLS: list[ToolIdentity] = []

TOOL_REGISTRY: dict[str, ToolIdentity] = {ti.tool_id: ti for ti in _DOMAIN_TOOLS}


runtime = OperatorRuntime(
    tool_registry={**STANDARD_IDENTITIES, **TOOL_REGISTRY},
    operator_credential_template=CredentialTemplate(
        service="optionality-mcp-operator",
        version=1,
        description="Operator credentials for BTCPay Lightning payments",
        fields={
            "btcpay_host": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "The URL of your BTCPay Server instance "
                    "(e.g. https://btcpay.example.com)."
                ),
            ),
            "btcpay_api_key": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "Your BTCPay Server API key. Generate one in BTCPay "
                    "under Account > Manage Account > API Keys."
                ),
            ),
            "btcpay_store_id": FieldSpec(
                required=True,
                sensitive=True,
                description=(
                    "Your BTCPay Store ID. Find it in BTCPay under "
                    "Stores > Settings > General."
                ),
            ),
        },
    ),
    operator_credential_greeting=(
        "Hi — I'm Optionality MCP, an AI-judged options trading drill. "
        "You (or your AI agent) requested a credential channel."
    ),
    service_name="Optionality MCP",
    credential_validator=validate_btcpay_creds,
)


tool = register_standard_tools(
    mcp,
    "optionality",
    runtime,
    service_name="optionality-mcp",
    service_version=__version__,
)


def main() -> None:
    """Main entry point for the server."""
    from tollbooth import validate_operator_tools

    missing = validate_operator_tools(mcp, "optionality")
    if missing:
        import sys

        print(
            f"⚠ Missing base-catalog tools: {', '.join(missing)}",
            file=sys.stderr,
        )
    mcp.run()


if __name__ == "__main__":
    main()
