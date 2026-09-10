import { deleteOrder, isBlobConfigured } from '@/lib/blob'

export async function DELETE(_request: Request, { params }: RouteContext<'/api/orders/[id]'>) {
  if (!isBlobConfigured()) {
    return Response.json({ configured: false, error: 'No Blob store connected' }, { status: 503 })
  }

  // In Next 16 route params are async and must be awaited.
  const { id } = await params

  try {
    const orders = await deleteOrder(id)
    return Response.json({ configured: true, orders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown storage error'
    return Response.json({ configured: true, error: message }, { status: 500 })
  }
}
