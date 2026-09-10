import Image from 'next/image'

type LogoProps = {
  /** 'mark' is the wolf badge alone; 'full' is the complete lockup. */
  variant?: 'mark' | 'full'
  size?: number
  className?: string
}

/*
 * No 'use client' here — this renders to static HTML and needs no
 * interactivity, so it stays a Server Component and ships zero JS.
 */
export default function Logo({ variant = 'mark', size = 44, className }: LogoProps) {
  const src = variant === 'mark' ? '/logo-mark.png' : '/logo.png'
  const ratio = variant === 'mark' ? 386 / 400 : 622 / 700

  return (
    <Image
      src={src}
      alt="The High Octane Café"
      width={Math.round(size * ratio)}
      height={size}
      className={className}
      priority
    />
  )
}
