import type { Category, MenuItem } from '@/lib/types'
import { rupees } from '@/lib/money'

/*
 * The High Octane Café menu, transcribed from the printed board.
 * Pampore — NH44 Lethpora 'A', opposite Transmart, 192122.
 *
 * Two conventions worth knowing before you edit this:
 *
 * 1. Items that come in more than one size are separate entries with the
 *    size in the name ("Chicken Wings (4 pcs)"). The bill needs one price
 *    per tappable button, and this keeps the data model simple.
 * 2. `id` values are permanent. Past bills reference items by id, so rename
 *    a `name` freely but never recycle or change an `id`.
 */

export const CATEGORIES: Category[] = [
  { id: 'box-meals', label: 'Box Meals' },
  { id: 'burgers', label: 'Burgers' },
  { id: 'twisters', label: 'Twisters' },
  { id: 'buckets', label: 'Buckets' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'fries', label: 'Fries' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'dips', label: 'Dips & Add-ons' },
]

export const MENU: MenuItem[] = [
  // ---- Box Meals — "Happiness comes in a Box!" ----
  {
    id: 'zinger-meal-box',
    name: 'Zinger Meal Box',
    priceP: rupees(239),
    category: 'box-meals',
    note: '1 Zinger Burger + 2 Wings + 1 Fries + Small Pepsi',
  },
  {
    id: 'twister-meal-box',
    name: 'Twister Meal Box',
    priceP: rupees(269),
    category: 'box-meals',
    note: '1 Twister + 2 Wings + 1 Fries + Small Pepsi',
  },
  {
    id: 'big-daddy-meal-box',
    name: 'Big Daddy Meal Box',
    priceP: rupees(320),
    category: 'box-meals',
    note: '1 Big Daddy Burger + 2 Wings + 1 Fries + Small Pepsi',
  },
  {
    id: 'combo-meal-box',
    name: 'Combo Meal Box',
    priceP: rupees(399),
    category: 'box-meals',
    note: '1 Crispy Twister + 1 Zinger Burger + 2 Wings + 1 Dip + 1 Fries + Cold Drink',
  },

  // ---- Burgers — "Bold bites. Built for legends." ----
  {
    id: 'veggie-deluxe-burger',
    name: 'Veggie Deluxe Burger',
    priceP: rupees(99),
    category: 'burgers',
  },
  {
    id: 'veggie-cheese-burger',
    name: 'Veggie Cheese Burger',
    priceP: rupees(129),
    category: 'burgers',
  },
  { id: 'grilled-burger', name: 'Grilled Burger', priceP: rupees(129), category: 'burgers' },
  { id: 'zinger-burger', name: 'Zinger Burger', priceP: rupees(119), category: 'burgers' },
  {
    id: 'zinger-king-burger',
    name: 'Zinger King Burger',
    priceP: rupees(139),
    category: 'burgers',
  },
  {
    id: 'mexican-chicken-burger',
    name: 'Mexican Chicken Burger',
    priceP: rupees(149),
    category: 'burgers',
  },
  {
    id: 'peri-peri-chicken-burger',
    name: 'Peri Peri Chicken Burger',
    priceP: rupees(159),
    category: 'burgers',
  },
  { id: 'big-daddy-burger', name: 'Big Daddy Burger', priceP: rupees(179), category: 'burgers' },

  // ---- Chicken Twister — "Twisted with taste. Wrapped in love." ----
  { id: 'crispy-twister', name: 'Crispy Twister', priceP: rupees(139), category: 'twisters' },
  { id: 'mexican-twister', name: 'Mexican Twister', priceP: rupees(149), category: 'twisters' },
  { id: 'tangy-twister', name: 'Tangy Twister', priceP: rupees(149), category: 'twisters' },
  { id: 'peri-peri-twister', name: 'Peri Peri Twister', priceP: rupees(159), category: 'twisters' },

  // ---- Buckets — "Big flavors. Bigger cravings." ----
  {
    id: 'family-bucket',
    name: 'Family Bucket',
    priceP: rupees(1199),
    category: 'buckets',
    note: '8 Crispy Chicken + 4 Lollipop + 1 Pop Corn Chicken + 1 Dip + 1 Fries + 1 Ltr Coke',
  },
  {
    id: 'small-family-bucket',
    name: 'Small Family Bucket',
    priceP: rupees(729),
    category: 'buckets',
    note: '4 Crispy Chicken + 4 Lollipop + 4 Chicken Wings + 1 Dip + Small Pepsi',
  },
  {
    id: 'friends-bucket',
    name: 'Friends Bucket',
    priceP: rupees(539),
    category: 'buckets',
    note: '3 Crispy Chicken + 5 Lollipop + 1 Dip + Small Pepsi',
  },

  // ---- Chicken ----
  {
    id: 'chicken-wings-4',
    name: 'Chicken Wings (4 pcs)',
    priceP: rupees(139),
    category: 'chicken',
  },
  {
    id: 'chicken-wings-8',
    name: 'Chicken Wings (8 pcs)',
    priceP: rupees(259),
    category: 'chicken',
  },
  {
    id: 'chicken-lollipop-4',
    name: 'Chicken Lollipop (4 pcs)',
    priceP: rupees(169),
    category: 'chicken',
  },
  {
    id: 'chicken-lollipop-8',
    name: 'Chicken Lollipop (8 pcs)',
    priceP: rupees(309),
    category: 'chicken',
  },
  {
    id: 'boneless-strips-3',
    name: 'Boneless Chicken Strips (3 pcs)',
    priceP: rupees(139),
    category: 'chicken',
  },
  {
    id: 'boneless-strips-6',
    name: 'Boneless Chicken Strips (6 pcs)',
    priceP: rupees(239),
    category: 'chicken',
  },
  {
    id: 'chicken-nuggets-8',
    name: 'Chicken Nuggets (8 pcs)',
    priceP: rupees(199),
    category: 'chicken',
  },
  {
    id: 'momos-8',
    name: 'Momos (8 pcs)',
    priceP: rupees(119),
    category: 'chicken',
    note: 'Steamed, stuffed',
  },
  { id: 'popcorn-chicken', name: 'Popcorn Chicken', priceP: rupees(129), category: 'chicken' },
  {
    id: 'fiery-popcorn-chicken',
    name: 'Fiery Popcorn Chicken',
    priceP: rupees(139),
    category: 'chicken',
  },
  {
    id: 'chizza',
    name: 'Chizza',
    priceP: rupees(299),
    category: 'chicken',
    note: 'Chicken x Pizza',
  },
  {
    id: 'fried-crispy-chicken',
    name: 'Fried Crispy Chicken',
    priceP: rupees(99),
    category: 'chicken',
    note: 'Per piece',
  },
  {
    id: 'chilli-lime-chicken',
    name: 'Chilli Lime Chicken',
    priceP: rupees(159),
    category: 'chicken',
  },

  // ---- Fries — "Crispy. Crunchy. Can't stop." ----
  { id: 'salted-french-fries', name: 'Salted French Fries', priceP: rupees(99), category: 'fries' },
  { id: 'peri-peri-fries', name: 'Peri Peri Fries', priceP: rupees(109), category: 'fries' },
  { id: 'cheezy-fries', name: 'Cheezy Fries', priceP: rupees(129), category: 'fries' },

  // ---- Drinks — "Sip more. Stress less." ----
  { id: 'mint-mojito', name: 'Mint Mojito', priceP: rupees(119), category: 'drinks' },
  { id: 'green-apple', name: 'Green Apple', priceP: rupees(119), category: 'drinks' },
  { id: 'watermelon', name: 'Watermelon', priceP: rupees(119), category: 'drinks' },
  { id: 'coffee', name: 'Coffee', priceP: rupees(99), category: 'drinks' },
  { id: 'cold-drink', name: 'Cold Drink', priceP: rupees(20), category: 'drinks' },
  { id: 'water-small', name: 'Water (small)', priceP: rupees(10), category: 'drinks' },
  { id: 'water-large', name: 'Water (large)', priceP: rupees(20), category: 'drinks' },

  // ---- Dips — "The perfect dip for every bite." — all ₹20 ----
  { id: 'dip-mayonnaise', name: 'Mayonnaise Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-garlic', name: 'Garlic Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-tandoori', name: 'Tandoori Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-peri-peri', name: 'Peri Peri Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-thousand', name: 'Thousand Island Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-mexican', name: 'Mexican Dip', priceP: rupees(20), category: 'dips' },
  { id: 'dip-schezwan', name: 'Schezwan Dip', priceP: rupees(20), category: 'dips' },

  // ---- Flavours — "More spice. More soul." ----
  {
    id: 'flavour-peri-peri',
    name: 'Peri Peri Flavour',
    priceP: rupees(20),
    category: 'dips',
    note: 'Add-on for any meal',
  },
  {
    id: 'flavour-chilli-garlic',
    name: 'Chilli Garlic Flavour',
    priceP: rupees(20),
    category: 'dips',
    note: 'Add-on for any meal',
  },
]
