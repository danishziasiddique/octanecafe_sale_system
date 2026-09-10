import { BlobPreconditionFailedError, get, put } from '@vercel/blob'
import type { Order } from '@/lib/types'

/*
 * SERVER ONLY. Never import this from a Client Component — it authenticates
 * with the Blob store and must not reach the browser.
 *
 * The whole order log lives in ONE private JSON blob. That is a deliberate
 * trade-off for a single-till café, and it has two failure modes worth
 * understanding:
 *
 * 1. STALE READS. Vercel's CDN caches blobs, and an overwrite can take up to
 *    60 seconds to propagate. Reading through the cache could hand back an
 *    order log missing the sale you just made — and the next write would then
 *    erase it. Every read here passes `useCache: false` to go straight to
 *    origin. This is why the store must be PRIVATE: public blobs are served
 *    from the CDN and cannot bypass it.
 *
 * 2. LOST UPDATES. Two writes racing means read-modify-write clobbering.
 *    Every write passes `ifMatch` with the ETag we read, so a concurrent
 *    change fails loudly instead of silently overwriting, and we retry.
 *
 * Neither is a concern a real database would make you think about. That is
 * the cost of using file storage for records.
 */

const ORDERS_PATH = 'orders/orders.json'
const MAX_WRITE_ATTEMPTS = 4

/**
 * Is a Blob store connected? Vercel injects BLOB_STORE_ID (OIDC, the default)
 * or BLOB_READ_WRITE_TOKEN. Without either, the app falls back to localStorage
 * so local development works with no setup.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN)
}

type ReadResult = {
  orders: Order[]
  /** Undefined when the blob does not exist yet, i.e. the very first sale. */
  etag: string | undefined
}

export async function readOrders(): Promise<ReadResult> {
  const result = await get(ORDERS_PATH, { access: 'private', useCache: false })

  // get() resolves to null when the blob has never been written.
  if (!result || result.statusCode !== 200) {
    return { orders: [], etag: undefined }
  }

  const text = await new Response(result.stream).text()

  try {
    const parsed: unknown = JSON.parse(text)
    if (!Array.isArray(parsed)) return { orders: [], etag: result.blob.etag }
    return { orders: parsed as Order[], etag: result.blob.etag }
  } catch {
    // Corrupt JSON: report it rather than silently starting a new empty log,
    // which would look like every past sale had vanished.
    throw new Error('Stored order log is not valid JSON')
  }
}

async function writeOrders(orders: Order[], etag: string | undefined): Promise<void> {
  await put(ORDERS_PATH, JSON.stringify(orders), {
    access: 'private',
    contentType: 'application/json',
    // ifMatch implies allowOverwrite. Omitted on the first write, when there
    // is nothing to match against.
    ...(etag ? { ifMatch: etag } : { allowOverwrite: true }),
  })
}

/**
 * Read, apply `change`, write back — retrying if someone else wrote in between.
 *
 * `change` must be pure: it may run several times.
 */
async function updateOrders(change: (orders: Order[]) => Order[]): Promise<Order[]> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const { orders, etag } = await readOrders()
    const next = change(orders)

    try {
      await writeOrders(next, etag)
      return next
    } catch (error) {
      if (!(error instanceof BlobPreconditionFailedError)) throw error
      // Someone wrote between our read and our write. Re-read and reapply.
      lastError = error
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Could not save the order after several attempts')
}

export async function appendOrder(order: Order): Promise<Order[]> {
  return updateOrders((orders) =>
    // Ignore a duplicate id so a retried request cannot bill twice.
    orders.some((existing) => existing.id === order.id) ? orders : [order, ...orders],
  )
}

export async function deleteOrder(id: string): Promise<Order[]> {
  return updateOrders((orders) => orders.filter((order) => order.id !== id))
}
