// US dollars in the reader's number format. The currency stays USD in every
// language: the scenarios price US-listed options.

/** Whole dollars, e.g. "$1,000" or "1 000 $US". */
export const usd0 = (n: number): string =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Dollars and cents, e.g. "$12.50". */
export const usd2 = (n: number): string =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
