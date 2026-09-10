import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Order } from '@/lib/types'

const { appendOrder, isBlobConfigured, readOrders } = vi.hoisted(() => ({
  appendOrder: vi.fn(),
  isBlobConfigured: vi.fn(),
  readOrders: vi.fn(),
}))

vi.mock('@/lib/blob', () => ({ appendOrder, isBlobConfigured, readOrders }))

const { GET, POST } = await import('@/app/api/orders/route')

const validOrder: Order = {
  id: 'a1b2',
  token: 7,
  lines: [{ itemId: 'zinger-burger', name: 'Zinger Burger', unitPriceP: 11900, qty: 2 }],
  totalP: 23800,
  payment: 'upi',
  placedAt: '2026-09-10T10:00:00.000Z',
}

function post(body: unknown) {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  isBlobConfigured.mockReturnValue(true)
})

describe('GET /api/orders', () => {
  it('returns 503 when no Blob store is connected, so the client can fall back', async () => {
    isBlobConfigured.mockReturnValue(false)

    const response = await GET()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({ configured: false })
  })

  it('returns the stored orders', async () => {
    readOrders.mockResolvedValue({ orders: [validOrder], etag: 'e1' })

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ orders: [validOrder] })
  })

  it('reports a storage failure as 500 rather than pretending there are no sales', async () => {
    readOrders.mockRejectedValue(new Error('Stored order log is not valid JSON'))

    const response = await GET()

    expect(response.status).toBe(500)
  })
})

describe('POST /api/orders', () => {
  it('stores a valid order', async () => {
    appendOrder.mockResolvedValue([validOrder])

    const response = await POST(post(validOrder))

    expect(response.status).toBe(200)
    expect(appendOrder).toHaveBeenCalledWith(validOrder)
  })

  it('rejects a body that is not JSON', async () => {
    const response = await POST(post('not json at all'))

    expect(response.status).toBe(400)
    expect(appendOrder).not.toHaveBeenCalled()
  })

  it.each([
    ['missing id', { ...validOrder, id: undefined }],
    ['non-numeric total', { ...validOrder, totalP: '23800' }],
    ['NaN total', { ...validOrder, totalP: Number.NaN }],
    ['unknown payment method', { ...validOrder, payment: 'crypto' }],
    ['lines not an array', { ...validOrder, lines: 'two burgers' }],
    ['a malformed line', { ...validOrder, lines: [{ itemId: 'x' }] }],
    ['not an object at all', 'hello'],
    ['null', null],
  ])('rejects %s without writing anything', async (_label, body) => {
    const response = await POST(post(body))

    expect(response.status).toBe(400)
    // Nothing malformed may ever reach the day's takings.
    expect(appendOrder).not.toHaveBeenCalled()
  })
})
