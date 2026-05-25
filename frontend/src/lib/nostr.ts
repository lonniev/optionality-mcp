// Nostr DM utilities — NIP-07 detection, NIP-04 encrypt, sign, publish.
//
// Optionality's Phase 2 patron-to-patron DM uses an installed NIP-07
// extension (Alby, nos2x, Flamingo, …) as the signer. The user's nsec
// NEVER enters this process; we only call window.nostr.signEvent /
// window.nostr.nip04.encrypt, which the extension implements with the
// nsec in its own sandbox.
//
// Relay publish is a thin WebSocket fan-out. nostr-tools' SimplePool
// could do this for us but pulling in another abstraction for a
// fire-and-forget send isn't worth the byte cost; the protocol is
// "open ws, send ['EVENT', signed_event], wait for OK or timeout, close."

import { nip19 } from "nostr-tools";

/// Subset of the NIP-07 interface Optionality uses. The full interface
/// has more methods (nip44, getRelays, etc.) but we only need these.
export interface Nip07Provider {
  getPublicKey(): Promise<string>;
  signEvent(event: UnsignedEvent): Promise<SignedEvent>;
  nip04: {
    encrypt(peerHex: string, plaintext: string): Promise<string>;
    decrypt(peerHex: string, ciphertext: string): Promise<string>;
  };
  // Optional in some providers — we feature-detect at call sites.
  getRelays?: () => Promise<Record<string, { read: boolean; write: boolean }>>;
}

export interface UnsignedEvent {
  kind: number;
  created_at: number;
  tags: string[][];
  content: string;
  pubkey: string;
}

export interface SignedEvent extends UnsignedEvent {
  id: string;
  sig: string;
}

declare global {
  interface Window {
    nostr?: Nip07Provider;
  }
}

export function hasNip07(): boolean {
  return typeof window !== "undefined" && !!window.nostr;
}

/// Convert a bech32 npub to its 64-char hex pubkey. Throws on malformed
/// input — the caller surfaces the error to the user since this only
/// runs on a recipient npub the FE didn't generate.
export function npubToHex(npub: string): string {
  const decoded = nip19.decode(npub);
  if (decoded.type !== "npub" || typeof decoded.data !== "string") {
    throw new Error(`Not a valid npub: ${npub}`);
  }
  return decoded.data;
}

/// Per-relay result from publishToRelays — useful for "sent to 3 of 5
/// relays" status display in the DM modal.
export interface RelayPublishResult {
  url: string;
  ok: boolean;
  /// "ok" / "timeout" / "rejected: <reason>" / "ws_error" — diagnostic
  /// for the failure case; not shown directly to users unless they
  /// expand details.
  status: string;
}

/// Open a fresh WebSocket per relay, push the EVENT frame, wait for
/// the matching OK frame (or timeout), close. Parallel across relays;
/// promise resolves when every relay has either ack'd or timed out.
export async function publishToRelays(
  signed: SignedEvent,
  relays: string[],
  { timeoutMs = 5000 }: { timeoutMs?: number } = {},
): Promise<RelayPublishResult[]> {
  if (relays.length === 0) {
    throw new Error("No relays configured. Add at least one in Profile → Nostr Relays.");
  }
  return Promise.all(relays.map((url) => publishToOne(signed, url, timeoutMs)));
}

function publishToOne(signed: SignedEvent, url: string, timeoutMs: number): Promise<RelayPublishResult> {
  return new Promise((resolve) => {
    let ws: WebSocket;
    let settled = false;
    const t = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        try { ws?.close(); } catch { /* noop */ }
        resolve({ url, ok: false, status: "timeout" });
      }
    }, timeoutMs);

    try {
      ws = new WebSocket(url);
    } catch (e) {
      window.clearTimeout(t);
      resolve({ url, ok: false, status: `ws_error: ${(e as Error).message}` });
      return;
    }

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify(["EVENT", signed]));
      } catch (e) {
        if (!settled) {
          settled = true;
          window.clearTimeout(t);
          resolve({ url, ok: false, status: `send_error: ${(e as Error).message}` });
          try { ws.close(); } catch { /* noop */ }
        }
      }
    };

    ws.onmessage = (msg) => {
      // Relays reply with ["OK", <event_id>, <accepted>, <reason>]
      // Parse and match on our event id; ignore unrelated frames.
      try {
        const frame = JSON.parse(msg.data);
        if (Array.isArray(frame) && frame[0] === "OK" && frame[1] === signed.id) {
          if (!settled) {
            settled = true;
            window.clearTimeout(t);
            const accepted = frame[2] === true;
            const reason = typeof frame[3] === "string" ? frame[3] : "";
            resolve({
              url,
              ok: accepted,
              status: accepted ? "ok" : `rejected: ${reason || "no reason"}`,
            });
            try { ws.close(); } catch { /* noop */ }
          }
        }
      } catch {
        // Malformed frame — ignore, let the timeout fire.
      }
    };

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        window.clearTimeout(t);
        resolve({ url, ok: false, status: "ws_error" });
        try { ws.close(); } catch { /* noop */ }
      }
    };

    ws.onclose = () => {
      if (!settled) {
        settled = true;
        window.clearTimeout(t);
        resolve({ url, ok: false, status: "closed_without_ok" });
      }
    };
  });
}

/// Build, encrypt, sign, and publish a NIP-04 DM via the user's NIP-07
/// signer. Returns a summary the modal can render.
export async function sendNip04DM({
  targetNpub,
  plaintext,
  relays,
}: {
  targetNpub: string;
  plaintext: string;
  relays: string[];
}): Promise<{
  signedEventId: string;
  relayResults: RelayPublishResult[];
  successCount: number;
}> {
  const provider = window.nostr;
  if (!provider) throw new Error("No NIP-07 signer detected. Install Alby, nos2x, or Flamingo.");
  if (!plaintext.trim()) throw new Error("Message can't be empty.");

  const senderHex = await provider.getPublicKey();
  const targetHex = npubToHex(targetNpub);
  const ciphertext = await provider.nip04.encrypt(targetHex, plaintext);

  const unsigned: UnsignedEvent = {
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", targetHex]],
    content: ciphertext,
    pubkey: senderHex,
  };

  const signed = await provider.signEvent(unsigned);
  const relayResults = await publishToRelays(signed, relays);
  const successCount = relayResults.filter((r) => r.ok).length;
  return { signedEventId: signed.id, relayResults, successCount };
}
