import type { BackendKind } from '@/lib/ordersBackend'

type StorageNoticeProps = {
  backend: BackendKind | null
  error: string | null
}

/*
 * Tells the operator where the day's sales are actually going.
 *
 * This is not decoration. On localStorage the takings live in one browser and
 * vanish if site data is cleared — the person running the till deserves to
 * know that without reading the source.
 */
export default function StorageNotice({ backend, error }: StorageNoticeProps) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
      >
        <span className="font-semibold">Not saved.</span> {error} The order is still on screen — try
        charging again.
      </p>
    )
  }

  if (backend === 'local') {
    return (
      <p className="border-coal-700 bg-coal-900 text-cream/50 rounded-lg border px-4 py-2 text-xs">
        Saving to this browser only. Clearing site data erases the sales log.
      </p>
    )
  }

  return null
}
