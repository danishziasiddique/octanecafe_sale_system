import PosTerminal from '@/components/PosTerminal'

/*
 * A Server Component. It ships no JavaScript itself — it just renders
 * <PosTerminal />, which is the client boundary. This is the pattern the
 * project conventions ask for: keep 'use client' as deep in the tree as
 * the interactivity actually requires.
 */
export default function TillPage() {
  return <PosTerminal />
}
