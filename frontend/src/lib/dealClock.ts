// Pure formatting for the deal-wait status card. Kept out of the component so
// it can be smoke-tested without a DOM (see verify/dealClock.smoke.ts).

/// mm:ss for a non-negative seconds count (clamped at zero).
export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

/// The ETA line under the elapsed clock. Empty when the operator gave no
/// estimate; past the estimate we say "wrapping up…" rather than show a
/// negative or zeroed countdown, because the estimate is a prediction, not a
/// deadline — the job often finishes a little after it.
export function etaLabel(elapsedSec: number, expectedSeconds: number): string {
  if (expectedSeconds <= 0) return "";
  const remaining = expectedSeconds - elapsedSec;
  return remaining > 1 ? `~${fmtClock(remaining)} left` : "wrapping up…";
}
