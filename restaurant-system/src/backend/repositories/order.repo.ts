import prisma from '../db'

export async function createOrder(data: any) {
  try {
    const order = await prisma.order.create({
      data: {
        total:           data.total,
        guestName:       data.guestName  ?? null,
        guestPhone:      data.guestPhone ?? null,
        orderType:       data.orderType  ?? 'dine-in',
        userId:          data.userId     ?? null,
        paymentMethod:   data.paymentMethod ?? null,
        paymentStatus:   data.paymentStatus ?? 'pending',
        items: {
          create: data.items.map((item: any) => ({
            name:  item.name,
            price: item.price,
            qty:   item.qty,
            removedIngredients: item.removedIngredients ?? '[]',  // เพิ่ม
            toppings:           item.toppings           ?? '[]',  // เพิ่ม
            note:               item.note               ?? '',    // เพิ่ม
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

export async function updateOrderStatus(id: number, status: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return order
  } catch (error) {
    console.error('updateOrderStatus repo error:', error)
    throw error
  }
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: string) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return order
  } catch (error) {
    console.error('updateOrderPaymentStatus repo error:', error)
    throw error
  }
}

export async function deleteOrder(id: number) {
  try {
    const order = await prisma.order.delete({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    return order
  } catch (error) {
    console.error('deleteOrder repo error:', error)
    throw error
  }
}

export async function getOrdersByPhone(phone: string) {
  return prisma.order.findMany({
    where: {
      guestPhone: { contains: phone },
    },
    include: {
      items: true,   // ← ปรับตาม schema จริง
    },
    orderBy: { createdAt: 'desc' },
  })
}