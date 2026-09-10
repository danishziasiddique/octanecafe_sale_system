'use client'

import { useState } from 'react'
import MenuBoard from '@/components/MenuBoard'
import OrderPanel from '@/components/OrderPanel'
import ReceiptDialog from '@/components/ReceiptDialog'
import StorageNotice from '@/components/StorageNotice'
import { addItem, nextToken, orderTotalP, setQty } from '@/lib/order'
import { useOrders } from '@/lib/useOrders'
import type { MenuItem, Order, OrderLine, PaymentMethod } from '@/lib/types'

/*
 * The one stateful component in the app. Everything below it
 * (MenuBoard, OrderPanel, Receipt) receives plain props, which keeps them
 * easy to test and easy to reason about.
 */
export default function PosTerminal() {
  const { orders, saving, error, backend, addOrder, clearError } = useOrders()
  const [lines, setLines] = useState<OrderLine[]>([])
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [lastOrder, setLastOrder] = useState<Order | null>(null)

  function handleSelect(item: MenuItem) {
    clearError()
    setLines((current) => addItem(current, item))
  }

  function handleQtyChange(itemId: string, qty: number) {
    setLines((current) => setQty(current, itemId, qty))
  }

  async function handleCharge() {
    if (lines.length === 0 || saving) return

    const order: Order = {
      id: crypto.randomUUID(),
      token: nextToken(orders),
      lines,
      totalP: orderTotalP(lines),
      payment,
      placedAt: new Date().toISOString(),
    }

    try {
      // Only clear the till AFTER the sale is safely stored. Saving now goes
      // over the network and can fail; clearing first would lose the order
      // with nothing to show the customer and no way to recover the basket.
      await addOrder(order)
    } catch {
      // useOrders has already put the message in `error` for the operator.
      return
    }

    setLastOrder(order)
    setLines([])
    setPayment('cash')
  }

  return (
    <>
      <div className="no-print flex min-h-0 flex-1 flex-col gap-6 p-6 lg:flex-row">
        <MenuBoard onSelect={handleSelect} />
        <div className="flex w-full flex-col gap-3 lg:w-[380px]">
          <StorageNotice backend={backend} error={error} />
          <OrderPanel
            lines={lines}
            payment={payment}
            saving={saving}
            onPaymentChange={setPayment}
            onQtyChange={handleQtyChange}
            onClear={() => setLines([])}
            onCharge={handleCharge}
          />
        </div>
      </div>

      {lastOrder ? <ReceiptDialog order={lastOrder} onClose={() => setLastOrder(null)} /> : null}
    </>
  )
}
