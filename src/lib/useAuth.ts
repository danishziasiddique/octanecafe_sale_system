'use client'

import { useSyncExternalStore } from 'react'
import { getServerSnapshot, getSnapshot, lock, setPin, subscribe, unlock } from '@/lib/authStore'

export function useAuth() {
  const { hasPin, unlocked, loaded } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  return { hasPin, unlocked, ready: loaded, setPin, unlock, lock }
}
