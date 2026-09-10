/*
 * PIN hashing.
 *
 * Read this before trusting it with anything: in a browser-only app the PIN
 * gate is a COUNTER LOCK, not authentication. Every check below runs on the
 * customer's own machine, so anyone with devtools can read the stored hash,
 * call these functions directly, or simply flip the "unlocked" flag. It stops
 * a customer picking up the tablet. It does not stop a determined person.
 *
 * Real authentication needs a server that holds the secret and decides — which
 * arrives with the phase-2 database, not before.
 *
 * Given that, why hash at all rather than store "1234"? Two honest reasons:
 * a plain PIN is readable over your shoulder in devtools, and people reuse
 * PINs across their bank card and their phone. Hashing costs nothing and
 * avoids storing a number that means something elsewhere.
 *
 * The salt makes each install's hash unique, so a stored hash cannot be
 * compared against a precomputed table of the 10,000 four-digit PINs.
 */

export const PIN_LENGTH = 4

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)
}

export function createSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(new Uint8Array(digest))
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  return (await hashPin(pin, salt)) === expectedHash
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
