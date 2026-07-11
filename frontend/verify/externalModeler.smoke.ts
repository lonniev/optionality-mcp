// Smoke test for externalModeler applicability + URL building.
// The repo has no test runner; this is executed through the esbuild that
// ships with Vite (no extra deps) via `npm run verify:modeler`.
import {
  externalModelerFor,
  strategySlugForStructure,
  INSIDER_FINANCE,
} from "../src/lib/externalModeler";
import type { Scenario, TradeLeg } from "../src/types";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}`, detail ?? "");
  }
}

const bullPutLegs: TradeLeg[] = [
  { side: "short", type: "put", strike: 97, expiry_days: 30, premium: 2.1, qty: 1 },
  { side: "long", type: "put", strike: 92, expiry_days: 30, premium: 1.0, qty: 1 },
];

function scenario(mode: Scenario["mode"], ticker: string): Scenario {
  return {
    mode,
    date_context: "",
    macro_backdrop: "",
    asset: { ticker, name: ticker, spot: 100, iv_30d: 40 },
    catalyst: "",
    key_levels: "",
    constraints: "",
    the_question: "",
  };
}

// 1. live + bull put spread + real ticker → available, verified URL shape.
{
  const r = externalModelerFor(scenario("live", "PLTR"), bullPutLegs);
  check("live/bull-put → available", r.kind === "available", r);
  if (r.kind === "available") {
    check(
      "live/bull-put → correct URL",
      r.url ===
        "https://www.insiderfinance.io/options-profit-calculator/strategy/bull-put-spread/PLTR",
      r.url,
    );
    check("provider is InsiderFinance", r.provider.id === INSIDER_FINANCE.id);
  }
}

// 2. historical → unavailable with a reason (past chain can't be re-quoted).
{
  const r = externalModelerFor(scenario("historical", "AAPL"), bullPutLegs);
  check("historical → unavailable", r.kind === "unavailable");
  check(
    "historical → has reason",
    r.kind === "unavailable" && !!r.reason && /past/i.test(r.reason),
    r,
  );
}

// 3. fiction → unavailable with a reason (underlying doesn't exist).
{
  const r = externalModelerFor(scenario("fiction", "ZXCV"), bullPutLegs);
  check("fiction → unavailable", r.kind === "unavailable");
  check(
    "fiction → has reason",
    r.kind === "unavailable" && !!r.reason && /hypothetical/i.test(r.reason),
    r,
  );
}

// 4. live but no legs → unavailable, silent (nothing to say yet).
{
  const r = externalModelerFor(scenario("live", "PLTR"), []);
  check("live/no-legs → unavailable+silent", r.kind === "unavailable" && r.reason === null, r);
}

// 5. live but a structure with no preset (calendar) → unavailable with reason.
{
  const calendar: TradeLeg[] = [
    { side: "short", type: "call", strike: 100, expiry_days: 30, premium: 2, qty: 1 },
    { side: "long", type: "call", strike: 100, expiry_days: 60, premium: 3, qty: 1 },
  ];
  const r = externalModelerFor(scenario("live", "PLTR"), calendar);
  check("live/calendar → unavailable", r.kind === "unavailable");
  check("live/calendar → has reason", r.kind === "unavailable" && !!r.reason, r);
}

// 6. live but missing ticker → unavailable, silent.
{
  const s = scenario("live", "");
  const r = externalModelerFor(s, bullPutLegs);
  check("live/no-ticker → unavailable+silent", r.kind === "unavailable" && r.reason === null, r);
}

// 7. null scenario → unavailable, silent (static Sample Assessment path).
{
  const r = externalModelerFor(null, bullPutLegs);
  check("null scenario → unavailable+silent", r.kind === "unavailable" && r.reason === null, r);
}

// 8. slug mapping strips (credit)/(debit) qualifiers.
check("slug: Bull Put Spread (credit)", strategySlugForStructure("Bull Put Spread (credit)") === "bull-put-spread");
check("slug: Bear Call Spread (credit)", strategySlugForStructure("Bear Call Spread (credit)") === "bear-call-spread");
check("slug: Long Straddle → straddle", strategySlugForStructure("Long Straddle") === "straddle");
check("slug: Custom 2-leg → null", strategySlugForStructure("Custom 2-leg position") === null);

// 9. ticker is uppercased + URL-encoded.
{
  const r = externalModelerFor(scenario("live", "  pltr "), bullPutLegs);
  check(
    "ticker normalized to PLTR",
    r.kind === "available" && r.url.endsWith("/PLTR"),
    r.kind === "available" ? r.url : r,
  );
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
