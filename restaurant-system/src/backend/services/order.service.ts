export async function createOrder(data: any) {
  // Mock implementation - replace with actual database logic later
  return {
    id: Date.now(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}