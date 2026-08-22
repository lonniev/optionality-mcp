"""Detached execution for Optionality's LLM drills.

The wheel's ``ModalExecutor`` spawns ``run_job(claim)`` here instead of starting
an asyncio task on Horizon. What runs is the operator's OWN registered runner —
``deal_scenario``, ``judge_trade`` or ``ask_tip``, unchanged — so this file adds
a *place to run*, not a second implementation.

That is the whole reason the sealed-closure apparatus could be deleted in
tollbooth-dpyc 0.82.0. A generic remote flow could not execute this module's
code, so a job spec had to be encrypted, shipped, interpreted by an op
vocabulary and shaped on the way back. Here the code simply is the code.

**Why this file exists at all.** Optionality carried the `[prefect]` extra from
2026-07-12 until 2026-08-06, when a routine dependency bump to tollbooth-dpyc
0.82.0 dropped it and nothing replaced it. From then until this change every
drill ran in-process on a stateless front: a container recycle mid-call orphaned
the job, which is the exact failure the durable-jobs work had fixed a month
earlier. The wheel degrades quietly by design — no extra, no executor, jobs
still run — so nothing was red. It just was not durable.

**One secret, and it is the one an operator human actually knows.**

``ensure_bootstrapped()`` reads exactly ``TOLLBOOTH_NOSTR_OPERATOR_NSEC``. From
the nsec it derives the npub, finds the Authority's bootstrap DM on a Nostr
relay, and returns BOTH the Neon URL and the vault encryption key. So nothing
else is copied into Modal: no database URL (the operator human does not reliably
know it — the Authority issues it), no vault key, and not the model-router key
that pays for every drill. Those all live in the vault this boot discovers.

The nsec is irreducible: it *is* the identity, and it cannot be fetched over
Nostr because decrypting a DM addressed to your npub requires the nsec you would
be fetching. Everything downstream of identity already arrives over Nostr.

Net effect: this container holds exactly what Horizon holds — no more.

Deploy::

    modal deploy modal_app.py

Then courier ``modal_token_id`` / ``modal_token_secret`` / ``modal_app_name``
into the operator vault; the runtime installs ModalExecutor on its next job.
Until all three are vaulted, drills run in-process exactly as they do today.
"""

import modal

# Safe at module scope in both places this file is imported: at deploy time from
# the project venv, and at container import via `add_local_python_source`.
# `config` pulls in only pydantic-settings and reads the environment — no
# runtime, no server, no I/O.
from config import runner_timeout_s

# Must match the vaulted ``modal_app_name``; the wheel resolves the function by
# (app_name, "run_job"). Rename this without re-couriering that field and the
# runtime keeps dispatching to a name that no longer exists — every drill falls
# back in-process while `service_status` still reports an executor installed.
APP_NAME = "optionality-drills"

app = modal.App(APP_NAME)

image = (
    modal.Image.debian_slim(python_version="3.12")
    # Dependencies from the single source of truth — the same pins the MCP runs,
    # including tollbooth-dpyc itself. A second dependency list here would drift
    # from pyproject.toml and be discovered as a version-skew bug months later.
    .pip_install_from_pyproject("pyproject.toml")
    # Optionality is a FLAT layout, not a src package: `py-modules` and
    # `packages` in pyproject.toml are the authority for this list. Miss one and
    # the container fails at import, inside a job, on the operator's dime.
    .add_local_python_source("server", "config", "llm", "prompts", "db", "tools")
)

# Named, not inline: created once by the operator in Modal, holding the single
# field TOLLBOOTH_NOSTR_OPERATOR_NSEC.
operator_identity = modal.Secret.from_name("optionality-operator")


@app.function(
    image=image,
    secrets=[operator_identity],
    # The OUTERMOST budget ring, derived in config.py from the largest job
    # attempt rather than restated here. It must sit outside the wheel's
    # re-claim threshold: a runner that gives up while the job row is still
    # inside its own budget kills work nothing has given up on, and the drill
    # hangs until the row goes stale and a second worker starts it over — which
    # a trainee reads as slowness, not as a timeout.
    timeout=runner_timeout_s(),
    # Drills are I/O-bound: one provider call per drill, with the provider
    # running its own tool loop server-side. Requesting more CPU would buy
    # nothing.
    cpu=1.0,
    memory=1024,
)
def run_job(claim: str) -> None:
    """Run one claimed drill to completion, detached from the caller.

    Returns ``None`` deliberately. ``_run_job`` persists its own outcome to the
    operator's Neon — success, curated situation, or refund — so the job row is
    the source of truth and this function's return value is not part of the
    contract. The wheel polls the Modal handle only to catch a run that died
    without writing a row at all (cancelled, crashed, or out of time).
    """
    import asyncio

    # Imported INSIDE the function: importing the server module registers the
    # job runners as a side effect, and doing that at container import would run
    # it during image build too, where no secret is mounted.
    import server

    asyncio.run(server.runtime._run_job(claim))
