// URL-hash routing for the Optionality SPA. One hook, no dependencies.
//
// The active tab lives in `window.location.hash` as `#/<tabId>`. Browser
// back/forward and refresh all do what you'd expect because the URL is
// the single source of truth — React state mirrors it. The hook returns
// two setters:
//
//   setTab(next)     — user-initiated navigation. Pushes a history entry
//                      so the back button can return to the prior tab.
//   replaceTab(next) — system-initiated redirect (auto-route off a
//                      forbidden tab, balance-driven bounce, etc.).
//                      Uses replaceState so the bad URL doesn't pile up
//                      in the back stack.
//
// Hash is preferred over path-based routing because Cloudflare Pages
// serves static assets — no rewrite config needed for deep links.

import { useCallback, useEffect, useState } from "react";
import type { TabId } from "../types";

const TAB_IDS: ReadonlySet<TabId> = new Set<TabId>([
  "welcome",
  "play",
  "sample",
  "journal",
  "leaderboard",
  "usage",
  "profile",
]);

function parseHash(hash: string): TabId | null {
  // Tolerate "#/play", "#play", "#/play/", "#/play?ref=x".
  const cleaned = hash.replace(/^#\/?/, "").replace(/[/?].*$/, "");
  return TAB_IDS.has(cleaned as TabId) ? (cleaned as TabId) : null;
}

function writeHash(tab: TabId, replace: boolean): void {
  const target = `#/${tab}`;
  if (window.location.hash === target) return;
  if (replace) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}${target}`);
  } else {
    window.location.hash = target;
  }
}

export interface HashTabApi {
  tab: TabId;
  setTab: (next: TabId) => void;
  replaceTab: (next: TabId) => void;
}

export function useHashTab(initial: TabId): HashTabApi {
  const [tab, setTabState] = useState<TabId>(() => {
    if (typeof window === "undefined") return initial;
    return parseHash(window.location.hash) ?? initial;
  });

  // First mount: if URL has no recognized tab hash, stamp the initial
  // so a refresh-from-here works immediately.
  useEffect(() => {
    if (parseHash(window.location.hash) == null) {
      writeHash(tab, /*replace=*/ true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Browser back/forward.
  useEffect(() => {
    const onHash = () => {
      const next = parseHash(window.location.hash);
      if (next) setTabState(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    writeHash(next, /*replace=*/ false);
  }, []);

  const replaceTab = useCallback((next: TabId) => {
    setTabState(next);
    writeHash(next, /*replace=*/ true);
  }, []);

  return { tab, setTab, replaceTab };
}
