// Shared DPYC relay set. The ecosystem agrees on ONE relay list, published at
// dpyc-community/relays.json — the same single source the wheel's relay_registry
// reads. Patrons no longer pick their own relays.
//
// The FE needs it for the one thing that must publish client-side: a NIP-07
// patron-to-patron DM (signed in the browser, fanned out to relays here). We
// fetch the registry once per session (module memo) and fall back to a baked-in
// copy so a GitHub blip never blocks a DM — fail-open with the known-good set.

const RELAYS_URL =
  "https://raw.githubusercontent.com/lonniev/dpyc-community/main/relays.json";

// A build-time mirror of dpyc-community/relays.json — the fallback when the live
// fetch fails. Keep roughly in sync with the registry's entries.
const FALLBACK_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
];

interface RelayEntry {
  url: string;
  primary?: boolean;
}
interface RelaysDoc {
  relays?: RelayEntry[];
}

let cached: string[] | null = null;
let inflight: Promise<string[]> | null = null;

/// The ecosystem relay URLs (wss://…). Cached after the first call; always
/// resolves to a non-empty list (the baked-in fallback covers a fetch failure).
export async function getEcosystemRelays(): Promise<string[]> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const r = await fetch(RELAYS_URL, { cache: "no-cache" });
      if (!r.ok) throw new Error(`relays.json ${r.status}`);
      const doc = (await r.json()) as RelaysDoc;
      const urls = (doc.relays ?? [])
        .map((e) => e.url)
        .filter((u): u is string => typeof u === "string" && u.startsWith("wss://"));
      cached = urls.length ? urls : FALLBACK_RELAYS;
    } catch {
      cached = FALLBACK_RELAYS;
    } finally {
      inflight = null;
    }
    return cached ?? FALLBACK_RELAYS;
  })();
  return inflight;
}
