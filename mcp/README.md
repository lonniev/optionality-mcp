# optionality-mcp — Python server

FastMCP SSE server for the Optionality options-trading drill. Monetized via Tollbooth DPYC Bitcoin Lightning micropayments.

## Quick start (operator)

1. **Install dependencies**

   ```bash
   cd mcp
   uv venv
   source .venv/bin/activate
   uv pip install -e ".[dev]"
   ```

2. **Configure operator identity**

   Set `TOLLBOOTH_NOSTR_OPERATOR_NSEC` in your environment (or `.env`). This is the operator's Nostr private key. `NEON_DATABASE_URL` is provisioned automatically by the Authority during operator onboarding.

3. **Onboarding (one-time)**

   - Register with a DPYC Authority via `optionality_register_operator` / `authority_register_operator` (standard tools provided by `tollbooth-dpyc`).
   - Deliver BTCPay credentials (`btcpay_host`, `btcpay_api_key`, `btcpay_store_id`) via Secure Courier:
     - Call `optionality_request_credential_channel` to receive a welcome DM.
     - Reply with the JSON payload via your Nostr client.
     - Call `optionality_receive_credentials` to vault them.

4. **Run locally**

   ```bash
   python -m optionality_mcp.server
   ```

5. **Deploy to FastMCP Cloud (Horizon)**

   The repo-root `fastmcp.json` is the deployment descriptor. Push to `main` and FastMCP Cloud picks it up automatically.

## Layout

```
mcp/src/optionality_mcp/
├── __init__.py
├── server.py          # FastMCP app, OperatorRuntime, standard-tool registration
├── config.py          # env-driven settings
├── tools/             # Phase-3: dealer, judge, ask-tip, journal, leaderboard
├── persistence/       # Phase-2: Neon asyncpg pool, schema, CRUD
└── tollbooth/         # Optionality-specific Tollbooth glue (custom validators, ACL)
```

## DPYC standard tools

All standard DPYC tools — onboarding, balance, pricing, certificates, proof,
Secure Courier, OAuth, audit — are provided by `register_standard_tools()`
from the `tollbooth-dpyc` wheel. Tools appear under the `optionality_` prefix
(e.g., `optionality_check_balance`, `optionality_request_credential_channel`).
