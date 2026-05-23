import { useCallback, useState } from "react";

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

  if (!authed) {
    return <NpubGate onAuthenticated={handleAuthenticated} />;
  }

  return <Optionality onSignOut={handleSignOut} />;
}
