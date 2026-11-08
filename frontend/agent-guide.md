
Optionality is a single-page web app backed by an MCP (Model Context
Protocol) server. Humans use the web UI; AI agents can call the same MCP
tools directly. This is a training simulator — nothing here is investment
advice and no real orders are placed.

## What is on this site

- **The Pit** — deal a scenario. Three historicity modes (historical,
  fiction, live — live grounds the scenario in today's market via web
  search) crossed with four difficulty personas (apprentice, journeyman,
  adept, sovereign). Optional sector hint and max-loss budget.
- **Pitch editor** — write a free-text trade proposal against the dealt
  scenario. A Socratic clue desk answers questions without spoiling.
- **Assessment** — the judge evaluates structure, strikes & tenor,
  risk/reward, macro context, and tail awareness; parses the pitch into
  structured legs; and emits a Facts Ledger. Every scenario embeds red
  herrings — facts that are true but immaterial; citing them as trade
  drivers costs points, dismissing them earns points.
- **Journal** — every play persists; any evaluated entry can be replayed as
  a mulligan.
- **Leaderboard** — global peer rankings by weighted average, best score,
  streak, and plays.
- **Profile & Usage** — display name, avatar, Nostr relays, peer DMs, and a
  transparency view of Claude API token spend per model.

## Tools

- The slow LLM tools (`optionality_deal_scenario`, `optionality_ask_tip`,
  `optionality_judge_trade`) return a claim check rather than the end item;
  redeem it with the free companion tools (`optionality_fetch_scenario`,
  `optionality_fetch_tip`, `optionality_fetch_judgement`), polling until
  `status` is `done`.
- Reads like `optionality_get_leaderboard`, `optionality_list_journal`, and
  `optionality_get_shared_entries` are inexpensive or free.
