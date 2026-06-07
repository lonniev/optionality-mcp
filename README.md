# optionality-mcp

[MCP](https://modelcontextprotocol.io/) server and React drill UI for an AI-judged options trading practice game. Built on [FastMCP](https://github.com/jlowin/fastmcp).

Optionality is an instance of a [Tollbooth-DPYC](https://tollbooth-dpyc.com)&trade; service: engagement is monetized with convenient Don't Pester Your Customer&trade; (DPYC&trade;) Bitcoin commerce. Patrons pre-fund a balance over Lightning and play without per-request payment ceremonies. All prices are dynamic and set by the operator &mdash; the Welcome page shows live quotes. Patrons can also enter Tollbooth-DPYC coupons to take advantage of discounts when they are offered.

## How a Round Works

1. **The Dealer deals.** A *dealer* LLM composes a complete options scenario: ticker, spot, IV regime and skew, macro backdrop, catalyst, key levels, and constraints &mdash; optionally including a max-loss budget the structure must fit.
2. **You pitch.** Free text, the way you'd pitch a senior PM. Multi-leg structures, single legs, or a deliberate stand-aside &mdash; declining to trade is a legitimate, gradeable answer.
3. **The Judge grades.** A *judge* LLM parses your pitch into structured legs, scores it across six dimensions, and proposes an alternative structure you can overlay on the risk chart.

**Six judging dimensions:** Strategy Selection, Strikes &amp; Tenor, Risk/Reward, Macro Integration, Tail Risk, and Communication &mdash; each 0&ndash;20, rolled into a 0&ndash;100 score with letter grades A+ through F.

## Core Pedagogy — Red Herrings

Each scenario embeds 1&ndash;2 facts that are factually TRUE but immaterial, woven inline into the narrative and never flagged. Citing them as trade drivers penalizes the trainee; recognizing them as noise and setting them aside earns points. The drill is signal-from-noise on a tape where everything you read is true.

A **Facts Ledger** accompanies every evaluation: which scenario facts you integrated, which you missed, which red herrings you caught, and which you followed.

## Scenario Modes & Difficulty

**Three historicity modes:**

- **Historical Fiction** &mdash; real, identifiable market moments (SVB week, the gilt crisis), grounded in the actual macro and IV regime of the day
- **Fiction** &mdash; invented regimes: counterfactual shocks, de-peg cascades, gamma squeezes
- **Live Events** &mdash; web-search-grounded scenarios anchored to this week's actual tape, with cited sources

**Four difficulty personas:** Apprentice, Journeyman, Adept, Sovereign. Leaderboard points are difficulty-weighted, so rankings can't be padded on easy mode. A **Mulligan** mode replays an already-judged scenario fresh.

## Options Math — One Source of Truth

The server builds the full option chain from the dealer's scaffold &mdash; three expirations, a strike ladder around spot, a three-anchor IV smile honoring put-bid skew &mdash; and prices it with Black&ndash;Scholes. The same math runs client-side, so the trainee, the charts, and the judge all see identical numbers.

- **Option chain modal** in broker convention: calls left, strikes and smile center, puts right; tap a mid to buy or sell; running net-premium readout
- **Risk profile chart** with expiration P/L, breakeven markers, and a DTE slider that replays theta bleed across the holding period
- **Judge-alternative overlay** to compare your payoff curve against the structure the judge would have run

## Socratic Clue Desk

Mid-scenario, ask anything. Educational questions get direct, formula-backed answers; tactical questions get redirected to the dimension worth more thought &mdash; the responsibility stays with the trainee. The desk never reveals the scenario's hidden facts or red herrings. Clues carry a scoring penalty.

## Journal, Leaderboard & Peer Learning

- **Journal** &mdash; every round persisted: open drafts, submitted pitches, full evaluations with leg tables and charts
- **Leaderboard** &mdash; five sort orders (average, best, streak, played, recent), filterable by mode and difficulty
- **Streaks** &mdash; consecutive scores of 70+, current and all-time
- **Shared entries** &mdash; opt in to share an evaluated round so others can study the pitch, the grade, and the ledger
- **Profile** &mdash; display name, avatar, bio
- **Usage** &mdash; transparency tab showing per-model token consumption, per-tool spend, and the patron's account statement

## Repo Layout

```
optionality-mcp/
├── server.py    # FastMCP SSE server (Python) → Horizon
├── tools/       # dealer, judge, journal, leaderboard, profile, options chain
├── prompts.py   # dealer / judge / clue-desk personas
└── frontend/    # React 18 + Vite + TS UI → Cloudflare Pages
```

Heavy LLM tools (deal, judge, clue desk) use a claim-check async pattern: the call returns a claim immediately and the client polls a free fetch tool, so slow generations survive client timeouts.

## License

Apache 2.0 &mdash; see [LICENSE](LICENSE) and [NOTICE](NOTICE).
