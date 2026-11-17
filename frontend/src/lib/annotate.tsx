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
import { tr, useT, type MessageKey } from "../i18n";

/// A concept's message key: its term with every run of other characters as "_".
const glossaryKey = (term: string): MessageKey =>
  `glossary.${term.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}` as MessageKey;

/// Options structures, Greeks, and vol-regime concepts the dealer/judge
/// will routinely name, matched in their (English) text. Each one's short
/// definition is the message `glossary.<term, underscored>`, shown in the
/// reader's language. Ordered by length descending at match time so
/// multi-word phrases match before their sub-terms.
const CONCEPTS: string[] = [
  "delta-neutral",
  "iron condor",
  "iron butterfly",
  "jade lizard",
  "calendar spread",
  "diagonal spread",
  "ratio spread",
  "vertical spread",
  "credit spread",
  "debit spread",
  "short strangle",
  "short straddle",
  "long straddle",
  "long strangle",
  "covered call",
  "cash-secured put",
  "protective put",
  "put spread",
  "call spread",
  "iv crush",
  "vol crush",
  "vol regime",
  "iv rank",
  "skew",
  "term structure",
  "gamma risk",
  "vega exposure",
  "theta decay",
  "delta",
  "gamma",
  "vega",
  "theta",
  "rho",
  "moneyness",
  "breakeven",
  "max loss",
  "max gain",
  "dte",
  "assignment risk",
  "pin risk",
  "expected move",
  "atm straddle",
  "wheel strategy",
];

const CONCEPTS_SORTED = [...CONCEPTS].sort((a, b) => b.length - a.length);
const conceptPattern = CONCEPTS_SORTED.map((term) => escapeRegex(term)).join("|");
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
function ConceptTooltip({ term, children }: { term: string; children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tip = t(glossaryKey(term));
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
      const term = CONCEPTS_SORTED.find((c) => c.toLowerCase() === raw.toLowerCase());
      if (term) {
        out.push(
          <ConceptTooltip key={`c${keyCounter++}`} term={term}>
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
            title={tr("glossary.chartLink", { symbol })}
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
