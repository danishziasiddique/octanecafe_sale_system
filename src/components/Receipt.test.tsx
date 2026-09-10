import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Receipt from '@/components/Receipt'
import { rupees } from '@/lib/money'
import type { Order } from '@/lib/types'

const order: Order = {
  id: 'a1b2c3d4-0000-0000-0000-000000000000',
  token: 7,
  lines: [
    { itemId: 'latte', name: 'Cafe Latte', unitPriceP: rupees(190), qty: 2 },
    { itemId: 'fries', name: 'Peri Peri Fries', unitPriceP: rupees(160), qty: 1 },
  ],
  totalP: rupees(540),
  payment: 'upi',
  placedAt: new Date('2026-09-07T18:30:00').toISOString(),
}

describe('Receipt', () => {
  it('heads the bill with the print version of the logo', () => {
    render(<Receipt order={order} />)

    const logo = screen.getByAltText('THE HIGH OCTANE CAFÉ')
    // The 1-bit black-on-white artwork, not the dark-background one, or it
    // prints as a pale smudge on receipt paper.
    expect(logo.getAttribute('src')).toContain('logo-print.png')
  })

  it('serves the logo unoptimised, so the 1-bit artwork is not re-encoded', () => {
    render(<Receipt order={order} />)

    // Going through /_next/image would apply lossy compression to line art
    // that was deliberately thresholded to pure black and white.
    expect(screen.getByAltText('THE HIGH OCTANE CAFÉ')).toHaveAttribute('src', '/logo-print.png')
  })

  it('does not lazy load the logo, which would print a blank header', () => {
    render(<Receipt order={order} />)

    expect(screen.getByAltText('THE HIGH OCTANE CAFÉ')).not.toHaveAttribute('loading', 'lazy')
  })

  it('shows the outlet address and phone, as a bill should', () => {
    render(<Receipt order={order} />)

    expect(screen.getByText('Pampore 192122')).toBeInTheDocument()
    expect(screen.getByText(/9906629292/)).toBeInTheDocument()
  })

  it('shows the token number zero-padded', () => {
    render(<Receipt order={order} />)

    expect(screen.getByText('TOKEN #007')).toBeInTheDocument()
  })

  it('lists each line with its extended amount, not its unit price', () => {
    render(<Receipt order={order} />)

    expect(screen.getByText('Cafe Latte')).toBeInTheDocument()
    expect(screen.getByText('380.00')).toBeInTheDocument() // 2 x 190
    expect(screen.getByText('160.00')).toBeInTheDocument()
  })

  it('shows the total and how it was paid', () => {
    render(<Receipt order={order} />)

    expect(screen.getByText('540.00')).toBeInTheDocument()
    expect(screen.getByText('Paid by UPI')).toBeInTheDocument()
  })
})
