"""Regression: Horizon stale-wheel deploys are cleared by touching server.py's marker.

Issue #88 (and the long 6bbcd100 series before it) fire when live
``optionality_service_status`` still reports ``fastmcp_cloud_git_commit_sha=6bbcd100``
after main has moved on. The established fix is a one-line deploy-marker bump in
the server entry-point docstring so Horizon rebuilds clean layers.

This test locks the marker shape and the current land target so a no-op merge
cannot leave the docstring pointing at a previous nudge.
"""

from __future__ import annotations

from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[1]
_SERVER = _REPO_ROOT / "server.py"

# Land target for the #88 nudge — must match the Deploy marker line in server.py.
_LAND_SHA_PREFIX = "6061556c"
_STALE_SHA_PREFIX = "6bbcd100"


def _marker_line() -> str:
    for line in _SERVER.read_text(encoding="utf-8").splitlines():
        if "Deploy marker:" in line:
            return line
    raise AssertionError("server.py is missing a 'Deploy marker:' line in its docstring")


def test_deploy_marker_names_stale_wheel_and_land_target() -> None:
    line = _marker_line()
    assert _STALE_SHA_PREFIX in line, (
        f"marker must name the stale sha being escaped, got: {line!r}"
    )
    assert _LAND_SHA_PREFIX in line, (
        f"marker must name land target {_LAND_SHA_PREFIX} (issue #88), got: {line!r}"
    )
    assert "#88" in line, f"marker should cite issue #88, got: {line!r}"
