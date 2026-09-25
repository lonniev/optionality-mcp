// How Optionality's loading quotes look. @tollbooth-dpyc/web's QuoteScroller
// brings only the mechanics (rotation, fade, reserved height); the look is
// the site's, drawn by the .quote-scroller rules in index.css (Tailwind here
// generates only the package's own utilities, never the site's). Pass this
// wherever the scroller is shown.

import type { QuoteScrollerClassNames } from "@tollbooth-dpyc/web/react";

export const quoteStyles: QuoteScrollerClassNames = {
  root: "quote-scroller",
  heading: "quote-scroller-heading",
  figure: "quote-scroller-body",
  text: "quote-scroller-text",
  mark: "qmark",
  author: "quote-scroller-author",
};
