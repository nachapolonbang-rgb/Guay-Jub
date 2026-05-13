import { z } from 'zod'
import { getOrder, updateOrderStatus, updateOrderPaymentStatus, deleteOrder } from '@/src/backend/services/order.service'

const updateOrderSchema = z.object({
  status: z.enum(['new', 'cooking', 'ready', 'done']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'cancelled']).optional(),
})

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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const parsedId = parseInt(id)

    if (isNaN(parsedId)) {
      return Response.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const parsed = updateOrderSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    let order = await getOrder(parsedId)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (parsed.data.status) {
      order = await updateOrderStatus(parsedId, parsed.data.status)
    }

    if (parsed.data.paymentStatus) {
      order = await updateOrderPaymentStatus(parsedId, parsed.data.paymentStatus)
    }

    return Response.json(order)
  } catch (error: any) {
    if (error?.message?.includes('Record to update not found')) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const parsedId = parseInt(id)

    if (isNaN(parsedId)) {
      return Response.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    const existing = await getOrder(parsedId)
    if (!existing) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const deleted = await deleteOrder(parsedId)
    return Response.json(deleted)

  } catch (error) {
    return Response.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}