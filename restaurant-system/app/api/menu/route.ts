// app/api/menu/route.ts  (แก้ไขจากของเดิม — เพิ่ม image field)
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
        name:     body.name,
        price:    Number(body.price),
        cost:     Number(body.cost),
        category: body.category,
        ingredients: typeof body.ingredients === 'string'
          ? body.ingredients
          : JSON.stringify(body.ingredients ?? []),
        toppings: typeof body.toppings === 'string'
          ? body.toppings
          : JSON.stringify(body.toppings ?? []),
        isAvailable: body.available != null ? Boolean(body.available) : true,
        // ✅ image field ใหม่ — เก็บ path เช่น /images/menu/xxx.jpg
        ...(body.image ? { image: body.image } : {}),
      },
    });
    return NextResponse.json(menu, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 });
  }
}