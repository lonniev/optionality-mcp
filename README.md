# optionality-mcp

[MCP](https://modelcontextprotocol.io/) server and React drill UI for an AI-judged options trading practice game. Built on [FastMCP](https://github.com/jlowin/fastmcp), monetized via [Tollbooth DPYC](https://github.com/lonniev/tollbooth-dpyc)&trade; Lightning micropayments.

> Don't Pester Your Customer&trade; (DPYC&trade;) &mdash; API monetization for Entrepreneurial Bitcoin Advocates

## What It Does

A *dealer* LLM composes options trading scenarios. A trainee writes a free-text trade proposal. A *judge* LLM evaluates across five dimensions, parses the trade into structured legs, and emits a Facts Ledger showing fact-integration discipline. A risk-profile chart renders Black&ndash;Scholes and expiration P/L with a DTE slider.

**Three historicity modes:** Historical Fiction (real moments), Fiction (invented), Live Events (web-search-grounded).

**Four difficulty personas:** Apprentice, Journeyman, Adept, Sovereign.

**Core pedagogy &mdash; red herrings:** Each scenario embeds 1&ndash;2 facts that are factually TRUE but immaterial. Citing them as drivers penalizes the trainee. Recognizing them as noise and setting them aside earns points. The drill is signal-from-noise on a tape where everything you read is true.

## Repo Layout

```
optionality-mcp/
├── mcp/         # FastMCP SSE server (Python) → Horizon
└── frontend/    # React 18 + Vite + TS UI → Cloudflare Pages
```

## Status

Scaffolded. See the `TASKS` board in TheBrain under `Optionality MCP` for active work.

## License

Apache 2.0 &mdash; see [LICENSE](LICENSE) and [NOTICE](NOTICE).
