/*
 * Money is stored as an integer number of paise, never as a float of rupees.
 *
 * Why: binary floating point cannot represent 0.1 exactly, so decimal money
 * drifts. `0.1 + 0.2 === 0.30000000000000004` in JavaScript. Over a day of
 * sales those errors accumulate and your totals stop reconciling with the till.
 * Integers have no such problem, so we count the smallest unit (paise) and
 * only convert to a decimal string at the moment we display it.
 *
 * Right now every price is a whole rupee and there is no tax, so you would
 * get away with plain rupees. The moment you add a percentage discount or
 * GST, you would not. This costs one helper function to get right up front.
 */

/** ₹120 -> 12000 paise. Use this when writing menu prices. */
export function rupees(amount: number): number {
  return Math.round(amount * 100)
}

/** 12000 paise -> "₹120.00" */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paise / 100)
}

/** 12000 paise -> "120.00" — for receipts, where the ₹ sits in its own column. */
export function formatAmount(paise: number): string {
  return (paise / 100).toFixed(2)
}

/** 7 -> "#007" */
export function formatToken(token: number): string {
  return `#${String(token).padStart(3, '0')}`
}
