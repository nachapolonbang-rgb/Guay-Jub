'use client';

// src/backend/hooks/useSettings.ts
//
// Drop-in replacement สำหรับ useLocalStorage ใน SettingsPage
// — โหลดจาก GET /api/settings ตอน mount
// — บันทึกผ่าน PUT /api/settings (debounced 600ms)
// — interface เหมือนกันทุกอย่าง: [value, setter, hydrated]

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface OpenHour {
  open: string;
  close: string;
  closed: boolean;
}

export interface ShopSettings {
  shopName:     string;
  shopPhone:    string;
  shopAddress:  string;
  shopNote:     string;
  isOpen:       boolean;
  hours:        OpenHour[];
  notifNew:     boolean;
  notifLowStock: boolean;
  notifDaily:   boolean;
  dailyTime:    string;
}

const DEFAULT_HOURS: OpenHour[] = [
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: true  },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
  { open: '08:00', close: '16:00', closed: false },
];

const DEFAULTS: ShopSettings = {
  shopName:     'ร้านก๋วยจั๊บป้าแดง',
  shopPhone:    '081-234-5678',
  shopAddress:  '123 ถ.สุขุมวิท กรุงเทพฯ',
  shopNote:     'เปิดทุกวัน ยกเว้นวันพุธ',
  isOpen:       true,
  hours:        DEFAULT_HOURS,
  notifNew:     true,
  notifLowStock: true,
  notifDaily:   false,
  dailyTime:    '22:00',
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettingsState] = useState<ShopSettings>(DEFAULTS);
  const [hydrated,  setHydrated]     = useState(false);
  const [saving,    setSaving]       = useState(false);
  const [saveError, setSaveError]    = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef  = useRef<Partial<ShopSettings>>({});

  // ── Load from API on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/settings')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ShopSettings) => {
        setSettingsState(prev => ({ ...prev, ...data }));
        setHydrated(true);
      })
      .catch(err => {
        console.error('[useSettings] load failed:', err);
        // ยังใช้ defaults ได้ — hydrate ต่อ
        setHydrated(true);
      });
  }, []);

  // ── Debounced save to API ─────────────────────────────────────────────────
  const flushSave = useCallback(async () => {
    const patch = pendingRef.current;
    if (Object.keys(patch).length === 0) return;
    pendingRef.current = {};

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/settings', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(patch),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ';
      setSaveError(msg);
      console.error('[useSettings] save failed:', err);
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Public setter — accepts partial update ────────────────────────────────
  const setSettings = useCallback(
    (patch: Partial<ShopSettings> | ((prev: ShopSettings) => Partial<ShopSettings>)) => {
      setSettingsState(prev => {
        const resolved = typeof patch === 'function' ? patch(prev) : patch;

        // Accumulate pending changes
        pendingRef.current = { ...pendingRef.current, ...resolved };

        // Debounce: flush after 600ms idle
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(flushSave, 600);

        return { ...prev, ...resolved };
      });
    },
    [flushSave]
  );

  // ── Explicit save (ใช้กับปุ่ม "บันทึก") ─────────────────────────────────
  const save = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await flushSave();
  }, [flushSave]);

  return { settings, setSettings, save, hydrated, saving, saveError };
}