import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Hero from './Hero'

describe('Hero', () => {
  it('renders the title', () => {
    render(<Hero title="Octane Cafe" />)
    expect(screen.getByRole('heading', { name: 'Octane Cafe' })).toBeInTheDocument()
  })

  it('renders the tagline when provided', () => {
    render(<Hero title="Octane Cafe" tagline="High-octane coffee" />)
    expect(screen.getByText('High-octane coffee')).toBeInTheDocument()
  })

  it('omits the tagline when absent', () => {
    render(<Hero title="Octane Cafe" />)
    expect(screen.queryByText(/high-octane/i)).not.toBeInTheDocument()
  })
})
