import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = 'your-secret-key-change-in-production';

// ✅ ดึง token จาก cookie
function getTokenFromCookie(request: NextRequest) {
  const cookie = request.cookies.get('token');
  return cookie?.value || null;
}

// ✅ ตรวจสอบ token
function verifyToken(token: string | null): boolean {
  if (!token) return false;
  try {
    // jwt.verify จะ throw error ถ้า token ไม่ valid
    const jwt = require('jsonwebtoken');
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ ป้องกันเฉพาะ /admin
  if (pathname.startsWith('/admin')) {
    const token = getTokenFromCookie(request);
    
    if (!verifyToken(token)) {
      // ✅ Redirect ไป login ถ้าไม่มี token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// ✅ กำหนด path ที่ middleware จะทำงาน
export const config = {
  matcher: '/admin/:path*',
};