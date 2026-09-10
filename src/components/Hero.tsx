type HeroProps = {
  title: string
  tagline?: string
}

export default function Hero({ title, tagline }: HeroProps) {
  return (
    <section className="flex flex-col items-center gap-3 py-20 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      {tagline ? <p className="text-lg text-neutral-500">{tagline}</p> : null}
    </section>
  )
}
