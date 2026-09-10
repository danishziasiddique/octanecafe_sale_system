import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import AuthGate from '@/components/AuthGate'
import { resetForTests } from '@/lib/authStore'

function Till() {
  return <p>Current Order</p>
}

function renderGate() {
  return render(
    <AuthGate>
      <Till />
    </AuthGate>,
  )
}

async function typePin(user: ReturnType<typeof userEvent.setup>, pin: string) {
  for (const digit of pin) {
    await user.click(screen.getByRole('button', { name: digit }))
  }
}

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  resetForTests()
})

describe('AuthGate', () => {
  it('asks a brand new device to choose a PIN, and hides the till', async () => {
    renderGate()

    expect(await screen.findByText('Set a 4-digit PIN')).toBeInTheDocument()
    expect(screen.queryByText('Current Order')).not.toBeInTheDocument()
  })

  it('confirms the new PIN before accepting it', async () => {
    const user = userEvent.setup()
    renderGate()
    await screen.findByText('Set a 4-digit PIN')

    await typePin(user, '4821')

    expect(await screen.findByText('Enter it again')).toBeInTheDocument()
  })

  it('starts over when the two PINs do not match', async () => {
    const user = userEvent.setup()
    renderGate()
    await screen.findByText('Set a 4-digit PIN')

    await typePin(user, '4821')
    await screen.findByText('Enter it again')
    await typePin(user, '9999')

    expect(await screen.findByText(/did not match/i)).toBeInTheDocument()
    expect(screen.getByText('Set a 4-digit PIN')).toBeInTheDocument()
  })

  it('opens the till once the PIN is set and confirmed', async () => {
    const user = userEvent.setup()
    renderGate()
    await screen.findByText('Set a 4-digit PIN')

    await typePin(user, '4821')
    await screen.findByText('Enter it again')
    await typePin(user, '4821')

    expect(await screen.findByText('Current Order')).toBeInTheDocument()
  })

  it('locks again on a fresh session and rejects a wrong PIN', async () => {
    const user = userEvent.setup()
    const first = renderGate()
    await screen.findByText('Set a 4-digit PIN')
    await typePin(user, '4821')
    await screen.findByText('Enter it again')
    await typePin(user, '4821')
    await screen.findByText('Current Order')
    first.unmount()

    // Closing the tab clears sessionStorage but not the stored PIN.
    window.sessionStorage.clear()
    resetForTests()
    renderGate()

    expect(await screen.findByText('Enter your PIN')).toBeInTheDocument()

    await typePin(user, '0000')
    expect(await screen.findByText(/wrong pin/i)).toBeInTheDocument()
    expect(screen.queryByText('Current Order')).not.toBeInTheDocument()
  })

  it('opens the till on the correct PIN in a fresh session', async () => {
    const user = userEvent.setup()
    const first = renderGate()
    await screen.findByText('Set a 4-digit PIN')
    await typePin(user, '4821')
    await screen.findByText('Enter it again')
    await typePin(user, '4821')
    await screen.findByText('Current Order')
    first.unmount()

    window.sessionStorage.clear()
    resetForTests()
    renderGate()
    await screen.findByText('Enter your PIN')

    await typePin(user, '4821')

    expect(await screen.findByText('Current Order')).toBeInTheDocument()
  })

  it('never stores the PIN in readable form', async () => {
    const user = userEvent.setup()
    renderGate()
    await screen.findByText('Set a 4-digit PIN')
    await typePin(user, '4821')
    await screen.findByText('Enter it again')
    await typePin(user, '4821')
    await screen.findByText('Current Order')

    expect(JSON.stringify(window.localStorage)).not.toContain('4821')
  })
})
