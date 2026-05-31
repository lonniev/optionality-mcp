import FactsLedger from "./FactsLedger";
import RichText from "./RichText";
import RiskProfileChart from "./RiskProfileChart";
import SkewGuide from "./SkewGuide";
import {
  SAMPLE_EVALUATION,
  SAMPLE_SCENARIO,
  SAMPLE_TRADE_PROPOSAL,
} from "../data/sampleAssessment";
import type { OptionChainRow } from "../types";

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
            skewNote={scenario.asset.skew_note}
          />
        )}

        {Array.isArray(scenario.option_chain) && scenario.option_chain.length > 0 && (
          <>
            <h3 className="serif">Option Chain</h3>
            {(() => {
              const byExpiry = new Map<string, { dte: number; rows: OptionChainRow[] }>();
              for (const r of scenario.option_chain) {
                let entry = byExpiry.get(r.expiration);
                if (!entry) {
                  entry = { dte: r.dte, rows: [] };
                  byExpiry.set(r.expiration, entry);
                }
                entry.rows.push(r);
              }
              const groups = Array.from(byExpiry.entries()).sort((a, b) => a[1].dte - b[1].dte);
              return (
                <>
                  {groups.map(([exp, { dte, rows }]) => (
                    <div key={exp} style={{ marginBottom: 12, fontSize: 11 }}>
                      <div style={{
                        fontSize: 10,
                        color: "var(--ink-faint)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}>
                        {exp} · {dte} DTE
                      </div>
                      <table style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontFamily: "JetBrains Mono, monospace",
                      }}>
                        <thead>
                          <tr style={{ color: "var(--ink-faint)" }}>
                            <th style={{ textAlign: "right", padding: "2px 6px", fontWeight: 400 }}>Strike</th>
                            <th style={{ textAlign: "right", padding: "2px 6px", fontWeight: 400 }}>Call Mid</th>
                            <th style={{ textAlign: "right", padding: "2px 6px", fontWeight: 400 }}>ΔC</th>
                            <th style={{ textAlign: "right", padding: "2px 6px", fontWeight: 400 }}>Put Mid</th>
                            <th style={{ textAlign: "right", padding: "2px 6px", fontWeight: 400 }}>ΔP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.strike} style={{ borderTop: "1px solid var(--panel-edge)" }}>
                              <td style={{ textAlign: "right", padding: "3px 6px", color: "var(--amber)" }}>{r.strike}</td>
                              <td style={{ textAlign: "right", padding: "3px 6px", color: "var(--ink)" }}>{r.call_mid.toFixed(2)}</td>
                              <td style={{ textAlign: "right", padding: "3px 6px", color: "var(--ink-soft)" }}>{r.call_delta.toFixed(2)}</td>
                              <td style={{ textAlign: "right", padding: "3px 6px", color: "var(--ink)" }}>{r.put_mid.toFixed(2)}</td>
                              <td style={{ textAlign: "right", padding: "3px 6px", color: "var(--ink-soft)" }}>{r.put_delta.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                  <div style={{ fontSize: 10, color: "var(--ink-faint)", fontStyle: "italic", marginTop: 4, marginBottom: 12 }}>
                    Mid prices computed from a Black-Scholes smile anchored by ATM, 25Δ-put, and 25Δ-call volatilities.
                  </div>
                </>
              );
            })()}
          </>
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
