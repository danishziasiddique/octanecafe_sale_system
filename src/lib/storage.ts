import type { Order } from '@/lib/types'

const KEY = 'highoctane.orders.v1'

/*
 * Everything here has to survive running on the server, where `window`
 * does not exist. Next.js renders your components on the server first, so
 * touching localStorage during render would crash the page. These functions
 * return safe defaults instead, and the app only calls them from an effect.
 *
 * The `v1` in the key matters: if you later change the shape of an Order,
 * bump it to v2 so old, incompatible data is ignored rather than crashing.
 */

export function loadOrders(): Order[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed as Order[]
  } catch {
    // Corrupt or unreadable storage should never take the till offline.
    return []
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(KEY, JSON.stringify(orders))
  } catch {
    // Quota exceeded or storage blocked — ignore rather than crash.
  }
}

export function clearOrders(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}
