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

import { useT } from "../i18n";
import { dimensionLabel } from "../lib/labels";

/// Static sample of one full Optionality round — a dealt scenario, a
/// trainee's free-text trade, and the judge's evaluation — rendered
/// through the same components the live game uses. Lets visitors (and
/// guests, who can't pay for a real deal) see what an assessment
/// actually looks like. Data lives in src/data/sampleAssessment.ts.
export default function SampleAssessment() {
  const t = useT();
  const scenario = SAMPLE_SCENARIO;
  const evaluation = SAMPLE_EVALUATION;

  return (
    <>
      <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
        <span className="panel-label">{t("sample.label")}</span>
        <h2 className="serif" style={{ marginTop: 4 }}>{t("sample.title")}</h2>
        <p className="briefing-prose" style={{ marginBottom: 0 }}>{t("sample.intro")}</p>
      </div>

      <div className="panel">
        <span className="panel-label">{t("sample.scenario", { date: scenario.date_context })}</span>
        <h2 className="serif" style={{ marginTop: 4 }}>
          {scenario.asset.name} ({scenario.asset.ticker})
        </h2>

        <div className="data-row" style={{ marginTop: 14 }}>
          <div className="data-cell"><label>{t("game.card.spot")}</label><b>${scenario.asset.spot}</b></div>
          <div className="data-cell"><label>{t("game.card.iv30")}</label><b>{scenario.asset.iv_30d}%</b></div>
          <div className="data-cell"><label>{t("game.card.ivRank")}</label><b>{scenario.asset.iv_rank}</b></div>
          <div className="data-cell"><label>{t("sample.maxLoss")}</label><b>${scenario.max_loss_usd?.toLocaleString()}</b></div>
        </div>

        <h3 className="serif" style={{ marginTop: 18 }}>{t("game.card.macro")}</h3>
        <div className="briefing-prose"><RichText text={scenario.macro_backdrop} /></div>

        <h3 className="serif">{t("game.card.catalyst")}</h3>
        <div className="briefing-prose"><RichText text={scenario.catalyst} /></div>

        <h3 className="serif">{t("game.card.keyLevels")}</h3>
        <div className="briefing-prose"><RichText text={scenario.key_levels} /></div>

        <h3 className="serif">{t("game.card.skewNote")}</h3>
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

        <h3 className="serif">{t("game.card.constraints")}</h3>
        <div className="briefing-prose"><RichText text={scenario.constraints} /></div>

        <h3 className="serif">{t("game.card.question")}</h3>
        <p className="briefing-prose" style={{ fontStyle: "italic", color: "var(--amber-bright)" }}>
          {scenario.the_question}
        </p>
      </div>

      <div className="panel">
        <span className="panel-label">{t("sample.pitch")}</span>
        <div className="briefing-prose" style={{ lineHeight: 1.6 }}>
          <RichText text={SAMPLE_TRADE_PROPOSAL} />
        </div>
      </div>

      <div className="panel">
        <span className="panel-label">{t("game.review.label")}</span>
        <div className="score-banner">
          <div className="grade">{evaluation.letter_grade}</div>
          <div className="score">{t("game.review.overall")}<b>{evaluation.overall_score} / 100</b></div>
          <div className="headline">&ldquo;<RichText inline text={evaluation.headline} />&rdquo;</div>
        </div>

        <h3 className="serif">{t("game.review.byDimension")}</h3>
        <div className="dim-grid">
          {Object.entries(evaluation.dimensions || {}).map(([k, v]) => (
            <div className="dim-card" key={k}>
              <div className="dim-name">{dimensionLabel(t, k)}</div>
              <div className="dim-score">
                {v.score}<span style={{ fontSize: 12, color: "var(--ink-faint)" }}> / 20</span>
              </div>
              <div className="dim-fb"><RichText text={v.feedback} /></div>
            </div>
          ))}
        </div>

        <FactsLedger evaluation={evaluation} />

        <h3 className="serif">{t("game.entry.riskProfile")}</h3>
        <RiskProfileChart
          legs={evaluation.trade_legs}
          altLegs={evaluation.alt_trade_legs}
          scenario={scenario}
        />

        <h3 className="serif">{t("game.review.right")}</h3>
        <ul className="bullet-list good">
          {(evaluation.what_you_got_right || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
        </ul>

        <h3 className="serif">{t("game.review.sharpen")}</h3>
        <ul className="bullet-list bad">
          {(evaluation.what_to_improve || []).map((b, i) => <li key={i}><RichText inline text={b} /></li>)}
        </ul>

        <h3 className="serif">{t("game.review.alternative")}</h3>
        <div className="alt-trade"><RichText text={evaluation.alternative_trade || ""} /></div>

        <h3 className="serif">{t("game.entry.deeper")}</h3>
        <div className="deeper"><RichText text={evaluation.deeper_context || ""} /></div>
      </div>
    </>
  );
}
