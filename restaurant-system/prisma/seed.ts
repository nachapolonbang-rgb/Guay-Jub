import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.menuItem.createMany({
    data: [
      { name: 'ก๋วยจั๊บน้ำใส',               category: 'ก๋วยจั๊บ',   price: 50, cost: 20 },
      { name: 'ก๋วยจั๊บน้ำข้น',               category: 'ก๋วยจั๊บ',   price: 60, cost: 25 },
      { name: 'ก๋วยจั๊บพิเศษ (เพิ่มเครื่อง)', category: 'ก๋วยจั๊บ',   price: 80, cost: 35 },
      { name: 'ผักบุ้งไฟแดง',                 category: 'ผัก',        price: 40, cost: 12 },
      { name: 'คะน้าน้ำมันหอย',               category: 'ผัก',        price: 45, cost: 14 },
      { name: 'ถั่วงอกผัดน้ำมัน',             category: 'ผัก',        price: 35, cost: 10 },
      { name: 'น้ำเปล่า',                     category: 'เครื่องดื่ม', price: 10, cost: 3  },
      { name: 'น้ำอัดลม',                     category: 'เครื่องดื่ม', price: 20, cost: 8  },
    ],
  });
  console.log('✅ Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());