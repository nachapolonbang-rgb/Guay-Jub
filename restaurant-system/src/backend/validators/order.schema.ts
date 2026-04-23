import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      menuItemId: z.string().cuid(),
      quantity: z.number().int().min(1).max(99),
    })
  ).min(1, 'Order must have at least 1 item'),

  promotionCode: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>