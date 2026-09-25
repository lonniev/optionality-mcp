import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureTollbooth } from '@tollbooth-dpyc/web'
import App from './App'
import './index.css'
import { bootstrapTheme } from './lib/theme'

// Apply persisted light/dark theme before React paints — otherwise the
// first frame flashes the default dark palette on light-theme users.
bootstrapTheme()

// The MCP client, sign-in gate and account pieces read who this site is from
// here. The storage prefix defaults to the slug, so the identity, proof,
// recent logins and session key stay under the optionality:* keys they
// always had.
configureTollbooth({
  slug: 'optionality',
  appName: 'Optionality',
  mcpUrl: import.meta.env.VITE_MCP_URL as string,
  // A public read (guests browse a peer's shared trades): its wheel signature
  // takes no npub/proof, so the envelope would be rejected.
  extraBootstrapTools: ['get_shared_entries'],
  // Polled liveness and balance: too routine for the debug log.
  quietTools: ['session_status', 'check_balance'],
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
