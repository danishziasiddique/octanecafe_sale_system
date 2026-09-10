'use client'

import LockScreen from '@/components/LockScreen'
import { useAuth } from '@/lib/useAuth'

type AuthGateProps = {
  children: React.ReactNode
}

/*
 * Renders the till only when the device is unlocked.
 *
 * Why a gate rather than a /login route with a redirect: the PIN lives in the
 * browser, so the server has no idea whether you are unlocked. A redirect
 * would mean rendering the till, discovering on the client that it is locked,
 * then navigating away — a visible flash of the order screen every load. The
 * gate never renders the till at all until the PIN is in.
 *
 * `children` is passed down from the server layout, so the header and pages
 * stay Server Components even though this wrapper is a Client Component.
 */
export default function AuthGate({ children }: AuthGateProps) {
  const { unlocked, ready } = useAuth()

  // Before the first browser read we know nothing. Rendering either branch
  // would be a guess, and the wrong guess flashes the till to a locked device.
  if (!ready) return null

  if (!unlocked) return <LockScreen />

  return <>{children}</>
}
