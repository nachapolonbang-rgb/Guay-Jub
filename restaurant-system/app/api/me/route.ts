import prisma from '@/src/backend/db';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_SECRET = 'your-secret-key-change-in-production';

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