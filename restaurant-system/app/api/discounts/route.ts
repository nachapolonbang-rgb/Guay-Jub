import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const discounts = await prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(discounts);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.code || !body.description || !body.type || body.value == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const discount = await prisma.discountCode.create({
      data: {
        code: body.code,
        description: body.description,
        type: body.type,
        value: Number(body.value),
        minOrder: Number(body.minOrder) || 0,
        maxUses: body.maxUses ? Number(body.maxUses) : null,
        active: body.active !== undefined ? body.active : true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(discount, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 });
  }
}