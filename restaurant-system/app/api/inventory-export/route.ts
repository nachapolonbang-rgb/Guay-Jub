// app/api/inventory-export/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });

  const header = 'ชื่อวัตถุดิบ,จำนวน,หน่วย,ขั้นต่ำ,ราคา/หน่วย,สถานะ,อัปเดตล่าสุด';
  const rows = items.map((item: typeof items[0]) => {
    const status = item.qty === 0 ? 'หมดแล้ว' : item.qty <= item.minQty ? 'ใกล้หมด' : 'พอ';
    return [
      item.name,
      item.qty,
      item.unit,
      item.minQty,
      item.cost,
      status,
      item.updatedAt.toISOString().split('T')[0],
    ].join(',');
  });

  const csv = '\uFEFF' + [header, ...rows].join('\n'); // BOM สำหรับ Excel ภาษาไทย

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}