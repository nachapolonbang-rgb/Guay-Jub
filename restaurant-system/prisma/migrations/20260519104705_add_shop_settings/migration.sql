-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "shopName" TEXT NOT NULL DEFAULT 'ร้านก๋วยจั๊บป้าแดง',
    "shopPhone" TEXT NOT NULL DEFAULT '081-234-5678',
    "shopAddress" TEXT NOT NULL DEFAULT '123 ถ.สุขุมวิท กรุงเทพฯ',
    "shopNote" TEXT NOT NULL DEFAULT 'เปิดทุกวัน ยกเว้นวันพุธ',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "hours" TEXT NOT NULL DEFAULT '[]',
    "notifNew" BOOLEAN NOT NULL DEFAULT true,
    "notifLowStock" BOOLEAN NOT NULL DEFAULT true,
    "notifDaily" BOOLEAN NOT NULL DEFAULT false,
    "dailyTime" TEXT NOT NULL DEFAULT '22:00',
    "updatedAt" DATETIME NOT NULL
);
