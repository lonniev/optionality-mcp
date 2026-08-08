"""Lock the Horizon deploy-marker in server.py.

Horizon has repeatedly served a stale wheel pinned at 6bbcd100. The
established recovery is a no-op touch of the entry-point docstring so the
image rebuilds clean layers. This test makes the marker's *target* (the
sha/version after ``→ land``) an explicit contract: it must name a commit
other than the known-stale sha and must track the tollbooth pin in
pyproject.toml so a deps bump without a redeploy nudge fails CI.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER = (ROOT / "server.py").read_text(encoding="utf-8")
PYPROJECT = (ROOT / "pyproject.toml").read_text(encoding="utf-8")

_MARKER_RE = re.compile(
    r"Deploy marker:.*→ land (?P<sha>[0-9a-f]+) / tollbooth (?P<ver>\d+\.\d+\.\d+)",
)
_PIN_RE = re.compile(r'tollbooth-dpyc\[nostr\]==(?P<ver>\d+\.\d+\.\d+)')

# Known-stale Horizon wheel from the recurring deploy-verify failures.
_STALE_SHA = "6bbcd100"


def test_deploy_marker_present_and_well_formed() -> None:
    m = _MARKER_RE.search(SERVER)
    assert m is not None, "server.py docstring must carry a 'Deploy marker: … → land <sha> / tollbooth <ver>' line"


def test_deploy_marker_does_not_target_stale_wheel() -> None:
    m = _MARKER_RE.search(SERVER)
    assert m is not None
    assert not m.group("sha").startswith(_STALE_SHA), (
        f"deploy marker still targets stale sha {m.group('sha')}; "
        "touch the marker to land the current main commit"
    )


def test_deploy_marker_tracks_tollbooth_pin() -> None:
    marker = _MARKER_RE.search(SERVER)
    pin = _PIN_RE.search(PYPROJECT)
    assert marker is not None
    assert pin is not None, "pyproject.toml must pin tollbooth-dpyc[nostr]==X.Y.Z"
    assert marker.group("ver") == pin.group("ver"), (
        f"deploy marker tollbooth {marker.group('ver')} != pyproject pin {pin.group('ver')}; "
        "nudge the marker when bumping the wheel so Horizon rebuilds"
    )
