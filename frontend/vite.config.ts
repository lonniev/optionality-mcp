import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { agentGuide } from '@tollbooth-dpyc/web/agent-guide'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// Resolve a short git commit SHA at build time. Cloudflare Pages
// injects CF_PAGES_COMMIT_SHA; local dev falls back to `git rev-parse`;
// last-resort fallback is "dev" so the Profile page never renders
// undefined.
function resolveCommit(): string {
  if (process.env.CF_PAGES_COMMIT_SHA) {
    return process.env.CF_PAGES_COMMIT_SHA.slice(0, 7)
  }
  if (process.env.COMMIT_SHA) {
    return process.env.COMMIT_SHA.slice(0, 7)
  }
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
}

export default defineConfig({
  plugins: [
    react(), tailwindcss(),
    agentGuide({
      name: "Optionality",
      summary: "An AI-judged options trading practice drill. The Firm deals a scenario, the trainee writes a free-text trade pitch, and an AI judge scores it across six dimensions, parses the trade legs, and shows how well the pitch separated signal from noise.",
      site: "https://optionality.tollbooth-dpyc.com",
      mcpUrl: "https://optionality-mcp.fastmcp.app/mcp",
      toolPrefix: "optionality",
      source: "https://github.com/lonniev/optionality-mcp",
      registryName: "io.github.lonniev/optionality-mcp",
      body: "agent-guide.md",
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_COMMIT__: JSON.stringify(resolveCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: { outDir: 'dist' },
})
