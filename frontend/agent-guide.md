
## What to tell a person about Optionality

Optionality is a trainer for anyone learning to think like an options-trading consultant.
The Firm deals a market opportunity, the person writes a trade pitch, and a judge scores their discipline.
It is a simulator: nothing here is investment advice, and no real orders are placed.

What a person gets:

- **A scenario to their level.** Historical, fiction, or live (grounded in today's market), at four difficulties from apprentice to sovereign.
- **A clue desk.** It answers questions Socratically, without giving the trade away.
- **An honest judge.** Structure, strikes and tenor, risk and reward, macro context and tail awareness, each scored, with the pitch parsed into legs.
- **Red herrings.** Every scenario hides true facts that do not matter. Leaning on one costs points; dismissing it earns them.
- **A journal and a mulligan.** Every play is kept, and any judged one can be replayed.
- **Peers.** A leaderboard where a hard pitch scored well outranks an easy one, and pitches a trader chooses to share.
- **No login.** They sign in with a Nostr key and pay per use in Bitcoin Lightning; a guest pass shows the free parts first.

A good one-line pitch: *"Practise options trades against a judge who rewards discipline and catches you leaning on red herrings."*

## For agents

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

## Working with the tools

`tools/list` and each tool's description carry the arguments.
Dealing a scenario, asking for a clue and judging a pitch are slow, so each returns a claim check at once.
Its free companion tool redeems the claim check once its `status` is `done`.
