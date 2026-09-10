'use client'

import { useSyncExternalStore } from 'react'
import {
  addOrder,
  clearError,
  getServerSnapshot,
  getSnapshot,
  removeOrder,
  subscribe,
} from '@/lib/ordersStore'

/**
 * Reads the order log in a way that is safe to render on the server.
 * See src/lib/ordersStore.ts for how the store side works.
 *
 * `addOrder` and `removeOrder` REJECT when a save fails — callers must await
 * them and handle the failure, or a sale can be silently lost.
 */
export function useOrders() {
  const { orders, loaded, saving, error, backend } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  return { orders, ready: loaded, saving, error, backend, addOrder, removeOrder, clearError }
}
