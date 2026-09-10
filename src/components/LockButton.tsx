'use client'

import { useAuth } from '@/lib/useAuth'

export default function LockButton() {
  const { lock } = useAuth()

  return (
    <button
      onClick={lock}
      className="hover:bg-coal-800 text-cream/60 hover:text-cream font-display rounded-lg px-4 py-2 text-sm tracking-widest uppercase"
    >
      Lock
    </button>
  )
}
