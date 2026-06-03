import FactsLedger from "./FactsLedger";
import OptionChainGuide from "./OptionChainGuide";
import RichText from "./RichText";
import RiskProfileChart from "./RiskProfileChart";
import SkewGuide from "./SkewGuide";
import {
  SAMPLE_EVALUATION,
  SAMPLE_SCENARIO,
  SAMPLE_TRADE_PROPOSAL,
} from "../data/sampleAssessment";

const DIMENSION_LABELS: Record<string, string> = {
  strategy_selection: "Strategy",
  strikes_and_tenor: "Strikes & Tenor",
  risk_reward: "Risk / Reward",
  macro_integration: "Macro Context",
  tail_risk: "Tail Risk",
  communication: "Communication",
};

/// Static sample of one full Optionality round — a dealt scenario, a
/// trainee's free-text trade, and the judge's evaluation — rendered
/// through the same components the live game uses. Lets visitors (and
/// guests, who can't pay for a real deal) see what an assessment
/// actually looks like. Data lives in src/data/sampleAssessment.ts.
export default function SampleAssessment() {
  const scenario = SAMPLE_SCENARIO;
  const evaluation = SAMPLE_EVALUATION;

  return (
    <>
      <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
        <span className="panel-label">Sample · For Illustration</span>
        <h2 className="serif" style={{ marginTop: 4 }}>
          What an Optionality pitch review looks like.
        </h2>
        <p className="briefing-prose" style={{ marginBottom: 0 }}>
          A real round is composed fresh by The Firm — grounded in the mode &amp; persona you
          choose — then pitched to a second LLM that grades you across six dimensions, and
          persisted to your Journal. This one is fixed: a March 2023 opportunity, a credit
          put spread pitch, a full review. Use it to see what the game ships before you put
          sats on the table.
        </p>
      </div>

      <div className="panel">
        <span className="panel-label">Scenario · {scenario.date_context}</span>
        <h2 className="serif" style={{ marginTop: 4 }}>
          {scenario.asset.name} ({scenario.asset.ticker})
        </h2>

        <div className="data-row" style={{ marginTop: 14 }}>
          <div className="data-cell"><label>Spot</label><b>${scenario.asset.spot}</b></div>
          <div className="data-cell"><label>IV 30d</label><b>{scenario.asset.iv_30d}%</b></div>
          <div className="data-cell"><label>IV Rank</label><b>{scenario.asset.iv_rank}</b></div>
          <div className="data-cell"><label>Max-Loss Envelope</label><b>${scenario.max_loss_usd?.toLocaleString()}</b></div>
        </div>

        <h3 className="serif" style={{ marginTop: 18 }}>Macro backdrop</h3>
        <div className="briefing-prose"><RichText text={scenario.macro_backdrop} /></div>

        <h3 className="serif">Catalyst</h3>
        <div className="briefing-prose"><RichText text={scenario.catalyst} /></div>

        <h3 className="serif">Key levels</h3>
        <div className="briefing-prose"><RichText text={scenario.key_levels} /></div>

        <h3 className="serif">Skew note</h3>
        <div className="briefing-prose"><RichText text={scenario.asset.skew_note || ""} /></div>

        {typeof scenario.asset.spot === "number" && (
          <SkewGuide
            ticker={scenario.asset.ticker}
            name={scenario.asset.name}
            spot={scenario.asset.spot}
            iv30d={scenario.asset.iv_30d}
            iv25dPut={scenario.asset.iv_25d_put}
            iv25dCall={scenario.asset.iv_25d_call}
            skewNote={scenario.asset.skew_note}
          />
        )}

        {Array.isArray(scenario.option_chain) && scenario.option_chain.length > 0 && (
          <div style={{ marginTop: 6, marginBottom: 12 }}>
            <OptionChainGuide
              spot={scenario.asset.spot}
              chain={scenario.option_chain}
              ticker={scenario.asset.ticker || ""}
              ivPct={scenario.asset.iv_30d}
              scenario={scenario}
            />
          </div>
        )}

        <h3 className="serif">Constraints</h3>
        <div className="briefing-prose"><RichText text={scenario.constraints} /></div>

        <h3 className="serif">The question</h3>
        <p className="briefing-prose" style={{ fontStyle: "italic", color: "var(--amber-bright)" }}>
          {scenario.the_question}
        </p>
      </div>

      <div className="panel">
        <span className="panel-label">Trainee's Pitch</span>
        <div className="briefing-prose" style={{ lineHeight: 1.6 }}>
          <RichText text={SAMPLE_TRADE_PROPOSAL} />
        </div>
      </div>

      <div className="panel">
        <span className="panel-label">Pitch Review</span>
        <div className="score-banner">
          <div className="grade">{evaluation.letter_grade}</div>
          <div className="score">Overall<b>{evaluation.overall_score} / 100</b></div>
          <div className="headline">&ldquo;<RichText inline text={evaluation.headline} />&rdquo;</div>
        </div>

        <h3 className="serif">By Dimension</h3>
        <div className="dim-grid">
          {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
            <div className="dim-card" key={k}>
              <div className="dim-name">{DIMENSION_LABELS[k] || k}</div>
              <div className="dim-score">
                {v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span>
              </div>
              <div className="dim-fb"><RichText text={v.feedback} /></div>
            </div>
          ))}
        </div>

        <FactsLedger evaluation={evaluation} />

        <h3 className="serif">Risk Profile</h3>
        <RiskProfileChart
          legs={evaluation.trade_legs}
          altLegs={evaluation.alt_trade_legs}
          scenario={scenario}
        />

        <h3 className="serif">What you got right</h3>
        <ul className="bullet-list good">
          {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
        </ul>

        <h3 className="serif">What to sharpen</h3>
        <ul className="bullet-list bad">
          {(evaluation.what_to_improve || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
        </ul>

        <h3 className="serif">An alternative the house would have taken</h3>
        <div className="alt-trade"><RichText text={evaluation.alternative_trade || ""} /></div>

        <h3 className="serif">Deeper context</h3>
        <div className="deeper"><RichText text={evaluation.deeper_context || ""} /></div>
      </div>
    </>
  );
}
