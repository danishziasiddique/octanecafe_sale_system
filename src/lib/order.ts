import type { MenuItem, Order, OrderLine } from '@/lib/types'

/*
 * Pure cart logic — no React, no browser APIs.
 *
 * Keeping these as plain functions that take state and return NEW state
 * (rather than mutating it) means React can reliably detect changes, and it
 * means every rule here can be unit tested without rendering a component.
 */

/** Add one of `item`, or bump the quantity if it is already on the bill. */
export function addItem(lines: OrderLine[], item: MenuItem): OrderLine[] {
  const existing = lines.find((line) => line.itemId === item.id)

  if (existing) {
    return lines.map((line) => (line.itemId === item.id ? { ...line, qty: line.qty + 1 } : line))
  }

  return [...lines, { itemId: item.id, name: item.name, unitPriceP: item.priceP, qty: 1 }]
}

/** Change a line's quantity. Dropping to zero removes the line entirely. */
export function setQty(lines: OrderLine[], itemId: string, qty: number): OrderLine[] {
  if (qty <= 0) return lines.filter((line) => line.itemId !== itemId)
  return lines.map((line) => (line.itemId === itemId ? { ...line, qty } : line))
}

export function removeItem(lines: OrderLine[], itemId: string): OrderLine[] {
  return lines.filter((line) => line.itemId !== itemId)
}

export function lineTotalP(line: OrderLine): number {
  return line.unitPriceP * line.qty
}

export function orderTotalP(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotalP(line), 0)
}

export function itemCount(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

/**
 * Token numbers restart at 1 each day, which is how a counter actually works.
 * `orders` may contain older days; we only look at today's.
 */
export function nextToken(orders: Order[], now: Date = new Date()): number {
  const today = orders.filter((order) => isSameDay(new Date(order.placedAt), now))
  if (today.length === 0) return 1
  return Math.max(...today.map((order) => order.token)) + 1
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Sum of completed sales for a given day. */
export function salesTotalP(orders: Order[], day: Date = new Date()): number {
  return orders
    .filter((order) => isSameDay(new Date(order.placedAt), day))
    .reduce((sum, order) => sum + order.totalP, 0)
}
