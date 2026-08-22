"""Root conftest: this worktree's own modules resolve first.

``modal_app.py`` is deliberately NOT in pyproject's ``py-modules`` — it is a
deploy artefact, not part of the served app, so an editable install does not
expose it. Tests still need to import it, and pytest only puts the *test*
directory on ``sys.path``.

This matters more than it looks. ``python -m pytest`` inserts the working
directory and the ``pytest`` executable does not, so a suite that passes locally
one way fails in CI the other — which is exactly how this file came to exist.
Putting the repo root on the path explicitly makes both invocations agree, and
guarantees a test reads THIS worktree rather than a stale editable install.
"""

import pathlib
import sys

_root = str(pathlib.Path(__file__).resolve().parent)
if _root not in sys.path:
    sys.path.insert(0, _root)
