// Optionality's quotes for a wait: the Austrian tradition and sound money, a
// port of the Studio app's LoadingQuoteView. The scroller that shows them is
// @tollbooth-dpyc/web's QuoteScroller. The community corpus at QUOTES_SOURCE
// supersedes these once it loads; these show at once and cover offline, CI
// and a failed fetch.

import type { Quote } from "@tollbooth-dpyc/web";

export const QUOTES_SOURCE =
  "https://raw.githubusercontent.com/lonniev/dpyc-community/main/quotes.json";

export const QUOTES: ReadonlyArray<Quote> = [
  {
    text:
      "Sound money is an instrument of protection of civil liberties against " +
      "despotic inroads on the part of governments.",
    author: "Ludwig von Mises",
  },
  {
    text:
      "The curious task of economics is to demonstrate to men how little they " +
      "really know about what they imagine they can design.",
    author: "F.A. Hayek",
  },
  {
    text:
      "The root problem with conventional currency is all the trust that's " +
      "required to make it work.",
    author: "Satoshi Nakamoto",
  },
  {
    text:
      "I don't believe we shall ever have a good money again before we take " +
      "the thing out of the hands of government.",
    author: "F.A. Hayek",
  },
  { text: "Inflation is taxation without legislation.", author: "Milton Friedman" },
];
