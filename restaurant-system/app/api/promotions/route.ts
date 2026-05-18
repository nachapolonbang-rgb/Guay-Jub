import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promotions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description || !body.date || !body.status || !body.tag) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        title: body.title,
        description: body.description,
        detail: body.detail,
        date: body.date,
        status: body.status,
        tag: body.tag,
        emoji: body.emoji || '📢',
        discount: body.discount,
      },
    });
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Failed to create promotion:', error);
    const message = process.env.NODE_ENV === 'production'
      ? 'Failed to create promotion'
      : (error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}