import { getOrder } from '@/src/backend/services/order.service'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ ต้อง await params ก่อน
    const { id } = await context.params

    console.log('ID:', id)

    const parsedId = parseInt(id)

    if (isNaN(parsedId)) {
      return Response.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const order = await getOrder(parsedId)

    if (!order) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return Response.json(order)

  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}