"""The detached runner's deploy graph.

Two traps live here, and neither is visible to any other test.

**The app name is a contract with the vault.** The wheel resolves the remote
function by ``(modal_app_name, "run_job")``, where ``modal_app_name`` is a
vaulted credential. Rename the app without re-couriering that field and the
runtime keeps dispatching to a name that no longer exists — every drill falls
back in-process while ``service_status`` still reports an executor installed.

**The mounted source list is a contract with the layout.** Optionality is a flat
project, not a src package: ``py-modules`` and ``packages`` in pyproject.toml are
the authority. Miss one and the container fails at import, inside a job, on the
operator's dime — long after CI was green.
"""

from __future__ import annotations

import ast
import pathlib
import re
import tomllib

import modal_app
from config import runner_timeout_s

ROOT = pathlib.Path(__file__).resolve().parent.parent


class TestTheVaultContract:
    def test_the_app_name_is_what_an_operator_must_courier(self):
        assert modal_app.app.name == modal_app.APP_NAME == "optionality-drills"

    def test_the_secret_is_named_not_inline(self):
        """An inline secret would put the nsec in this file."""
        source = (ROOT / "modal_app.py").read_text()
        assert 'modal.Secret.from_name("optionality-operator")' in source
        assert "nsec1" not in source


class TestTheLayoutContract:
    def test_every_declared_module_and_package_is_mounted(self):
        """The flat-layout trap: pyproject declares them, Modal must mount them."""
        cfg = tomllib.loads((ROOT / "pyproject.toml").read_text())
        declared = set(cfg["tool"]["setuptools"]["py-modules"]) | set(
            cfg["tool"]["setuptools"]["packages"]
        )
        source = (ROOT / "modal_app.py").read_text()
        call = re.search(r"add_local_python_source\(([^)]*)\)", source, re.DOTALL)
        assert call, "modal_app.py must mount the operator's own source"
        mounted = set(re.findall(r'"([^"]+)"', call.group(1)))
        assert declared <= mounted, f"not mounted on Modal: {sorted(declared - mounted)}"


class TestTheBudgetRing:
    def test_the_runner_outlasts_every_job_it_may_be_asked_to_run(self):
        """The runner must never be what kills a job the wheel still owns.

        Reads the literal budgets out of server.py rather than trusting a
        constant, because the inversion this guards against is exactly someone
        raising a `max_runtime_seconds` and not the ring around it.
        """
        budgets = [
            int(m)
            for m in re.findall(
                r"max_runtime_seconds=(?:JOB_ATTEMPT_MAX_S|(\d+))",
                (ROOT / "server.py").read_text(),
            )
            if m
        ]
        from config import JOB_ATTEMPT_MAX_S

        budgets.append(JOB_ATTEMPT_MAX_S)
        assert budgets, "no job budgets found in server.py"
        assert runner_timeout_s() > max(budgets), (
            f"runner ceiling {runner_timeout_s()}s does not outlast the longest "
            f"job attempt {max(budgets)}s"
        )

    def test_the_deployed_timeout_is_derived_not_restated(self):
        """Modal bakes this in at deploy time on a CI runner, where a wrong
        literal is invisible to every in-process test."""
        tree = ast.parse((ROOT / "modal_app.py").read_text())
        for node in ast.walk(tree):
            if isinstance(node, ast.keyword) and node.arg == "timeout":
                assert not isinstance(node.value, ast.Constant), (
                    "timeout must be computed from config, never a literal"
                )
                return
        raise AssertionError("no timeout= on the Modal function")


class TestRunJobStaysAShim:
    def test_the_server_import_is_inside_the_function(self):
        """At container import it would also run during image build, where no
        secret is mounted."""
        tree = ast.parse((ROOT / "modal_app.py").read_text())
        fn = next(
            n for n in ast.walk(tree)
            if isinstance(n, ast.FunctionDef) and n.name == "run_job"
        )
        inner = {
            alias.name
            for n in ast.walk(fn)
            if isinstance(n, ast.Import)
            for alias in n.names
        }
        assert "server" in inner, "server must be imported inside run_job"

        module_level = {
            alias.name
            for n in tree.body
            if isinstance(n, ast.Import)
            for alias in n.names
        }
        assert "server" not in module_level

    def test_it_holds_no_business_logic(self):
        """A second implementation here would drift from the registered runner."""
        tree = ast.parse((ROOT / "modal_app.py").read_text())
        fn = next(
            n for n in ast.walk(tree)
            if isinstance(n, ast.FunctionDef) and n.name == "run_job"
        )
        # import asyncio, import server, one asyncio.run(...) call.
        assert len(fn.body) <= 4, "run_job should be a shim, not a runner"
