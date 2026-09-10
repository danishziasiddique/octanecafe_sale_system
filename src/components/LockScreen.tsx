'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import PinPad from '@/components/PinPad'
import { OUTLET } from '@/data/outlet'
import { PIN_LENGTH, isValidPin } from '@/lib/auth'
import { useAuth } from '@/lib/useAuth'

type Mode = 'unlock' | 'choose' | 'confirm'

const MAX_ATTEMPTS = 5
const COOLDOWN_MS = 30_000

export default function LockScreen() {
  const { hasPin, setPin, unlock } = useAuth()

  const [mode, setMode] = useState<Mode>(hasPin ? 'unlock' : 'choose')
  const [pin, setPinInput] = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [cooldownUntil, setCooldownUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const cooling = cooldownUntil > now
  const secondsLeft = Math.ceil((cooldownUntil - now) / 1000)

  // Only tick while a cooldown is actually running.
  useEffect(() => {
    if (cooldownUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [cooldownUntil])

  const submit = useCallback(
    async (candidate: string) => {
      setBusy(true)
      setError(null)

      try {
        if (mode === 'choose') {
          setFirstPin(candidate)
          setPinInput('')
          setMode('confirm')
          return
        }

        if (mode === 'confirm') {
          if (candidate !== firstPin) {
            setError('Those did not match. Start again.')
            setFirstPin('')
            setPinInput('')
            setMode('choose')
            return
          }
          await setPin(candidate)
          return
        }

        const ok = await unlock(candidate)
        if (!ok) {
          const next = attempts + 1
          setAttempts(next)
          setPinInput('')
          if (next >= MAX_ATTEMPTS) {
            setCooldownUntil(Date.now() + COOLDOWN_MS)
            setNow(Date.now())
            setAttempts(0)
            setError('Too many wrong PINs. Locked briefly.')
          } else {
            setError(`Wrong PIN. ${MAX_ATTEMPTS - next} tries left.`)
          }
        }
      } finally {
        setBusy(false)
      }
    },
    [mode, firstPin, attempts, setPin, unlock],
  )

  const handleChange = useCallback(
    (next: string) => {
      if (cooling) return
      setError(null)
      setPinInput(next)
      // Submit as soon as the PIN is complete — no separate Enter step.
      if (isValidPin(next)) void submit(next)
    },
    [cooling, submit],
  )

  // Let a physical keyboard drive the pad too, for laptop use.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key >= '0' && event.key <= '9') {
        setPinInput((current) => {
          if (current.length >= PIN_LENGTH) return current
          const next = current + event.key
          if (isValidPin(next)) void submit(next)
          return next
        })
        setError(null)
      } else if (event.key === 'Backspace') {
        setPinInput((current) => current.slice(0, -1))
      } else if (event.key === 'Escape') {
        setPinInput('')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submit])

  const heading =
    mode === 'choose'
      ? 'Set a 4-digit PIN'
      : mode === 'confirm'
        ? 'Enter it again'
        : 'Enter your PIN'

  const subheading =
    mode === 'choose'
      ? 'You will use this to open the till.'
      : mode === 'confirm'
        ? 'Just to be sure you will remember it.'
        : OUTLET.tagline

  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 p-6 lg:flex-row lg:gap-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <Image
          src="/mascot.png"
          alt=""
          width={640}
          height={597}
          priority
          className="h-auto w-full max-w-[380px]"
        />
        <p className="font-display text-octane mt-2 text-2xl tracking-widest uppercase">
          {OUTLET.name}
        </p>
      </div>

      <div className="w-full max-w-[300px]">
        <h1 className="font-display text-center text-2xl tracking-widest uppercase">{heading}</h1>
        <p className="text-cream/50 mt-1 text-center text-xs tracking-wide">{subheading}</p>

        <div className="my-7 flex justify-center gap-3" aria-hidden="true">
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-colors ${
                i < pin.length ? 'border-octane bg-octane' : 'border-coal-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        <PinPad value={pin} onChange={handleChange} disabled={busy || cooling} />

        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-[2.5rem] text-center text-sm text-orange-400"
        >
          {cooling ? `Try again in ${secondsLeft}s.` : error}
        </p>
      </div>
    </main>
  )
}
