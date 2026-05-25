import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { bootstrapTheme } from './lib/theme'

// Apply persisted light/dark theme before React paints — otherwise the
// first frame flashes the default dark palette on light-theme users.
bootstrapTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
