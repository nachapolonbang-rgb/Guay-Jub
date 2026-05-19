// app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: 'asc' },
  });

  const withStatus = items.map((item: typeof items[0]) => ({
    ...item,
    status:
      item.qty === 0 ? 'out' : item.qty <= item.minQty ? 'low' : 'ok',
  }));

  return NextResponse.json(withStatus);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, qty, unit, minQty, cost } = body;

  if (!name || qty == null || minQty == null) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });
  }

  const item = await prisma.inventoryItem.create({
    data: { name, qty: Number(qty), unit: unit ?? 'กก.', minQty: Number(minQty), cost: Number(cost ?? 0) },
  });

  return NextResponse.json({ ...item, status: qty === 0 ? 'out' : qty <= minQty ? 'low' : 'ok' }, { status: 201 });
}