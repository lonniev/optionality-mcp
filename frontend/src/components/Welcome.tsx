// Welcome panel — the first page every new arrival lands on,
// authenticated or guest. Mission + how-it's-played + Tollbooth-DPYC
// marketing in one scrollable page; primary CTA is Top Off for signed-in
// patrons or "Sign in to play" for guests. Stays in the tab strip
// after the initial auto-route so seasoned patrons can find a refresher.
//
// Kubrick's 1949 CBOT pit photo (the same backdrop the gate uses) sits
// as a fixed, sepia-toned watermark behind the content panels — visual
// continuity from the gate into the app.

interface Props {
  onTopOff: () => void;
  onSeeAssessment: () => void;
  isGuest: boolean;
}

export default function Welcome({ onTopOff, onSeeAssessment, isGuest }: Props) {
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
          The dealer LLM composes scenarios — real historical setups, counterfactual
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
        <p className="briefing-prose">
          Each tool call costs Bitcoin Lightning sats. A fiction-mode apprentice
          scenario is 1 sat (less than a tenth of a US cent at $100K/BTC). Sovereign
          live tape with full web-search grounding is 40 sats. The pitch review is
          10 sats. A typical round runs 6–30 sats. There's no subscription, no KYC,
          no platform skim — the operator sets the pricing model transparently and
          you can inspect every multiplier on the Usage tab.
        </p>
        <p className="briefing-prose">
          <b>To start playing: about 80¢ in BTC.</b> That's roughly 800 sats, enough for
          a dozen graded pitches at typical difficulty. The Top Off button buys sats
          via a Lightning invoice; Wallet of Satoshi, Phoenix, Mutiny, or any Lightning
          wallet works.
        </p>
      </div>

      <div className="panel">
        <span className="panel-label">The economy</span>
        <h3 className="serif">Optionality runs on Tollbooth-DPYC</h3>
        <p className="briefing-prose">
          Optionality is an agentic options-trading game built on{" "}
          <a
            href="https://tollbooth-dpyc.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-bright)", textDecoration: "none", fontWeight: 500 }}
          >
            Tollbooth-DPYC →
          </a>{" "}
          — a Bitcoin Lightning + Nostr stack for monetized AI services. Three properties
          worth naming:
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
              start pitching trades for real, sign in with a Nostr identity and
              top off about 80¢ in BTC.
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
            {isGuest ? "Sign In to Play" : "Top Off — ~80¢ to start"}
          </button>
        </div>
      </div>
    </>
  );
}
