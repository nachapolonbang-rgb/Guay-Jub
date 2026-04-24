import { createOrder as createOrderRepo, getOrders, getOrderById } from '../repositories/order.repo'

export async function createOrder(data: any) {
  // Add any business logic here
  return await createOrderRepo(data)
}

export async function getAllOrders() {
  return await getOrders()
}

export async function getOrder(id: number) {
  return await getOrderById(id)
}