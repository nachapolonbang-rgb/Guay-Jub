import prisma from '../db'

export async function createOrder(data: any) {
  try {
    // Validate items is a valid array before storing
    if (!Array.isArray(data.items)) {
      throw new Error('items must be an array')
    }
    
    const order = await prisma.order.create({
      data: {
        items: JSON.stringify(data.items),
        total: data.total,
      },
    })

    return {
      ...order,
      items: JSON.parse(order.items),
    }
  } catch (error) {
    console.error('createOrder repo error:', error)
    throw error
  }
}

export async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(order => {
      try {
        return {
          ...order,
          items: JSON.parse(order.items),
        }
      } catch {
        // Handle invalid JSON stored in database
        return {
          ...order,
          items: order.items, // Return as-is if not valid JSON
        }
      }
    })
  } catch (error) {
    console.error('getOrders repo error:', error)
    throw error
  }
}

export async function getOrderById(id: number) {
  const order = await prisma.order.findUnique({
    where: { id },
  })
  if (!order) return null
  return {
    ...order,
    items: JSON.parse(order.items),
  }
}