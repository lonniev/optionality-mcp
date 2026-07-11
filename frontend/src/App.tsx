import { useCallback, useEffect, useState } from "react";

import DebugPanel from "./components/DebugPanel";
import NpubGate from "./components/NpubGate";
import Optionality from "./components/Optionality";
import { PROOF_EXPIRED_EVENT, isLoggedIn, logOut } from "./lib/mcp";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isLoggedIn());

  const handleAuthenticated = useCallback(() => {
    setAuthed(true);
  }, []);

  const handleSignOut = useCallback(() => {
    logOut();
    setAuthed(false);
  }, []);

  // A lapsed npub-proof bounces to the gate globally — even if the call
  // that surfaced it was a background read that swallowed its own error.
  // Mirrors the interactive ProofRequiredError handlers (full sign-out);
  // mcp.ts has already cleared the stale proof_token before firing this.
  useEffect(() => {
    window.addEventListener(PROOF_EXPIRED_EVENT, handleSignOut);
    return () => window.removeEventListener(PROOF_EXPIRED_EVENT, handleSignOut);
  }, [handleSignOut]);

  // DebugPanel renders in both states so a stuck deal *or* a sign-in bounce is
  // always visible — it's the trace that makes "spins then reloads" diagnosable.
  return (
    <>
      {authed ? (
        <Optionality onSignOut={handleSignOut} />
      ) : (
        <NpubGate onAuthenticated={handleAuthenticated} />
      )}
      <DebugPanel />
    </>
  );
}
