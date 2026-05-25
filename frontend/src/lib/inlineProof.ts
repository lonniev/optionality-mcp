// Inline kind-27235 identity proof — Tactic 2 in the wheel's
// identity_proof.verify_proof. A fresh signed event per paid tool call,
// scoped to the runtime tool name via the ``u`` tag. The wheel doesn't
// need a relay round-trip or a cached poison; it verifies the signature
// inline.
//
// The wheel's check is bound to:
//   - npub: the sender's pubkey on the event must match the claimed npub.
//   - tool_name: the ``u`` tag value must match the MCP-namespaced
//     tool the call is about to invoke (e.g. "optionality_deal_scenario").
//   - window_seconds: created_at must be within ~60s of server time.
//
// We sign fresh on every call. The Schnorr signing op is sub-millisecond
// and avoids any cache invalidation logic.

import { finalizeEvent } from "nostr-tools";
import { getSessionNsecBytes } from "./sessionNsec";

const PROOF_KIND = 27235;

/// Sign a kind-27235 proof event for ``mcpToolName`` (the
/// slug-prefixed name like ``optionality_deal_scenario``) using the
/// in-browser session nsec. Returns the JSON-stringified signed event,
/// which is exactly the shape the wheel's verify_proof expects.
export function signInlineProof(mcpToolName: string): string {
  const skBytes = getSessionNsecBytes();
  const signed = finalizeEvent(
    {
      kind: PROOF_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["u", mcpToolName]],
      content: "",
    },
    skBytes,
  );
  return JSON.stringify(signed);
}
