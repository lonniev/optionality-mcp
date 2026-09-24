import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureTollbooth } from '@tollbooth-dpyc/web'
import App from './App'
import './index.css'
import { bootstrapTheme } from './lib/theme'

// Apply persisted light/dark theme before React paints — otherwise the
// first frame flashes the default dark palette on light-theme users.
bootstrapTheme()

// The shared account pieces (profile, session key, avatar) read who this site
// is from here. The storage prefix defaults to the slug, so the held session
// key and avatar stay under the optionality:* keys they always had.
configureTollbooth({
  slug: 'optionality',
  appName: 'Optionality',
  mcpUrl: import.meta.env.VITE_MCP_URL as string,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
