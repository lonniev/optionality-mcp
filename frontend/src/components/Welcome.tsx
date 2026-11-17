// Welcome panel — the first page every new arrival lands on,
// authenticated or guest. Mission + how-it's-played + Tollbooth-DPYC
// marketing in one scrollable page; primary CTA is Top Up for signed-in
// patrons or "Sign in to play" for guests. Stays in the tab strip
// after the initial auto-route so seasoned patrons can find a refresher.
//
// Kubrick's 1949 CBOT pit photo (the same backdrop the gate uses) sits
// as a fixed, sepia-toned watermark behind the content panels — visual
// continuity from the gate into the app.
//
// Tool prices are quoted from the live pricing model via check_price —
// no hardcoded numbers. If the lookup fails (rare; the wheel free-tier
// gates it minimally) we render a softer paragraph without specific
// figures so we never misstate the operator's actual toll.

import { useEffect, useState } from "react";
import { getGuestId } from "../lib/guest";
import { checkPrice, shortNpub } from "@tollbooth-dpyc/web";
import { Tx } from "@tollbooth-dpyc/web/react";
import { useT, WORDS } from "../i18n";

import { usd2 } from "../lib/money";

/// US cents as dollars in the reader's number format.
const usdOfCents = (cents: number): string => usd2(cents / 100);

interface Props {
  onTopUp: () => void;
  onSeeAssessment: () => void;
  isGuest: boolean;
  /// Patron's bech32 npub when signed in; null for guests.
  npub: string | null;
  /// Patron's chosen display name from Profile, if set.
  displayName: string | null;
}

interface PriceQuote {
  cheap: number;     // deal_scenario at fiction × apprentice
  expensive: number; // deal_scenario at live × sovereign
  pitch: number;     // judge_trade base
}

export default function Welcome({ onTopUp, onSeeAssessment, isGuest, npub, displayName }: Props) {
  const t = useT();
  // Live pricing from the BE — null until the lookup completes; -1
  // sentinel if the lookup failed and we should avoid quoting numbers.
  const [prices, setPrices] = useState<PriceQuote | null | -1>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, e, p] = await Promise.all([
          checkPrice("deal_scenario", { mode: "fiction", difficulty: "apprentice" }),
          checkPrice("deal_scenario", { mode: "live", difficulty: "sovereign" }),
          checkPrice("judge_trade", {}),
        ]);
        if (cancelled) return;
        if (typeof c === "number" && typeof e === "number" && typeof p === "number") {
          setPrices({ cheap: c, expensive: e, pitch: p });
        } else {
          setPrices(-1);
        }
      } catch {
        if (!cancelled) setPrices(-1);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Cost-to-start guidance: ~30 paid rounds at the average price.
  // We compute it from the live numbers (cheap + expensive average +
  // pitch) so the figure tracks the operator's actual pricing.
  const startSats = prices && prices !== -1
    ? Math.max(200, Math.round(((prices.cheap + prices.expensive) / 2 + prices.pitch) * 30 / 100) * 100)
    : null;
  // Rough USD at ~$100K/BTC reference. 1 sat = $0.001 = 0.1¢, so
  // sats / 10 = cents. Reads as "about NN¢" rather than implying a
  // precise quote (BTC/USD moves; this is just a sticker price).
  const startCents = startSats !== null ? Math.round(startSats / 10) : null;

  return (
    <>
      <img
        src="/login-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.08,
          filter: "sepia(0.45) hue-rotate(-12deg) blur(0.4px) contrast(1.05)",
          transform: "scale(1.08)",
          pointerEvents: "none",
          zIndex: 0,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 85%)",
        }}
      />
      {(() => {
        // Greeting name fallback chain — guaranteed to render a non-empty
        // identifier. displayName (preferred) → short npub (signed-in
        // without a display name) → "Guest <id>" (browsing without
        // sign-in) → "Anonymous Visitor" (defensive last resort).
        let greetingName: string;
        let greetingMono = false;
        if (!isGuest && displayName) {
          greetingName = displayName;
        } else if (!isGuest && npub) {
          greetingName = shortNpub(npub);
          greetingMono = true;
        } else if (isGuest) {
          greetingName = t("welcome.guestName", { id: getGuestId() });
          greetingMono = true;
        } else {
          greetingName = t("welcome.anonymous");
        }
        const showNpubLine = !isGuest && !!npub && !!displayName;
        return (
          <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
            <span className="panel-label">{t("welcome.label")}</span>
            <div style={{
              fontSize: 13,
              color: "var(--ink)",
              marginTop: 6,
              marginBottom: 4,
              lineHeight: 1.5,
            }}>
              <Tx ns={WORDS} k="welcome.greeting" vars={{ name: greetingName }} components={{
                name: greetingMono
                  ? <code style={{ color: "var(--amber-bright)", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }} />
                  : <b style={{ color: "var(--amber-bright)" }} />,
              }} />
              {showNpubLine && (
                <Tx ns={WORDS} k="welcome.signedInAs" vars={{ npub: shortNpub(npub!) }} components={{
                  npub: <code style={{ color: "var(--amber-bright)", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }} />,
                }} />
              )}
            </div>
        <h2 className="serif" style={{ marginTop: 4, fontSize: 28 }}>
          {t("welcome.why")}
        </h2>
        <p className="briefing-prose" style={{ marginTop: 8 }}>{t("welcome.why1")}</p>
        <p className="briefing-prose">{t("welcome.why2")}</p>
        <p className="briefing-prose">{t("welcome.why3")}</p>
          </div>
        );
      })()}

      <div className="panel">
        <span className="panel-label">{t("welcome.play.label")}</span>
        <h3 className="serif">{t("welcome.play.round")}</h3>
        <ol className="briefing-prose" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          {(["welcome.play.1", "welcome.play.2", "welcome.play.3", "welcome.play.4", "welcome.play.5"] as const).map((key) => (
            <li key={key}><Tx ns={WORDS} k={key} components={{ b: <b /> }} /></li>
          ))}
        </ol>

        <h3 className="serif" style={{ marginTop: 20 }}>{t("welcome.toll")}</h3>
        {prices && prices !== -1 ? (
          <>
            <p className="briefing-prose">{t("welcome.toll.fair")}</p>
            <p className="briefing-prose"><Tx ns={WORDS} k="welcome.toll.inspect" components={{ b: <b /> }} /></p>
            <ul className="briefing-prose" style={{ paddingLeft: 22, lineHeight: 1.7, marginBottom: 12 }}>
              <li><Tx ns={WORDS} k="welcome.toll.cheap" vars={{ price: t("game.sats", { count: prices.cheap }) }} components={{ b: <b /> }} /></li>
              <li><Tx ns={WORDS} k="welcome.toll.expensive" vars={{ price: t("game.sats", { count: prices.expensive }) }} components={{ b: <b /> }} /></li>
              <li><Tx ns={WORDS} k="welcome.toll.pitch" vars={{ price: t("game.sats", { count: prices.pitch }) }} components={{ b: <b /> }} /></li>
            </ul>
            {startSats !== null && startCents !== null && (
              <p className="briefing-prose">
                {t("welcome.toll.session", { sats: startSats.toLocaleString(), usd: usdOfCents(startCents) })}
              </p>
            )}
          </>
        ) : (
          <p className="briefing-prose">
            <Tx ns={WORDS} k="welcome.toll.fallback" components={{ b: <b /> }} />{" "}
            {prices === -1 && (
              <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
                {t("welcome.toll.unreachable")}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="panel">
        <span className="panel-label">{t("welcome.economy.label")}</span>
        <h3 className="serif">{t("welcome.economy.title")}</h3>
        <p className="briefing-prose">
          <Tx ns={WORDS} k="welcome.economy.intro" components={{
            dpyc: <a href="https://tollbooth-dpyc.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber-bright)", textDecoration: "none", fontWeight: 500 }} />,
            community: <a href="https://github.com/lonniev/dpyc-community" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber-bright)", textDecoration: "none", fontWeight: 500 }} />,
          }} />
        </p>
        <ul className="briefing-prose" style={{ paddingLeft: 20, lineHeight: 1.7 }}>
          {(["welcome.economy.identity", "welcome.economy.pricing", "welcome.economy.money"] as const).map((key) => (
            <li key={key}><Tx ns={WORDS} k={key} components={{ b: <b /> }} /></li>
          ))}
        </ul>
      </div>

      <div className="panel" style={{ background: "var(--bg-soft)" }}>
        <h3 className="serif" style={{ marginTop: 0 }}>{t("welcome.ready")}</h3>
        <p className="briefing-prose">
          {isGuest ? (
            startCents !== null
              ? <Tx ns={WORDS} k="welcome.ready.guestPriced" vars={{ usd: usdOfCents(startCents) }} components={{ b: <b /> }} />
              : <Tx ns={WORDS} k="welcome.ready.guest" components={{ b: <b /> }} />
          ) : (
            <Tx ns={WORDS} k="welcome.ready.patron" components={{ b: <b /> }} />
          )}
        </p>
        <div className="actions">
          <button className="btn btn-ghost" onClick={onSeeAssessment}>
            {t("welcome.seeAssessment")}
          </button>
          <button className="btn" onClick={onTopUp}>
            {isGuest
              ? t("welcome.signInToPlay")
              : startCents !== null
                ? t("welcome.topUpPriced", { usd: usdOfCents(startCents) })
                : t("welcome.topUp")}
          </button>
        </div>
      </div>
    </>
  );
}
