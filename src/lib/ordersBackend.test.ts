import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectBackend } from '@/lib/ordersBackend'
import { saveOrders } from '@/lib/storage'
import type { Order } from '@/lib/types'

function order(id: string): Order {
  return {
    id,
    token: 1,
    lines: [],
    totalP: 1000,
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

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detectBackend', () => {
  it('uses Blob when the API reports a store is connected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ configured: true, orders: [order('a')] })),
    )

    const { backend, orders } = await detectBackend()

    expect(backend.kind).toBe('blob')
    expect(orders).toHaveLength(1)
  })

  it('falls back to localStorage on 503, which is the no-store-configured case', async () => {
    saveOrders([order('local-1')])
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ configured: false }, 503)))

    const { backend, orders } = await detectBackend()

    expect(backend.kind).toBe('local')
    expect(orders.map((o) => o.id)).toEqual(['local-1'])
  })

  it('falls back to localStorage when the network is unreachable', async () => {
    saveOrders([order('local-2')])
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const { backend, orders } = await detectBackend()

    expect(backend.kind).toBe('local')
    expect(orders.map((o) => o.id)).toEqual(['local-2'])
  })

  it('falls back rather than leaving the till unusable on a server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'blew up' }, 500)))

    const { backend } = await detectBackend()

    expect(backend.kind).toBe('local')
  })
})
