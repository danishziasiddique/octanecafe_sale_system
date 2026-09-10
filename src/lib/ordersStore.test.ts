import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addOrder, getSnapshot, resetForTests, subscribe } from '@/lib/ordersStore'
import type { Order } from '@/lib/types'

function order(id: string): Order {
  return {
    id,
    token: 1,
    lines: [],
    totalP: 5000,
    payment: 'cash',
    placedAt: '2026-09-10T10:00:00.000Z',
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

/** Subscribe and wait for the initial load to settle. */
async function ready() {
  subscribe(() => {})
  await vi.waitFor(() => expect(getSnapshot().loaded).toBe(true))
}

beforeEach(() => {
  window.localStorage.clear()
  resetForTests()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ordersStore', () => {
  it('records a sale and exposes it in the snapshot', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ configured: true, orders: [] }))
      .mockResolvedValueOnce(jsonResponse({ configured: true, orders: [order('a')] }))
    vi.stubGlobal('fetch', fetchMock)

    await ready()
    await addOrder(order('a'))

    expect(getSnapshot().orders.map((o) => o.id)).toEqual(['a'])
    expect(getSnapshot().error).toBeNull()
    expect(getSnapshot().saving).toBe(false)
  })

  it('REJECTS when the sale could not be saved, so the till can react', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ configured: true, orders: [] }))
      .mockResolvedValueOnce(jsonResponse({ error: 'Blob store unreachable' }, 500))
    vi.stubGlobal('fetch', fetchMock)

    await ready()

    // A silent failure here would mean a customer paid and no bill exists.
    await expect(addOrder(order('b'))).rejects.toThrow(/unreachable/i)
  })

  it('surfaces the failure and does not pretend the order was recorded', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ configured: true, orders: [] }))
      .mockRejectedValueOnce(new Error('network down'))
    vi.stubGlobal('fetch', fetchMock)

    await ready()
    await expect(addOrder(order('c'))).rejects.toThrow()

    expect(getSnapshot().error).toMatch(/network down/i)
    expect(getSnapshot().orders).toEqual([])
    expect(getSnapshot().saving).toBe(false)
  })

  it('reports which backend is in use', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ configured: false }, 503)))

    await ready()

    expect(getSnapshot().backend).toBe('local')
  })
})
