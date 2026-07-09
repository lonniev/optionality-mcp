import { useCallback, useState } from "react";

import DebugPanel from "./components/DebugPanel";
import NpubGate from "./components/NpubGate";
import Optionality from "./components/Optionality";
import { isLoggedIn, logOut } from "./lib/mcp";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(isLoggedIn());

  const handleAuthenticated = useCallback(() => {
    setAuthed(true);
  }, []);

  const handleSignOut = useCallback(() => {
    logOut();
    setAuthed(false);
  }, []);

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
