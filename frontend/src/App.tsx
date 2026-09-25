import { useCallback, useEffect, useState } from "react";
import {
  canSign,
  debugPush,
  getSessionNsec,
  isLoggedIn,
  logOut,
  onProofExpired,
} from "@tollbooth-dpyc/web";
import { DebugPanel } from "@tollbooth-dpyc/web/react";

import SignInScreen from "./components/SignInScreen";
import Optionality from "./components/Optionality";
import { isGuestMode, setGuestMode } from "./lib/guest";
import { escrowNsec } from "./lib/mcp";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => isGuestMode() || isLoggedIn());
  const [notice, setNotice] = useState("");

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
        setNotice("Your sign-in lapsed while you were away. Sign in again to carry on.");
      }),
    [handleSignOut],
  );

  // DebugPanel renders in both states so a stuck deal *or* a sign-in bounce is
  // always visible — it's the trace that makes "spins then reloads" diagnosable.
  // Mounted last so its spacer is the last thing in the page's flow. The
  // .tb-host wrapper gives its buttons the site's reset.
  return (
    <>
      {authed ? (
        <Optionality onSignOut={handleSignOut} />
      ) : (
        <SignInScreen onLogin={handleLogin} onGuest={handleGuest} notice={notice} />
      )}
      <div className="tb-host">
        <DebugPanel />
      </div>
    </>
  );
}
