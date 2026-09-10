import { describe, expect, it } from 'vitest'
import { addItem, nextToken, orderTotalP, salesTotalP, setQty } from '@/lib/order'
import { rupees } from '@/lib/money'
import type { MenuItem, Order, OrderLine } from '@/lib/types'

const zinger: MenuItem = {
  id: 'zinger-burger',
  name: 'Zinger Burger',
  priceP: rupees(119),
  category: 'burgers',
}

const fries: MenuItem = {
  id: 'peri-peri-fries',
  name: 'Peri Peri Fries',
  priceP: rupees(109),
  category: 'fries',
}

function order(overrides: Partial<Order>): Order {
  return {
    id: 'o1',
    token: 1,
    lines: [],
    totalP: 0,
    payment: 'cash',
    placedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('addItem', () => {
  it('adds a new line for an item that is not on the bill', () => {
    const lines = addItem([], zinger)

    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({
      itemId: 'zinger-burger',
      qty: 1,
      unitPriceP: rupees(119),
    })
  })

  it('bumps the quantity instead of duplicating the line', () => {
    const lines = addItem(addItem([], zinger), zinger)

    expect(lines).toHaveLength(1)
    expect(lines[0].qty).toBe(2)
  })

  it('does not mutate the array it was given', () => {
    const original: OrderLine[] = []
    addItem(original, zinger)

    expect(original).toHaveLength(0)
  })
})

describe('setQty', () => {
  it('removes the line when quantity drops to zero', () => {
    const lines = addItem(addItem([], zinger), fries)

    expect(setQty(lines, 'zinger-burger', 0)).toEqual([
      {
        itemId: 'peri-peri-fries',
        name: 'Peri Peri Fries',
        unitPriceP: rupees(109),
        qty: 1,
      },
    ])
  })
})

describe('orderTotalP', () => {
  it('multiplies each line by its quantity', () => {
    const lines = setQty(addItem(addItem([], zinger), fries), 'zinger-burger', 3)

    // 3 x 119 + 1 x 109 = 466
    expect(orderTotalP(lines)).toBe(rupees(466))
  })

  it('is exact for prices that would lose precision as floats', () => {
    const dip: MenuItem = { id: 'd', name: 'D', priceP: rupees(0.1), category: 'dips' }
    const lines = setQty(addItem([], dip), 'd', 3)

    expect(orderTotalP(lines)).toBe(30)
  })
})

describe('nextToken', () => {
  const now = new Date('2026-09-07T12:00:00')

  it('starts at 1 when there are no orders', () => {
    expect(nextToken([], now)).toBe(1)
  })

  it('continues from the highest token used today', () => {
    const orders = [
      order({ token: 4, placedAt: new Date('2026-09-07T09:00:00').toISOString() }),
      order({ token: 7, placedAt: new Date('2026-09-07T10:00:00').toISOString() }),
    ]

    expect(nextToken(orders, now)).toBe(8)
  })

  it('restarts at 1 on a new day, ignoring yesterday', () => {
    const orders = [order({ token: 42, placedAt: new Date('2026-09-06T20:00:00').toISOString() })]

    expect(nextToken(orders, now)).toBe(1)
  })
})

describe('salesTotalP', () => {
  it('counts only the given day', () => {
    const orders = [
      order({ totalP: rupees(300), placedAt: new Date('2026-09-07T09:00:00').toISOString() }),
      order({ totalP: rupees(500), placedAt: new Date('2026-09-07T18:00:00').toISOString() }),
      order({ totalP: rupees(900), placedAt: new Date('2026-09-06T18:00:00').toISOString() }),
    ]

    expect(salesTotalP(orders, new Date('2026-09-07T23:00:00'))).toBe(rupees(800))
  })
})
