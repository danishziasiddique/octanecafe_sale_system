'use client'

import { PIN_LENGTH } from '@/lib/auth'

type PinPadProps = {
  value: string
  onChange: (pin: string) => void
  disabled?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

/*
 * Big touch targets, because this is used on a counter tablet with one thumb
 * while holding a card machine in the other hand.
 */
export default function PinPad({ value, onChange, disabled }: PinPadProps) {
  function press(digit: string) {
    if (disabled || value.length >= PIN_LENGTH) return
    onChange(value + digit)
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {KEYS.map((digit) => (
        <Key key={digit} onClick={() => press(digit)} disabled={disabled}>
          {digit}
        </Key>
      ))}

      <Key onClick={() => onChange('')} disabled={disabled} muted>
        Clear
      </Key>
      <Key onClick={() => press('0')} disabled={disabled}>
        0
      </Key>
      <Key onClick={() => onChange(value.slice(0, -1))} disabled={disabled} muted label="Delete">
        &larr;
      </Key>
    </div>
  )
}

type KeyProps = {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  muted?: boolean
  label?: string
}

function Key({ children, onClick, disabled, muted, label }: KeyProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`font-display h-16 rounded-xl text-2xl tracking-wide transition-colors disabled:opacity-40 ${
        muted
          ? 'bg-coal-800 text-cream/60 hover:bg-coal-700 text-base'
          : 'bg-coal-800 text-cream hover:bg-coal-700 active:bg-octane active:text-black'
      }`}
    >
      {children}
    </button>
  )
}
