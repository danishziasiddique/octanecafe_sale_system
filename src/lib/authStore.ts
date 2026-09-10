import { createSalt, hashPin } from '@/lib/auth'

/*
 * Where the two pieces of auth state live, and why they live there:
 *
 *   localStorage    the PIN salt + hash. Must survive closing the browser,
 *                   or you would be asked to set a new PIN every morning.
 *   sessionStorage  the "unlocked" flag. Must NOT survive closing the tab,
 *                   so the till relocks when the browser is shut at close.
 *
 * Same external-store shape as ordersStore.ts — see the long note there for
 * why getSnapshot has to return a cached reference.
 */

const PIN_KEY = 'highoctane.pin.v1'
const UNLOCK_KEY = 'highoctane.unlocked.v1'

type StoredPin = { salt: string; hash: string }

export type AuthSnapshot = {
  /** Has a PIN ever been set on this device? */
  hasPin: boolean
  unlocked: boolean
  loaded: boolean
}

const EMPTY: AuthSnapshot = { hasPin: false, unlocked: false, loaded: false }

let snapshot: AuthSnapshot = EMPTY
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function readStoredPin(): StoredPin | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PIN_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredPin).salt === 'string' &&
      typeof (parsed as StoredPin).hash === 'string'
    ) {
      return parsed as StoredPin
    }
    return null
  } catch {
    return null
  }
}

function readUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

function refresh() {
  snapshot = {
    hasPin: readStoredPin() !== null,
    unlocked: readUnlocked(),
    loaded: true,
  }
  emit()
}

export function subscribe(listener: () => void): () => void {
  if (!snapshot.loaded) refresh()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): AuthSnapshot {
  return snapshot
}

export function getServerSnapshot(): AuthSnapshot {
  return EMPTY
}

/** First run: choose a PIN and unlock straight away. */
export async function setPin(pin: string): Promise<void> {
  const salt = createSalt()
  const hash = await hashPin(pin, salt)
  window.localStorage.setItem(PIN_KEY, JSON.stringify({ salt, hash }))
  window.sessionStorage.setItem(UNLOCK_KEY, '1')
  refresh()
}

/** Returns false on a wrong PIN rather than throwing — it is an expected outcome. */
export async function unlock(pin: string): Promise<boolean> {
  const stored = readStoredPin()
  if (!stored) return false

  const ok = (await hashPin(pin, stored.salt)) === stored.hash
  if (ok) {
    window.sessionStorage.setItem(UNLOCK_KEY, '1')
    refresh()
  }
  return ok
}

export function lock(): void {
  window.sessionStorage.removeItem(UNLOCK_KEY)
  refresh()
}

/** Test-only: forget everything so suites do not leak into each other. */
export function resetForTests(): void {
  snapshot = EMPTY
  listeners.clear()
}
