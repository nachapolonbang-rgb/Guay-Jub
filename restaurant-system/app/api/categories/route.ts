// app/api/categories/route.ts
//
// ⚠️  ถ้า Prisma schema ของคุณ **ยังไม่มี** model Category ให้ใช้โหมด JSON file
// ที่เก็บใน public/data/categories.json แทนก่อน แล้วค่อย migrate DB ทีหลัง
//
// วิธีใช้: ระบบจะอ่าน/เขียน categories.json อัตโนมัติ
// เมื่อต้องการย้ายไป DB จริง ให้ uncomment ส่วน prisma และลบส่วน JSON file

import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// ── ถ้าต้องการใช้ Prisma ให้ uncomment บรรทัดนี้ ──
// import { prisma } from '@/lib/prisma';

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'categories.json');

interface Category {
  id:    number;
  name:  string;
  color: string;
}

async function readCategories(): Promise<Category[]> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as Category[];
  } catch {
    // ค่า default ถ้าไฟล์ยังไม่มี
    return [
      { id: 1, name: 'ก๋วยจั๊บ',    color: 'bg-amber-100 text-amber-700' },
      { id: 2, name: 'ผัก',          color: 'bg-emerald-100 text-emerald-700' },
      { id: 3, name: 'เครื่องดื่ม', color: 'bg-blue-100 text-blue-700' },
    ];
  }
}

async function writeCategories(cats: Category[]) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(cats, null, 2), 'utf-8');
}

/* GET /api/categories */
export async function GET() {
  const cats = await readCategories();
  return NextResponse.json(cats);
}

/* POST /api/categories  — เพิ่มหมวดหมู่ใหม่ */
export async function POST(req: Request) {
  try {
    const body = await req.json() as { name?: string; color?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const cats   = await readCategories();
    const maxId  = cats.reduce((m, c) => Math.max(m, c.id), 0);
    const newCat: Category = {
      id:    maxId + 1,
      name:  body.name.trim(),
      color: body.color ?? 'bg-zinc-100 text-zinc-700',
    };
    await writeCategories([...cats, newCat]);
    return NextResponse.json(newCat, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

/* PUT /api/categories  — แก้ไขหมวดหมู่ */
export async function PUT(req: Request) {
  try {
    const body = await req.json() as { id?: number; name?: string; color?: string };
    if (!body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const cats    = await readCategories();
    const updated = cats.map(c =>
      c.id === body.id
        ? { ...c, name: body.name?.trim() ?? c.name, color: body.color ?? c.color }
        : c,
    );
    await writeCategories(updated);
    return NextResponse.json(updated.find(c => c.id === body.id));
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

/* DELETE /api/categories?id=X */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const cats = await readCategories();
    await writeCategories(cats.filter(c => c.id !== id));
    return NextResponse.json({ deleted: id });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}