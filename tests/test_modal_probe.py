"""The layered probes, and what counts as a passing layer.

These exist because a drill on Modal needs four things at once and reports a
single "Bootstrap failed" when any of them is missing. On 2026-08-23 that
message meant "the one relay carrying my bootstrap config was down for thirty
seconds", and nothing in it said so.

The verdict semantics are the part worth testing: they are easy to get subtly
wrong in the direction of false confidence. "One relay answered" reads like
success. "One relay carries the config" reads like success. Neither is.
"""

from __future__ import annotations

import ast
import pathlib

from modal_probe import verdict_config_replication, verdict_relays

ROOT = pathlib.Path(__file__).resolve().parent.parent
LAYER_ORDER = ["l0_lifecycle", "l1_egress", "l2_relays",
               "l2b_config_replication", "l3_bootstrap", "l4_neon"]


class TestRelayVerdict:
    def test_no_reachable_relay_fails(self):
        v = verdict_relays({"wss://a": {"ok": False}, "wss://b": {"ok": False}})
        assert v["ok"] is False and v["live"] == 0

    def test_one_reachable_relay_is_enough_to_try(self):
        v = verdict_relays({"wss://a": {"ok": True}, "wss://b": {"ok": False}})
        assert v["ok"] is True and v["live"] == 1


class TestConfigReplicationVerdict:
    """The probe that would have caught the 2026-08-23 failure."""

    def test_a_single_carrier_is_a_failure_not_a_success(self):
        v = verdict_config_replication({
            "wss://nos.lol": {"reachable": True, "configs": 1},
            "wss://relay.primal.net": {"reachable": True, "configs": 0},
            "wss://relay.damus.io": {"reachable": False},
        })
        assert v["ok"] is False, "one carrier is a single point of failure"
        assert v["carried_by"] == 1
        assert "single relay" in v["note"]
        assert "get_operator_config" in v["note"], "must say how to fix it"

    def test_two_carriers_pass(self):
        v = verdict_config_replication({
            "wss://a": {"reachable": True, "configs": 1},
            "wss://b": {"reachable": True, "configs": 1},
        })
        assert v["ok"] is True and v["carried_by"] == 2 and v["note"] == ""

    def test_no_carrier_says_so_distinctly(self):
        """Absent everywhere is a different problem from present-on-one."""
        v = verdict_config_replication({
            "wss://a": {"reachable": True, "configs": 0},
            "wss://b": {"reachable": True, "configs": 0},
        })
        assert v["ok"] is False and v["carried_by"] == 0
        assert "any reachable relay" in v["note"]

    def test_an_unreachable_relay_is_not_counted_as_carrying(self):
        v = verdict_config_replication({
            "wss://a": {"reachable": True, "configs": 1},
            "wss://b": {"reachable": False, "error": "TimeoutError"},
        })
        assert v["carried_by"] == 1 and v["ok"] is False


class TestTheProbeGraph:
    def test_every_layer_is_defined(self):
        import modal_probe
        for name in LAYER_ORDER:
            assert hasattr(modal_probe, name), f"{name} missing from modal_probe"

    def test_the_runner_walks_the_layers_in_dependency_order(self):
        """A runner that probed L3 before L2 would report the wrong culprit."""
        src = (ROOT / "scripts" / "run_probes.py").read_text()
        tree = ast.parse(src)
        layers = next(
            [e.value for e in n.value.elts]
            for n in ast.walk(tree)
            if isinstance(n, ast.Assign)
            and getattr(n.targets[0], "id", "") == "LAYERS"
        )
        assert layers == LAYER_ORDER

    def test_only_l0_is_free_of_dependencies(self):
        """L0 must run on the bare image with no secret — it is the floor.

        If L0 needed the project image or the operator secret it could fail for
        reasons that have nothing to do with Modal, and the floor would stop
        being a floor.
        """
        src = (ROOT / "modal_probe.py").read_text()
        tree = ast.parse(src)
        fn = next(n for n in ast.walk(tree)
                  if isinstance(n, ast.FunctionDef) and n.name == "l0_lifecycle")
        deco = fn.decorator_list[0]
        kwargs = {k.arg: k.value for k in deco.keywords}
        assert getattr(kwargs["image"], "id", None) == "image_bare"
        assert "secrets" not in kwargs, "L0 must not require a secret"

    def test_the_secret_bearing_layers_name_the_right_secret(self):
        src = (ROOT / "modal_probe.py").read_text()
        assert 'modal.Secret.from_name("optionality-operator")' in src
