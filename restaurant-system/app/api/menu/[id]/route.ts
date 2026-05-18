import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;  // ✅ await params
    const body = await req.json();
    const updated = await prisma.menuItem.update({
      where: { id: Number(id) },
      data: {
        ...(body.name != null     && { name: body.name }),
        ...(body.price != null    && { price: Number(body.price) }),
        ...(body.cost != null     && { cost: Number(body.cost) }),
        ...(body.category != null && { category: body.category }),
        ...(body.ingredients != null && {
          ingredients: typeof body.ingredients === 'string'
            ? body.ingredients
            : JSON.stringify(body.ingredients ?? []),
        }),
        ...(body.toppings != null && {
          toppings: typeof body.toppings === 'string'
            ? body.toppings
            : JSON.stringify(body.toppings ?? []),
        }),
        ...(body.available != null && { isAvailable: Boolean(body.available) }),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;  // ✅ await params
    await prisma.menuItem.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}