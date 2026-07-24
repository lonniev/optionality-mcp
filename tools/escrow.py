"""Opt-in nsec escrow + operator-signed DMs.

This module lets a patron deposit their game-persona nsec with the
operator so the operator can sign Nostr DMs on their behalf — useful
for platforms (iPadOS, etc.) where a NIP-07 browser-extension signer
isn't practical. The trade is sovereignty for UX: the operator
becomes a custodian of the patron's game-scoped Nostr identity, with
the same security posture as the Anthropic api_key (AES-256-GCM at
rest, decrypted only in-process during signing).

Architectural notes:

- Escrow is OPT-IN. Patrons can choose self-custody (NIP-07) instead.
- The nsec is encrypted with VaultCipher using the operator's nsec-
  derived key, AAD-bound to the patron's npub. Cross-row decryption
  fails by construction.
- The plaintext nsec exists in memory only for the duration of a
  signing operation. Python doesn't expose deterministic memory
  wiping; we shadow the local with an overwrite after use as a
  best-effort signal.
- Withdrawing the nsec is one-shot: the plaintext returns once,
  the row is cleared, and Optionality forgets it. The patron is now
  responsible for the key (via their own Nostr client).
"""

from __future__ import annotations

import logging
from typing import Any

from db import patrons

logger = logging.getLogger(__name__)


def _verify_nsec_matches_npub(nsec_bech32: str, claimed_npub: str) -> tuple[bool, str]:
    """Verify that a bech32 nsec derives to the claimed npub.

    Returns (ok, derived_npub_or_error). On mismatch the caller raises
    a ValueError so a patron can't escrow somebody else's nsec.
    """
    try:
        from pynostr.key import PrivateKey  # type: ignore[import-untyped]
        pk = PrivateKey.from_nsec(nsec_bech32)
        derived = pk.public_key.bech32()
        return (derived == claimed_npub, derived)
    except Exception as e:
        return (False, f"nsec parse failed: {e}")


async def escrow_nsec(npub: str, nsec_bech32: str) -> dict[str, Any]:
    """Deposit the patron's nsec into operator-managed encrypted storage.

    Refuses to overwrite a previously-escrowed nsec — the patron must
    first withdraw_nsec() to clear the slot before depositing again.
    This prevents an accidental clobber if the FE calls escrow twice.
    """
    from server import runtime

    if not nsec_bech32 or not nsec_bech32.startswith("nsec1"):
        return {"success": False, "error": "nsec must be a bech32 nsec1... string"}

    ok, derived_or_err = _verify_nsec_matches_npub(nsec_bech32, npub)
    if not ok:
        return {
            "success": False,
            "error": (
                f"nsec does not match the proven npub. "
                f"Derived: {derived_or_err}, claimed: {npub}"
            ),
        }

    # Refuse to clobber existing escrow without an explicit withdraw.
    if await patrons.escrow_nsec_present(npub):
        return {
            "success": False,
            "error": (
                "An escrowed nsec already exists for this patron. "
                "Call withdraw_nsec first to clear the slot."
            ),
        }

    operator_nsec_hex = runtime._get_nsec_hex()
    if not operator_nsec_hex:
        return {"success": False, "error": "Operator nsec not available."}

    await patrons.escrow_nsec_set(npub, nsec_bech32, operator_nsec_hex)
    logger.info("Escrowed nsec for patron %s", npub[:20])
    return {"success": True, "escrowed": True}


async def withdraw_nsec(npub: str, acknowledgment: str) -> dict[str, Any]:
    """Return the plaintext nsec one time and delete the escrow.

    Requires an explicit acknowledgment string ("I understand…") to
    prevent accidental withdrawal — the FE renders a confirmation
    dialog and only sends the exact phrase.
    """
    from server import runtime

    expected = "I understand I am now solely responsible for this nsec."
    if acknowledgment.strip() != expected:
        return {
            "success": False,
            "error": (
                f"Withdrawal requires the exact acknowledgment phrase: {expected!r}"
            ),
            "expected_acknowledgment": expected,
        }

    operator_nsec_hex = runtime._get_nsec_hex()
    if not operator_nsec_hex:
        return {"success": False, "error": "Operator nsec not available."}

    nsec_plain = await patrons.escrow_nsec_get(npub, operator_nsec_hex)
    if not nsec_plain:
        return {"success": False, "error": "No escrowed nsec to withdraw."}

    await patrons.escrow_nsec_delete(npub)
    logger.info("Withdrew + deleted escrowed nsec for patron %s", npub[:20])
    # The nsec is returned to the caller once; the local goes out of
    # scope here. Best-effort: shadow with a same-length placeholder
    # before returning so any lingering reference is poisoned.
    response = {"success": True, "nsec": nsec_plain, "escrowed": False}
    nsec_plain = "\x00" * len(nsec_plain)
    return response


async def send_patron_dm(
    npub: str,
    target_npub: str,
    message: str,
) -> dict[str, Any]:
    """Sign and publish a Nostr DM as the patron, using the escrowed nsec.

    Loads the patron's encrypted nsec from Neon, decrypts in-process,
    signs and broadcasts a kind-4 NIP-04 DM (plus NIP-17 gift wrap for
    modern clients) via the wheel's existing Secure Courier exchange,
    then drops the plaintext. The sender npub on the wire is the
    patron's own — DMs are cryptographically authored by the patron,
    not relayed under the operator's identity.
    """
    from server import runtime

    if not message.strip():
        return {"success": False, "error": "Message cannot be empty."}
    if len(message) > 2000:
        return {"success": False, "error": "Message exceeds 2000 chars."}
    if not target_npub.startswith("npub1"):
        return {"success": False, "error": "target_npub must be a bech32 npub1... string"}

    operator_nsec_hex = runtime._get_nsec_hex()
    if not operator_nsec_hex:
        return {"success": False, "error": "Operator nsec not available."}

    nsec_plain = await patrons.escrow_nsec_get(npub, operator_nsec_hex)
    if not nsec_plain:
        return {
            "success": False,
            "error": (
                "No escrowed nsec for this patron. Either escrow one via "
                "escrow_nsec, or sign DMs locally with a NIP-07 browser "
                "extension."
            ),
        }

    try:
        from pynostr.key import PrivateKey  # type: ignore[import-untyped]
        patron_key = PrivateKey.from_nsec(nsec_plain)
    except Exception as e:
        return {"success": False, "error": f"escrowed nsec parse failed: {e}"}
    finally:
        # Drop the plaintext string as soon as PrivateKey owns it.
        nsec_plain = "\x00" * len(nsec_plain)

    # Use the wheel's existing dual-protocol sender (NIP-17 + NIP-04).
    # The _send_dm_as helper accepts an explicit PrivateKey, signs the
    # event with it, and publishes to the courier's configured relays.
    courier = await runtime.courier()
    if courier is None:
        return {"success": False, "error": "Secure Courier not ready (operator nsec or relays missing)."}
    try:
        courier._exchange._send_dm_as(patron_key, target_npub, message)
    except Exception as e:
        return {"success": False, "error": f"DM send failed: {e}"}

    logger.info(
        "Sent escrowed-patron DM: %s → %s",
        npub[:20], target_npub[:20],
    )
    return {"success": True, "sender_npub": npub, "target_npub": target_npub}


async def get_escrow_status(npub: str) -> dict[str, Any]:
    """Lightweight presence check — returns ``{"escrowed": bool}`` so
    the FE can render Withdraw vs Deposit affordances without a full
    profile fetch."""
    return {"success": True, "escrowed": await patrons.escrow_nsec_present(npub)}
