import { appendOrder, isBlobConfigured, readOrders } from '@/lib/blob'
import type { Order } from '@/lib/types'

/*
 * Route Handlers are not cached by default in Next 16, which is what we want:
 * a till must never be served a stale order log.
 */

/** 503 tells the client "no Blob store here" so it can fall back to localStorage. */
function notConfigured() {
  return Response.json({ configured: false, error: 'No Blob store connected' }, { status: 503 })
}

function failed(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown storage error'
  return Response.json({ configured: true, error: message }, { status: 500 })
}

export async function GET() {
  if (!isBlobConfigured()) return notConfigured()

  try {
    const { orders } = await readOrders()
    return Response.json({ configured: true, orders })
  } catch (error) {
    return failed(error)
  }
}

export async function POST(request: Request) {
  if (!isBlobConfigured()) return notConfigured()

  let order: Order
  try {
    order = (await request.json()) as Order
  } catch {
    return Response.json({ error: 'Body was not valid JSON' }, { status: 400 })
  }

  if (!isOrder(order)) {
    return Response.json({ error: 'Body was not a valid order' }, { status: 400 })
  }

  try {
    const orders = await appendOrder(order)
    return Response.json({ configured: true, orders })
  } catch (error) {
    return failed(error)
  }
}

/**
 * Validate at the boundary. Anything that reaches the order log is money, and
 * `request.json()` returns `any` — without this, a malformed POST would be
 * written straight into the day's takings.
 */
function isOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false
  const order = value as Partial<Order>

  return (
    typeof order.id === 'string' &&
    typeof order.token === 'number' &&
    typeof order.totalP === 'number' &&
    Number.isFinite(order.totalP) &&
    typeof order.placedAt === 'string' &&
    (order.payment === 'cash' || order.payment === 'upi' || order.payment === 'card') &&
    Array.isArray(order.lines) &&
    order.lines.every(
      (line) =>
        typeof line?.itemId === 'string' &&
        typeof line?.name === 'string' &&
        typeof line?.unitPriceP === 'number' &&
        typeof line?.qty === 'number',
    )
  )
}
