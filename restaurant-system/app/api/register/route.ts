import prisma from '@/src/backend/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = 'your-secret-key-change-in-production';

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  const name = String(body.name || '');

  // ✅ 1. check ว่าง
  if (!email || !password) {
    return NextResponse.json(
      { message: 'Missing fields' },
      { status: 400 }
    );
  }

  // ✅ 2. check email format
  if (!/\S+@\S+\.\S+/.test(email)) {
    return NextResponse.json(
      { message: 'Invalid email' },
      { status: 400 }
    );
  }

  // ✅ 3. check password strength
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    return NextResponse.json(
      { message: 'Weak password' },
      { status: 400 }
    );
  }

  // ✅ 4. check email ซ้ำ
  const exist = await prisma.user.findUnique({
    where: { email },
  });

  if (exist) {
    return NextResponse.json(
      { message: 'Email already exists' },
      { status: 400 }
    );
  }

  // ✅ 5. hash password
  const hash = await bcrypt.hash(password, 10);

  // ✅ 6. create user
  await prisma.user.create({
    data: {
      email,
      password: hash,
      name, // optional
    },
  });

  return NextResponse.json({ success: true });
}