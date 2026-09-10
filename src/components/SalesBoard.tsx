'use client'

import { useState } from 'react'
import StorageNotice from '@/components/StorageNotice'
import ReceiptDialog from '@/components/ReceiptDialog'
import { formatINR, formatToken } from '@/lib/money'
import { isSameDay, itemCount } from '@/lib/order'
import { useOrders } from '@/lib/useOrders'
import type { Order } from '@/lib/types'

export default function SalesBoard() {
  const { orders, ready, saving, error, backend, removeOrder } = useOrders()
  const [reprint, setReprint] = useState<Order | null>(null)

  const today = orders.filter((order) => isSameDay(new Date(order.placedAt), new Date()))
  const todayTotalP = today.reduce((sum, order) => sum + order.totalP, 0)
  const todayItems = today.reduce((sum, order) => sum + itemCount(order.lines), 0)

  return (
    <main className="no-print flex flex-1 flex-col gap-6 p-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Today's Sales" value={formatINR(todayTotalP)} accent />
        <Stat label="Orders Today" value={String(today.length)} />
        <Stat label="Items Sold" value={String(todayItems)} />
      </section>

      <StorageNotice backend={backend} error={error} />

      <section className="border-coal-700 bg-coal-900 flex-1 rounded-2xl border">
        <header className="border-coal-700 border-b px-5 py-4">
          <h2 className="font-display text-lg tracking-widest uppercase">All Orders</h2>
        </header>

        {!ready ? (
          <p className="text-cream/40 px-5 py-10 text-sm">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-cream/40 px-5 py-10 text-sm">
            No sales recorded yet. Take an order on the Till screen.
          </p>
        ) : (
          <ul className="divide-coal-800 divide-y">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center gap-4 px-5 py-3">
                <span className="font-display text-octane tabular w-16 text-sm">
                  {formatToken(order.token)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {order.lines.map((line) => `${line.name} ×${line.qty}`).join(', ')}
                  </p>
                  <p className="text-cream/40 text-xs">
                    {new Date(order.placedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    &middot; {order.payment.toUpperCase()}
                  </p>
                </div>
                <span className="tabular text-sm font-semibold">{formatINR(order.totalP)}</span>
                <button
                  onClick={() => setReprint(order)}
                  className="bg-coal-800 hover:bg-coal-700 rounded-md px-3 py-1.5 text-xs"
                >
                  Reprint
                </button>
                <button
                  onClick={() => void removeOrder(order.id).catch(() => {})}
                  disabled={saving}
                  aria-label={`Delete order ${formatToken(order.token)}`}
                  className="text-cream/30 hover:text-octane px-2 text-xs"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {reprint ? (
        <ReceiptDialog
          order={reprint}
          onClose={() => setReprint(null)}
          closeLabel="Close"
          label="Reprint bill"
        />
      ) : null}
    </main>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-coal-700 bg-coal-900 rounded-2xl border px-5 py-4">
      <p className="text-cream/40 text-xs tracking-widest uppercase">{label}</p>
      <p className={`font-display tabular mt-1 text-3xl ${accent ? 'text-octane' : 'text-cream'}`}>
        {value}
      </p>
    </div>
  )
}
