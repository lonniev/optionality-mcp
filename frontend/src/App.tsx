import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  canSign,
  debugPush,
  getSessionNsec,
  isLoggedIn,
  logOut,
  onProofExpired,
} from "@tollbooth-dpyc/web";
import { DebugPanel, TourProvider } from "@tollbooth-dpyc/web/react";

import SignInScreen from "./components/SignInScreen";
import { isGuestMode, setGuestMode } from "./lib/guest";
import { escrowNsec } from "./lib/mcp";
import { useT } from "./i18n";
import { tours } from "./lib/tours";

// The game is its own chunk, fetched once the patron is past the sign-in gate.
const Optionality = lazy(() => import("./components/Optionality"));

export default function App() {
  const t = useT();
  const [authed, setAuthed] = useState<boolean>(() => isGuestMode() || isLoggedIn());
  const [notice, setNotice] = useState("");
  const shown = useMemo(() => tours(t), [t]);

  // A sign-in with an nsec (pasted or generated at the gate) also escrows it
  // with the operator, as the sign-in screen says, so the operator can sign
  // the patron's DMs. Best effort: the wheel refuses cleanly when it already
  // holds this patron's key, and a failure never blocks the sign-in.
  const handleLogin = useCallback(() => {
    setNotice("");
    const nsec = canSign() ? getSessionNsec() : null;
    if (nsec) {
      escrowNsec(nsec).catch((e: Error) => {
        debugPush("error", `escrow_nsec during sign-in failed (proceeding): ${e.message}`);
      });
    }
    setAuthed(true);
  }, []);

  const handleGuest = useCallback(() => {
    setGuestMode(true);
    setAuthed(true);
  }, []);

  const handleSignOut = useCallback(() => {
    logOut();
    setGuestMode(false);
    setAuthed(false);
  }, []);

  // A lapsed npub-proof bounces to the gate globally — even if the call that
  // surfaced it was a background read that swallowed its own error. The
  // package has already cleared the refused proof before telling us.
  useEffect(
    () =>
      onProofExpired(() => {
        handleSignOut();
        setNotice(t("app.lapsed"));
      }),
    [handleSignOut, t],
  );

  // DebugPanel renders in both states so a stuck deal *or* a sign-in bounce is
  // always visible — it's the trace that makes "spins then reloads" diagnosable.
  // Mounted last so its spacer is the last thing in the page's flow. The
  // .tb-host wrapper gives its buttons the site's reset.
  return (
    <TourProvider tours={shown}>
      {authed ? (
        <Suspense fallback={<div className="loading" style={{ display: "block", padding: "20px 0" }}>{t("game.openingFloor")}</div>}>
          <Optionality onSignOut={handleSignOut} />
        </Suspense>
      ) : (
        <SignInScreen onLogin={handleLogin} onGuest={handleGuest} notice={notice} />
      )}
      <div className="tb-host">
        <DebugPanel />
      </div>
    </TourProvider>
  );
}
