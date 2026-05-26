// Welcome panel — the first page every new arrival lands on,
// authenticated or guest. Mission + how-it's-played + Tollbooth-DPYC
// marketing in one scrollable page; primary CTA is Top Off for signed-in
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
import { checkPrice } from "../lib/mcp";
import { shortNpub } from "./Avatar";

interface Props {
  onTopOff: () => void;
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

function readCost(r: Awaited<ReturnType<typeof checkPrice>>): number | null {
  // Different wheel versions surface the cost under slightly different
  // keys. Tolerate the variations rather than rejecting a quote on a
  // shape change.
  const candidates = [
    (r as unknown as { effective_cost?: number }).effective_cost,
    (r as unknown as { cost?: number }).cost,
    (r as unknown as { effective_cost_api_sats?: number }).effective_cost_api_sats,
    (r as unknown as { base_cost_api_sats?: number }).base_cost_api_sats,
  ];
  for (const v of candidates) {
    if (typeof v === "number" && v >= 0) return v;
  }
  return null;
}

export default function Welcome({ onTopOff, onSeeAssessment, isGuest, npub, displayName }: Props) {
  // Live pricing from the BE — null until the lookup completes; -1
  // sentinel if the lookup failed and we should avoid quoting numbers.
  const [prices, setPrices] = useState<PriceQuote | null | -1>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cheap, expensive, pitch] = await Promise.all([
          checkPrice("deal_scenario", { mode: "fiction", difficulty: "apprentice" }),
          checkPrice("deal_scenario", { mode: "live", difficulty: "sovereign" }),
          checkPrice("judge_trade", {}),
        ]);
        if (cancelled) return;
        const c = readCost(cheap);
        const e = readCost(expensive);
        const p = readCost(pitch);
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
      <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
        <span className="panel-label">Welcome</span>
        {!isGuest && npub && (
          <div style={{
            fontSize: 13,
            color: "var(--ink)",
            marginTop: 6,
            marginBottom: 4,
            lineHeight: 1.5,
          }}>
            Welcome{displayName ? <>, <b style={{ color: "var(--amber-bright)" }}>{displayName}</b></> : ""}.
            Signed in as{" "}
            <code style={{
              color: "var(--amber-bright)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
            }}>
              {shortNpub(npub)}
            </code>.
          </div>
        )}
        <h2 className="serif" style={{ marginTop: 4, fontSize: 28 }}>
          Why Optionality.
        </h2>
        <p className="briefing-prose" style={{ marginTop: 8 }}>
          Most traders carry a good thesis in their head and lose it on the way to the pitch.
          Optionality is a drill for the second half of that work — articulating the
          trade so a senior PM, a risk committee, or your own future self can grade it on
          structure choice, strikes &amp; tenor, risk/reward, macro integration, and tail risk.
        </p>
        <p className="briefing-prose">
          The firm composes opportunities — real historical setups, counterfactual
          regimes, or live tape with web search — and asks you the question every desk
          asks: <i>What is your trade, and why?</i> You pitch it in plain English. A
          second LLM, playing the role of senior PM, grades the pitch and returns the
          structured legs, the alternative trade, and the deeper context worth
          internalizing. Sometimes the best pitch is to <i>not</i> enter the trade —
          a deliberate stand-aside scores higher than a forced answer.
        </p>
      </div>

      <div className="panel">
        <span className="panel-label">How it's played</span>
        <h3 className="serif">A round</h3>
        <ol className="briefing-prose" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            <b>Be Challenged.</b> Pick a historicity (historical / fiction / live), a persona
            (apprentice → sovereign), and optionally a max-loss envelope. The toll scales
            with how hard your selection is.
          </li>
          <li>
            <b>Read the scenario.</b> Asset, spot, IV, skew, key levels, the catalyst,
            the constraints of your book — and a couple of embedded red herrings to
            see if you can spot what's noise vs what's load-bearing.
          </li>
          <li>
            <b>Pitch the Trade.</b> Free-text. Specify the structure, strikes, tenor,
            sizing, and your reasoning.
          </li>
          <li>
            <b>Read the review.</b> Headline classification, five-dimension score,
            facts-integrated ledger, alternative trade the house would have run,
            risk-profile chart, and deeper context.
          </li>
          <li>
            <b>Mulligan a past scenario</b> from your Journal when you want a second
            look. Same setup, fresh pitch, journaled separately.
          </li>
        </ol>

        <h3 className="serif" style={{ marginTop: 20 }}>The toll</h3>
        {prices && prices !== -1 ? (
          <>
            <p className="briefing-prose">
              Each tool call costs Bitcoin Lightning sats — pulled from this operator's
              live pricing model, not a marketing brochure. Right now:
            </p>
            <ul className="briefing-prose" style={{ paddingLeft: 22, lineHeight: 1.7, marginBottom: 12 }}>
              <li>
                Cheapest opportunity — fiction × apprentice:{" "}
                <b>{prices.cheap} sat{prices.cheap === 1 ? "" : "s"}</b>
              </li>
              <li>
                Top of the curve — live tape × sovereign with full web-search grounding:{" "}
                <b>{prices.expensive} sat{prices.expensive === 1 ? "" : "s"}</b>
              </li>
              <li>
                Pitch review (the judge LLM call):{" "}
                <b>{prices.pitch} sat{prices.pitch === 1 ? "" : "s"}</b>
              </li>
            </ul>
            <p className="briefing-prose">
              No subscription, no KYC, no platform skim — the operator sets every
              multiplier directly and you can inspect them yourself via the{" "}
              <b>Usage</b> tab once you have a balance.
            </p>
            {startSats !== null && startCents !== null && (
              <p className="briefing-prose">
                <b>To start playing: about {startCents}¢ in BTC.</b> That's roughly{" "}
                {startSats.toLocaleString()} sats — enough for ~30 graded rounds at
                mid-difficulty. Top Off buys sats via a Lightning invoice; Wallet
                of Satoshi, Phoenix, Mutiny, or any Lightning wallet works.
              </p>
            )}
          </>
        ) : (
          <p className="briefing-prose">
            Each tool call costs Bitcoin Lightning sats — pulled from this operator's
            live pricing model. Difficulty and mode scale the toll; you can inspect
            every multiplier on the <b>Usage</b> tab once you have a balance.
            Top Off buys sats via a Lightning invoice — Wallet of Satoshi, Phoenix,
            Mutiny, or any Lightning wallet works. {prices === -1 && (
              <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
                (Couldn't reach the pricing model just now to quote specific numbers.)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="panel">
        <span className="panel-label">The economy</span>
        <h3 className="serif">Optionality runs on Tollbooth-DPYC<sup>™</sup></h3>
        <p className="briefing-prose">
          Optionality is an agentic options-trading game built on{" "}
          <a
            href="https://tollbooth-dpyc.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none", fontWeight: 500 }}
          >
            Tollbooth-DPYC<sup>™</sup> →
          </a>{" "}
          — a Bitcoin Lightning + Nostr stack for monetized AI services. The
          governance, certified operators, and community registry live in the open at{" "}
          <a
            href="https://github.com/lonniev/dpyc-community"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none", fontWeight: 500 }}
          >
            github.com/lonniev/dpyc-community →
          </a>.
          Three properties worth naming:
        </p>
        <ul className="briefing-prose" style={{ paddingLeft: 20, lineHeight: 1.7 }}>
          <li>
            <b>Sovereign identity.</b> You sign in with a Nostr keypair, not an email +
            password. Your nsec is the only credential; no KYC, no platform-issued
            account. Optionality holds an encrypted copy only if you ask it to (Profile →
            Game Persona Key), and you can withdraw it any time.
          </li>
          <li>
            <b>Dynamic pricing without redeploys.</b> The operator's tool prices are
            stored in a pricing model — not in code. Multipliers for difficulty and
            mode get tuned live (you can verify yourself via the Usage tab). The same
            mechanism the leaderboard uses to weight scores.
          </li>
          <li>
            <b>Sound money.</b> Fiat-rail micropayments are economically dead — the
            interchange fees alone exceed a 1-sat toll. Bitcoin Lightning makes
            tolling per AI-tool-call trivial. The economic model — pre-funded
            Lightning balances, per-call atomic settlement, no custodian holding
            your spend off-chain — is what makes services like Optionality work
            at all.
          </li>
        </ul>
      </div>

      <div className="panel" style={{ background: "var(--bg-soft)" }}>
        <h3 className="serif" style={{ marginTop: 0 }}>Ready?</h3>
        <p className="briefing-prose">
          {isGuest ? (
            <>
              Look around — the <b>See Assessment</b> tab shows a full graded round
              so you can see what the game ships before joining. When you want to
              start pitching trades for real, sign in with a Nostr identity
              {startCents !== null ? <> and top off about {startCents}¢ in BTC.</> : "."}
            </>
          ) : (
            <>
              Look around — the <b>See Assessment</b> tab shows a full graded round
              so you can see what the game ships before you put sats on the table.
              When you want to start pitching trades for real:
            </>
          )}
        </p>
        <div className="actions">
          <button className="btn btn-ghost" onClick={onSeeAssessment}>
            See Assessment
          </button>
          <button className="btn" onClick={onTopOff}>
            {isGuest
              ? "Sign In to Play"
              : startCents !== null
                ? `Top Off — ~${startCents}¢ to start`
                : "Top Off"}
          </button>
        </div>
      </div>
    </>
  );
}
