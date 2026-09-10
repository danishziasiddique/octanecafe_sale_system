'use client'

import { useState } from 'react'
import { CATEGORIES, MENU } from '@/data/menu'
import { formatINR } from '@/lib/money'
import type { CategoryId, MenuItem } from '@/lib/types'

type MenuBoardProps = {
  onSelect: (item: MenuItem) => void
}

export default function MenuBoard({ onSelect }: MenuBoardProps) {
  const [active, setActive] = useState<CategoryId>('box-meals')

  const items = MENU.filter((item) => item.category === active && item.available !== false)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div role="tablist" aria-label="Menu categories" className="flex flex-wrap gap-2 pb-4">
        {CATEGORIES.map((category) => {
          const selected = category.id === active
          return (
            <button
              key={category.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(category.id)}
              className={`font-display rounded-lg px-4 py-2 text-sm tracking-wide uppercase transition-colors ${
                selected ? 'bg-octane text-black' : 'bg-coal-800 text-cream/70 hover:bg-coal-700'
              }`}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-1 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="border-coal-700 bg-coal-900 hover:border-octane focus-visible:border-octane flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none"
          >
            <span className="font-display text-base leading-tight tracking-wide uppercase">
              {item.name}
            </span>
            {item.note ? <span className="text-cream/50 text-xs">{item.note}</span> : null}
            <span className="text-octane tabular mt-auto text-sm font-semibold">
              {formatINR(item.priceP)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
