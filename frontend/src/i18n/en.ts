/**
 * Every word Optionality's own pages say, in English: the bedrock the other
 * languages translate.
 *
 * Keys are "<area>.<part>.<name>". A `{{name}}` is filled with a word or number;
 * a `<name>…</name>` is drawn as an element. A translation keeps each one
 * exactly as written and may move it. A key ending `_one` / `_other` is a plural.
 * Optionality, Tollbooth-DPYC, Nostr, Lightning, ticker and option symbols,
 * the Greeks (Delta, Gamma, Theta, Vega), sats and the ™ marks stay as they are.
 */

export const en = {

  // ─── game.journal ───
  "game.journal.col.symbol": "Symbol",
  "game.journal.col.historicity": "Historicity",
  "game.journal.col.difficulty": "Difficulty",
  "game.journal.col.created": "Created",
  "game.journal.col.updated": "Updated",
  "game.journal.col.grade": "Grade",
  "game.journal.col.score": "Score",
  "game.journal.col.status": "Status",
  "game.journal.group.none": "None",

  // ─── game.tool ───
  "game.tool.deal_scenario": "Trade Scenario",
  "game.tool.judge_trade": "Pitch Review",
  "game.tool.ask_tip": "Clue Request",
  "game.tool.save_draft": "Save Draft",
  "game.tool.purchase_credits": "Top Up",
  "game.tool.check_payment": "Payment Check",
  "game.tool.check_balance": "Balance Check",
  "game.tool.check_price": "Price Preview",
  "game.tool.get_leaderboard": "Leaderboard",
  "game.tool.get_my_rank": "My Rank",
  "game.tool.get_journal": "Journal Lookup",
  "game.tool.list_journal": "Journal List",
  "game.tool.delete_journal": "Journal Delete",
  "game.tool.set_display_name": "Display Name",
  "game.tool.get_api_usage_stats": "API Usage",
  "game.tool.account_statement": "Account Statement",
  "game.tool.request_npub_proof": "Sign-In (request)",
  "game.tool.receive_npub_proof": "Sign-In (verify)",

  // ─── game.difficulty ───
  "game.difficulty.apprentice.label": "Apprentice",
  "game.difficulty.apprentice.blurb": "Clean directional setups. Vanilla macro backdrop.",
  "game.difficulty.journeyman.label": "Journeyman",
  "game.difficulty.journeyman.blurb": "Volatility regime matters. Earnings, Fed days, single catalysts.",
  "game.difficulty.adept.label": "Adept",
  "game.difficulty.adept.blurb": "Multi-factor. Cross-asset correlations. Skew and term structure.",
  "game.difficulty.sovereign.label": "Sovereign",
  "game.difficulty.sovereign.blurb": "Regime-change era. Monetary debasement, geopolitics, tail hedging.",
  "game.difficulty.mulligan.label": "Mulligan",

  // ─── game.mode ───
  "game.mode.historical.label": "Historical Fiction",
  "game.mode.historical.blurb": "Anchored to a real moment in market history. Macro real; numbers calibrated.",
  "game.mode.fiction.label": "Fiction",
  "game.mode.fiction.blurb": "Pure invention. Near-future hypotheticals, counterfactuals, speculative regimes.",
  "game.mode.live.label": "Live Events",
  "game.mode.live.blurb": "Grounded in today's actual market via web search. Real ticker, real catalyst, now.",

  // ─── game.sector ───
  "game.sector.any": "Any",
  "game.sector.biotech": "Biotech",
  "game.sector.semis": "Semis",
  "game.sector.megaTech": "Mega Tech",
  "game.sector.banks": "Banks",
  "game.sector.energy": "Energy",
  "game.sector.miners": "Miners",
  "game.sector.consumer": "Consumer",
  "game.sector.homebuilders": "Homebuilders",
  "game.sector.defense": "Defense",
  "game.sector.airlines": "Airlines",
  "game.sector.crypto": "Crypto Equities",
  "game.sector.index": "Index/ETF",

  // ─── game.dimension ───
  "game.dimension.strategy_selection": "Structure",
  "game.dimension.strikes_and_tenor": "Strikes & Tenor",
  "game.dimension.risk_reward": "Risk / Reward",
  "game.dimension.macro_integration": "Macro Context",
  "game.dimension.tail_risk": "Tail Awareness",
  "game.dimension.communication": "Communication",

  // ─── game.zoom ───
  "game.zoom.title": "Tap to read this in a larger font",

  // ─── game.loading ───
  "game.loading.tape": "Reading the tape",
  "game.loading.wire": "Tapping the wire",
  "game.loading.judging": "Judging your Pitch",
  "game.loading.reissuing": "Reissuing the scenario",

  // ─── game.error ───
  "game.error.agedOut": "That assignment aged out before you returned. No fare was charged. Deal a fresh one.",
  "game.error.recover": "Couldn't recover that assignment. {{message}}",
  "game.error.start": "Could not start scenario. {{message}}",
  "game.error.typeFirst": "Type your trade first.",
  "game.error.noScenario": "No active scenario. Deal a new one first.",
  "game.error.notInJournal": "That scenario is no longer in your journal, so it can't be judged. Deal a fresh one to pitch. No fare was charged.",
  "game.error.evaluation": "Evaluation failed. {{message}}",
  "game.error.noScenarioToSave": "No active scenario to save against.",
  "game.error.save": "Save failed. {{message}}",
  "game.error.acceptFirst": "Accept a challenge before asking for a clue.",
  "game.error.clue": "Clue request failed. {{message}}",
  "game.error.replay": "Replay failed. {{message}}",
  "game.error.nothingToResume": "This entry has no scenario to resume.",

  // ─── game.entry ───
  "game.entry.yourTrade": "Your trade",
  "game.entry.headline": "Headline",
  "game.entry.riskProfile": "Risk Profile",
  "game.entry.alternative": "Alternative",
  "game.entry.deeper": "Deeper context",
  "game.entry.redoTitle": "Reissue this scenario as a mulligan: same setup, fresh pitch",
  "game.entry.redo": "Redo Again",
  "game.entry.sharedTitle": "Shared on your Leaderboard row. Click to make it private.",
  "game.entry.shareTitle": "Share this pitch on your Leaderboard row so peers can compare",
  "game.entry.shared": "✓ Shared",
  "game.entry.share": "Share",
  "game.entry.visibleToAll": "Visible to all",
  "game.entry.resumeDraftTitle": "You have a saved draft. Resume in The Pit to finish and pitch it. No new deal, no charge.",
  "game.entry.resumeTitle": "Resume this open scenario in The Pit to pitch a trade and get a review. No new deal, no charge.",
  "game.entry.resume": "🙋 Resume",
  "game.entry.noReview": "Entry status: {{status}}. No pitch review available.",

  // ─── game.brand ───
  "game.brand.tagline": "Gamified Options Trading Consultant Trainer",

  // ─── game.stats ───
  "game.stats.sessions": "Sessions",
  "game.stats.avg": "Avg Score",
  "game.stats.best": "Best",
  "game.stats.streak": "Streak",

  // ─── game.balance ───
  "game.balance.title": "Top Up: buy sats over Bitcoin Lightning",
  "game.balance.label": "Balance",
  "game.balance.sats": " sats",
  "game.balance.topUp": "＋ Top Up",

  // ─── game.signOut ───
  "game.signOut.title": "Sign out: clear the stored npub and proof token",
  "game.signOut.label": "Sign out",

  // ─── game.tab ───
  "game.tab.welcome": "Welcome",
  "game.tab.play": "The Pit",
  "game.tab.sample": "See Assessment",
  "game.tab.journal": "Journal",
  "game.tab.leaderboard": "Leaderboard",
  "game.tab.usage": "Usage",
  "game.tab.profile": "Profile",

  // ─── game.openingFloor ───
  "game.openingFloor": "Opening the floor",

  // ─── game.guest ───
  "game.guest.label": "Guest pass",
  "game.guest.welcome": "Welcome Guest Trader <id>{{id}}</id>.",
  "game.guest.body": "The site is live, but you can use only the free services until you buy some DPYC tokens.\nVisit the <b>Usage</b> tab to see your account and to buy tokens.\nGetting a Challenge, asking for clues and Getting Assessed are paid services, but the fees are tiny: just a few sats each.\nOnce you have your Nostr credentials, you can Top Up here.\nThen you can work your challenges, save your work in progress and message peers on the Leaderboard.\nWith practice you become more proficient at pitching options trades to professional audiences.\nWelcome.",
  "game.guest.signIn": "Sign in to play →",

  // ─── game.briefing ───
  "game.briefing.label": "Briefing",
  "game.briefing.title": "The desk is open.",
  "game.briefing.prose": "The Firm presents an opportunity: a moment in markets, perhaps real, perhaps invented, perhaps unfolding right now.\nYou'll see a date, a macro backdrop, an asset, a catalyst, key levels and the constraints of your book.\nRead it like a courtroom brief.\nThen write your trade in your own words: structure, strikes, expiry, sizing and your reasoning.",
  "game.briefing.integration": "<b>Integration is rewarded.</b> A strong answer accounts for the political, monetary and cross-asset facts The Firm put in front of you.\nThe more relevant facts you weave into your thesis, the higher you score, particularly on the Macro Context dimension.",
  "game.briefing.herrings": "<b>Red herrings are planted.</b> The Firm embeds one or two facts that are perfectly true but immaterial to the ideal trade.\nThey are real-world noise that a trader could reasonably notice and overweight.\nA skew note may be color, not catalyst.\nA headline may already be in the tape.\nA disclosed position may be stale.\nThey are traps of relevance, never of falsehood.\nBuilding your thesis on one costs you points; recognizing it as noise and setting it aside earns them.",
  "game.briefing.coda": "Choose your historicity. Choose your persona. Accept the challenge.",

  // ─── game.chooser ───
  "game.chooser.historicity": "Historicity",
  "game.chooser.persona": "Persona",
  "game.chooser.risk": "Risk Envelope",
  "game.chooser.maxLoss": "Max loss per trade:",
  "game.chooser.optional": "optional",
  "game.chooser.clear": "clear",
  "game.chooser.maxLossHint": "Optional. When set, The Firm sizes the opportunity's account and constraints so a well-chosen structure fits your envelope. The judge scores down trades whose worst case exceeds it.",
  "game.chooser.sector": "Sector Focus",
  "game.chooser.sectorLimit": "Limit the dealer to {{sector}}",
  "game.chooser.sectorAny": "Let the dealer pick any sector",
  "game.chooser.customSector": "or type a custom sector:",
  "game.chooser.customExample": "e.g. luxury goods",
  "game.chooser.sectorHint": "Optional. The Firm picks the underlying from the chosen sector and tailors the catalyst, relevant facts and red herrings to its dynamics.",

  // ─── game.topUp ───
  "game.topUp.title": "Buy sats from the operator over Bitcoin Lightning",
  "game.topUp.label": "Top Up",

  // ─── game.toll ───
  "game.toll.label": "Toll",

  // ─── game.sats_one ───
  "game.sats_one": "{{count}} sat",

  // ─── game.sats_other ───
  "game.sats_other": "{{count}} sats",

  // ─── game.toll ───
  "game.toll.noModel": "The pricing model has no multipliers yet. Run reset_pricing_model on this operator.",

  // ─── game.signInToPlayTitle ───
  "game.signInToPlayTitle": "Sign in with your Nostr identity to deal a Trade Scenario",

  // ─── game.signInToPlay ───
  "game.signInToPlay": "Sign In to Play",

  // ─── game.deal ───
  "game.deal.another": "Deal Another",
  "game.deal.challenge": "Be Challenged",
  "game.deal.watchTitle": "Return to the Reading-the-Tape screen for your latest scenario",
  "game.deal.preparing_one": "{{count}} scenario already being prepared. Watch ›",
  "game.deal.preparing_other": "{{count}} scenarios already being prepared. Watch ›",
  "game.deal.confirmPriced": "Deal another? Each scenario is a separate {{price}}-sat toll.",
  "game.deal.confirm": "Deal another? Each scenario is a separate toll.",
  "game.deal.yes": "Yes, deal another",
  "game.deal.notYet": "Not yet",

  // ─── game.card ───
  "game.card.macro": "Macro Backdrop",
  "game.card.skewNote": "Skew Note",
  "game.card.catalyst": "Catalyst",
  "game.card.keyLevels": "Key Levels",
  "game.card.constraints": "Constraints",
  "game.card.question": "The Question",
  "game.card.sources": "Sources",
  "game.card.spot": "Spot",
  "game.card.iv30": "IV 30d",
  "game.card.ivRank": "IV Rank",
  "game.card.skew": "Skew · ",

  // ─── game.pitch ───
  "game.pitch.saveTitle": "Keep this draft in your Journal entry so it survives a page reload",
  "game.pitch.save": "Save draft",
  "game.pitch.discardTitle": "Discard this scenario and pick a new one. The scenario fee is non-refundable, so you'll be asked to confirm.",
  "game.pitch.discard": "Discard scenario",
  "game.pitch.placeholder": "e.g. Sell the 30-day 95/90 put spread for 1.20 credit, sized to risk 0.5% of NAV. The Fed's hawkish hold puts a floor under the dollar but the equity is bid on insider buying; collecting premium below the 200d feels asymmetric…",
  "game.pitch.presentTitle": "Present your trade to the senior PM for review and a graded pitch audit",
  "game.pitch.present": "Present pitch",
  "game.pitch.saved": "✓ Draft saved {{time}}",

  // ─── game.clue ───
  "game.clue.heading": "Ask for a Clue",
  "game.clue.hint": "Ask what you like for a small fee. e.g. <q>“What do you mean by Call Skew?”</q>",
  "game.clue.copied": "Copied to clipboard",
  "game.clue.copyTitle": "Copy this clue conversation to your clipboard, to continue in your own Claude.ai session",
  "game.clue.copy": "Copy conversation to clipboard",
  "game.clue.q": "Q · {{question}}",
  "game.clue.placeholder": "Type your question…",
  "game.clue.asking": "Asking the clue desk…",
  "game.clue.sendTitle": "Send this question. A small clue fee applies.",
  "game.clue.send": "Send clue question",

  // ─── game.review ───
  "game.review.label": "Pitch Review",
  "game.review.overall": "Overall",
  "game.review.byDimension": "By Dimension",
  "game.review.right": "What you got right",
  "game.review.sharpen": "What to sharpen",
  "game.review.alternative": "An alternative the house would have taken",
  "game.review.replayTitle": "Back to the scenario picker",
  "game.review.replay": "🔁 Replay",

  // ─── game.ledger ───
  "game.ledger.label": "DPYC Ledger",
  "game.ledger.title": "Sats balance & MCP tool usage",
  "game.ledger.intro": "Your balance at Optionality MCP, what the last 30 days spent and bought, and the tools the sats went to.\nTolls are deducted at call time; the operator's accounting flushes to Neon after each settle.",
  "game.ledger.tools": "MCP tool usage: last 30 days",
  "game.ledger.empty": "No paid tool calls in the last 30 days.",
  "game.ledger.health": "Account health",

  // ─── game.ai ───
  "game.ai.refresh": "Refresh API usage",
  "game.ai.label": "Usage",
  "game.ai.title": "AI usage & what it cost",
  "game.ai.intro": "Optionality calls a model for every scenario, clue and verdict.\nThis is what your tool calls have spent in tokens, and what the provider actually billed the operator for them.\nYour toll covers this plus operator overhead.\nNo hidden margin.",
  "game.ai.estimated": "Figures marked “est.” predate per-call cost reporting and are inferred from published rates (fetched {{date}}); the rest are what the provider billed.",
  "game.ai.reported": "Costs are the provider's own per-call figures, not an estimate.",
  "game.ai.tallying": "Tallying the receipts",
  "game.ai.none": "No model calls recorded yet. Accept a challenge.",
  "game.ai.unknown": "unknown",
  "game.ai.runs": "Runs:",
  "game.ai.input": "Input:",
  "game.ai.output": "Output:",
  "game.ai.cost": "Cost:",
  "game.ai.costEst": "Cost (est.):",
  "game.ai.perCall": "Per call:",
  "game.ai.costPartEst": "AI cost (part est.)",
  "game.ai.costBilled": "AI cost billed",
  "game.ai.tokens": "{{tokens}} tokens across {{calls}} model calls",
  "game.ai.costPerCall": "Cost per call",
  "game.ai.averaged": "averaged over every scenario, clue and verdict",
  "game.ai.sats": "Equivalent in sats",
  "game.ai.atRate": "at ~{{rate}}/BTC",
  "game.ai.footnote": "The operator passes the AI cost through to patrons by Lightning micropayments.\nThis view is the raw transparency: what each scenario, clue and verdict actually cost, plus a sats equivalent at a fixed {{rate}}/BTC reference rate.\nThat rate is a yardstick for comparison, not today's spot.",

  // ─── game.lb ───
  "game.lb.label": "Leaderboard",
  "game.lb.title": "Sovereign traders, sorted by skill",
  "game.lb.intro": "The pricing model is the single dial: a hard, expensive pitch scored well outranks a cheap one scored well.\nWhen the operator retunes a multiplier (mulligan, sovereign, anything), the next leaderboard recompute reflects the new weights for every entry, so no snapshot drifts.\nThe default sort is the weighted average; raw scores are available too.",
  "game.lb.sort.weighted_avg": "Weighted Avg",
  "game.lb.sort.weighted_best": "Weighted Best",
  "game.lb.sort.avg": "Raw Avg",
  "game.lb.sort.best": "Raw Best",
  "game.lb.sort.streak": "Streak",
  "game.lb.sort.played": "Played",
  "game.lb.loading": "Loading…",
  "game.lb.refresh": "Refresh",
  "game.lb.failed": "The leaderboard didn't load. {{error}}",
  "game.lb.unknownError": "Unknown error.",
  "game.lb.empty": "No judged trades yet. Be the first.",
  "game.lb.trader": "Trader",
  "game.lb.wavg": "W·Avg",
  "game.lb.wavgTitle": "Weighted average: raw score × difficulty multiplier",
  "game.lb.wbest": "W·Best",
  "game.lb.wbestTitle": "Weighted best single pitch",
  "game.lb.avg": "Avg",
  "game.lb.avgTitle": "Raw average across all evaluated pitches",
  "game.lb.streak": "Streak",
  "game.lb.played": "Played",
  "game.lb.rowTitle": "Click to see this trader's shared pitches",
  "game.lb.dmSelf": "DM yourself: test the relay path",
  "game.lb.dm": "DM {{name}}",
  "game.lb.anonymous": "Anonymous",
  "game.lb.you": "YOU",
  "game.lb.last": "  ·  last: {{date}}",
  "game.lb.fetching": "Fetching shared pitches",
  "game.lb.youNone": "You haven't shared any pitches yet. Open one of your evaluated journal entries and tap Share.",
  "game.lb.theyNone": "This trader hasn't shared any pitches yet.",
  "game.lb.yourShared": "Your shared pitches · {{count}}",
  "game.lb.shared": "Shared pitches · {{count}}",
  "game.lb.theirPitch": "Their pitch",
  "game.lb.houseAlt": "House alternative",

  // ─── game.journal ───
  "game.journal.label": "Journal",
  "game.journal.title": "Your study room",
  "game.journal.intro": "Welcome to your study room.\nHere you can review your prior proposals, reread your assessments, and resume any pitches you started but had to set aside.",
  "game.journal.introNamed": "Welcome to your study room, {{name}}.\nHere you can review your prior proposals, reread your assessments, and resume any pitches you started but had to set aside.",

  // ─── game.prep ───
  "game.prep.heading": "Scenarios in Preparation · {{count}}",
  "game.prep.rowTitle": "Return to the Reading-the-Tape screen for this scenario",
  "game.prep.watch": "Watch ›",
  "game.prep.note": "The Firm is composing these in the background, so you can leave and come back.\nWhen one is ready it drops out of this list and appears below as an open entry to claim.",

  // ─── game.journal ───
  "game.journal.pulling": "Pulling sessions",
  "game.journal.emptyPreparing": "No finished sessions yet. Your scenario is still being prepared above.",
  "game.journal.empty": "No sessions yet. Deal your first Trade Scenario.",
  "game.journal.groupBy": "Group by",
  "game.journal.flipGroups": "Flip the order of the groups",
  "game.journal.groupsAsc": "Groups ▲",
  "game.journal.groupsDesc": "Groups ▼",
  "game.journal.sortBy": "Sort by",
  "game.journal.flipSort": "Flip the sort direction",
  "game.journal.sortedAsc": "Sorted ascending. Flip to descending.",
  "game.journal.sortedDesc": "Sorted descending. Flip to ascending.",
  "game.journal.asc": "▲ Asc",
  "game.journal.desc": "▼ Desc",
  "game.journal.sessions_one": "{{count}} session",
  "game.journal.sessions_other": "{{count}} sessions",
  "game.journal.avg": " · avg {{score}}",

  // ─── game.status ───
  "game.status.open": "open",
  "game.status.evaluated": "evaluated",

  // ─── game.journal ───
  "game.journal.sharedTag": "· shared",
  "game.journal.deleteTitle": "Delete this session for good",
  "game.journal.delete": "Delete session",
  "game.journal.loadingEntry": "Loading entry",

  // ─── game.discard ───
  "game.discard.title": "Discard this scenario?",
  "game.discard.body": "Discarding lets you choose a new scenario.\nEach scenario uses paid external LLM processing, so the fee for this one can't be refunded.\nAre you sure you want to give up on this scenario and choose another?",
  "game.discard.keep": "Keep this scenario",
  "game.discard.confirm": "Discard & choose another",

  // ─── game.delete ───
  "game.delete.title": "Delete this session for good?",
  "game.delete.body": "You're about to permanently delete your <b>{{ticker}}</b> session.\nThe scenario, your pitch, the review, the score and any leaderboard standing it earned are <b>erased for good</b>.\nThis can't be undone, and there is no recovering it later.",
  "game.delete.bodyGraded": "You're about to permanently delete your <b>{{ticker}}</b> session (graded {{grade}}).\nThe scenario, your pitch, the review, the score and any leaderboard standing it earned are <b>erased for good</b>.\nThis can't be undone, and there is no recovering it later.",
  "game.delete.this": "this",
  "game.delete.keep": "Keep it",
  "game.delete.deleting": "Deleting…",
  "game.delete.confirm": "Delete forever",

  // ─── game.zoom ───
  "game.zoom.copyTitle": "Copy this text to your clipboard",
  "game.zoom.copy": "Copy text to clipboard",
  "game.zoom.closeTitle": "Close (Esc)",
  "game.zoom.close": "Close",

  // ─── game.status ───
  "game.status.submitted": "submitted",
  "game.status.abandoned": "abandoned",

  // ─── app.lapsed ───
  "app.lapsed": "Your sign-in lapsed while you were away. Sign in again to carry on.",

  // ─── signIn.welcome ───
  "signIn.welcome": "An agentic options-trading trainer. The Firm composes the opportunity, you write the pitch, a judge scores your discipline.",

  // ─── signIn.nsecHint ───
  "signIn.nsecHint": "Signing in with an nsec? It stays in this browser to sign each call.\nOptionality also keeps an encrypted copy so it can sign your DMs.\nWithdraw it any time from Profile.\nFor an identity you keep self-custodied, sign in with your npub instead.",

  // ─── signIn.or ───
  "signIn.or": "or",

  // ─── signIn.guest ───
  "signIn.guest": "Continue as Guest",

  // ─── signIn.guestHint ───
  "signIn.guestHint": "Guests can browse the chooser, the briefing and the sample assessment.",

  // ─── signIn.footnote ───
  "signIn.footnote": "Optionality™ is an agentic options-trading game built on <link>Tollbooth-DPYC™</link>: Bitcoin Lightning micropayments and Nostr identity for AI agents.",

  // ─── welcome.guestName ───
  "welcome.guestName": "Guest {{id}}",

  // ─── welcome.anonymous ───
  "welcome.anonymous": "Anonymous Visitor",

  // ─── welcome.label ───
  "welcome.label": "Welcome",

  // ─── welcome.greeting ───
  "welcome.greeting": "Welcome, <name>{{name}}</name>.",

  // ─── welcome.signedInAs ───
  "welcome.signedInAs": " Signed in as <npub>{{npub}}</npub>.",

  // ─── welcome.why ───
  "welcome.why": "Why Optionality.",

  // ─── welcome.why1 ───
  "welcome.why1": "Optionality™ is gamified, scenario-based learning for people training to become fluent options traders.\nIt stays outside the usual curriculum of pricing mathematics and platform mechanics.\nIt engages you with narratives that ask for a clear, actionable trade and the reasoning behind it.",

  // ─── welcome.why2 ───
  "welcome.why2": "You're unfamiliar with the jargon and tongue-tied when challenged to describe your strategy and your current trade ideas.\nYou want to see the larger world situation and to make cogent trade proposals under duress.\nBut your ideas are fuzzy, you chase big payoffs, and you can't say before a situation what you would do in it.\nOptionality™ helps you learn sound strategies, take in world affairs and sharpen how you describe your strategies.",

  // ─── welcome.why3 ───
  "welcome.why3": "Optionality™ plays your investment-house Firm.\nIt uses modern AI services to present you with challenging simulated world scenarios that give you a chance to think, and then to present your trade.\nThe Firm's auditors grade your proposal on structure choice, strikes & tenor, risk/reward, macro integration and tail risk.\nThat feedback helps you improve your narrative proposals.\nOver time you become able to conceive, present and execute wiser trades, rapidly and well.",

  // ─── welcome.play ───
  "welcome.play.label": "Game Play",
  "welcome.play.round": "A round",
  "welcome.play.1": "<b>Be Challenged.</b> Pick a historicity (historical, fiction or live), a persona (apprentice → sovereign) and, if you like, a max-loss envelope. The toll scales with how hard your selection is.",
  "welcome.play.2": "<b>Read the scenario.</b> Asset, spot, IV, skew, key levels, the catalyst, the constraints of your book, and a couple of embedded red herrings to see if you can tell noise from what's load-bearing.",
  "welcome.play.3": "<b>Pitch the Trade.</b> Free text. Give the structure, strikes, tenor, sizing and your reasoning.",
  "welcome.play.4": "<b>Read the review.</b> Headline classification, five-dimension score, facts-integrated ledger, the alternative trade the house would have run, risk-profile chart and deeper context.",
  "welcome.play.5": "<b>Mulligan a past scenario</b> from your Journal when you want a second look. Same setup, fresh pitch, journaled separately.",

  // ─── welcome.toll ───
  "welcome.toll": "The toll",
  "welcome.toll.fair": "Optionality™ uses fair usage-based pricing.\nDon't use it and you pay nothing: there's no subscription and no KYC.\nPricing tracks what each scenario actually costs to compose and grade.\nSimpler ones use fewer LLM tokens; more demanding ones, like live tape with web-search grounding or sovereign-level difficulty, use more.\nEven the most complex scenario carries a fee of only a few hundred sats.",
  "welcome.toll.inspect": "The operator sets every multiplier directly, and you can inspect each one yourself on the <b>Usage</b> tab once you have a balance.\nRight now, pulled from the live pricing model:",
  "welcome.toll.cheap": "Simplest scenario (fiction × apprentice): <b>{{price}}</b>",
  "welcome.toll.expensive": "Most demanding scenario (live tape × sovereign with full web-search grounding): <b>{{price}}</b>",
  "welcome.toll.pitch": "Pitch audit: <b>{{price}}</b>",
  "welcome.toll.session": "A session of ~30 graded rounds at mid-difficulty runs roughly {{sats}} sats, about {{usd}} in BTC.\nTop Up buys sats with a Lightning invoice; Wallet of Satoshi, Phoenix, Mutiny or any Lightning wallet works.",
  "welcome.toll.fallback": "Optionality™ uses fair usage-based pricing: don't use it and you pay nothing.\nDifficulty and mode scale the toll; you can inspect every multiplier on the <b>Usage</b> tab once you have a balance.\nTop Up buys sats with a Lightning invoice; Wallet of Satoshi, Phoenix, Mutiny or any Lightning wallet works.",
  "welcome.toll.unreachable": "(Couldn't reach the pricing model just now to quote specific numbers.)",

  // ─── welcome.economy ───
  "welcome.economy.label": "The economy",
  "welcome.economy.title": "Optionality runs on Tollbooth-DPYC™",
  "welcome.economy.intro": "Optionality is an agentic options-trading game built on <dpyc>Tollbooth-DPYC™ →</dpyc>, a Bitcoin Lightning + Nostr stack for monetized AI services.\nThe governance, certified operators and community registry live in the open at <community>github.com/lonniev/dpyc-community →</community>.\nThree properties are worth naming:",
  "welcome.economy.identity": "<b>Sovereign identity.</b> You sign in with a Nostr keypair, not an email and password.\nYour nsec is the only credential: no KYC, no platform-issued account.\nOptionality holds an encrypted copy only if you ask it to (Profile → Game Persona Key), and you can withdraw it any time.",
  "welcome.economy.pricing": "<b>Dynamic pricing without redeploys.</b> The operator's tool prices are stored in a pricing model, not in code.\nMultipliers for difficulty and mode get tuned live, and you can check them yourself on the Usage tab.\nThe leaderboard uses the same mechanism to weight scores.",
  "welcome.economy.money": "<b>Sound money.</b> Fiat-rail micropayments are economically dead: the interchange fees alone exceed a 1-sat toll.\nBitcoin Lightning makes tolling each AI tool call trivial.\nPre-funded Lightning balances, atomic settlement per call and no custodian holding your spend off-chain are what make services like Optionality work at all.",

  // ─── welcome.ready ───
  "welcome.ready": "Ready?",
  "welcome.ready.guest": "Look around: the <b>See Assessment</b> tab shows a full graded round, so you can see what the game ships before joining.\nWhen you want to start pitching trades for real, sign in with a Nostr identity.",
  "welcome.ready.guestPriced": "Look around: the <b>See Assessment</b> tab shows a full graded round, so you can see what the game ships before joining.\nWhen you want to start pitching trades for real, sign in with a Nostr identity and top up about {{usd}} in BTC.",
  "welcome.ready.patron": "Look around: the <b>See Assessment</b> tab shows a full graded round, so you can see what the game ships before you put sats on the table.\nWhen you want to start pitching trades for real:",

  // ─── welcome.seeAssessment ───
  "welcome.seeAssessment": "See Assessment",

  // ─── welcome.signInToPlay ───
  "welcome.signInToPlay": "Sign In to Play",

  // ─── welcome.topUpPriced ───
  "welcome.topUpPriced": "Top Up: ~{{usd}} to start",

  // ─── welcome.topUp ───
  "welcome.topUp": "Top Up",

  // ─── profile.label ───
  "profile.label": "Profile",

  // ─── profile.title ───
  "profile.title": "Your self-sovereign identity.",

  // ─── profile.intro ───
  "profile.intro": "Your profile lives in your Nostr kind-0 metadata, read from relays and shown in every Nostr client.\nEdits are signed in your browser and relayed; your key never leaves this device.",

  // ─── profile.tz ───
  "profile.tz.label": "Time zone",
  "profile.tz.title": "Every clock, one zone.",
  "profile.tz.intro": "Every date on Optionality follows this zone. It's local to this browser; nothing here is published or shared.",

  // ─── profile.theme ───
  "profile.theme.label": "Preferences",
  "profile.theme.title": "How Optionality looks to you.",
  "profile.theme.intro": "Local to this browser; nothing here is published or shared.",
  "profile.theme.dark": "🌑 Dark",
  "profile.theme.light": "☀ Light",

  // ─── profile.language ───
  "profile.language.label": "Language",
  "profile.language.title": "The words on these pages.",
  "profile.language.intro": "Kept in this browser. Scenarios, clues and reviews from The Firm stay in English.",

  // ─── profile.build ───
  "profile.build.label": "Build & License",
  "profile.build.title": "Open source, private commerce.",
  "profile.build.intro": "Optionality and Tollbooth-DPYC™ ship as open source under the Apache License 2.0: anyone can read the code, fork it and run their own operator.\nThe <i>services</i> hosted on that code are private commerce: each operator sets their own tolls and pricing model, and patrons pre-fund a Lightning balance and pay per call.\nThe protocol is shared; the businesses on it are not.",

  // ─── profile.key ───
  "profile.key.notNsec": "That doesn't look like a bech32 nsec1… string.",
  "profile.key.depositFailed": "Deposit failed.",
  "profile.key.ackMismatch": "The acknowledgment phrase doesn't match exactly.",
  "profile.key.withdrawFailed": "Withdrawal failed.",
  "profile.key.label": "Game Persona Key",
  "profile.key.title": "Nsec custody",
  "profile.key.intro": "If you made your npub fresh for Optionality, you can hand the nsec to the operator so the server signs Nostr DMs for you, with no signer extension needed (iPad-friendly).\nThe nsec is encrypted at rest with AES-256-GCM.\n<b>Don't paste your real Nostr identity here</b>, only fresh game personas.",
  "profile.key.deposit": "Deposit a nsec",
  "profile.key.encrypting": "Encrypting…",
  "profile.key.depositBtn": "Deposit",
  "profile.key.held": "✓ Held by Optionality (encrypted in the vault). DMs to other patrons go through the server's signer, with no browser extension needed.",
  "profile.key.withdraw": "Withdraw & self-custody",
  "profile.key.ackIntro": "Type the phrase below exactly to confirm.\nThe nsec displays once for you to copy, then Optionality forgets it.\nAfter withdrawal you'll need a Nostr signer extension (Alby, nos2x) to send DMs.\nThe phrase stays in English: the server checks it word for word.",
  "profile.key.ack": "Acknowledgment",
  "profile.key.cancel": "Cancel",
  "profile.key.withdrawing": "Withdrawing…",
  "profile.key.confirm": "Confirm Withdrawal",
  "profile.key.copyNow": "<b>Copy your nsec now.</b> Optionality has deleted it from its vault.\nThis is the only time it will be shown.\nStash it in a Nostr client (0xchat, Damus, Amber) or a password manager.",
  "profile.key.copy": "Copy",
  "profile.key.saved": "I've saved it",

  // ─── clock.left ───
  "clock.left": "~{{clock}} left",

  // ─── clock.wrapping ───
  "clock.wrapping": "wrapping up…",

  // ─── deal.preparing ───
  "deal.preparing": "The Firm is preparing your assignment",

  // ─── deal.elapsed ───
  "deal.elapsed": "Elapsed",

  // ─── deal.estimate ───
  "deal.estimate": "Estimate",

  // ─── deal.claim ───
  "deal.claim": "Claim",

  // ─── deal.reassure ───
  "deal.reassure": "Take your time: you can leave this page.\nYour assignment lands in your <b>Journal</b> when it's ready, and picks up right where it left off if your connection drops.",

  // ─── deal.claimInJournal ───
  "deal.claimInJournal": "Claim in Journal",

  // ─── deal.live ───
  "deal.live": "Live mode searches the web, so this can take a few minutes.",

  // ─── lib.quotes ───
  "lib.quotes.0": "Sound money is an instrument of protection of civil liberties against despotic inroads on the part of governments.",
  "lib.quotes.1": "The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.",
  "lib.quotes.2": "The root problem with conventional currency is all the trust that's required to make it work.",
  "lib.quotes.3": "I don't believe we shall ever have a good money again before we take the thing out of the hands of government.",
  "lib.quotes.4": "Inflation is taxation without legislation.",

  // ─── judge.title ───
  "judge.title": "Judging your Pitch",

  // ─── judge.sub ───
  "judge.sub": "Weighing six dimensions of the proposal",

  // ─── judge.dim ───
  "judge.dim.tail": "Tail Risk",

  // ─── ledger.title ───
  "ledger.title": "Facts Ledger",

  // ─── ledger.integrated ───
  "ledger.integrated": "Facts you integrated",

  // ─── ledger.integratedNone ───
  "ledger.integratedNone": "None. Try citing the relevant facts directly.",

  // ─── ledger.missed ───
  "ledger.missed": "Relevant facts you missed",

  // ─── ledger.missedNone ───
  "ledger.missedNone": "Clean sweep: you addressed the facts that mattered.",

  // ─── ledger.caught ───
  "ledger.caught": "Red herrings you set aside",

  // ─── ledger.caughtNone ───
  "ledger.caughtNone": "None noted.",

  // ─── ledger.followed ───
  "ledger.followed": "Red herrings that pulled your thesis",

  // ─── ledger.followedNone ───
  "ledger.followedNone": "None. You kept noise out of the thesis.",

  // ─── legs.side ───
  "legs.side": "Side",

  // ─── legs.type ───
  "legs.type": "Type",

  // ─── legs.strike ───
  "legs.strike": "Strike",

  // ─── legs.dte ───
  "legs.dte": "DTE",

  // ─── legs.premium ───
  "legs.premium": "Premium",

  // ─── legs.qty ───
  "legs.qty": "Qty",

  // ─── legs.long ───
  "legs.long": "long",

  // ─── legs.short ───
  "legs.short": "short",

  // ─── legs.call ───
  "legs.call": "call",

  // ─── legs.put ───
  "legs.put": "put",

  // ─── legs.days ───
  "legs.days": "{{days}}d",

  // ─── risk.noLegs ───
  "risk.noLegs": "No structured trade legs were parsed, so the chart is unavailable. Naked stock or bond positions and unparseable trades skip the chart.",

  // ─── risk.days ───
  "risk.days": "Days into trade: {{days}}d",

  // ─── risk.entry ───
  "risk.entry": "(entry)",

  // ─── risk.expiration ───
  "risk.expiration": "(expiration)",

  // ─── risk.overlay ───
  "risk.overlay": "Overlay alternative trade",

  // ─── risk.maxProfit ───
  "risk.maxProfit": "Max Profit",

  // ─── risk.maxLoss ───
  "risk.maxLoss": "Max Loss",

  // ─── risk.unlimited ───
  "risk.unlimited": "Unlimited",

  // ─── risk.breakeven_one ───
  "risk.breakeven_one": "Breakeven",

  // ─── risk.breakeven_other ───
  "risk.breakeven_other": "Breakevens",

  // ─── risk.iv ───
  "risk.iv": "IV used",

  // ─── risk.r ───
  "risk.r": "r assumed",

  // ─── risk.footnote ───
  "risk.footnote": "Black-Scholes with no dividends.\nThe risk-free rate is held at 4.5%.\nVol is held constant at the scenario's IV; real vol-of-vol effects are not modeled.\nPer-leg qty as parsed, with a multiplier of 100 shares.",

  // ─── risk.parsed ───
  "risk.parsed": "Parsed Legs",

  // ─── risk.yours ───
  "risk.yours": "Your trade",

  // ─── risk.alt ───
  "risk.alt": "Alt trade",

  // ─── chain.triggerTitle ───
  "chain.triggerTitle": "Pop up the full option chain: tap a mid to buy, sell or remove",

  // ─── chain.title ───
  "chain.title": "Option Chain",

  // ─── chain.legs_one ───
  "chain.legs_one": "{{count}} leg",

  // ─── chain.legs_other ───
  "chain.legs_other": "{{count}} legs",

  // ─── chain.close ───
  "chain.close": "Close chain",

  // ─── chain.lede ───
  "chain.lede": "Tap a <b>Call</b> or <b>Put</b> mid to buy, sell or remove a contract.\nThe chain's mids and deltas come from a Black-Scholes smile anchored by ATM, 25Δ-put and 25Δ-call volatilities.\nThe IV column reads the smile at each strike: the same IV prices both the call and the put at that strike, since the smile is one curve, not two.\nThe row closest to spot (<b>{{spot}}</b>) is highlighted as ATM.",

  // ─── chain.dte ───
  "chain.dte": "{{dte}} DTE",

  // ─── chain.calls ───
  "chain.calls": "Calls",

  // ─── chain.strikeIv ───
  "chain.strikeIv": "Strike · IV",

  // ─── chain.puts ───
  "chain.puts": "Puts",

  // ─── chain.mid ───
  "chain.mid": "Mid",

  // ─── chain.strike ───
  "chain.strike": "Strike",

  // ─── chain.held ───
  "chain.held": "{{side}} · click to change",

  // ─── chain.long ───
  "chain.long": "LONG",

  // ─── chain.short ───
  "chain.short": "SHORT",

  // ─── chain.tapCall ───
  "chain.tapCall": "Click to buy or sell this call",

  // ─── chain.tapPut ───
  "chain.tapPut": "Click to buy or sell this put",

  // ─── chain.proposed ───
  "chain.proposed": "Proposed structure",

  // ─── chain.clearTitle ───
  "chain.clearTitle": "Clear all legs",

  // ─── chain.clear ───
  "chain.clear": "Clear",

  // ─── chain.noLegs ───
  "chain.noLegs": "No legs yet. Tap a Call or Put mid above to start building.",

  // ─── chain.buyCaps ───
  "chain.buyCaps": "BUY",

  // ─── chain.sellCaps ───
  "chain.sellCaps": "SELL",

  // ─── chain.fewer ───
  "chain.fewer": "Decrease contracts",

  // ─── chain.useRemove ───
  "chain.useRemove": "Use Remove to take this leg off",

  // ─── chain.oneFewer ───
  "chain.oneFewer": "One fewer contract",

  // ─── chain.qty ───
  "chain.qty": "Contract quantity",

  // ─── chain.more ───
  "chain.more": "Increase contracts",

  // ─── chain.oneMore ───
  "chain.oneMore": "One more contract",

  // ─── chain.net ───
  "chain.net": "Net premium",

  // ─── chain.credit ───
  "chain.credit": "credit",

  // ─── chain.debit ───
  "chain.debit": "debit",

  // ─── chain.buy ───
  "chain.buy": "Buy",

  // ─── chain.sell ───
  "chain.sell": "Sell",

  // ─── chain.remove ───
  "chain.remove": "Remove",

  // ─── chain.cancel ───
  "chain.cancel": "Cancel",

  // ─── modeler.fiction ───
  "modeler.fiction": "Hypothetical underlying: external modelers quote only real, listed chains, so this payoff is Optionality's own.",

  // ─── modeler.historical ───
  "modeler.historical": "This scenario is set in the past. External modelers quote today's chain, not the scenario's date, so this payoff is Optionality's own reconstruction.",

  // ─── modeler.noPreset ───
  "modeler.noPreset": "External modelers have no preset for this structure; the payoff above already covers it.",

  // ─── payoff.captionMulti ───
  "payoff.captionMulti": "Profile at front expiration · {{dte}} DTE · back legs valued with Black-Scholes",

  // ─── payoff.caption ───
  "payoff.caption": "Profile at expiration · {{dte}} DTE",

  // ─── payoff.credit ───
  "payoff.credit": "credit {{amount}}",

  // ─── payoff.debit ───
  "payoff.debit": "debit {{amount}}",

  // ─── payoff.netEntry ───
  "payoff.netEntry": "Net Entry",

  // ─── payoff.received ───
  "payoff.received": "credit received",

  // ─── payoff.paid ───
  "payoff.paid": "debit paid",

  // ─── payoff.rr ───
  "payoff.rr": "Reward : Risk",

  // ─── payoff.undefined ───
  "payoff.undefined": "undefined",

  // ─── payoff.breakeven ───
  "payoff.breakeven": "Breakeven",

  // ─── payoff.verifyTitle ───
  "payoff.verifyTitle": "Open this {{structure}} on {{provider}} for live Greeks, IV and probability",

  // ─── payoff.verify ───
  "payoff.verify": "Verify on {{provider}} ↗",

  // ─── payoff.verifyNote ───
  "payoff.verifyNote": "live Greeks · IV · probability, on the real chain",

  // ─── payoff.ticket ───
  "payoff.ticket": "Order Ticket",

  // ─── payoff.copyTitle ───
  "payoff.copyTitle": "Copy this broker-style ticket to your clipboard",

  // ─── payoff.copied ───
  "payoff.copied": "copied ✓",

  // ─── payoff.copy ───
  "payoff.copy": "copy",

  // ─── payoff.try ───
  "payoff.try": "Try an example structure",

  // ─── payoff.tryHint ───
  "payoff.tryHint": " · examples to study, not to submit",

  // ─── payoff.presetsCaption ───
  "payoff.presetsCaption": "Examples to study, not to submit. Premiums come from the actual chain: the same numbers you'd see if you tapped these strikes yourself.",

  // ─── presets.0 ───
  "presets.0": "Short OTM put + long lower put. Bullish credit spread.",

  // ─── presets.1 ───
  "presets.1": "Short OTM call + long higher call. Bearish credit spread.",

  // ─── presets.2 ───
  "presets.2": "Both wings short, both wings long beyond. Wide range-bound.",

  // ─── presets.3 ───
  "presets.3": "ATM straddle short + far OTM wings long. Narrow pin trade.",

  // ─── presets.4 ───
  "presets.4": "Long ATM call + long ATM put. Pre-event vol play.",

  // ─── presets.5 ───
  "presets.5": "Short OTM call + short OTM put. Premium-collection on range.",

  // ─── presets.6 ───
  "presets.6": "Short near-dated ATM call + long back-dated same strike.",

  // ─── presets.7 ───
  "presets.7": "Short near-dated ATM put + long back-dated same strike.",

  // ─── presets.8 ───
  "presets.8": "Long deep-ITM back-month call + short OTM front-month call.",

  // ─── payoff.replaceTitle ───
  "payoff.replaceTitle": "Replace current legs?",

  // ─── payoff.replaceBody_one ───
  "payoff.replaceBody_one": "Loading <b>{{preset}}</b> replaces your current {{count}} leg with the preset's structure, with premiums from the live chain.",

  // ─── payoff.replaceBody_other ───
  "payoff.replaceBody_other": "Loading <b>{{preset}}</b> replaces your current {{count}} legs with the preset's structure, with premiums from the live chain.",

  // ─── payoff.keep ───
  "payoff.keep": "Keep my legs",

  // ─── payoff.replace ───
  "payoff.replace": "Replace with {{preset}}",

  // ─── skew.level ───
  "skew.level.none": "This scenario didn't supply an IV Rank, so judge the level off ATM IV ({{iv}}%) and your own sense of whether that's high for {{ticker}}.",
  "skew.level.rich": "IV Rank {{rank}}: premium is rich (expensive) versus {{ticker}}'s own trailing range.\nThat's a seller's green light: options across the board are well-paid right now.\nSkew then tells you which strike to sell.",
  "skew.level.mid": "IV Rank {{rank}}: premium is middling, neither a fat pitch nor a famine.\nLean on the scenario's own catalysts and let skew decide where the relative value sits.",
  "skew.level.cheap": "IV Rank {{rank}}: premium is cheap versus {{ticker}}'s own range.\nThin reward for sellers; the whole curve is low, so be choosier even where skew looks inviting.",

  // ─── skew.verdict ───
  "skew.verdict.flat": "This scenario didn't supply 25Δ smile anchors, so the curve here is flat IV at {{iv}}% ATM: the level only, not the shape.\nRead the scenario's skew_note for the regime story.",
  "skew.verdict.smirkWide": "Reverse smirk (put-bid).\nThe put you buy ({{long}}) is meaningfully richer in vol than the one you sell ({{short}}): skew eats into your credit, but the wing pays for fear.\nSell below the steepest part for real cushion.",
  "skew.verdict.smirkNarrow": "Reverse smirk (put-bid).\nUp near spot the skew is gentle; both legs carry similar vol, so the credit is clean.\nBut you're closer to the money, so the cushion is thinner.\nThe classic trade-off.",
  "skew.verdict.forward": "Forward skew: the call wing is the rich one here.\nFor a put spread on {{ticker}} that's friendly, since the puts you trade sit on the cheaper, flatter side.\nThe danger this curve prices is an upside spike, not a collapse.",
  "skew.verdict.symmetric": "Roughly symmetric: both wings carry similar IV.\nATM is neither a deep valley nor heavily biased, so read it for spot or event positioning rather than counting on skew to pay for a wing.",

  // ─── skew.trigger ───
  "skew.trigger": "Skew Guide",

  // ─── skew.close ───
  "skew.close": "Close guide",

  // ─── skew.title ───
  "skew.title": "Guide to Skew",

  // ─── skew.lede ───
  "skew.lede": "Implied volatility is not one number: it's a <em>curve</em> across strikes, a map of where the market is paying up for fear.\nFor a premium seller it shows where the insurance is <em>richest</em>, and throughout this guide <b>rich means expensive</b> (a high premium): good to <em>sell</em>, bad to buy.\nIt never means the option's holder gets rich.",
  "skew.lede.smile": "The curve below is the <em>literal</em> smile this scenario prices, anchored to <b>{{who}}</b> at spot <b>{{spot}}</b>, ATM 30-day IV <b>{{iv}}%</b>, 25Δ-put IV <b>{{put}}%</b> and 25Δ-call IV <b>{{call}}%</b>.\nIt is the same smile the option chain prices each strike from.",
  "skew.lede.flat": "This scenario was dealt before the structured smile anchors were captured, so the curve below shows flat IV at <b>{{iv}}%</b> across all strikes: <em>level only, no shape</em>.\nRead the scenario's skew_note for the regime story.",

  // ─── skew.aria ───
  "skew.aria": "Implied volatility skew curve for {{ticker}}",

  // ─── skew.put25 ───
  "skew.put25": "25Δ put",

  // ─── skew.call25 ───
  "skew.call25": "25Δ call",

  // ─── skew.chip ───
  "skew.chip": "25Δ {{value}} pts",

  // ─── skew.leg ───
  "skew.leg.long": "long {{strike}}",
  "skew.leg.short": "short {{strike}}",

  // ─── skew.axis ───
  "skew.axis.spot": "SPOT",
  "skew.axis.strike": "STRIKE",
  "skew.axis.iv": "IMPLIED VOLATILITY",

  // ─── skew.legend ───
  "skew.legend.curve": "IV curve",
  "skew.legend.short": "short put (sold)",
  "skew.legend.long": "long put (bought)",
  "skew.legend.wings": "25Δ wings (skew)",
  "skew.legend.spot": "spot ≈ {{spot}}",

  // ─── skew.slider ───
  "skew.slider": "Short strike (the put you sell): drag to walk it down the curve",

  // ─── skew.wide ───
  "skew.wide": "{{width}} wide",

  // ─── skew.read ───
  "skew.read.shortIv": "Short put IV",
  "skew.read.longIv": "Long put IV",
  "skew.read.gap": "Skew gap (leg-to-leg)",
  "skew.read.fear": "25Δ skew (fear gauge)",

  // ─── skew.pts ───
  "skew.pts": "{{value}} pts",

  // ─── skew.card ───
  "skew.card.reverse.tag": "Equities & indices: the default",
  "skew.card.reverse.title": "Reverse skew (smirk)",
  "skew.card.reverse.body": "IV climbs as strikes fall. <put>OTM puts are the most expensive options on the board.</put>\nThe market is permanently bid for crash protection: hedging demand lifts downside IV.\nThis is the world bull put spreads live in.",
  "skew.card.smile.tag": "FX, single names, pre-event",
  "skew.card.smile.title": "Volatility smile",
  "skew.card.smile.body": "Both wings lift; ATM is the cheap valley.\nThe market fears a <em>big move either way</em> with no strong lean.\nIt's classic ahead of binary events (earnings, FOMC, a CPI print) where gap risk is two-sided.",
  "skew.card.forward.tag": "Commodities: oil, gas, grains",
  "skew.card.forward.title": "Forward skew",
  "skew.card.forward.body": "IV climbs as strikes <em>rise</em>. <call>OTM calls are the most expensive options on the board</call> because the feared shock is to the <em>upside</em>: a supply disruption that spikes price.\nEnergy names live closer to this regime.",
  "skew.card.delta.tag": "The number to actually watch",
  "skew.card.delta.title": "25-delta skew",
  "skew.card.delta.body": "Steepness = <b>IV of the 25Δ put minus IV of the 25Δ call</b>.\nA widening gap is fear bidding up the put wing (stress).\nA flattening gap is complacency.\nIt's the cleanest read on how scared the market is of this name right now.",

  // ─── skew.sell ───
  "skew.sell.title": "Why it matters when you sell premium",
  "skew.sell.intro": "You're not buying insurance: you're underwriting it.\nBut a seller is really asking <b>two separate questions</b>, and <em>skew only answers the second one.</em>",

  // ─── skew.q ───
  "skew.q.head.question": "The question",
  "skew.q.head.answered": "Answered by",
  "skew.q.head.card": "On this card",
  "skew.q.rich": "“Is premium <em>rich</em> at all right now?”",
  "skew.q.richBy": "<b>IV level + IV Rank</b>: how high the whole curve sits",
  "skew.q.card": "IV 30d {{iv}}%",
  "skew.q.cardRank": "IV 30d {{iv}}%, IV Rank {{rank}}",
  "skew.q.which": "“<em>Which strike</em>, and with what structure, do I keep the most of it?”",
  "skew.q.whichBy": "<b>Skew</b>: the <em>shape</em> of the curve across strikes",
  "skew.q.curve": "the curve above",

  // ─── skew.levelPays ───
  "skew.levelPays": "<b>Level is what pays you. Skew just decides how that pay is spread across strikes, and which structure captures it versus hands it back.</b>\nA rich (expensive) curve means options everywhere are well-paid; skew is your actuarial table for where the overpaying concentrates.",

  // ─── skew.step1 ───
  "skew.step1": "Step 1 · The level read (go / no-go)",

  // ─── skew.step2 ───
  "skew.step2": "Step 2 · The shape read, and the spread wrinkle",
  "skew.step2.intro": "Once the level says “play,” skew says <em>how</em>.\nThe two seller structures use skew in opposite ways:",
  "skew.step2.csp": "<b>Cash-secured put</b> (sell one put outright): a steep put skew is a pure <em>tailwind</em>.\nYou collect the single richest, most fear-bid option on the board and keep all of it.",
  "skew.step2.bps": "<b>Bull put spread</b> (sell the higher put, buy the lower one): here steep skew is a <em>tax</em>.\nThe put you <b>buy</b> sits higher on the curve than the one you <b>sell</b>, so you pay rich and collect cheap.\nThe steeper the skew, the smaller your net credit.\nThat shrunk credit is the price of a capped, defined risk.\nWatch the <b>skew gap</b> readout do exactly this as you walk the short strike down.",

  // ─── skew.fearOpportunity ───
  "skew.fearOpportunity": "So <gold>“fear = opportunity”</gold> and the spread wrinkle aren't a contradiction.\nA fear-bid put wing means <em>elevated absolute premium</em> (good: you collect more), while the <em>tilt</em> of that wing is what a spread gives back for its risk cap.\nYour edge in either structure is the same: sell where the market's priced fear is <b>richer than your own belief that price will hold</b>.",

  // ─── skew.check ───
  "skew.check.title": "A practical reading checklist",
  "skew.check.see": "What you see",
  "skew.check.means": "What it means",
  "skew.check.move": "Seller's move",
  "skew.check.0.see": "High IV Rank + steep put skew",
  "skew.check.0.means": "Premium rich (expensive) AND the richness sits in the puts",
  "skew.check.0.move": "The textbook seller's setup: a rich wing to sell, and the level says it's well-paid",
  "skew.check.1.see": "Steep put skew",
  "skew.check.1.means": "Crash fear expensively priced",
  "skew.check.1.move": "Put premium is fat: put your short strike <em>below</em> the steepest part of the ramp, so you collect fear-bid premium at a strike price still has room to avoid",
  "skew.check.2.see": "Flat skew",
  "skew.check.2.means": "Complacency",
  "skew.check.2.move": "Thin premium, little cushion priced in: be choosier",
  "skew.check.3.see": "Skew steepening fast",
  "skew.check.3.means": "Stress building",
  "skew.check.3.move": "IV expanding: the entry window is opening",
  "skew.check.4.see": "Smile forming",
  "skew.check.4.means": "Binary event ahead",
  "skew.check.4.move": "Two-sided gap risk: don't be short through it",
  "skew.check.5.see": "Forward skew (energy)",
  "skew.check.5.means": "Upside shock feared",
  "skew.check.5.move": "Calls are the expensive wing; puts relatively cheap to sell",

  // ─── skew.foot ───
  "skew.foot.smile": "The curve is the literal three-anchor smile this scenario prices: ATM IV {{iv}}%, 25Δ-put IV {{put}}%, 25Δ-call IV {{call}}%, anchored at {{ticker}} spot {{spot}}.\nThe option chain tables price each strike from this same smile.\nImplied vol is the market's forward guess, not a forecast: read it as sentiment priced.",
  "skew.foot.flat": "This scenario predates the structured smile anchors, so the curve is flat IV at {{iv}}% across all strikes (level, not shape).\nRead the scenario's skew_note for the regime story until a fresh scenario is dealt.",

  // ─── sample.label ───
  "sample.label": "Sample · For Illustration",

  // ─── sample.title ───
  "sample.title": "What an Optionality pitch review looks like.",

  // ─── sample.intro ───
  "sample.intro": "A real round is composed fresh by The Firm, grounded in the mode & persona you choose.\nIt is then pitched to a second LLM that grades you across six dimensions, and kept in your Journal.\nThis one is fixed: a March 2023 opportunity, a credit put spread pitch and a full review.\nUse it to see what the game ships before you put sats on the table.\nThe Firm writes its scenarios and reviews in English.",

  // ─── sample.scenario ───
  "sample.scenario": "Scenario · {{date}}",

  // ─── sample.maxLoss ───
  "sample.maxLoss": "Max-Loss Envelope",

  // ─── sample.pitch ───
  "sample.pitch": "Trainee's Pitch",

  // ─── dm.failed ───
  "dm.failed": "The DM didn't send.",

  // ─── dm.titleSelf ───
  "dm.titleSelf": "Send DM to Yourself",

  // ─── dm.title ───
  "dm.title": "Send DM",

  // ─── dm.you ───
  "dm.you": " (you)",

  // ─── dm.selfNote ───
  "dm.selfNote": "Self-DM: the message lands in your own Nostr client's inbox.\nIt's a way to check your NIP-07 signer and relay path end to end without pinging a peer.",

  // ─── dm.loading ───
  "dm.loading": "The shared relay set is still loading. Close this and try again in a moment.",

  // ─── dm.close ───
  "dm.close": "Close",

  // ─── dm.placeholder ───
  "dm.placeholder": "Type a single message. The recipient sees it in their Nostr client.",

  // ─── dm.escrowNote ───
  "dm.escrowNote": "Signed by Optionality with your escrowed nsec, kept in operator-managed storage.\nThe DM appears on Nostr authored by your npub.\nWithdraw the key any time in <b>Profile → Game Persona Key</b>.",

  // ─── dm.nip07Note_one ───
  "dm.nip07Note_one": "Signed locally by your NIP-07 extension; your nsec never reaches Optionality.\nPublished to <b>{{count}}</b> relay from the shared DPYC set.",

  // ─── dm.nip07Note_other ───
  "dm.nip07Note_other": "Signed locally by your NIP-07 extension; your nsec never reaches Optionality.\nPublished to <b>{{count}}</b> relays from the shared DPYC set.",

  // ─── dm.cancel ───
  "dm.cancel": "Cancel",

  // ─── dm.send ───
  "dm.send": "Sign & Send",

  // ─── dm.sending ───
  "dm.sending": "Encrypting, signing, broadcasting…",

  // ─── dm.sent ───
  "dm.sent": "✓ Sent",

  // ─── dm.notAccepted ───
  "dm.notAccepted": "✗ Not Accepted",

  // ─── dm.relays ───
  "dm.relays": "{{ok}} / {{total}} relays",

  // ─── dm.perRelay ───
  "dm.perRelay": "Per-relay results",

  // ─── dm.eventNote ───
  "dm.eventNote": "Event id <id>{{id}}…</id>. The recipient sees this in any Nostr client that subscribes to one of these relays.",

  // ─── dm.serverNote ───
  "dm.serverNote": "The DM is on its way through Optionality's relay pool. The recipient will see it in their Nostr client.",

  // ─── dm.done ───
  "dm.done": "Done",

  // ─── dm.tryAgain ───
  "dm.tryAgain": "Try Again",

  // ─── dm.install ───
  "dm.install": "<b>Install a Nostr signer extension</b> to send DMs.\nOptionality never sees your nsec: the extension signs the DM in its own sandbox, and the encrypted message goes straight to relays.",

  // ─── dm.alby ───
  "dm.alby": "Browser extension + iOS / Android. Includes a Lightning wallet too.",

  // ─── dm.nos2x ───
  "dm.nos2x": "Minimal Chrome / Firefox extension. NIP-07 only, no wallet.",

  // ─── dm.flamingo ───
  "dm.flamingo": "iOS / desktop wrapper around your nsec; exposes NIP-07 to web pages.",

  // ─── nostr.badNpub ───
  "nostr.badNpub": "Not a valid npub: {{npub}}",

  // ─── nostr.noRelays ───
  "nostr.noRelays": "No relays configured. Add at least one in Profile → Nostr Relays.",

  // ─── nostr.noSigner ───
  "nostr.noSigner": "No NIP-07 signer detected. Install Alby, nos2x or Flamingo.",

  // ─── nostr.empty ───
  "nostr.empty": "The message can't be empty.",

  // ─── glossary.delta_neutral ───
  "glossary.delta_neutral": "Position with net delta near zero: directional P/L cancels at the moment of construction. Profits live in vega, theta, or gamma instead of price direction.",

  // ─── glossary.iron_condor ───
  "glossary.iron_condor": "Sell an OTM call spread and an OTM put spread on the same expiry. Defined-risk premium-collection trade; profits if the underlying stays inside both short strikes.",

  // ─── glossary.iron_butterfly ───
  "glossary.iron_butterfly": "Sell an ATM straddle and buy protective OTM wings. Defined-risk version of a short straddle; max profit if the underlying pins the short strike.",

  // ─── glossary.jade_lizard ───
  "glossary.jade_lizard": "Short call spread + short put with combined premium exceeding the call-spread width. No upside risk; downside is bounded by where the short put sits.",

  // ─── glossary.calendar_spread ───
  "glossary.calendar_spread": "Sell a near-dated option, buy a longer-dated option at the same strike. Benefits from theta on the front leg and vega expansion on the back leg.",

  // ─── glossary.diagonal_spread ───
  "glossary.diagonal_spread": "Calendar spread with different strikes: adds a directional tilt to the time-spread vol play.",

  // ─── glossary.ratio_spread ───
  "glossary.ratio_spread": "Buy one option and sell two (or more) further-OTM options of the same type. Cheap or even credit entry; tail risk if the underlying overshoots the short strikes.",

  // ─── glossary.vertical_spread ───
  "glossary.vertical_spread": "Buy one option, sell another of the same type and expiry at a different strike. Defined risk, defined reward. Bull call / bear put / bear call / bull put.",

  // ─── glossary.credit_spread ───
  "glossary.credit_spread": "Vertical where the sold option has a higher premium than the bought one: operator collects premium at entry. Profits if the underlying stays away from the short strike.",

  // ─── glossary.debit_spread ───
  "glossary.debit_spread": "Vertical where the bought option costs more than the sold one: operator pays at entry. Profits if the underlying moves toward the bought strike.",

  // ─── glossary.short_strangle ───
  "glossary.short_strangle": "Sell an OTM call and an OTM put. Undefined risk in both directions; collects two premiums for taking that risk.",

  // ─── glossary.short_straddle ───
  "glossary.short_straddle": "Sell an ATM call and an ATM put. Maximum premium collection, maximum gamma risk: small moves cost real money fast.",

  // ─── glossary.long_straddle ───
  "glossary.long_straddle": "Buy an ATM call and an ATM put. Pays for explosive moves in either direction; bleeds theta if the underlying stays still.",

  // ─── glossary.long_strangle ───
  "glossary.long_strangle": "Buy an OTM call and an OTM put. Cheaper than a straddle; needs a bigger move to pay off.",

  // ─── glossary.covered_call ───
  "glossary.covered_call": "Long stock + short call at a higher strike. Sacrifices upside above the strike in exchange for premium and a small cushion.",

  // ─── glossary.cash_secured_put ───
  "glossary.cash_secured_put": "Short put with cash on hand to buy the shares if assigned. A patient way to enter a long stock position at a lower effective basis.",

  // ─── glossary.protective_put ───
  "glossary.protective_put": "Long stock + long put. Pays insurance against a downside move; the cost is the put premium.",

  // ─── glossary.put_spread ───
  "glossary.put_spread": "Vertical spread using puts. Bear put = pay debit, profit on down moves; bull put = collect credit, profit if it stays above the short strike.",

  // ─── glossary.call_spread ───
  "glossary.call_spread": "Vertical spread using calls. Bull call = pay debit, profit on up moves; bear call = collect credit, profit if it stays below the short strike.",

  // ─── glossary.iv_crush ───
  "glossary.iv_crush": "Sharp drop in implied vol after an event (earnings, FDA, FOMC) prints. Long-vol structures bleed; short-vol structures pay.",

  // ─── glossary.vol_crush ───
  "glossary.vol_crush": "Same idea as IV crush: implied vol collapses post-event, deflating option premiums regardless of direction.",

  // ─── glossary.vol_regime ───
  "glossary.vol_regime": "The volatility environment around the trade: realized vs implied, IV rank, term structure shape, skew. Determines whether to buy or sell premium.",

  // ─── glossary.iv_rank ───
  "glossary.iv_rank": "Where current implied vol sits in its 1-year range, 0–100. High IV rank favors premium-selling structures; low favors buying premium or calendars.",

  // ─── glossary.skew ───
  "glossary.skew": "Difference between implied vol at different strikes. Equity skew = puts trade richer than calls; reverse skew (commodities) = calls richer.",

  // ─── glossary.term_structure ───
  "glossary.term_structure": "How implied vol differs across expiries. Contango = back months higher (calm market); backwardation = front months higher (stress).",

  // ─── glossary.gamma_risk ───
  "glossary.gamma_risk": "Risk that delta changes faster than you can hedge. Short gamma positions lose money in volatile, choppy tape.",

  // ─── glossary.vega_exposure ───
  "glossary.vega_exposure": "Sensitivity to implied-vol changes. Long vega = profits if IV rises; short vega = profits if IV falls.",

  // ─── glossary.theta_decay ───
  "glossary.theta_decay": "The daily premium erosion option sellers collect and option buyers pay. Accelerates as expiry approaches.",

  // ─── glossary.delta ───
  "glossary.delta": "Approximate change in option price for a $1 move in the underlying. Also a rough proxy for probability of finishing ITM.",

  // ─── glossary.gamma ───
  "glossary.gamma": "Rate of change of delta. High gamma = delta swings fast: friendly to long-option holders, hostile to short-option holders near strikes.",

  // ─── glossary.vega ───
  "glossary.vega": "Change in option price per 1-vol-point change in implied vol. Long options have positive vega; short options have negative vega.",

  // ─── glossary.theta ───
  "glossary.theta": "Daily time decay of an option's extrinsic value. Long options pay theta; short options collect it.",

  // ─── glossary.rho ───
  "glossary.rho": "Sensitivity of an option's price to changes in the risk-free rate. Larger for long-dated options; often a footnote for short-dated.",

  // ─── glossary.moneyness ───
  "glossary.moneyness": "How far an option's strike is from spot: ITM (in the money), ATM (at the money) or OTM (out of the money). How far OTM matters for delta.",

  // ─── glossary.breakeven ───
  "glossary.breakeven": "The underlying price at expiry where the trade's P/L is exactly zero. Multi-leg structures can have two breakevens (e.g. condors).",

  // ─── glossary.max_loss ───
  "glossary.max_loss": "The worst-case outcome at expiry assuming you hold to the end. Defined-risk structures cap it explicitly; naked shorts have unbounded max loss.",

  // ─── glossary.max_gain ───
  "glossary.max_gain": "The best-case outcome at expiry. For long premium it's unbounded (calls) or large (puts); for short premium it's the credit collected.",

  // ─── glossary.dte ───
  "glossary.dte": "Days to expiration. Drives theta acceleration and vega exposure. Structures under 21 DTE are usually gamma-dominated; over 45 DTE, usually vega-dominated.",

  // ─── glossary.assignment_risk ───
  "glossary.assignment_risk": "Risk that a short option gets exercised early, forcing you to deliver / take delivery of stock. Highest near expiry and around ex-div dates.",

  // ─── glossary.pin_risk ───
  "glossary.pin_risk": "Risk that the underlying closes exactly at a short strike at expiry, leaving you uncertain whether you'll be assigned.",

  // ─── glossary.expected_move ───
  "glossary.expected_move": "Approximate one-sigma range for the underlying through a defined window. Often derived from straddle pricing or implied vol × sqrt(time).",

  // ─── glossary.atm_straddle ───
  "glossary.atm_straddle": "Long or short an at-the-money call and an at-the-money put. A long ATM straddle is the canonical “I expect a big move” trade.",

  // ─── glossary.wheel_strategy ───
  "glossary.wheel_strategy": "Sell cash-secured puts on a stock you'd own; if assigned, sell covered calls against it until called away. Repeat. Premium-grind playbook.",

  // ─── glossary.chartLink ───
  "glossary.chartLink": "Open {{symbol}} chart on TradingView",

  // ─── chart.underlying ───
  "chart.underlying": "Underlying  {{price}}",

  // ─── chart.net ───
  "chart.net": "Net P/L",

  // ─── chart.alt ───
  "chart.alt": "Alt P/L",

  // ─── chart.spot ───
  "chart.spot": "spot",
};

/** A key as written in the catalog, plural suffix and all. */
export type EnglishKey = keyof typeof en;
type StripPlural<K> = K extends `${infer Base}_${"zero" | "one" | "two" | "few" | "many" | "other"}` ? Base : K;
/** A key as code asks for it: `x` stands for `x_one` / `x_other`, read with `{ count }`. */
export type MessageKey = StripPlural<EnglishKey>;
export type Messages = Record<EnglishKey, string>;
type PluralBase = EnglishKey extends infer K ? (K extends `${infer Base}_other` ? Base : never) : never;
/** One language's words: English's keys, plus the plural forms that language has beyond English's two. */
export type Translation = Partial<Messages> & Partial<Record<`${PluralBase}_${"zero" | "two" | "few" | "many"}`, string>>;

export default en as Messages;
