import prisma from '@/src/backend/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET() {
  const cookieStore = await cookies(); // ✅ สำคัญ
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { name, email } = await req.json();

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { ...(name && { name }), ...(email && { email }) },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}