import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono, Oswald } from 'next/font/google'
import AuthGate from '@/components/AuthGate'
import LockButton from '@/components/LockButton'
import Logo from '@/components/Logo'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

/* Condensed, heavy display face — the closest free match to the logo's type. */
const oswald = Oswald({ variable: '--font-oswald', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The High Octane Café — Till',
  description: 'Order, bill and sales terminal for The High Octane Café.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          AuthGate is a Client Component, but everything inside it is passed as
          `children` from this Server Component — so the header and pages are
          still rendered on the server. Wrapping in a client component does not
          make the tree beneath it client-side.
        */}
        <AuthGate>
          <header className="no-print border-coal-800 flex items-center gap-4 border-b px-6 py-3">
            <Logo size={40} />
            <div className="mr-auto">
              <p className="font-display text-lg leading-none tracking-widest uppercase">
                High Octane
              </p>
              <p className="text-cream/40 text-[11px] tracking-wide">
                One life &middot; Two wheels &middot; No regrets
              </p>
            </div>

            <nav className="flex items-center gap-1">
              <NavLink href="/">Till</NavLink>
              <NavLink href="/sales">Sales</NavLink>
              <LockButton />
            </nav>
          </header>

          {children}
        </AuthGate>
      </body>
    </html>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:bg-coal-800 font-display rounded-lg px-4 py-2 text-sm tracking-widest uppercase"
    >
      {children}
    </Link>
  )
}
