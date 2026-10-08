`optionality_api_usage` gains a `cost_usd` column, written from the provider's own
per-call figure. The browser previously reconstructed cost from a bundled rate table; that
was fine while one model was hardwired, and wrong the moment the route can change model,
because tokens from two models are not comparable money.

Rows predating the column carry NULL and are rendered as estimates, explicitly labelled —
never silently blended with measured figures. `null` means unknown, never free.

`get_api_usage_stats` gains a `totals` block including **`avg_cost_usd`** — what one
scenario, clue or verdict costs to serve, which is the figure that says whether a tool's
sats price covers its own compute. The Usage page surfaces it as a "Cost per call" tile
and a per-model "Per call" figure.

The sats-equivalent tile's $100K/BTC constant is now labelled as the fixed reference rate
it has always been, rather than reading as today's spot.
