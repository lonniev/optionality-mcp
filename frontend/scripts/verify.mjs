// Run the verify/*.smoke.ts checks, each bundled by esbuild and run by node.
//
// These used to be `esbuild … | node --input-type=module`, where the exit code
// was node's: with esbuild missing or failing, node read nothing and exited 0,
// so every check "passed" without running. Bundling to a file first means a
// failed bundle and a failed check both fail the run.
//
//   node scripts/verify.mjs              every check
//   node scripts/verify.mjs dealClock    just the named ones

import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const here = new URL("../verify/", import.meta.url).pathname;
const wanted = process.argv.slice(2);
const smokes = readdirSync(here)
  .filter((f) => f.endsWith(".smoke.ts"))
  .map((f) => f.replace(/\.smoke\.ts$/, ""))
  .filter((name) => wanted.length === 0 || wanted.includes(name));

if (smokes.length === 0) {
  console.error(`no smoke checks matched: ${wanted.join(", ") || "(none found)"}`);
  process.exit(1);
}

const out = mkdtempSync(join(tmpdir(), "verify-"));
let failed = 0;
try {
  for (const name of smokes) {
    const outfile = join(out, `${name}.mjs`);
    await build({
      entryPoints: [join(here, `${name}.smoke.ts`)],
      bundle: true, format: "esm", platform: "node", outfile, logLevel: "error",
    });
    const run = spawnSync(process.execPath, [outfile], { stdio: "inherit" });
    if (run.status !== 0) {
      failed += 1;
      console.error(`✗ ${name} (exit ${run.status})`);
    } else {
      console.log(`✓ ${name}`);
    }
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);
