import { getOrdersByPhone } from '@/src/backend/services/order.service'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')?.trim()

    if (!phone) {
      return Response.json(
        { error: 'กรุณาระบุเบอร์โทรศัพท์' },
        { status: 400 }
      )
    }

    // รับเบอร์โทรแบบต่างๆ เช่น 0812345678 / 081-234-5678 / +66812345678
    const normalised = phone.replace(/[\s\-]/g, '')

    const orders = await getOrdersByPhone(normalised)
    return Response.json(orders)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch orders by phone' },
      { status: 500 }
    )
  }
}