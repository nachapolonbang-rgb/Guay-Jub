import prisma from '@/src/backend/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = 'your-secret-key-change-in-production';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return NextResponse.json({ message: 'Wrong password' }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const res = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });

  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
  });

  return res;
}