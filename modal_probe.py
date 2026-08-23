"""Layered dependency probes for the detached runner.

A drill on Modal needs four things to work, stacked:

    L0 container lifecycle  →  L1 outbound network  →  L2 relays  →  L3 bootstrap  →  L4 Neon

When a drill fails, the interesting question is which of those is broken —
and the full runner cannot answer it, because it needs all of them at once
and reports a single "Bootstrap failed". On 2026-08-23 a live deal aborted
with exactly that message; the real cause was that all four relays were
refusing connections for about thirty seconds. Nothing in the failure said so.

Each probe below depends on strictly less than the one after it, so the first
one that fails names the broken ingredient. They are deliberately separate
Modal functions with separate images: L0 runs on a bare image with no secret,
so if it fails the problem is Modal or the account and not our code.

Nothing here returns a secret. Bootstrap reports whether it obtained a Neon URL
and the vault key, never their values.

Run them in order::

    python -m scripts.run_probes        # stops at the first failing layer
"""

import modal

app = modal.App("dpyc-probe")

# L0: nothing at all. The floor.
image_bare = modal.Image.debian_slim(python_version="3.12")

# L1/L2: just enough to open a socket. Deliberately NOT the project image —
# a relay probe that needed the whole dependency tree could fail for reasons
# that have nothing to do with relays.
image_net = image_bare.pip_install("websocket-client>=1.6.0", "httpx>=0.27.0")

# L3/L4: the real thing, same as the drill runner.
image_full = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install_from_pyproject("pyproject.toml")
    .add_local_python_source("server", "config", "llm", "prompts", "db", "tools")
)

operator_identity = modal.Secret.from_name("optionality-operator")

RELAYS = [
    "wss://nos.lol",
    "wss://relay.damus.io",
    "wss://relay.primal.net",
    "wss://relay.nostr.band",
]


@app.function(image=image_bare, timeout=60)
def l0_lifecycle() -> dict:
    """Can Modal start a container of ours at all?"""
    import os
    import platform
    import socket
    return {"layer": "L0-lifecycle", "ok": True, "python": platform.python_version(),
            "host": socket.gethostname(), "pid": os.getpid()}


@app.function(image=image_net, timeout=120)
def l1_egress() -> dict:
    """Does the container have outbound DNS and TLS at all?"""
    import httpx
    targets = {"pypi": "https://pypi.org/simple/", "github": "https://api.github.com/"}
    results = {}
    for name, url in targets.items():
        try:
            r = httpx.get(url, timeout=10, follow_redirects=True)
            results[name] = {"ok": True, "status": r.status_code}
        except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
            results[name] = {"ok": False, "error": f"{type(exc).__name__}: {exc}"[:160]}
    return {"layer": "L1-egress", "ok": all(v["ok"] for v in results.values()),
            "targets": results}


@app.function(image=image_net, timeout=180)
def l2_relays(relays: list[str] | None = None) -> dict:
    """Can the container reach the DPYC relays — connect AND get served?

    Accepting a socket is not the same as serving, so each relay gets a
    REQ→EOSE round trip, the same bar the Oracle's health probe uses.
    """
    import json
    import time

    from websocket import create_connection

    out = {}
    for url in relays or RELAYS:
        started = time.monotonic()
        try:
            ws = create_connection(url, timeout=8)
            try:
                ws.send(json.dumps(["REQ", "probe", {"kinds": [1], "limit": 1}]))
                ws.settimeout(8)
                served = False
                while True:
                    frame = json.loads(ws.recv())
                    if frame[0] in ("EVENT", "EOSE"):
                        served = True
                        break
                    if frame[0] in ("CLOSED", "NOTICE"):
                        break
                out[url] = {"ok": served, "ms": round((time.monotonic() - started) * 1000)}
            finally:
                ws.close()
        except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
            out[url] = {"ok": False, "ms": round((time.monotonic() - started) * 1000),
                        "error": f"{type(exc).__name__}: {exc}"[:200]}
    return verdict_relays(out)


@app.function(image=image_net, timeout=180)
def l2b_config_replication(operator_hex: str, relays: list[str] | None = None) -> dict:
    """Is the Authority's bootstrap config on MORE THAN ONE relay?

    L2 answers "can we reach relays". This answers the question that actually
    bit us: the config is a single kind-30078 replaceable event, and on
    2026-08-23 it existed on exactly one relay of four. Every cold-booting
    container must read it, so a one-relay hiccup takes bootstrap down while
    three healthy relays look on. Reachability was never the whole story.
    """
    import json

    from websocket import create_connection

    found = {}
    for url in relays or RELAYS:
        try:
            ws = create_connection(url, timeout=8)
            try:
                ws.send(json.dumps(["REQ", "cfg", {
                    "kinds": [30078], "#p": [operator_hex], "limit": 5}]))
                ws.settimeout(8)
                hits = 0
                while True:
                    frame = json.loads(ws.recv())
                    if frame[0] == "EVENT":
                        hits += 1
                    elif frame[0] in ("EOSE", "CLOSED", "NOTICE"):
                        break
                found[url] = {"reachable": True, "configs": hits}
            finally:
                ws.close()
        except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
            found[url] = {"reachable": False, "error": f"{type(exc).__name__}"[:60]}

    return verdict_config_replication(found)


@app.function(image=image_full, secrets=[operator_identity], timeout=300)
def l3_bootstrap() -> dict:
    """Can the container turn its nsec into vault access?

    This is what the drill runner does first and what failed on 2026-08-23.
    Reports only the SHAPE of what it found — never a URL or a key.
    """
    import os
    result = {"layer": "L3-bootstrap", "ok": False}
    nsec = os.environ.get("TOLLBOOTH_NOSTR_OPERATOR_NSEC", "")
    result["nsec_present"] = bool(nsec)
    if not nsec:
        result["error"] = "the mounted secret has no TOLLBOOTH_NOSTR_OPERATOR_NSEC"
        return result
    try:
        from tollbooth.bootstrap import ensure_bootstrapped
        # Read BootstrapResult's real fields. An earlier version of this probe
        # guessed `neon_url`, got None because the field is `neon_database_url`,
        # and reported a confident falsehood — the exact failure mode these
        # probes exist to prevent.
        r = await_sync(ensure_bootstrapped())
        result["ok"] = bool(r.success and r.neon_database_url)
        result["success_flag"] = bool(r.success)
        result["got_neon_database_url"] = bool(r.neon_database_url)
        result["got_vault_key"] = bool(r.encryption_nsec_hex)
        result["npub_present"] = bool(r.npub)
        result["authority_npub_present"] = bool(r.authority_npub)
        if r.error:
            result["error"] = str(r.error)[:400]
    except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
        result["error"] = f"{type(exc).__name__}: {exc}"[:400]
    return result


@app.function(image=image_full, secrets=[operator_identity], timeout=300)
def l4_neon() -> dict:
    """Can the container reach the operator's database, once bootstrapped?"""
    result = {"layer": "L4-neon", "ok": False}
    try:
        from tollbooth.bootstrap import ensure_bootstrapped
        r = await_sync(ensure_bootstrapped())
        url = r.neon_database_url
        if not url:
            result["error"] = "bootstrap returned no Neon URL (L3 is the real failure)"
            return result
        import httpx
        host = url.split("@")[-1].split("/")[0]
        result["host_shape"] = host.split(".")[-2:] and ".".join(host.split(".")[-2:])
        r = httpx.get(f"https://{host}/sql", timeout=10)
        result["ok"] = r.status_code < 500
        result["status"] = r.status_code
    except Exception as exc:  # noqa: BLE001 — a probe reports, never raises
        result["error"] = f"{type(exc).__name__}: {exc}"[:300]
    return result


# ── Verdicts ────────────────────────────────────────────────────────
#
# Pure, so CI can test what counts as "ok" without a Modal account. The
# semantics are the whole point of these probes and are easy to get subtly
# wrong — "one relay answered" reads like success and is not.


def verdict_relays(per_relay: dict) -> dict:
    """One reachable relay is enough to TRY; it is not a healthy set."""
    live = [u for u, v in per_relay.items() if v.get("ok")]
    return {
        "layer": "L2-relays",
        "ok": bool(live),
        "live": len(live),
        "total": len(per_relay),
        "relays": per_relay,
    }


def verdict_config_replication(per_relay: dict) -> dict:
    """Two carriers or it is a single point of failure.

    A config on exactly one relay passes every reachability check and still
    takes bootstrap down the moment that one relay hiccups — which is precisely
    what happened on 2026-08-23, with three other relays healthy.
    """
    carrying = [u for u, v in per_relay.items() if v.get("configs")]
    note = ""
    if len(carrying) == 1:
        note = ("bootstrap depends on a single relay — ask the Authority to "
                "re-publish (get_operator_config)")
    elif not carrying:
        note = ("no bootstrap config found on any reachable relay — the "
                "operator cannot cold-start anywhere")
    return {
        "layer": "L2b-config-replication",
        "ok": len(carrying) >= 2,
        "carrying": carrying,
        "carried_by": len(carrying),
        "relays": per_relay,
        "note": note,
    }


def await_sync(coro):
    """Run a coroutine from a sync Modal function."""
    import asyncio
    return asyncio.run(coro)
