import React from 'react'
import ReactDOM from 'react-dom/client'
import { bootstrapTheme, configureTollbooth, startLanguage } from '@tollbooth-dpyc/web'
import App from './App'
import { registerOptionality } from './i18n'
import './index.css'
// The MCP client, sign-in gate and account pieces read who this site is from
// here. The storage prefix defaults to the slug, so the identity, proof,
// recent logins and session key stay under the optionality:* keys they
// always had.
configureTollbooth({
  slug: 'optionality',
  appName: 'Optionality',
  mcpUrl: import.meta.env.VITE_MCP_URL as string,
  operatorUrl: "https://optionality-mcp.fastmcp.app",
  // A public read (guests browse a peer's shared trades): its wheel signature
  // takes no npub/proof, so the envelope would be rejected.
  extraBootstrapTools: ['get_shared_entries'],
  // Polled liveness and balance: too routine for the debug log.
  quietTools: ['session_status', 'check_balance'],
})

// The stored pick (dark or light; dark when none) is on <html> before React
// paints, so a light-theme patron never sees a dark first frame.
bootstrapTheme('dark')

// Optionality's words, then the reader's language: their choice, else their
// country's, else English. Optionality draws its own shell, so it starts this
// itself (the package's AppShell would otherwise).
void registerOptionality()
void startLanguage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
