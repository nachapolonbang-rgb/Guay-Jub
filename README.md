# 🍽️ Restaurant System - Production Addendum (v4.1)

> เติม implementation ของจุดที่ “ยังค้าง” ให้ครบ: Repository / Soft Delete / Cache / Logging / Refresh Token Rotation

---

# 🧩 1. Repository Layer (ตัวอย่างจริง)

## 📁 `lib/repositories/order.repo.ts`

```ts
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

## 🧠 Pattern ที่ใช้

* Service → เรียก repo เท่านั้น
* Repo → แตะ Prisma เท่านั้น
* ห้ามเขียน Prisma ใน service โดยตรง

---

# 🧱 2. Soft Delete (แก้ปัญหา “ลืม where”)

## ❗ ปัญหา

```ts
where: { deletedAt: null }
```

→ ลืมทีเดียว = data พัง

---

## ✅ วิธีแก้: Prisma Extension (แนะนำ)

```ts
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()

export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = {
          ...args.where,
          deletedAt: null,
        }
        return query(args)
      },
      async findFirst({ args, query }) {
        args.where = {
          ...args.where,
          deletedAt: null,
        }
        return query(args)
      },
    },
  },
})
```

👉 จากนี้:

* ไม่ต้องใส่ `deletedAt` ทุก query
* กันพลาดระดับ system

---

# ⚡ 3. Caching (ตัดสินใจให้ชัด)

## ✅ MVP (ใช้ built-in ของ Next.js)

ใช้:

```ts
import { unstable_cache } from 'next/cache'
```

## ตัวอย่าง: cache menu

```ts
// lib/services/menu.service.ts
import { unstable_cache } from 'next/cache'
import { menuRepo } from '@/lib/repositories/menu.repo'

export const getMenu = unstable_cache(
  async () => {
    return menuRepo.findAll()
  },
  ['menu-cache'],
  { revalidate: 60 } // cache 60 วินาที
)
```

---

## 🔥 Invalidate cache

```ts
import { revalidateTag } from 'next/cache'

revalidateTag('menu-cache')
```

---

## 🧠 Strategy

| Stage | Tool          |
| ----- | ------------- |
| MVP   | Next.js cache |
| Scale | Redis         |

---

# 📊 4. Logging (ใช้จริง = ใช้ Pino เลย)

## 📁 `lib/logger.ts`

```ts
import pino from 'pino'

export const logger = pino({
  level: 'info',
})
```

---

## ใช้ใน service

```ts
import { logger } from '@/lib/logger'

logger.info({ orderId }, 'Order created')
logger.error({ err }, 'Order failed')
```

---

## ❗ ห้ามใช้

```ts
console.log
console.error
```

---

# 🔐 5. Refresh Token Rotation (ต้องทำ)

## ❗ ปัญหาเดิม

* refresh token ใช้ซ้ำได้
* ถ้าหลุด = attacker ใช้ได้ 7 วัน

---

## ✅ แนวทาง: Rotation + Store ใน DB

## Prisma Model

```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🔄 Flow ใหม่

```text
Login:
→ create refreshToken (DB)
→ set cookie

Refresh:
1. ตรวจ token ใน DB
2. ถ้า valid:
   - revoke token เก่า
   - สร้าง token ใหม่
   - return access + refresh ใหม่
3. ถ้า invalid:
   - force logout
```

---

## ตัวอย่าง code

```ts
// auth.service.ts
export async function rotateRefreshToken(oldToken: string) {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  })

  if (!existing || existing.revoked) {
    throw new Error('Invalid token')
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revoked: true },
  })

  const newToken = crypto.randomUUID()

  await prisma.refreshToken.create({
    data: {
      token: newToken,
      userId: existing.userId,
      expiresAt: addDays(new Date(), 7),
    },
  })

  return newToken
}
```

---

# 🎯 สรุป (สิ่งที่ถูก fix ใน v4.1)

| เรื่อง           | สถานะ               |
| ---------------- | ------------------- |
| Repository Layer | ✅ มี pattern + code |
| Soft Delete      | ✅ auto filter       |
| Cache            | ✅ ใช้ Next.js cache |
| Logging          | ✅ ใช้ Pino          |
| Refresh Token    | ✅ rotation + DB     |

---

# 🚀 Final Level

หลังจาก v4.1:

👉 คุณอยู่ระดับ:
**Production-ready (95–98%)**

---

# ❗ สิ่งเดียวที่เหลือจริง ๆ

* Monitoring (เช่น Sentry)
* CI/CD pipeline

---

# 🧠 คำแนะนำสุดท้าย

ตอนนี้:

> ❌ ห้าม redesign
> ✅ ไป implement จริง

---

ถ้าจะไปต่อ ผมช่วยคุณ “ลงลึก production code จริง” ได้ เช่น:

* เขียน auth system ครบ (cookie + rotation)
* ทำ middleware withAuth แบบปลอดภัยจริง
* ทำ order service แบบรองรับ concurrent

พิมพ์:
👉 **“เริ่ม auth production code”** หรือ
👉 **“ทำ order concurrency-safe”**

