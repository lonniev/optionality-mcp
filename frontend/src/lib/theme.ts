// Theme toggle — pure FE, persisted in localStorage so a returning
// patron keeps their pick. Applied by writing data-theme="light" on the
// <html> element; the index.css :root[data-theme="light"] block flips
// the palette tokens. Default is dark (the original Optionality look).
//
// Two consumers:
//   - bootstrapTheme() called from main.tsx before render, so the
//     correct palette is in place on first paint and there's no flash.
//   - useTheme() React hook (NpubGate + Profile use it) for components
//     that need to react to theme changes.

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "optionality:theme";

function readStoredTheme(): Theme {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
  // Only set the attribute for the non-default theme; removing it for
  // dark keeps the :root selector specificity simple.
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

/// Run once on app boot to apply the stored theme before React paints.
export function bootstrapTheme(): void {
  applyTheme(readStoredTheme());
}

/// React hook — returns the current theme and a setter that both
/// updates localStorage and re-applies the data-theme attribute. Cross-
/// tab sync via the storage event so toggling in Profile updates any
/// other tab the user has open.
export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    function onStorage(e: StorageEvent): void {
      if (e.key === STORAGE_KEY) {
        setTheme(readStoredTheme());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function update(next: Theme): void {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setTheme(next);
  }

  return [theme, update];
}
