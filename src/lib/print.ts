/*
 * Printing a receipt at the right paper size.
 *
 * The obvious CSS — `@page { size: 80mm auto }` — is INVALID and silently
 * falls back to A4/Letter. The spec allows `<length>{1,2}` or the keyword
 * `auto`, never a mix of the two, so the whole declaration is discarded and
 * bills come out Letter-sized on an 80mm roll.
 *
 * A fixed height is not the answer either: a thermal printer cuts at the end
 * of the page, so `size: 80mm 297mm` would spit out and cut ~30cm of paper
 * for a two-item order.
 *
 * So the height is measured from the rendered receipt and injected as a real
 * `@page` rule immediately before printing. The width comes from the
 * --receipt-width custom property, keeping one source of truth for the paper
 * size rather than a value duplicated between CSS and TypeScript.
 */

/** CSS defines 1in as exactly 96px, so 1mm is 96/25.4 px. */
const PX_PER_MM = 96 / 25.4

/** A little slack so the last line is never clipped by rounding. */
const TAIL_MM = 4

export function receiptWidthMm(): number {
  if (typeof window === 'undefined') return 80
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--receipt-width')
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 80
}

/**
 * Print `element` as a single receipt-sized page.
 *
 * Falls back to whatever the printer driver has configured if the element is
 * missing — for a thermal printer that is the roll width, which is sane.
 */
export function printReceipt(element: HTMLElement | null): void {
  const style = document.createElement('style')

  if (element) {
    const widthMm = receiptWidthMm()
    const heightMm = Math.ceil(element.getBoundingClientRect().height / PX_PER_MM) + TAIL_MM
    style.textContent = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`
    document.head.appendChild(style)
  }

  try {
    window.print()
  } finally {
    style.remove()
  }
}
