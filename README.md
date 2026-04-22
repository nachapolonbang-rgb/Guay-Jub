# 🍽️ Restaurant System — Production Guide (v4.3)

> เอกสารรวมฉบับสมบูรณ์: Architecture + Implementation + Best Practices สำหรับระบบร้านอาหารระดับ Production

---

# 📌 Overview

ระบบรองรับ:

* 👤 Customer (ลูกค้า)
* 👨‍🍳 Admin (ผู้ดูแลร้าน)
* 🛒 Order System (สั่งอาหาร)
* 🎯 Promotions (โปรโมชั่น)
* 📦 BOM (คุมต้นทุน)
* 🔐 Secure Auth (JWT + Refresh Token Rotation)
* ⚡ Performance (Cache + Rate Limit)
* 📊 Logging + Debugging

---

# 🧱 Project Structure

```bash
restaurant-system/
│
├── apps/
│   └── web/                    # Next.js (Frontend + API)
│
├── packages/
│   ├── ui/
│   ├── types/                  # Zod schemas + types
│   ├── utils/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── logs/
├── .env
└── README.md
```

---

# 🧠 Architecture

```text
Route Handler (API)
     ↓
Validation (Zod)
     ↓
Service Layer
     ↓
Repository Layer
     ↓
Prisma (Transaction)
     ↓
PostgreSQL
```

---

# 🧩 Core Modules

| Module    | Description           |
| --------- | --------------------- |
| Auth      | Login + Refresh Token |
| Menu      | จัดการเมนู            |
| Order     | ระบบสั่งอาหาร         |
| Promotion | ส่วนลด                |
| BOM       | คุมต้นทุน             |

---

# 🧩 Repository Layer (ตัวอย่างจริง)

```ts
// lib/repositories/order.repo.ts
import { prisma } from '@/lib/db'

export const orderRepo = {
  findById: (id: string) =>
    prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { items: true },
    }),

  findByUser: (userId: string) =>
    prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),

  create: (data: any) =>
    prisma.order.create({
      data,
      include: { items: true },
    }),

  updateStatus: (id: string, status: string) =>
    prisma.order.update({
      where: { id },
      data: { status },
    }),

  softDelete: (id: string) =>
    prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
}
```

---

# 🧱 Soft Delete (Auto Filter)

```ts
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()

export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
  },
})
```

---

# ⚡ Caching

```ts
import { unstable_cache } from 'next/cache'

export const getMenu = unstable_cache(
  async () => menuRepo.findAll(),
  ['menu-cache'],
  { revalidate: 60 }
)
```

---

# 📊 Logging

```ts
import pino from 'pino'
export const logger = pino({ level: 'info' })
```

---

# 🔐 Auth + Rotation

```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revoked   Boolean  @default(false)
}
```

---

# 🚀 Deployment

* Vercel (web + api)
* Railway (database)

---

# 🎯 Summary

ระบบนี้พร้อมใช้งานจริงระดับ production และสามารถ scale ต่อได้
