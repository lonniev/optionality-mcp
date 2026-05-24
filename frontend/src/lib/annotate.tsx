// Annotated text renderer for the verdict and other pedagogical panels.
//
// Wraps known options-trading concepts with hover tooltips, and known
// tickers / publication names with emoji-decorated links. The verdict
// becomes a small in-place study guide: a trainee who doesn't yet know
// what "calendar spread" or "IV crush" means gets the definition on
// hover; a reference to MSTR or Bloomberg becomes a click-through.
//
// Two glossaries live here on purpose. They are study-guide content, not
// configuration — keep the inline definitions tight and prefer adding a
// term over expanding existing ones. The annotator is greedy on length:
// "iron condor" wins over "iron".

import { type ReactNode } from "react";

interface ConceptDef {
  /// Canonical lowercase form used for matching.
  term: string;
  /// Tooltip body. Keep under ~180 chars — fits a popover comfortably.
  tip: string;
}

/// Options structures, Greeks, and vol-regime concepts the dealer/judge
/// will routinely name. Ordered by length descending so multi-word phrases
/// match before their sub-terms.
const CONCEPTS: ConceptDef[] = [
  { term: "delta-neutral", tip: "Position with net delta near zero — directional P/L cancels at the moment of construction. Profits live in vega, theta, or gamma instead of price direction." },
  { term: "iron condor", tip: "Sell an OTM call spread and an OTM put spread on the same expiry. Defined-risk premium-collection trade; profits if the underlying stays inside both short strikes." },
  { term: "iron butterfly", tip: "Sell an ATM straddle and buy protective OTM wings. Defined-risk version of a short straddle; max profit if the underlying pins the short strike." },
  { term: "jade lizard", tip: "Short call spread + short put with combined premium exceeding the call-spread width. No upside risk; downside is bounded by where the short put sits." },
  { term: "calendar spread", tip: "Sell a near-dated option, buy a longer-dated option at the same strike. Benefits from theta on the front leg and vega expansion on the back leg." },
  { term: "diagonal spread", tip: "Calendar spread with different strikes — adds a directional tilt to the time-spread vol play." },
  { term: "ratio spread", tip: "Buy one option and sell two (or more) further-OTM options of the same type. Cheap or even credit entry; tail risk if the underlying overshoots the short strikes." },
  { term: "vertical spread", tip: "Buy one option, sell another of the same type and expiry at a different strike. Defined risk, defined reward. Bull call / bear put / bear call / bull put." },
  { term: "credit spread", tip: "Vertical where the sold option has a higher premium than the bought one — operator collects premium at entry. Profits if the underlying stays away from the short strike." },
  { term: "debit spread", tip: "Vertical where the bought option costs more than the sold one — operator pays at entry. Profits if the underlying moves toward the bought strike." },
  { term: "short strangle", tip: "Sell an OTM call and an OTM put. Undefined risk in both directions; collects two premiums for taking that risk." },
  { term: "short straddle", tip: "Sell an ATM call and an ATM put. Maximum premium collection, maximum gamma risk — small moves cost real money fast." },
  { term: "long straddle", tip: "Buy an ATM call and an ATM put. Pays for explosive moves in either direction; bleeds theta if the underlying stays still." },
  { term: "long strangle", tip: "Buy an OTM call and an OTM put. Cheaper than a straddle; needs a bigger move to pay off." },
  { term: "covered call", tip: "Long stock + short call at a higher strike. Sacrifices upside above the strike in exchange for premium and a small cushion." },
  { term: "cash-secured put", tip: "Short put with cash on hand to buy the shares if assigned. A patient way to enter a long stock position at a lower effective basis." },
  { term: "protective put", tip: "Long stock + long put. Pays insurance against a downside move; the cost is the put premium." },
  { term: "put spread", tip: "Vertical spread using puts. Bear put = pay debit, profit on down moves; bull put = collect credit, profit if it stays above the short strike." },
  { term: "call spread", tip: "Vertical spread using calls. Bull call = pay debit, profit on up moves; bear call = collect credit, profit if it stays below the short strike." },
  { term: "iv crush", tip: "Sharp drop in implied vol after an event (earnings, FDA, FOMC) prints. Long-vol structures bleed; short-vol structures pay." },
  { term: "vol crush", tip: "Same idea as IV crush — implied vol collapses post-event, deflating option premiums regardless of direction." },
  { term: "vol regime", tip: "The volatility environment around the trade: realized vs implied, IV rank, term structure shape, skew. Determines whether to buy or sell premium." },
  { term: "iv rank", tip: "Where current implied vol sits in its 1-year range, 0–100. High IV rank favors premium-selling structures; low favors buying premium or calendars." },
  { term: "skew", tip: "Difference between implied vol at different strikes. Equity skew = puts trade richer than calls; reverse skew (commodities) = calls richer." },
  { term: "term structure", tip: "How implied vol differs across expiries. Contango = back months higher (calm market); backwardation = front months higher (stress)." },
  { term: "gamma risk", tip: "Risk that delta changes faster than you can hedge. Short gamma positions lose money in volatile, choppy tape." },
  { term: "vega exposure", tip: "Sensitivity to implied-vol changes. Long vega = profits if IV rises; short vega = profits if IV falls." },
  { term: "theta decay", tip: "The daily premium erosion option sellers collect and option buyers pay. Accelerates as expiry approaches." },
  { term: "delta", tip: "Approximate change in option price for a $1 move in the underlying. Also a rough proxy for probability of finishing ITM." },
  { term: "gamma", tip: "Rate of change of delta. High gamma = delta swings fast — friendly to long-option holders, hostile to short-option holders near strikes." },
  { term: "vega", tip: "Change in option price per 1-vol-point change in implied vol. Long options have positive vega; short options have negative vega." },
  { term: "theta", tip: "Daily time decay of an option's extrinsic value. Long options pay theta; short options collect it." },
  { term: "rho", tip: "Sensitivity of an option's price to changes in the risk-free rate. Larger for long-dated options; often a footnote for short-dated." },
  { term: "moneyness", tip: "How far an option's strike is from spot. ITM (in the money), ATM (at the money), OTM (out of the money) — and how far OTM matters for delta." },
  { term: "breakeven", tip: "The underlying price at expiry where the trade's P/L is exactly zero. Multi-leg structures can have two breakevens (e.g. condors)." },
  { term: "max loss", tip: "The worst-case outcome at expiry assuming you hold to the end. Defined-risk structures cap it explicitly; naked shorts have unbounded max loss." },
  { term: "max gain", tip: "The best-case outcome at expiry. For long premium it's unbounded (calls) or large (puts); for short premium it's the credit collected." },
  { term: "dte", tip: "Days to expiration. Drives theta acceleration and vega exposure. <21 DTE structures are usually gamma-dominated; >45 DTE are usually vega-dominated." },
  { term: "assignment risk", tip: "Risk that a short option gets exercised early, forcing you to deliver / take delivery of stock. Highest near expiry and around ex-div dates." },
  { term: "pin risk", tip: "Risk that the underlying closes exactly at a short strike at expiry, leaving you uncertain whether you'll be assigned." },
  { term: "expected move", tip: "Approximate one-sigma range for the underlying through a defined window. Often derived from straddle pricing or implied vol × sqrt(time)." },
  { term: "atm straddle", tip: "Long or short an at-the-money call and an at-the-money put. Long ATM straddle is the canonical 'I expect a big move' trade." },
  { term: "wheel strategy", tip: "Sell cash-secured puts on a stock you'd own; if assigned, sell covered calls against it until called away. Repeat. Premium-grind playbook." },
];

interface PublicationDef {
  /// Canonical display name as it tends to appear in evaluation text.
  name: string;
  /// Site URL to link to.
  url: string;
  /// One-character emoji that fronts the link.
  emoji: string;
}

const PUBLICATIONS: PublicationDef[] = [
  { name: "Bloomberg", url: "https://www.bloomberg.com/", emoji: "📰" },
  { name: "Reuters", url: "https://www.reuters.com/", emoji: "📰" },
  { name: "Wall Street Journal", url: "https://www.wsj.com/", emoji: "📰" },
  { name: "WSJ", url: "https://www.wsj.com/", emoji: "📰" },
  { name: "Financial Times", url: "https://www.ft.com/", emoji: "🌐" },
  { name: "Barron's", url: "https://www.barrons.com/", emoji: "📰" },
  { name: "Investopedia", url: "https://www.investopedia.com/", emoji: "📚" },
  { name: "Zero Hedge", url: "https://www.zerohedge.com/", emoji: "⚡" },
  { name: "ZeroHedge", url: "https://www.zerohedge.com/", emoji: "⚡" },
  { name: "MarketWatch", url: "https://www.marketwatch.com/", emoji: "📊" },
  { name: "CNBC", url: "https://www.cnbc.com/", emoji: "📺" },
  { name: "Wired", url: "https://www.wired.com/", emoji: "🌐" },
  { name: "Coindesk", url: "https://www.coindesk.com/", emoji: "🪙" },
  { name: "CoinDesk", url: "https://www.coindesk.com/", emoji: "🪙" },
];

/// Build the regex once. Concepts use word-boundary matching and are
/// case-insensitive. Publications are case-sensitive (preserves casing
/// like "Barron's"). Tickers are 2–5 uppercase letters, often appearing
/// alone or alongside the cash-tag prefix.
const CONCEPTS_SORTED = [...CONCEPTS].sort((a, b) => b.term.length - a.term.length);
const PUBS_SORTED = [...PUBLICATIONS].sort((a, b) => b.name.length - a.name.length);

const conceptPattern = CONCEPTS_SORTED.map((c) => escapeRegex(c.term)).join("|");
const pubPattern = PUBS_SORTED.map((p) => escapeRegex(p.name)).join("|");
const tickerPattern = "\\$?\\b([A-Z]{2,5})\\b";

const COMBINED = new RegExp(
  `(${conceptPattern})|(${pubPattern})|(${tickerPattern})`,
  "gi",
);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/// A tiny denylist for the ticker pass — common 2–4 letter all-caps
/// words that show up in trading prose but aren't tickers. The annotator
/// would otherwise link "FOMC" or "ETF" to a fake quote URL.
const TICKER_DENYLIST = new Set([
  "FOMC", "FED", "ETF", "ETFS", "USD", "EUR", "GBP", "JPY", "CNY",
  "GDP", "CPI", "PPI", "PMI", "ISM", "OECD", "IMF", "BIS", "ECB",
  "BOJ", "BOE", "PBOC", "RBA", "RBNZ", "SNB", "OPEC", "NATO",
  "API", "MCP", "JSON", "CEO", "CFO", "CTO", "COO", "USA", "UK",
  "EU", "EV", "AI", "ML", "ATM", "ITM", "OTM", "DTE", "IV", "PE",
  "FY", "Q1", "Q2", "Q3", "Q4", "TBD", "TBA", "EOD", "EOM", "EOY",
  "BTW", "FYI", "ASAP", "NB", "PS", "RE", "OK", "OG", "DM", "PM",
  "AM", "ETA", "ROI", "ROE", "ROIC", "EPS", "DCF", "NAV", "AUM",
  "MOM", "YOY", "QOQ", "WOW", "DOD",
]);

/// Render a string with concept tooltips, publication links, and ticker
/// links woven into the React tree. Plain prose stays plain; matches
/// become inline elements. Pass through React strings so the caller can
/// keep using <p>{annotate(text)}</p> without ceremony.
export function annotate(text: string): ReactNode[] {
  if (!text) return [text];

  const out: ReactNode[] = [];
  let lastIndex = 0;
  let keyCounter = 0;

  COMBINED.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = COMBINED.exec(text)) !== null) {
    const matchStart = m.index;
    const matchEnd = COMBINED.lastIndex;

    if (matchStart > lastIndex) {
      out.push(text.slice(lastIndex, matchStart));
    }

    const raw = m[0];
    // Group 1 = concept, 2 = publication, 3 = ticker (with $? prefix)
    if (m[1]) {
      const def = CONCEPTS_SORTED.find((c) => c.term.toLowerCase() === raw.toLowerCase());
      if (def) {
        out.push(
          <span
            key={`c${keyCounter++}`}
            title={def.tip}
            style={{
              borderBottom: "1px dotted var(--amber)",
              cursor: "help",
            }}
          >
            {raw}
          </span>,
        );
      } else {
        out.push(raw);
      }
    } else if (m[2]) {
      const pub = PUBS_SORTED.find((p) => p.name.toLowerCase() === raw.toLowerCase());
      if (pub) {
        out.push(
          <a
            key={`p${keyCounter++}`}
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none" }}
            title={`Open ${pub.name}`}
          >
            {pub.emoji} {raw}
          </a>,
        );
      } else {
        out.push(raw);
      }
    } else if (m[3]) {
      const ticker = m[4];
      if (ticker && !TICKER_DENYLIST.has(ticker.toUpperCase())) {
        const symbol = ticker.toUpperCase();
        out.push(
          <a
            key={`t${keyCounter++}`}
            href={`https://www.tradingview.com/symbols/${symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none" }}
            title={`Open ${symbol} on TradingView`}
          >
            📊 {raw}
          </a>,
        );
      } else {
        out.push(raw);
      }
    } else {
      out.push(raw);
    }

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    out.push(text.slice(lastIndex));
  }

  return out;
}
