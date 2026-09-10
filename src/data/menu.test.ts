import { describe, expect, it } from 'vitest'
import { CATEGORIES, MENU } from '@/data/menu'

/*
 * These guard the menu DATA, not the UI. The menu was transcribed by hand
 * from the printed board, and a duplicated id or a stray zero in a price is
 * exactly the kind of mistake you would otherwise discover mid-service.
 */
describe('menu data', () => {
  it('has no duplicate item ids', () => {
    const ids = MENU.map((item) => item.id)
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)

    expect(duplicates).toEqual([])
  })

  it('has no duplicate item names', () => {
    const names = MENU.map((item) => item.name)
    const duplicates = names.filter((name, i) => names.indexOf(name) !== i)

    expect(duplicates).toEqual([])
  })

  it('puts every item in a category that exists', () => {
    const known = new Set(CATEGORIES.map((category) => category.id))
    const orphans = MENU.filter((item) => !known.has(item.category))

    expect(orphans).toEqual([])
  })

  it('leaves no category empty', () => {
    const empty = CATEGORIES.filter(
      (category) => !MENU.some((item) => item.category === category.id),
    )

    expect(empty).toEqual([])
  })

  it('prices every item as a positive whole number of paise', () => {
    const bad = MENU.filter((item) => !Number.isInteger(item.priceP) || item.priceP <= 0)

    expect(bad).toEqual([])
  })

  it('prices everything in whole rupees, as the printed menu does', () => {
    const withPaise = MENU.filter((item) => item.priceP % 100 !== 0)

    expect(withPaise).toEqual([])
  })

  it('matches a few prices spot-checked against the printed board', () => {
    const price = (id: string) => MENU.find((item) => item.id === id)?.priceP

    expect(price('family-bucket')).toBe(119900)
    expect(price('zinger-burger')).toBe(11900)
    expect(price('chizza')).toBe(29900)
    expect(price('momos-8')).toBe(11900)
    expect(price('dip-garlic')).toBe(2000)
  })
})
