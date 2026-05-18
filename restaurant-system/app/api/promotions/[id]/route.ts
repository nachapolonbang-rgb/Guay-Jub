import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: Number(id) },
    });
    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }
    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const promotion = await prisma.promotion.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        description: body.description,
        detail: body.detail,
        date: body.date,
        status: body.status,
        tag: body.tag,
        emoji: body.emoji,
        discount: body.discount,
      },
    });
    return NextResponse.json(promotion);
  } catch {
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.promotion.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Promotion deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}