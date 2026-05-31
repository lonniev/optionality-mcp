// Fixed sample assessment used by the Sample tab on Optionality.
//
// Shows visitors (especially guests) a realistic end-to-end run: a
// dealt scenario, the trainee's free-text trade, and a full evaluation
// rendered through the same components the live game uses. Composed by
// hand — no live LLM call needed to display this — so the tab renders
// for guests who have no proof_token.
//
// Scenario reflects the dealer's house style: a concrete date anchor,
// a real-world catalyst, plausible IV / skew, embedded red herrings.
// Evaluation reflects the judge's house style: the verdict opens with
// "We'd summarize your trade as a …", facts_integrated / facts_missed
// cite the scenario's relevant_facts verbatim, and the structured legs
// arrays let the RiskProfileChart actually render.

import type { Evaluation, Scenario } from "../types";
import { buildOptionChain } from "../lib/bs";

export const SAMPLE_SCENARIO: Scenario = {
  scenario_id: "sample-2023-svb",
  mode: "historical",
  date_context: "Friday, March 10, 2023 — six hours after the FDIC seized Silicon Valley Bank",
  macro_backdrop:
    "Regional bank deposit flight is the story of the week. $SIVB tape was halted before the open and the receivership announcement landed mid-afternoon. $KRE has been bid-then-offered three sessions running on rotating headlines about uninsured deposit concentrations at peer names. The 2yr Treasury has rallied 60 bps in 48 hours as the rate path repriced from another 25 to a pause. Powell's hawkish JEC testimony from Tuesday is already stale.",
  asset: {
    ticker: "KRE",
    name: "SPDR S&P Regional Banking ETF",
    spot: 50.20,
    iv_30d: 62,
    // RR = iv_25d_call - iv_25d_put = -14 vol points (puts bid by 14).
    // Slight butterfly so the wings sit a touch above ATM on average.
    iv_25d_put: 72,
    iv_25d_call: 58,
    iv_rank: 94,
    skew_note: "Puts bid hard relative to calls; 25-delta risk reversal at -14. Read it in the chain — the put wing prices far richer than the symmetric call wing at the same DTE.",
  },
  catalyst:
    "Sunday-evening Treasury / FDIC / Fed press conference expected to address whether uninsured $SIVB depositors are made whole. A backstop announcement caps the contagion thesis; silence amplifies it. Either way, a gap on Monday's open is the market's base case.",
  key_levels:
    "Friday close $50.20. Pre-SIVB-headlines mid-week reference at $58.40. 2020 COVID-shock low at $26.50. Open interest stacked on the 45 and 40 strikes from the weeklies; gamma walls visible in the option flow.",
  constraints:
    "$10,000 max-loss budget on this trade. Account size approximately $400,000, so this is a 2.5% risk-of-ruin event. Holding window through Friday March 17 — one weekly expiry past the Sunday catalyst.",
  the_question:
    "What is your options trade? Specify structure, strikes, expiry, sizing, and rationale.",
  relevant_facts: [
    "IV rank at 94 favors net premium-selling structures over premium buying",
    "Sunday-evening policy press conference is a binary gap-risk event — sized appropriately",
    "Skew at -14 on the 25d RR means puts are already richly priced — long puts are the consensus expensive side",
    "$10,000 max-loss budget bounds size and forces a defined-risk structure",
  ],
  red_herrings: [
    "Powell's hawkish Tuesday testimony is in the tape and stale — not a forward driver",
    "2020 COVID-shock low at $26.50 is a memorable level but not load-bearing for a one-week trade",
  ],
  hidden_considerations: [
    "Theta acceleration into the weekly expiry compounds vega risk if vol persists",
    "Pin risk on the round-strike short put if the Sunday backstop pins KRE near it",
  ],
  max_loss_usd: 10000,
  // Scaffolds. The chain itself is computed once below.
  today_date: "2023-03-10",
  expirations: [
    "2023-03-17",  // one weekly past the Sunday catalyst
    "2023-04-21",  // front-month April
    "2023-05-19",  // standard May monthly
  ],
  strike_ladder: { min: 38, max: 60, step: 2 },
};

// Compute the chain once at module load using the same smile + BS
// machinery the live game uses. Frozen onto the exported scenario so
// the sample is deterministic and matches its skew_note.
SAMPLE_SCENARIO.option_chain = buildOptionChain({
  spot: SAMPLE_SCENARIO.asset.spot,
  atmIvPct: SAMPLE_SCENARIO.asset.iv_30d,
  iv25dPutPct: SAMPLE_SCENARIO.asset.iv_25d_put,
  iv25dCallPct: SAMPLE_SCENARIO.asset.iv_25d_call,
  todayDate: SAMPLE_SCENARIO.today_date!,
  expirations: SAMPLE_SCENARIO.expirations!,
  strikeLadder: SAMPLE_SCENARIO.strike_ladder!,
});

export const SAMPLE_TRADE_PROPOSAL =
  "Sell the March-17 weekly 45 / 40 put spread on $KRE for an estimated $1.60 net credit. " +
  "Sell to open the 45 puts, buy to open the 40 puts as wing protection. Width is $5; max loss " +
  "is $5 minus the credit = $3.40 per share, or $340 per contract. Sizing: 25 contracts caps the " +
  "worst case at $8,500 — inside the $10,000 budget with a small reserve. " +
  "Thesis: IV rank at 94 and skew at -14 mean puts are already richly priced. A Sunday backstop " +
  "announcement would deflate vol and let the credit decay over the week. Even an ambiguous outcome " +
  "is unlikely to break $40 absent a second regional name failing simultaneously — the 40 strike is " +
  "11% below the catalyst-anchor reference of $45. I'm collecting premium on a defined-risk structure " +
  "sized to the max-loss envelope. I'm explicitly not betting on the policy direction — only that vol " +
  "is rich and the tail is bounded.";

export const SAMPLE_EVALUATION: Evaluation = {
  overall_score: 84,
  letter_grade: "A-",
  headline:
    "We'd summarize your trade as a bearish credit put spread — a disciplined premium-selling read " +
    "on a binary catalyst that respects both the IV regime and the stated risk envelope.",
  dimensions: {
    strategy_selection: {
      score: 17,
      feedback:
        "Defined-risk credit spread is the right family here — IV rank at 94 and a -14 RR mean " +
        "the market is already paying you to be short premium, and the budget forces defined-risk. " +
        "A short strangle would have produced more credit but exceeded the envelope.",
    },
    strikes_and_tenor: {
      score: 16,
      feedback:
        "Strikes at 45 / 40 sit a clean strip below spot and the gamma walls in the option flow " +
        "support the placement. One-week tenor matches the Sunday-press-conference event window. " +
        "A 42 / 37 spread would have collected less premium but moved the short strike further from spot.",
    },
    risk_reward: {
      score: 18,
      feedback:
        "Sized to $8,500 max-loss against a $10,000 budget — clean. Breakeven at $43.40 sits below " +
        "the prior-week reference of $45 and 14% below spot. The defined-risk wing eliminates the " +
        "tail you'd carry on a naked short put.",
    },
    macro_integration: {
      score: 16,
      feedback:
        "Cited IV rank, skew, and the binary catalyst directly. Correctly read the Powell testimony " +
        "as stale tape — that's the red herring caught. Could have addressed the gamma walls more " +
        "explicitly as the reason for the round-strike choice.",
    },
    tail_risk: {
      score: 17,
      feedback:
        "Caps max loss at the wing width; calls out the second-regional-failure scenario as the " +
        "left-tail. Could have noted the pin-risk if KRE closes near 45 on Friday — early assignment " +
        "on the short leg is a real possibility around a policy announcement.",
    },
    communication: {
      score: 17,
      feedback:
        "Crisp paragraph that lands the thesis in two beats — IV regime, then sized defined-risk. " +
        "Jargon is used at a senior-PM register (skew, RR, IV rank, gamma walls) without over-explaining. " +
        "Slight hedging-clause drag in the last sentence; tightening it to a single declarative line " +
        "would push this into a forward-able pitch.",
    },
  },
  facts_integrated: [
    "IV rank at 94 favors net premium-selling structures over premium buying",
    "$10,000 max-loss budget bounds size and forces a defined-risk structure",
    "Skew at -14 on the 25d RR means puts are already richly priced — long puts are the consensus expensive side",
  ],
  facts_missed: [
    "Sunday-evening policy press conference is a binary gap-risk event — sized appropriately",
  ],
  red_herrings_caught: [
    "Powell's hawkish Tuesday testimony is in the tape and stale — not a forward driver",
  ],
  red_herrings_followed: [],
  what_you_got_right: [
    "Picked a credit spread family in a high-IV environment — sold expensive premium rather than buying it",
    "Sized to the max-loss envelope explicitly, with a small reserve",
    "Defined-risk structure caps the tail at the wing width",
    "Read the Powell testimony as stale tape and kept it out of the thesis",
  ],
  what_to_improve: [
    "Reason explicitly about pin risk on the short leg around a policy event",
    "Address the gamma walls in the option flow as the rationale for the round-strike placement",
    "Note the second-regional-name-failure scenario as the load-bearing left-tail, not just an aside",
  ],
  alternative_trade:
    "Same expiry, 42 / 37 put spread for a smaller credit (~$0.95) with the short strike 6% further " +
    "from spot. Trades less premium for less assignment / pin risk around the Sunday event. Or, on " +
    "the other end of the spectrum: a 47 / 42 spread for a richer credit (~$2.15) if you want to " +
    "lean harder into the IV-rich regime, at the cost of a tighter breakeven.",
  deeper_context:
    "March 2023 was a stress test of the post-2008 banking-system architecture — deposit insurance " +
    "caps, held-to-maturity accounting, and the Fed's reaction function to financial-system stress " +
    "all collided. The trade-execution lesson is straightforward (sell premium when vol is rich, " +
    "size to the envelope, define the tail), but the deeper lesson is reading the gap between policy " +
    "communication and policy action. The Sunday announcement that ultimately backstopped uninsured " +
    "depositors was not a market consensus on Friday afternoon — it was a tail scenario the option " +
    "tape was pricing as a coin-flip. Disciplined premium-selling structures monetize that gap.",
  trade_legs: [
    { side: "short", type: "put", strike: 45, expiry_days: 7, premium: 3.40, qty: 25 },
    { side: "long", type: "put", strike: 40, expiry_days: 7, premium: 1.80, qty: 25 },
  ],
  alt_trade_legs: [
    { side: "short", type: "put", strike: 42, expiry_days: 7, premium: 2.20, qty: 25 },
    { side: "long", type: "put", strike: 37, expiry_days: 7, premium: 1.25, qty: 25 },
  ],
};
