import { createOrder, getAllOrders } from '@/src/backend/services/order.service'
import { createOrderSchema } from '@/src/backend/validators/order.schema'

export async function GET() {
  try {
    const orders = await getAllOrders()
    return Response.json(orders)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = createOrderSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createOrder(parsed.data)

    return Response.json(result, { status: 201 })

  } catch (error) {
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}