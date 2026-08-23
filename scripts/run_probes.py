"""Run the detached-runner probes in dependency order, stopping at the first failure.

The point is to name the broken ingredient instead of re-cooking the whole
dish. Each layer needs strictly less than the next, so the first failure IS
the diagnosis — there is nothing to learn from running the layers above it.
"""

from __future__ import annotations

import json
import sys

LAYERS = ["l0_lifecycle", "l1_egress", "l2_relays", "l2b_config_replication",
          "l3_bootstrap", "l4_neon"]
APP = "dpyc-probe"


def main(argv: list[str]) -> int:
    import modal

    only = argv[1:] or LAYERS
    for name in only:
        try:
            fn = modal.Function.from_name(APP, name)
        except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
            print(f"✗ {name}: cannot resolve — {type(exc).__name__}: {exc}")
            print(f"\nStopped at {name}. Is `{APP}` deployed?")
            return 1
        try:
            # L2b needs to know whose config to look for.
            if name == "l2b_config_replication":
                import os
                op = os.environ.get("DPYC_OPERATOR_HEX", "")
                if not op:
                    print(f"– {name}: skipped (set DPYC_OPERATOR_HEX to check)")
                    continue
                result = fn.remote(op)
            else:
                result = fn.remote()
        except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
            print(f"✗ {name}: raised — {type(exc).__name__}: {str(exc)[:200]}")
            print(f"\nStopped at {name}: the layer could not even run.")
            return 1

        ok = bool(result.get("ok"))
        print(f"{'✓' if ok else '✗'} {name}: {json.dumps(result, default=str)[:400]}")
        if not ok:
            print(f"\nStopped at {name}. Everything below it is sound; fix this "
                  f"before reading anything into the layers above.")
            return 1
    print("\nAll layers sound — a drill failing now is not an infrastructure problem.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
