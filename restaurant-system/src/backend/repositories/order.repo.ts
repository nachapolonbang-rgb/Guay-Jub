import prisma from '../db'

export async function createOrder(data: any) {
  try {
    const order = await prisma.order.create({
      data: {
        total:      data.total,
        // ✅ เพิ่มใหม่
        guestName:  data.guestName  ?? null,
        guestPhone: data.guestPhone ?? null,
        orderType:  data.orderType  ?? 'dine-in',
        userId:     data.userId     ?? null,
        items: {
          create: data.items.map((item: any) => ({
            name:  item.name,
            price: item.price,
            qty:   item.qty,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return order
  } catch (error) {
    console.error('createOrder repo error:', error)
    throw error
  }
}

// ✅ getOrders — เพิ่ม user มาด้วยเผื่อ admin ดู
export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return orders
  } catch (error) {
    console.error('getOrders repo error:', error)
    throw error
  }
}

export async function getOrderById(id: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return order
  } catch (error) {
    console.error('getOrderById repo error:', error)
    throw error
  }
}