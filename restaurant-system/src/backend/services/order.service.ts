import {
  createOrder as createOrderRepo,
  getOrders,
  getOrderById,
  updateOrderStatus as updateOrderStatusRepo,
  updateOrderPaymentStatus as updateOrderPaymentStatusRepo,
  deleteOrder as deleteOrderRepo,
} from '../repositories/order.repo'

export async function createOrder(data: any) {
  const calculatedTotal = data.items.reduce(
    (sum: number, item: any) => sum + (item.price * item.qty),
    0
  )

  return createOrderRepo({
    total:           calculatedTotal,
    items:           data.items,
    guestName:       data.guestName  ?? null,
    guestPhone:      data.guestPhone ?? null,
    orderType:       data.orderType  ?? 'dine-in',
    userId:          data.userId     ?? null,
    paymentMethod:   data.paymentMethod ?? null,
    paymentStatus:   data.paymentStatus ?? 'pending',
  })
}

export async function getAllOrders() {
  return getOrders()
}

export async function getOrder(id: number) {
  return getOrderById(id)
}

export async function updateOrderStatus(id: number, status: string) {
  const validStatuses = ['new', 'cooking', 'ready', 'done'] as const
  if (!validStatuses.includes(status as any)) {
    throw new Error('Invalid status')
  }

  return updateOrderStatusRepo(id, status)
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: string) {
  const validStatuses = ['pending', 'paid', 'cancelled'] as const
  if (!validStatuses.includes(paymentStatus as any)) {
    throw new Error('Invalid payment status')
  }

  return updateOrderPaymentStatusRepo(id, paymentStatus)
}

export async function deleteOrder(id: number) {
  return deleteOrderRepo(id)
}