'use client'

import { useRef } from 'react'
import Receipt from '@/components/Receipt'
import { printReceipt } from '@/lib/print'
import type { Order } from '@/lib/types'

type ReceiptDialogProps = {
  order: Order
  onClose: () => void
  closeLabel?: string
  label?: string
}

/*
 * Shared by the till (after charging) and the sales list (reprint), so the
 * printed bill is identical either way.
 *
 * The ref is what makes correct paper sizing possible: printReceipt measures
 * this element to build the @page rule, since a receipt's height depends on
 * how many lines are on it.
 */
export default function ReceiptDialog({
  order,
  onClose,
  closeLabel = 'Done',
  label = 'Bill',
}: ReceiptDialogProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  return (
    <div
      role="dialog"
      aria-label={label}
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-black/80 p-6 print:static print:bg-white print:p-0"
    >
      <div ref={sheetRef}>
        <Receipt order={order} />
      </div>

      <div className="no-print flex gap-3">
        <button
          onClick={() => printReceipt(sheetRef.current)}
          className="bg-octane hover:bg-octane-dim font-display rounded-lg px-6 py-3 tracking-widest text-black uppercase"
        >
          Print Bill
        </button>
        <button
          onClick={onClose}
          className="bg-coal-800 text-cream hover:bg-coal-700 rounded-lg px-6 py-3 text-sm"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
