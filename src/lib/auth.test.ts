import { describe, expect, it } from 'vitest'
import { PIN_LENGTH, createSalt, hashPin, isValidPin, verifyPin } from '@/lib/auth'

describe('isValidPin', () => {
  it('accepts exactly four digits', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin('0000')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('12345')).toBe(false)
    expect(isValidPin('12a4')).toBe(false)
    expect(isValidPin('')).toBe(false)
  })

  it('agrees with PIN_LENGTH', () => {
    expect(isValidPin('7'.repeat(PIN_LENGTH))).toBe(true)
  })
})

describe('createSalt', () => {
  it('is different every time, so two tills never share a hash', () => {
    const salts = new Set(Array.from({ length: 50 }, () => createSalt()))

    expect(salts.size).toBe(50)
  })
})

describe('hashPin', () => {
  it('never returns the PIN itself', async () => {
    const hash = await hashPin('1234', await Promise.resolve('salt'))

    expect(hash).not.toContain('1234')
    expect(hash).toHaveLength(64) // SHA-256 as hex
  })

  it('is deterministic for the same PIN and salt', async () => {
    const salt = createSalt()

    expect(await hashPin('1234', salt)).toBe(await hashPin('1234', salt))
  })

  it('gives the same PIN a different hash under a different salt', async () => {
    const a = await hashPin('1234', createSalt())
    const b = await hashPin('1234', createSalt())

    expect(a).not.toBe(b)
  })
})

describe('verifyPin', () => {
  it('accepts the right PIN', async () => {
    const salt = createSalt()
    const hash = await hashPin('4821', salt)

    expect(await verifyPin('4821', salt, hash)).toBe(true)
  })

  it('rejects a wrong PIN', async () => {
    const salt = createSalt()
    const hash = await hashPin('4821', salt)

    expect(await verifyPin('4822', salt, hash)).toBe(false)
  })

  it('rejects the right PIN against the wrong salt', async () => {
    const hash = await hashPin('4821', createSalt())

    expect(await verifyPin('4821', createSalt(), hash)).toBe(false)
  })
})
