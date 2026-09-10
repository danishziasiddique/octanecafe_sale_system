import { afterEach, describe, expect, it, vi } from 'vitest'
import { printReceipt, receiptWidthMm } from '@/lib/print'

function fakeSheet(heightPx: number): HTMLElement {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({ height: heightPx }) as DOMRect
  return el
}

function injectedPageRules(): string[] {
  return Array.from(document.head.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .filter((text) => text.includes('@page'))
}

afterEach(() => {
  document.documentElement.style.removeProperty('--receipt-width')
  vi.restoreAllMocks()
})

describe('receiptWidthMm', () => {
  it('reads the paper width from --receipt-width', () => {
    document.documentElement.style.setProperty('--receipt-width', '58mm')

    expect(receiptWidthMm()).toBe(58)
  })

  it('falls back to 80mm when the property is missing or junk', () => {
    expect(receiptWidthMm()).toBe(80)

    document.documentElement.style.setProperty('--receipt-width', 'wide')
    expect(receiptWidthMm()).toBe(80)
  })
})

describe('printReceipt', () => {
  it('injects a @page rule with TWO lengths, never the invalid "auto"', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    let ruleAtPrintTime = ''
    print.mockImplementation(() => {
      ruleAtPrintTime = injectedPageRules()[0] ?? ''
    })

    printReceipt(fakeSheet(378))

    // `size: 80mm auto` is invalid CSS and silently falls back to Letter,
    // which is the bug this whole module exists to prevent.
    expect(ruleAtPrintTime).not.toContain('auto')
    expect(ruleAtPrintTime).toMatch(/@page \{ size: 80mm \d+mm; margin: 0; \}/)
  })

  it('sizes the page to the measured height plus a small tail', () => {
    let rule = ''
    vi.spyOn(window, 'print').mockImplementation(() => {
      rule = injectedPageRules()[0] ?? ''
    })

    // 378px / 3.7795px-per-mm = 100.01mm, which ceils to 101mm, +4mm tail.
    // Rounding UP matters: rounding down would clip the last line of the bill.
    printReceipt(fakeSheet(378))

    expect(rule).toContain('size: 80mm 105mm')
  })

  it('honours a 58mm roll', () => {
    document.documentElement.style.setProperty('--receipt-width', '58mm')
    let rule = ''
    vi.spyOn(window, 'print').mockImplementation(() => {
      rule = injectedPageRules()[0] ?? ''
    })

    printReceipt(fakeSheet(378))

    expect(rule).toContain('size: 58mm')
  })

  it('cleans up the injected style afterwards', () => {
    vi.spyOn(window, 'print').mockImplementation(() => {})

    printReceipt(fakeSheet(378))

    expect(injectedPageRules()).toEqual([])
  })

  it('still prints, without a @page rule, if the element is missing', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})

    printReceipt(null)

    expect(print).toHaveBeenCalledOnce()
    expect(injectedPageRules()).toEqual([])
  })
})
