// proxy.ts  ← ชื่อไฟล์ใหม่
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function proxy(req: NextRequest) {  // ← เปลี่ยนจาก middleware → proxy
  const token = req.cookies.get('token')?.value;

  console.log("JWT_SECRET:", JWT_SECRET);
  console.log("TOKEN:", token);

  if (!token || !JWT_SECRET) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("DECODED:", decoded);

    if (decoded.role !== 'ADMIN') {
      console.log("❌ Not ADMIN, role:", decoded.role);
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error("JWT ERROR:", err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};