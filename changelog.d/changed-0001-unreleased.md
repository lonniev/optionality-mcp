The old instruction ("find market conditions, recent news, and active catalysts") named no
finish line, so every answer invited another query — eleven searches and ~35k input tokens
for one scenario, since it is search *results*, not the prompt, that fill the context.

`SCENARIO_LIVE` now names the six facts a live scenario actually needs, the order to get
them (broad once → narrow to one ticker → stop), and what needs no research at all (option
chains, analyst targets, red-herring material). It stops the model answering from memory,
and tells it what to do when a fact won't come: estimate from the regime and say so in
`skew_note`, rather than substituting a remembered price or searching forever.

`claude.py` is now `llm.py`. Its docstring recorded that it had been *"Modeled after
`taxsort-mcp/tools/advisors.py`"* — one of three near-identical copies of the same
provider plumbing across the estate, each pinning `api.anthropic.com`, each declaring its
own web-search tool, two carrying a byte-identical `clamp_timeout`. That is a wheel
concern and now lives in `tollbooth.llm_route` (SDK 0.74.0). What stays here is what makes
a *drill* good: the prompts, the usage journal, and the JSON coercion they depend on.

Dealing and judging draw the **writer** tier — both compose reasoned prose the patron is
asked to trust, and a live deal grounds itself with web search. Tips draw the **reader**
tier: a hint alongside a scenario already in front of the patron. Changing either model is
an environment variable and a restart, not a release.

**One request shape, one execution path.** The in-process path used the `anthropic` SDK
client while the detached closure path built a raw HTTP envelope, so every provider
behaviour had to be understood — and every provider failure classified — twice, by
`_provider_situation` and `situation_from_status`. Both now build the same envelope and
read the same reply, and `_provider_situation` is gone. The `anthropic` package is no
longer a dependency.

**The vaulted credential is renamed `anthropic_api_key` → `llm_api_key`, with no
compatibility shim.** The operator must redeliver it via Secure Courier — already required
to change providers, so the rename costs nothing extra.

`record_call` was passed the module's default model rather than the model named in the
reply. That was harmless while one model was hardwired; with the model now configurable it
would have mis-attributed every row after a change, and the Profile/Usage view compares
token counts across models. Both paths now read the model from the response.
