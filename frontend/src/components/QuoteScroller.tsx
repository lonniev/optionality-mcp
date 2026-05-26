import { useEffect, useRef, useState } from "react";

// Port of the Studio app's LoadingQuoteView. Rotates Austrian-tradition
// quotations during long-running loads (scenario composition takes
// 10–30s; live mode longer). Fetched once per page from the
// dpyc-community/quotes.json registry, shuffled, then displayed with a
// gentle fade between entries. Inline fallback covers offline / CI /
// first-load latency.

interface Quote {
  text: string;
  author: string;
}

const REMOTE_URL =
  "https://raw.githubusercontent.com/lonniev/dpyc-community/main/quotes.json";

const FALLBACK: ReadonlyArray<Quote> = [
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

let cachedQuotes: Quote[] | null = null;
let fetchPromise: Promise<Quote[]> | null = null;

function shuffle<T>(arr: ReadonlyArray<T>): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchQuotes(): Promise<Quote[]> {
  if (cachedQuotes) return cachedQuotes;
  if (fetchPromise) return fetchPromise;
  fetchPromise = (async () => {
    try {
      const res = await fetch(REMOTE_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { quotes?: Quote[] };
      const list = Array.isArray(body?.quotes) ? body.quotes : [];
      const clean = list.filter(
        (q) => typeof q?.text === "string" && typeof q?.author === "string",
      );
      cachedQuotes = clean.length > 0 ? clean : FALLBACK.slice();
    } catch {
      cachedQuotes = FALLBACK.slice();
    }
    return cachedQuotes!;
  })();
  return fetchPromise;
}

interface QuoteScrollerProps {
  heading?: string;
  /** Per-quote dwell in ms. Studio uses 3000. */
  intervalMs?: number;
  /** Fade transition duration in ms. */
  fadeMs?: number;
}

export default function QuoteScroller({
  heading,
  intervalMs = 3500,
  fadeMs = 450,
}: QuoteScrollerProps) {
  const [quotes, setQuotes] = useState<Quote[]>(() => shuffle(FALLBACK));
  const [index, setIndex] = useState<number>(() =>
    Math.floor(Math.random() * FALLBACK.length),
  );
  const [visible, setVisible] = useState<boolean>(false);
  const fadeTimer = useRef<number | null>(null);
  const tickTimer = useRef<number | null>(null);

  // Initial fade-in.
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(id);
  }, []);

  // Resolve the remote corpus once. Replace the fallback when ready.
  useEffect(() => {
    let alive = true;
    void fetchQuotes().then((list) => {
      if (!alive) return;
      const shuffled = shuffle(list);
      setQuotes(shuffled);
      setIndex(0);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Rotate.
  useEffect(() => {
    if (quotes.length <= 1) return;
    function tick() {
      setVisible(false);
      fadeTimer.current = window.setTimeout(() => {
        setIndex((prev) => {
          let next = Math.floor(Math.random() * quotes.length);
          if (quotes.length > 1) {
            while (next === prev) {
              next = Math.floor(Math.random() * quotes.length);
            }
          }
          return next;
        });
        setVisible(true);
      }, fadeMs);
    }
    tickTimer.current = window.setInterval(tick, intervalMs);
    return () => {
      if (tickTimer.current) window.clearInterval(tickTimer.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, [quotes, intervalMs, fadeMs]);

  const q = quotes[index % quotes.length] ?? FALLBACK[0];

  return (
    <div className="quote-scroller">
      {heading && <div className="quote-scroller-heading">{heading}</div>}
      <div
        className="quote-scroller-body"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${fadeMs}ms ease`,
        }}
      >
        <div className="quote-scroller-text">
          <span className="qmark">&ldquo;</span>
          {q.text}
          <span className="qmark">&rdquo;</span>
        </div>
        <div className="quote-scroller-author">{q.author}</div>
      </div>

      <style>{`
        .quote-scroller {
          padding: 22px 18px 14px;
          text-align: center;
        }
        .quote-scroller-heading {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 26px;
        }
        .quote-scroller-body {
          max-width: 520px;
          margin: 0 auto;
          min-height: 132px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
        }
        .quote-scroller-text {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-size: 17px;
          line-height: 1.55;
          color: var(--ink-soft);
        }
        .quote-scroller-text .qmark {
          color: var(--amber);
          font-size: 22px;
          font-style: normal;
          margin: 0 2px;
        }
        .quote-scroller-author {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }
      `}</style>
    </div>
  );
}
