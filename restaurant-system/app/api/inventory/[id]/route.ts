// app/api/inventory/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const body = await req.json();
  const { qty, changedBy, note } = body;

  if (qty == null || isNaN(Number(qty))) {
    return NextResponse.json({ error: 'qty ไม่ถูกต้อง' }, { status: 400 });
  }

  const current = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'ไม่พบรายการ' }, { status: 404 });

  const newQty = Number(qty);

  await prisma.inventoryLog.create({
    data: {
      itemId: id,
      prevQty: current.qty,
      newQty,
      changedBy: changedBy ?? 'staff',
      note: note ?? null,
    },
  });

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: { qty: newQty },
  });

  return NextResponse.json({
    ...updated,
    status: newQty === 0 ? 'out' : newQty <= updated.minQty ? 'low' : 'ok',
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  await prisma.inventoryItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}