import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const menu = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(menu);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || body.price == null || body.cost == null || !body.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const menu = await prisma.menuItem.create({
      data: {
        name: body.name,
        price: Number(body.price),
        cost: Number(body.cost),
        category: body.category,
        ingredients: typeof body.ingredients === 'string'
          ? body.ingredients
          : JSON.stringify(body.ingredients ?? []),
        toppings: typeof body.toppings === 'string'
          ? body.toppings
          : JSON.stringify(body.toppings ?? []),
        isAvailable: body.available != null ? Boolean(body.available) : true,
        // ✅ ลบ description ออก (ไม่มีใน schema)
        // ✅ ลบ available ออก (schema ใช้ isAvailable + มี default อยู่แล้ว)
        // ✅ ลบ sold ออก (มี default(0) ใน schema อยู่แล้ว)
      },
    });
    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}