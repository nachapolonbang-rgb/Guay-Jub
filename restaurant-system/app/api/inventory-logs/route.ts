// app/api/inventory-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');

  const logs = await prisma.inventoryLog.findMany({
    where: itemId ? { itemId: Number(itemId) } : undefined,
    include: { item: { select: { name: true, unit: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json(logs);
}