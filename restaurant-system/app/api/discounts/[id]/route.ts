import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const discount = await prisma.discountCode.findUnique({
      where: { id: Number(id) },
    });
    if (!discount) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 });
    }
    return NextResponse.json(discount);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch discount code' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const discount = await prisma.discountCode.update({
      where: { id: Number(id) },
      data: {
        code: body.code,
        description: body.description,
        type: body.type,
        value: Number(body.value),
        minOrder: Number(body.minOrder) || 0,
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        active: body.active,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(discount);
  } catch {
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.discountCode.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Discount code deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete discount code' }, { status: 500 });
  }
}