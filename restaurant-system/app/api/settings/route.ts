// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_HOURS = [
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: true  }, // พุธ
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
];

// parse hours string → array ก่อนส่งออก
function parseSettings(settings: any) {
  return {
    ...settings,
    hours: typeof settings.hours === 'string'
      ? JSON.parse(settings.hours)
      : settings.hours,
  };
}

// ─── GET /api/settings ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const settings = await prisma.shopSettings.upsert({
      where:  { id: 1 },
      update: {},
      create: { id: 1, hours: JSON.stringify(DEFAULT_HOURS) },
    });

    return NextResponse.json(parseSettings(settings));
  } catch (err) {
    console.error('[GET /api/settings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PUT /api/settings ───────────────────────────────────────────────────────
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const allowed = [
      'shopName', 'shopPhone', 'shopAddress', 'shopNote',
      'isOpen',
      'hours',
      'notifNew', 'notifLowStock', 'notifDaily', 'dailyTime',
    ] as const;

    type AllowedKey = typeof allowed[number];

    const data: Partial<Record<AllowedKey, unknown>> = {};
    for (const key of allowed) {
      if (key in body) {
        // stringify hours ก่อนเก็บลง DB
        data[key] = key === 'hours' ? JSON.stringify(body[key]) : body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.shopSettings.upsert({
      where:  { id: 1 },
      create: { id: 1, hours: JSON.stringify(DEFAULT_HOURS), ...data },
      update: data,
    });

    return NextResponse.json(parseSettings(updated));
  } catch (err) {
    console.error('[PUT /api/settings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}