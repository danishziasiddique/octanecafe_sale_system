'use client'

import { formatINR } from '@/lib/money'
import { itemCount, lineTotalP, orderTotalP } from '@/lib/order'
import type { OrderLine, PaymentMethod } from '@/lib/types'

type OrderPanelProps = {
  lines: OrderLine[]
  payment: PaymentMethod
  /** A save is in flight — block a second charge for the same basket. */
  saving?: boolean
  onPaymentChange: (payment: PaymentMethod) => void
  onQtyChange: (itemId: string, qty: number) => void
  onClear: () => void
  onCharge: () => void
}

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
]

export default function OrderPanel({
  lines,
  payment,
  saving = false,
  onPaymentChange,
  onQtyChange,
  onClear,
  onCharge,
}: OrderPanelProps) {
  const total = orderTotalP(lines)
  const count = itemCount(lines)
  const empty = lines.length === 0

  return (
    <aside className="border-coal-700 bg-coal-900 flex w-full flex-1 flex-col rounded-2xl border">
      <header className="border-coal-700 flex items-baseline justify-between border-b px-5 py-4">
        <h2 className="font-display text-lg tracking-widest uppercase">Current Order</h2>
        <span className="text-cream/50 text-sm">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="min-h-[120px] flex-1 overflow-y-auto px-2 py-2">
        {empty ? (
          <p className="text-cream/40 px-3 py-10 text-center text-sm">
            Tap items on the menu to start a bill.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {lines.map((line) => (
              <li
                key={line.itemId}
                className="hover:bg-coal-800 flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.name}</p>
                  <p className="text-cream/45 tabular text-xs">{formatINR(line.unitPriceP)} each</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => onQtyChange(line.itemId, line.qty - 1)}
                    className="bg-coal-700 hover:bg-coal-800 h-7 w-7 rounded-md text-sm"
                  >
                    &minus;
                  </button>
                  <span className="tabular w-6 text-center text-sm">{line.qty}</span>
                  <button
                    aria-label={`Increase ${line.name}`}
                    onClick={() => onQtyChange(line.itemId, line.qty + 1)}
                    className="bg-coal-700 hover:bg-coal-800 h-7 w-7 rounded-md text-sm"
                  >
                    +
                  </button>
                </div>

                <span className="tabular w-20 text-right text-sm font-semibold">
                  {formatINR(lineTotalP(line))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-coal-700 flex flex-col gap-4 border-t px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm tracking-widest uppercase">Total</span>
          <span className="text-octane tabular text-2xl font-bold">{formatINR(total)}</span>
        </div>

        <fieldset className="flex gap-2">
          <legend className="sr-only">Payment method</legend>
          {PAYMENTS.map((option) => (
            <label
              key={option.id}
              className={`flex-1 cursor-pointer rounded-lg py-2 text-center text-sm transition-colors ${
                payment === option.id
                  ? 'bg-cream font-semibold text-black'
                  : 'bg-coal-800 text-cream/70 hover:bg-coal-700'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={option.id}
                checked={payment === option.id}
                onChange={() => onPaymentChange(option.id)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div className="flex gap-2">
          <button
            onClick={onClear}
            disabled={empty}
            className="bg-coal-800 text-cream/70 hover:bg-coal-700 rounded-lg px-4 py-3 text-sm disabled:opacity-40"
          >
            Clear
          </button>
          <button
            onClick={onCharge}
            disabled={empty || saving}
            className="bg-octane hover:bg-octane-dim font-display flex-1 rounded-lg py-3 tracking-widest text-black uppercase disabled:opacity-40"
          >
            {saving ? 'Saving…' : <>Charge &amp; Print</>}
          </button>
        </div>
      </div>
    </aside>
  )
}
