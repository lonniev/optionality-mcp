import { useEffect } from "react";
import type { Mode } from "../types";
import QuoteScroller from "./QuoteScroller";

/// Full-viewport scene shown while a scenario is being composed (or
/// reissued via mulligan). Mirrors JudgeAnimation's pattern but pulls
/// the login screen's backdrop (Kubrick 1949 CBOT pit, public domain)
/// so the trainee waits inside the institutional setting the Firm is
/// pretending to inhabit. The QuoteScroller carries the active loading
/// headline ("Tapping the wire" / "Reading the tape" / "Reissuing the
/// scenario").
///
/// Locks body scroll while up so the page can't slide out from under
/// the overlay.
export default function DealAnimation(props: { loadingMsg: string; mode: Mode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="deal-anim">
      {/* Themed backdrop — same archival CBOT pit photograph the login
          gate uses, bundled locally at frontend/public/login-bg.jpg.
          Full-bleed across the overlay, sepia-tinted, low opacity,
          radial-masked so the QuoteScroller reads on top. */}
      <img
        src="/login-bg.jpg"
        alt=""
        aria-hidden="true"
        className="deal-anim-bg"
      />
      <div className="deal-anim-foreground">
        <QuoteScroller heading={props.loadingMsg} />
        {props.mode === "live" && (
          <div className="deal-anim-foot">
            Live mode searches the web — expect 15–30s.
          </div>
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
      `}</style>
    </div>
  );
}
