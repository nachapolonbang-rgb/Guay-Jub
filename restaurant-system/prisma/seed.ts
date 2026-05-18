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

  await prisma.promotion.createMany({
    data: [
      { title:'ร้านเปิดทุกวัน',      description:'เปิดให้บริการทุกวัน เวลา 10:00–22:00 น.',              date:'ทุกวัน',         status:'active',   tag:'ข่าวสาร',   emoji:'🏪' },
      { title:'เมนูใหม่กำลังมา',     description:'เตรียมพบก๋วยเตี๋ยวสูตรพิเศษและของหวานใหม่เร็ว ๆ นี้', date:'สัปดาห์หน้า',   status:'upcoming', tag:'เมนูใหม่',  emoji:'🍜' },
      { title:'ดนตรีสดหน้าร้าน',     description:'ทุกคืนวันศุกร์ บรรยากาศดนตรีสด + อาหารร้อน ๆ',       date:'ทุกศุกร์ 18:00',status:'active',   tag:'กิจกรรม',  emoji:'🎵' },
      { title:'ปิดปรับปรุงระบบครัว', description:'ปิดชั่วคราว 20 พ.ค. เพื่อพัฒนาคุณภาพบริการ',          date:'20 พ.ค. 2026',  status:'upcoming', tag:'ประกาศ',    emoji:'🔧' },
      { title:'ลด 20% เมนูพิเศษ',    description:'ทุกวันอังคาร–พุธ รับส่วนลด 20% เมนูแนะนำ',            date:'อังคาร – พุธ',  status:'active',   tag:'โปรโมชั่น',emoji:'🎉', discount:'20%' },
    ],
  });

  await prisma.discountCode.createMany({
    data: [
      { code:'SAVE10',   description:'ลด 10 บาท สำหรับทุกออเดอร์',        type:'fixed',   value:10, minOrder:0,   maxUses:null, active:true,  expiresAt:null },
      { code:'FOOD20',   description:'ลด 20 บาท เมื่อสั่งขั้นต่ำ 100 บาท', type:'fixed',   value:20, minOrder:100, maxUses:50,   active:true,  expiresAt:new Date('2026-06-30') },
      { code:'VIP50',    description:'ลด 50 บาท สำหรับลูกค้า VIP',          type:'fixed',   value:50, minOrder:200, maxUses:20,   active:true,  expiresAt:new Date('2026-05-31') },
      { code:'SUMMER15', description:'ลด 15% ต้อนรับหน้าร้อน',              type:'percent', value:15, minOrder:0,   maxUses:100,  active:false, expiresAt:new Date('2026-08-30') },
    ],
  });

  console.log('✅ Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());