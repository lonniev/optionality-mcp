// Annotated text renderer for the verdict and other pedagogical panels.
//
// Two passes are woven into the React tree:
//
//   1. Options concepts (calendar spread, IV crush, vega, …) get a
//      dotted-underline hover that surfaces a short definition in a
//      real React popover (mouseenter / focus, positioned, themed).
//      Not the browser `title="..."` attribute — that renders a slow
//      OS-styled tooltip and ships a different feel per platform.
//
//   2. Tickers (2–5 uppercase letters, denylisted against macro
//      acronyms like FOMC / ETF / GDP) become an emoji-decorated link
//      to TradingView so a curious reader can pull up the chart.
//
// An earlier revision also auto-linked publication names (Bloomberg /
// WSJ / Investopedia / …). The visual density was wildly excessive in
// dimension-feedback paragraphs — six links in three sentences read
// like spam. Publications dropped; the agent can cite outlets in prose
// without a link decoration.

import { type ReactNode, useState } from "react";

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

const CONCEPTS_SORTED = [...CONCEPTS].sort((a, b) => b.term.length - a.term.length);
const conceptPattern = CONCEPTS_SORTED.map((c) => escapeRegex(c.term)).join("|");
// Tickers must use the cash-tag prefix ($KRE, $MSTR) to qualify. An
// earlier revision matched bare 2–5 letter all-caps tokens with a
// denylist, but the false-positive surface was too large and a single
// scenario like the SVB write-up would link "KRE" half a dozen times.
// Cash-tags are an explicit "this is a ticker" signal — both the
// dealer / judge prompts can adopt them and the Sample fixture uses
// them. Without the prefix, all-caps words stay plain.
const tickerPattern = "\\$([A-Z]{1,6})\\b";
const COMBINED = new RegExp(`(${conceptPattern})|(${tickerPattern})`, "gi");

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/// React popover-on-hover for an inline concept term. Dotted underline
/// is the affordance; the popover appears on mouseenter / focus and
/// dismisses on mouseleave / blur. Positioned above the term unless
/// near the top of the viewport.
function ConceptTooltip({ tip, children }: { tip: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{
        position: "relative",
        borderBottom: "1px dotted var(--amber)",
        cursor: "help",
        display: "inline",
      }}
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "max-content",
            maxWidth: 320,
            background: "var(--panel)",
            border: "1px solid var(--amber)",
            color: "var(--ink)",
            padding: "8px 12px",
            fontSize: 12,
            fontStyle: "normal",
            lineHeight: 1.5,
            textAlign: "left",
            zIndex: 1000,
            boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
            pointerEvents: "none",
            // Small caret pointing down at the underlined term
            // (rendered via a transparent-border triangle).
          }}
        >
          {tip}
        </span>
      )}
    </span>
  );
}

/// Render a string with concept hovers and ticker links woven into the
/// React tree. Plain prose stays plain; matches become inline elements.
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
    if (m[1]) {
      // concept group
      const def = CONCEPTS_SORTED.find((c) => c.term.toLowerCase() === raw.toLowerCase());
      if (def) {
        out.push(
          <ConceptTooltip key={`c${keyCounter++}`} tip={def.tip}>
            {raw}
          </ConceptTooltip>,
        );
      } else {
        out.push(raw);
      }
    } else if (m[2]) {
      // ticker group — cash-tag-required, so raw is "$TICKER"
      const ticker = m[3];
      if (ticker) {
        const symbol = ticker.toUpperCase();
        out.push(
          <a
            key={`t${keyCounter++}`}
            href={`https://www.tradingview.com/symbols/${symbol}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none" }}
            title={`Open ${symbol} chart on TradingView`}
          >
            📊 ${symbol}
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
