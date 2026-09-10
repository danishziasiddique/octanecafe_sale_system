/** A single sellable thing on the menu. */
export type MenuItem = {
  id: string
  name: string
  /** Price in paise. See src/lib/money.ts for why this is an integer. */
  priceP: number
  category: CategoryId
  /** Shown under the name on the order screen. Optional. */
  note?: string
  /** Temporarily hide from the order screen without deleting history. */
  available?: boolean
}

export type CategoryId =
  'box-meals' | 'burgers' | 'twisters' | 'buckets' | 'chicken' | 'fries' | 'drinks' | 'dips'

export type Category = {
  id: CategoryId
  label: string
}

/** One line on a bill: an item, plus how many. */
export type OrderLine = {
  itemId: string
  /** Copied from the menu at the time of sale, so old bills keep their prices. */
  name: string
  unitPriceP: number
  qty: number
}

export type PaymentMethod = 'cash' | 'upi' | 'card'

export type Order = {
  id: string
  /** Human-facing short number shown on the receipt, e.g. 7 -> "#007". */
  token: number
  lines: OrderLine[]
  totalP: number
  payment: PaymentMethod
  /** ISO timestamp. Stored as a string so it survives JSON round-tripping. */
  placedAt: string
}
