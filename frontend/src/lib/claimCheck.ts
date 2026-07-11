// Claim-check resolution — the pure core of the slow-tool polling loop.
//
// The slow LLM tools (deal_scenario, ask_tip, judge_trade) usually return a
// claim check to poll, but a response can ALSO be terminal on arrival: a
// deterministic replay or a degenerate-input nudge completes synchronously
// ("done" with no claim check), and a pre-flight rejection (bad input, provider
// unfunded) comes back "error". Isolated here, dependency-free, so both the
// start response and each poll are resolved identically — and so it can be
// smoke-tested without pulling the MCP client.

export interface ClaimFetch<T> {
  status?: string; // running | done | error | expired
  result?: T;
  error?: string;
  next_steps?: string;
  poll_after_seconds?: number;
}

export interface ClaimCheckStart<T> extends ClaimFetch<T> {
  success?: boolean;
  claim_check?: string;
}

// Resolve a claim-check response if it has reached a terminal state: return the
// result on "done", throw the curated situation (safe message + next steps; the
// fare was already refunded server-side) on "error"/"expired", or signal
// "pending" to keep polling.
export function claimTerminalOutcome<T>(
  resp: ClaimFetch<T>,
): { value: T } | "pending" {
  if (resp.status === "done" && resp.result !== undefined) {
    return { value: resp.result };
  }
  if (resp.status === "error") {
    const base = resp.error ?? "The request failed; the fee was refunded.";
    throw new Error(resp.next_steps ? `${base} ${resp.next_steps}` : base);
  }
  if (resp.status === "expired") {
    throw new Error(
      resp.next_steps ?? "The claim check expired — please retry.",
    );
  }
  return "pending";
}
