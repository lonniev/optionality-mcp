import { useEffect, useState } from "react";

// Eye candy for the long-running judge_trade call. Sweeps through the
// six rubric dimensions, lighting each in turn as if the judge were
// scoring them in order. Loops if the call outlasts the cycle. The
// "score" column never shows fake digits — just dots while active and
// a tick once "weighed" — so this can't be mistaken for real progress.
//
// Visual treatment: while a pitch is being judged this takes over the
// whole viewport as a fixed overlay, so the themed backdrop image
// (drop /judge-bg.jpg into frontend/public/) bleeds across the entire
// page rather than being boxed into a single panel. The image is
// sepia-tinted and vignette-masked so the centered dimension rows read
// on top. Each criterion gets a leading emoji glyph for instant
// visual recognition.

interface JudgeDim {
  glyph: string;
  label: string;
}

const JUDGE_DIMS: ReadonlyArray<JudgeDim> = [
  { glyph: "📐", label: "Structure" },
  { glyph: "🎯", label: "Strikes & Tenor" },
  { glyph: "⚖️", label: "Risk / Reward" },
  { glyph: "🌍", label: "Macro Context" },
  { glyph: "🦢", label: "Tail Risk" },
  { glyph: "🎤", label: "Communication" },
];

const STEP_MS = 1400;             // Per-dimension dwell time.
const HOLD_STEPS = 2;             // Extra "all lit" beats before reset.
const CYCLE_STEPS = JUDGE_DIMS.length + HOLD_STEPS;

type RowState = "pending" | "scoring" | "scored";

function rowState(index: number, active: number): RowState {
  if (active >= JUDGE_DIMS.length) {
    // Hold phase — everything reads "scored" until cycle resets.
    return "scored";
  }
  if (index < active) return "scored";
  if (index === active) return "scoring";
  return "pending";
}

export default function JudgeAnimation() {
  const [active, setActive] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % CYCLE_STEPS);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, []);

  // The scene is a fixed full-page overlay; lock the page behind it so
  // it can't scroll out from under the judging animation.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="judge-anim">
      {/* Themed backdrop — Museum of the City of New York collection
          image (NYSE / Wall Street institutional setting), bundled
          locally at frontend/public/judge-bg.jpg so it survives any
          CDN token rotation. Full-bleed across the overlay: heavily
          sepia-tinted, low opacity, and radial-masked so the centered
          dimension rows read on top. */}
      <img
        src="/judge-bg.jpg"
        alt=""
        aria-hidden="true"
        className="judge-anim-bg"
      />

      <div className="judge-anim-title">Judging your Pitch</div>
      <div className="judge-anim-sub">
        Weighing six dimensions of the proposal
      </div>

      <div className="judge-anim-rows">
        {JUDGE_DIMS.map((dim, i) => {
          const state = rowState(i, active);
          return (
            <div key={dim.label} className={`judge-anim-row state-${state}`}>
              <div className="judge-anim-glyph" aria-hidden="true">{dim.glyph}</div>
              <div className="judge-anim-label">{dim.label}</div>
              <div className="judge-anim-meter">
                <div className="judge-anim-meter-fill" />
              </div>
              <div className="judge-anim-score">
                {state === "scored" ? (
                  <span className="tick">✓</span>
                ) : state === "scoring" ? (
                  <span className="dots">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <span className="placeholder">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .judge-anim {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          text-align: center;
          overflow: hidden;
          background: radial-gradient(ellipse at center, var(--bg-soft), var(--bg) 78%);
        }
        .judge-anim-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 0.20;
          filter: sepia(0.55) hue-rotate(-12deg) contrast(1.08) blur(0.3px);
          transform: scale(1.04);
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse at center, black 55%, transparent 95%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 55%, transparent 95%);
        }
        .judge-anim-title,
        .judge-anim-sub,
        .judge-anim-rows {
          position: relative;
          z-index: 1;
        }
        .judge-anim-title {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 6px;
        }
        .judge-anim-sub {
          font-size: 12px;
          color: var(--ink-faint);
          font-style: italic;
          margin-bottom: 22px;
        }
        .judge-anim-rows {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 480px;
          margin: 0 auto;
        }
        .judge-anim-row {
          display: grid;
          grid-template-columns: 28px 140px 1fr 36px;
          gap: 12px;
          align-items: center;
          padding: 10px 14px;
          background: rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(2px);
          border: 1px solid var(--panel-edge);
          transition: opacity 280ms ease, border-color 280ms ease, background 280ms ease;
        }
        .judge-anim-row.state-pending {
          opacity: 0.4;
        }
        .judge-anim-row.state-scoring {
          opacity: 1;
          border-color: var(--amber);
          background: rgba(212, 163, 91, 0.14);
        }
        .judge-anim-row.state-scored {
          opacity: 0.88;
          border-color: var(--panel-edge);
        }
        .judge-anim-glyph {
          font-size: 18px;
          line-height: 1;
          text-align: center;
          filter: grayscale(0.15);
          transition: filter 280ms ease, transform 280ms ease;
        }
        .judge-anim-row.state-scoring .judge-anim-glyph {
          filter: grayscale(0) drop-shadow(0 0 6px rgba(212, 163, 91, 0.55));
          transform: scale(1.12);
        }
        .judge-anim-row.state-scored .judge-anim-glyph {
          filter: grayscale(0.05);
        }
        .judge-anim-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          color: var(--ink);
          text-align: left;
          letter-spacing: 0.04em;
        }
        .judge-anim-meter {
          position: relative;
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }
        .judge-anim-meter-fill {
          position: absolute;
          inset: 0 100% 0 0;
          background: linear-gradient(90deg, var(--amber), var(--amber-bright));
          transition: right 1100ms cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .judge-anim-row.state-scoring .judge-anim-meter-fill {
          right: 0;
        }
        .judge-anim-row.state-scored .judge-anim-meter-fill {
          right: 0;
          background: linear-gradient(90deg, var(--amber-bright), var(--amber-bright));
          opacity: 0.6;
        }
        .judge-anim-score {
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          text-align: right;
          color: var(--ink-faint);
        }
        .judge-anim-score .tick {
          color: var(--amber-bright);
          font-size: 14px;
        }
        .judge-anim-score .placeholder {
          opacity: 0.5;
        }
        .judge-anim-score .dots {
          display: inline-flex;
          gap: 3px;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
        }
        .judge-anim-score .dots i {
          width: 3px;
          height: 3px;
          background: var(--amber-bright);
          border-radius: 50%;
          animation: judge-anim-pulse 1.05s ease-in-out infinite;
        }
        .judge-anim-score .dots i:nth-child(2) { animation-delay: 0.18s; }
        .judge-anim-score .dots i:nth-child(3) { animation-delay: 0.36s; }
        @keyframes judge-anim-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
