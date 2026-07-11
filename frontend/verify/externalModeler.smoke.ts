// Smoke test for externalModeler applicability + URL building.
// The repo has no test runner; this is executed through the esbuild that
// ships with Vite (no extra deps) via `npm run verify:modeler`.
import {
  externalModelerFor,
  strategySlugForStructure,
  OPTIONSTRAT,
  INSIDER_FINANCE,
} from "../src/lib/externalModeler";
import type { ProposedLeg, Scenario } from "../src/types";

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.log(`  FAIL ${name}`, detail ?? "");
  }
}

// Ground truth: the exact OptionStrat share URL a human built for a bull
// put spread — short 127 put / long 122 put, PLTR, exp 2026-08-07.
const GROUND_TRUTH =
  "https://optionstrat.com/build/bull-put-spread/PLTR/.PLTR260807P122,-.PLTR260807P127";

const bullPut: ProposedLeg[] = [
  { expiration: "2026-08-07", dte: 27, strike: 127, type: "put", side: "sell", premium: 3.1, qty: 1 },
  { expiration: "2026-08-07", dte: 27, strike: 122, type: "put", side: "buy", premium: 1.9, qty: 1 },
];

function scenario(mode: Scenario["mode"], ticker: string): Scenario {
  return {
    mode,
    date_context: "",
    macro_backdrop: "",
    asset: { ticker, name: ticker, spot: 130, iv_30d: 40 },
    catalyst: "",
    key_levels: "",
    constraints: "",
    the_question: "",
  };
}

// 1. live + bull put spread → OptionStrat full-prefill URL, byte-matching
//    the human-built share link (leg order sorted by ascending strike).
{
  const r = externalModelerFor(scenario("live", "PLTR"), bullPut);
  check("live/bull-put → available", r.kind === "available", r);
  if (r.kind === "available") {
    check("provider is OptionStrat", r.provider.id === OPTIONSTRAT.id, r.provider.id);
    check("URL == verified ground truth", r.url === GROUND_TRUTH, r.url);
  }
}

// 2. lowercase ticker is normalized to the same URL.
{
  const r = externalModelerFor(scenario("live", " pltr "), bullPut);
  check("ticker normalized", r.kind === "available" && r.url === GROUND_TRUTH, r.kind === "available" ? r.url : r);
}

// 3. qty > 1 encodes a leading multiplier after the sign.
{
  const twoLots: ProposedLeg[] = [
    { expiration: "2026-08-07", dte: 27, strike: 127, type: "put", side: "sell", premium: 3.1, qty: 2 },
    { expiration: "2026-08-07", dte: 27, strike: 122, type: "put", side: "buy", premium: 1.9, qty: 2 },
  ];
  const r = externalModelerFor(scenario("live", "PLTR"), twoLots);
  check(
    "qty 2 → 2. / -2. tokens",
    r.kind === "available" &&
      r.url ===
        "https://optionstrat.com/build/bull-put-spread/PLTR/2.PLTR260807P122,-2.PLTR260807P127",
    r.kind === "available" ? r.url : r,
  );
}

// 4. a call structure encodes C and a fractional strike keeps its decimal.
{
  const straddle: ProposedLeg[] = [
    { expiration: "2026-09-18", dte: 69, strike: 130.5, type: "call", side: "buy", premium: 6, qty: 1 },
    { expiration: "2026-09-18", dte: 69, strike: 130.5, type: "put", side: "buy", premium: 5, qty: 1 },
  ];
  const r = externalModelerFor(scenario("live", "PLTR"), straddle);
  check(
    "long straddle → straddle slug, C/P, .5 strike",
    r.kind === "available" &&
      r.url ===
        "https://optionstrat.com/build/straddle/PLTR/.PLTR260918C130.5,.PLTR260918P130.5",
    r.kind === "available" ? r.url : r,
  );
}

// 5. missing expiration → OptionStrat declines, falls back to InsiderFinance.
{
  const noExp: ProposedLeg[] = [
    { expiration: "", dte: 27, strike: 127, type: "put", side: "sell", premium: 3, qty: 1 },
    { expiration: "", dte: 27, strike: 122, type: "put", side: "buy", premium: 2, qty: 1 },
  ];
  const r = externalModelerFor(scenario("live", "PLTR"), noExp);
  check(
    "no expiration → InsiderFinance fallback",
    r.kind === "available" &&
      r.provider.id === INSIDER_FINANCE.id &&
      r.url ===
        "https://www.insiderfinance.io/options-profit-calculator/strategy/bull-put-spread/PLTR",
    r,
  );
}

// 6. historical → unavailable with a reason (past chain can't be re-quoted).
{
  const r = externalModelerFor(scenario("historical", "AAPL"), bullPut);
  check("historical → unavailable+reason", r.kind === "unavailable" && !!r.reason && /past/i.test(r.reason), r);
}

// 7. fiction → unavailable with a reason (underlying doesn't exist).
{
  const r = externalModelerFor(scenario("fiction", "ZXCV"), bullPut);
  check("fiction → unavailable+reason", r.kind === "unavailable" && !!r.reason && /hypothetical/i.test(r.reason), r);
}

// 8. live, no legs → unavailable, silent.
check(
  "live/no-legs → unavailable+silent",
  (() => { const r = externalModelerFor(scenario("live", "PLTR"), []); return r.kind === "unavailable" && r.reason === null; })(),
);

// 9. live, missing ticker → unavailable, silent.
check(
  "live/no-ticker → unavailable+silent",
  (() => { const r = externalModelerFor(scenario("live", ""), bullPut); return r.kind === "unavailable" && r.reason === null; })(),
);

// 10. null scenario → unavailable, silent (static Sample Assessment path).
check(
  "null scenario → unavailable+silent",
  (() => { const r = externalModelerFor(null, bullPut); return r.kind === "unavailable" && r.reason === null; })(),
);

// 11. live, calendar (unmapped structure) → unavailable with reason.
{
  const calendar: ProposedLeg[] = [
    { expiration: "2026-08-07", dte: 27, strike: 130, type: "call", side: "sell", premium: 2, qty: 1 },
    { expiration: "2026-09-18", dte: 69, strike: 130, type: "call", side: "buy", premium: 3, qty: 1 },
  ];
  const r = externalModelerFor(scenario("live", "PLTR"), calendar);
  check("live/calendar → unavailable+reason", r.kind === "unavailable" && !!r.reason, r);
}

// 12. slug mapping strips (credit)/(debit) qualifiers.
check("slug: Bull Put Spread (credit)", strategySlugForStructure("Bull Put Spread (credit)") === "bull-put-spread");
check("slug: Long Straddle → straddle", strategySlugForStructure("Long Straddle") === "straddle");
check("slug: Custom 2-leg → null", strategySlugForStructure("Custom 2-leg position") === null);

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
