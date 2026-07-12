import { useEffect, useState } from "react";
import type { Mode } from "../types";
import { etaLabel as computeEtaLabel, fmtClock } from "../lib/dealClock";
import QuoteScroller from "./QuoteScroller";

/// Full-viewport scene shown while a scenario is being composed (or
/// reissued via mulligan). Mirrors JudgeAnimation's pattern but pulls
/// the login screen's backdrop (Kubrick 1949 CBOT pit, public domain)
/// so the trainee waits inside the institutional setting the Firm is
/// pretending to inhabit. The QuoteScroller carries the active loading
/// headline ("Tapping the wire" / "Reading the tape" / "Reissuing the
/// scenario").
///
/// When a live claim is in flight (deal_scenario, which can take minutes
/// in live mode), it also shows a status card: what's being prepared, the
/// claim id, an elapsed clock, an ETA countdown, and a "Claim in Journal"
/// escape hatch. The point is to make a long wait bearable AND to promise —
/// truthfully — that the trainee can wander off: the scenario lands in their
/// Journal when it's ready, and the app resumes the claim on the next load.
///
/// Locks body scroll while up so the page can't slide out from under
/// the overlay.
export interface DealClaimStatus {
  /// Full claim-check id (we render a short prefix).
  claimId: string;
  /// ms epoch of the click that started this deal — anchors the clock.
  startedAt: number;
  /// The Firm's honest time estimate in seconds (0 = unknown → no ETA).
  expectedSeconds: number;
  /// Human label for what's being prepared, e.g. "Live Events · Apprentice".
  assignmentName: string;
  /// Leave the wait and go claim the assignment from the Journal. The deal
  /// keeps composing in the background; this never cancels or re-charges.
  onClaimInJournal: () => void;
}

export default function DealAnimation(props: {
  loadingMsg: string;
  mode: Mode;
  status?: DealClaimStatus;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // A 1Hz tick so the elapsed clock and ETA advance while we wait. Only
  // needed when a status card is showing.
  const [now, setNow] = useState<number>(() => Date.now());
  const hasStatus = !!props.status;
  useEffect(() => {
    if (!hasStatus) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasStatus]);

  const status = props.status;
  const elapsedSec = status ? (now - status.startedAt) / 1000 : 0;
  const etaLabel = status ? computeEtaLabel(elapsedSec, status.expectedSeconds) : "";

  return (
    <div className="deal-anim">
      {/* Themed backdrop — same archival CBOT pit photograph the login
          gate uses, bundled locally at frontend/public/login-bg.jpg.
          Full-bleed across the overlay, sepia-tinted, low opacity,
          radial-masked so the foreground reads on top. */}
      <img
        src="/login-bg.jpg"
        alt=""
        aria-hidden="true"
        className="deal-anim-bg"
      />
      <div className="deal-anim-foreground">
        <QuoteScroller heading={props.loadingMsg} />

        {status ? (
          <div className="deal-card" role="status" aria-live="polite">
            <div className="deal-card-head">The Firm is preparing your assignment</div>
            <div className="deal-card-name">{status.assignmentName}</div>

            <div className="deal-card-meters">
              <div className="deal-meter">
                <span className="deal-meter-k">Elapsed</span>
                <span className="deal-meter-v">{fmtClock(elapsedSec)}</span>
              </div>
              {etaLabel && (
                <div className="deal-meter">
                  <span className="deal-meter-k">Estimate</span>
                  <span className="deal-meter-v">{etaLabel}</span>
                </div>
              )}
              <div className="deal-meter">
                <span className="deal-meter-k">Claim</span>
                <span className="deal-meter-v mono">{status.claimId.slice(0, 8)}</span>
              </div>
            </div>

            <p className="deal-card-reassure">
              Take your time — you can leave this page. Your assignment lands in
              your <strong>Journal</strong> when it's ready, and picks up right
              where it left off if your connection drops.
            </p>

            <button
              type="button"
              className="btn deal-card-btn"
              onClick={status.onClaimInJournal}
            >
              Claim in Journal
            </button>
          </div>
        ) : (
          props.mode === "live" && (
            <div className="deal-anim-foot">
              Live mode searches the web — this can take a few minutes.
            </div>
          )
        )}
      </div>

      <style>{`
        .deal-anim {
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
        .deal-anim-bg {
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
        .deal-anim-foreground {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 720px;
        }
        .deal-anim-foot {
          margin-top: 14px;
          font-size: 11px;
          color: var(--ink-faint);
          font-style: italic;
        }
        .deal-card {
          margin: 22px auto 0;
          max-width: 440px;
          padding: 20px 22px 22px;
          border: 1px solid var(--line, rgba(255,255,255,0.12));
          border-radius: 12px;
          background: color-mix(in srgb, var(--panel) 86%, transparent);
          backdrop-filter: blur(3px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.45);
        }
        .deal-card-head {
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }
        .deal-card-name {
          margin-top: 4px;
          font-family: Fraunces, serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
        }
        .deal-card-meters {
          display: flex;
          justify-content: center;
          gap: 22px;
          margin: 16px 0 4px;
          flex-wrap: wrap;
        }
        .deal-meter {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 64px;
        }
        .deal-meter-k {
          font-size: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-faint);
        }
        .deal-meter-v {
          margin-top: 3px;
          font-size: 18px;
          font-weight: 600;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }
        .deal-meter-v.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          color: var(--rust, #c56a3a);
        }
        .deal-card-reassure {
          margin: 14px 0 18px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-soft, var(--ink-faint));
        }
        .deal-card-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
