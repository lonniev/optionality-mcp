"""The entrypoint must import — the check the deploy actually performs.

This exists because of a four-day outage nobody could see. tollbooth-dpyc 0.82.0
deleted ``OperatorRuntime.register_job_spec`` along with the closure apparatus.
``server.py`` still called it at module scope, so importing the module raised
``AttributeError``. Horizon builds by running ``fastmcp inspect server.py:mcp``,
which imports it — so every build failed, and the service went on serving the
last image that had built, four days and eighteen commits stale.

CI stayed green the whole time. Not one test imported ``server``, so the suite
could not fail for the reason production was broken. Fifteen "fix the deploy"
PRs merged green against a module that could not be loaded.

The lesson is narrow and cheap: the commit-phase gate must exercise the same
entrypoint the deploy-phase gate does. Anything registered at module scope —
tools, job runners, SDK calls — is checked here the moment it is written,
instead of at build time on a machine whose logs no workflow reads.
"""

from __future__ import annotations


def test_server_module_imports() -> None:
    """Import the deploy entrypoint exactly as ``fastmcp inspect`` does.

    A bare import is the entire assertion. If a module-scope call reaches for an
    SDK attribute that no longer exists, this raises and CI goes red — which is
    the whole point.
    """
    import server

    assert server.mcp is not None, "server.py must expose the `mcp` object"


def test_registered_job_runners_are_callable() -> None:
    """The runners really are registered, and are the only registration needed.

    Guards the specific regression: the job kinds must survive as runners after
    the closure/spec pair was removed. If a future SDK change strands these the
    way ``register_job_spec`` was stranded, this fails at commit time.
    """
    import server

    for kind in ("deal_scenario", "ask_tip", "judge_trade"):
        assert callable(
            server.runtime._job_runners[kind]
        ), f"{kind} must be registered as a callable runner"
