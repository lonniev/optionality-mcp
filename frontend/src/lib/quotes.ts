// Optionality's quotes for a wait: the Austrian tradition and sound money, a
// port of the Studio app's LoadingQuoteView. The scroller that shows them is
// @tollbooth-dpyc/web's QuoteScroller. The community corpus at QUOTES_SOURCE
// supersedes these once it loads; these show at once and cover offline, CI
// and a failed fetch.

import type { Quote } from "@tollbooth-dpyc/web";
import { tr, type MessageKey } from "../i18n";

export const QUOTES_SOURCE =
  "https://raw.githubusercontent.com/lonniev/dpyc-community/main/quotes.json";

/** Who said each quote, in order; names stay as they are in every language. */
const AUTHORS = ["Ludwig von Mises", "F.A. Hayek", "Satoshi Nakamoto", "F.A. Hayek", "Milton Friedman"] as const;

/**
 * The site's quotes in the reader's language. Call at render, so a change of
 * language shows at once.
 */
export const quotes = (): ReadonlyArray<Quote> =>
  AUTHORS.map((author, i) => ({ text: tr(`lib.quotes.${i}` as MessageKey), author }));
