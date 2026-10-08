A live deal's LLM budget was 360s, sized when `max_uses: 3` bounded the scenario to three
web searches. **Measured 2026-07-28: a model router silently drops that cap.** A request
declaring `max_uses: 1` ran *eight* searches; one declaring 3 ran *eleven* — on an xAI
model and on an Anthropic model alike. The declaration is forwarded, the bound is not.

So a live sovereign deal ran past 360s, the read timed out, and the patron watched the
poll ceiling instead of getting a scenario.

Budgets are resized against the real distribution rather than the old cap: the LLM read
timeout goes 360s → **600s**, `max_runtime_seconds` 420 → **700** (it must stay above the
read timeout, or a slow-but-alive call is reclaimed mid-flight instead of failing into a
refundable situation), and the live poll cadence 300s → 480s. `llm.py` now says plainly
that `max_uses` is decorative on this route, so nobody sizes anything against it again.

**Capping the search count was tried and rejected.** The model obeys a prompt-level "at
most twice" where it ignores `max_uses` — and then answers the rest from training data,
emitting a scenario dated a year in the past with no signal it had done so. For a trading
drill that is worse than failing.

Both classifiers decided the provider had run out of money by matching one lab's wording
(`credit balance`, `purchase credits`, `plans & billing`), because that lab reports an
empty account as a **400**. A model router reports the same condition as a **402** reading
*"Insufficient credits"* — matching none of those needles.

So an exhausted account was curated as `llm_unavailable`, `transient: True`: the
operator's "feed me" DM never fired, and patrons were told to retry a drill that could
never succeed until someone noticed the balance. The wheel's classifier now reads both
providers' wording and treats a bare 402 from a metered LLM provider as unfunded. A model
slug the provider no longer offers is newly distinguished as permanent rather than
retryable — the signature of a marketplace retiring a model under a running deployment.

The operator DM was also telling them to add credit at `console.anthropic.com` whatever
provider the key belonged to. It now points at the account behind `llm_api_key` without
naming a vendor console the operator may not have.
