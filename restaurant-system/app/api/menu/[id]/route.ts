// app/api/menu/[id]/route.ts  (แก้ไขจากของเดิม — เพิ่ม image field)
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const item = await prisma.menuItem.findUnique({ where: { id: Number(rawId) } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [body, { id: rawId }] = await Promise.all([req.json(), params]);
    const id = Number(rawId);

    const data: Record<string, unknown> = {};
    if (body.name        != null) data.name        = body.name;
    if (body.price       != null) data.price       = Number(body.price);
    if (body.cost        != null) data.cost        = Number(body.cost);
    if (body.category    != null) data.category    = body.category;
    if (body.available   != null) data.isAvailable = Boolean(body.available);
    if (body.isAvailable != null) data.isAvailable = Boolean(body.isAvailable);
    // ✅ image field ใหม่
    if (body.image       != null) data.image       = body.image;

    if (body.ingredients != null) {
      data.ingredients = typeof body.ingredients === 'string'
        ? body.ingredients
        : JSON.stringify(body.ingredients);
    }
    if (body.toppings != null) {
      data.toppings = typeof body.toppings === 'string'
        ? body.toppings
        : JSON.stringify(body.toppings);
    }

    const updated = await prisma.menuItem.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    await prisma.menuItem.delete({ where: { id: Number(rawId) } });
    return NextResponse.json({ deleted: Number(rawId) });
  } catch {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}