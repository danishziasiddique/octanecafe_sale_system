import type { Order } from '@/lib/types'
import { loadOrders, saveOrders } from '@/lib/storage'

/*
 * Two ways to store orders, behind one interface.
 *
 *   'blob'   the API routes, backed by Vercel Blob. Survives clearing the
 *            browser and is shared across devices.
 *   'local'  localStorage. No server needed, works offline, but the data
 *            lives in exactly one browser.
 *
 * Which one is used is DETECTED, not configured: the app asks the API once at
 * startup, and falls back to localStorage if no Blob store is connected. That
 * way `npm run dev` works with no setup, and a deployment with a Blob store
 * attached picks it up automatically.
 */

export type BackendKind = 'blob' | 'local'

export type OrdersBackend = {
  kind: BackendKind
  load(): Promise<Order[]>
  add(order: Order): Promise<Order[]>
  remove(id: string): Promise<Order[]>
}

const localBackend: OrdersBackend = {
  kind: 'local',
  async load() {
    return loadOrders()
  },
  async add(order) {
    const next = [order, ...loadOrders()]
    saveOrders(next)
    return next
  },
  async remove(id) {
    const next = loadOrders().filter((order) => order.id !== id)
    saveOrders(next)
    return next
  },
}

async function readJson(response: Response): Promise<{ orders?: Order[]; error?: string }> {
  try {
    return (await response.json()) as { orders?: Order[]; error?: string }
  } catch {
    return {}
  }
}

async function expectOrders(response: Response): Promise<Order[]> {
  const body = await readJson(response)

  if (!response.ok) {
    throw new Error(body.error ?? `Storage request failed (${response.status})`)
  }
  if (!Array.isArray(body.orders)) {
    throw new Error('Storage returned an unexpected response')
  }
  return body.orders
}

const blobBackend: OrdersBackend = {
  kind: 'blob',
  async load() {
    return expectOrders(await fetch('/api/orders'))
  },
  async add(order) {
    return expectOrders(
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(order),
      }),
    )
  },
  async remove(id) {
    return expectOrders(await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }))
  },
}

/**
 * Ask the server once whether a Blob store is connected.
 *
 * A 503 means "no store configured" — an expected answer, not a failure, so
 * we quietly use localStorage. Any other error also falls back, because a
 * till that will not open is worse than one storing data locally.
 */
export async function detectBackend(): Promise<{ backend: OrdersBackend; orders: Order[] }> {
  try {
    const response = await fetch('/api/orders')

    if (response.status === 503) {
      return { backend: localBackend, orders: await localBackend.load() }
    }

    const orders = await expectOrders(response)
    return { backend: blobBackend, orders }
  } catch {
    return { backend: localBackend, orders: await localBackend.load() }
  }
}

export { blobBackend, localBackend }
