import type { Order } from '@/lib/types'
import { detectBackend, type BackendKind, type OrdersBackend } from '@/lib/ordersBackend'

/*
 * Same external-store shape as before, but saving is now asynchronous and can
 * FAIL — a network request instead of a synchronous localStorage write.
 *
 * That difference matters more than it looks. With localStorage a sale was
 * always recorded. Over the network it might not be, and the operator has to
 * find out, so `addOrder` rejects on failure and the till keeps the cart.
 *
 * getSnapshot must still return a cached reference until something really
 * changes, or React re-renders forever.
 */

export type OrdersSnapshot = {
  orders: Order[]
  /** False until the first load finishes. */
  loaded: boolean
  /** A write is in flight. */
  saving: boolean
  /** Last storage error, for the UI to show. */
  error: string | null
  /** Which store the data is actually in. */
  backend: BackendKind | null
}

const EMPTY: OrdersSnapshot = {
  orders: [],
  loaded: false,
  saving: false,
  error: null,
  backend: null,
}

let snapshot: OrdersSnapshot = EMPTY
let backend: OrdersBackend | null = null
let initialising: Promise<void> | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function patch(changes: Partial<OrdersSnapshot>) {
  snapshot = { ...snapshot, ...changes }
  emit()
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : 'Could not reach storage'
}

/** Runs once, however many components subscribe. */
function init(): Promise<void> {
  initialising ??= detectBackend()
    .then(({ backend: detected, orders }) => {
      backend = detected
      patch({ orders, loaded: true, backend: detected.kind, error: null })
    })
    .catch((error: unknown) => {
      patch({ loaded: true, error: messageFor(error) })
    })

  return initialising
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (!snapshot.loaded) void init()
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): OrdersSnapshot {
  return snapshot
}

export function getServerSnapshot(): OrdersSnapshot {
  return EMPTY
}

async function mutate(run: (backend: OrdersBackend) => Promise<Order[]>): Promise<void> {
  await init()
  if (!backend) throw new Error('Storage is not ready yet')

  patch({ saving: true, error: null })

  try {
    const orders = await run(backend)
    patch({ orders, saving: false, error: null })
  } catch (error) {
    patch({ saving: false, error: messageFor(error) })
    // Rethrow so the caller knows the sale was NOT recorded.
    throw error
  }
}

export async function addOrder(order: Order): Promise<void> {
  return mutate((current) => current.add(order))
}

export async function removeOrder(id: string): Promise<void> {
  return mutate((current) => current.remove(id))
}

export function clearError(): void {
  if (snapshot.error !== null) patch({ error: null })
}

/** Test-only: forget everything so suites do not leak into each other. */
export function resetForTests(): void {
  snapshot = EMPTY
  backend = null
  initialising = null
  listeners.clear()
}
