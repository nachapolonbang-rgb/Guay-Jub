'use client';

import { useState } from 'react';
import Navbar from '@/src/backend/components/Navbar';
import {
  CalendarDays,
  Sparkles,
  Music2,
  UtensilsCrossed,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

// ---------------- TYPES ----------------
type PromotionNews = {
  id: number;
  title: string;
  desc: string;
  date: string;
  status: 'upcoming' | 'active' | 'ended';
  tag: string;
};

type Season = {
  key: string;
  nameTH: string;
  emoji: string;
  palette: {
    bg: string;
    surface: string;
    card: string;
    accent: string;
    accentSoft: string;
    text: string;
    muted: string;
    border: string;
    hero: string;
  };
  promos: PromotionNews[];
};

// ---------------- DATA ----------------
const SEASONS: Season[] = [
  {
    key: 'default',
    nameTH: 'ข่าวสารร้าน',
    emoji: '🍜',
    palette: {
      bg: '#f6f1ea',
      surface: '#fffaf4',
      card: '#ffffff',
      accent: '#c46b2d',
      accentSoft: '#f6e4d5',
      text: '#2b1d16',
      muted: '#7b6a60',
      border: '#eadccf',
      hero:
        'linear-gradient(135deg, #fff7ef 0%, #f6ecdf 50%, #fffaf5 100%)',
    },
    promos: [
      {
        id: 1,
        title: 'ร้านเปิดทุกวัน',
        desc:
          'เปิดให้บริการทุกวัน เวลา 10:00 - 22:00 น. พร้อมบริการนั่งทานและสั่งกลับบ้าน',
        date: 'อัปเดตล่าสุด',
        status: 'active',
        tag: 'ข่าวสาร',
      },
      {
        id: 2,
        title: 'เมนูใหม่กำลังมา',
        desc:
          'เตรียมพบกับก๋วยเตี๋ยวสูตรพิเศษและเมนูของหวานใหม่ประจำร้านเร็ว ๆ นี้',
        date: 'สัปดาห์หน้า',
        status: 'upcoming',
        tag: 'เมนูใหม่',
      },
      {
        id: 3,
        title: 'ดนตรีสดหน้าร้าน',
        desc:
          'ทุกคืนวันศุกร์พบกับบรรยากาศดนตรีสดและอาหารร้อน ๆ จากครัวของเรา',
        date: 'ทุกวันศุกร์ 18:00 น.',
        status: 'active',
        tag: 'กิจกรรม',
      },
      {
        id: 4,
        title: 'ปิดปรับปรุงระบบครัว',
        desc:
          'ร้านจะปิดปรับปรุงระบบครัวชั่วคราวในวันที่ 20 พฤษภาคม เพื่อพัฒนาคุณภาพบริการ',
        date: '20 พ.ค. 2026',
        status: 'upcoming',
        tag: 'ประกาศ',
      },
    ],
  },
];

// ---------------- PAGE ----------------
export default function PromotionsPage() {
  const [selectedSeason] = useState(SEASONS[0]);

  const p = selectedSeason.palette;

  const getStatus = (status: PromotionNews['status']) => {
    switch (status) {
      case 'active':
        return {
          text: 'กำลังจัด',
          bg: '#dcfce7',
          color: '#166534',
        };

      case 'upcoming':
        return {
          text: 'เร็ว ๆ นี้',
          bg: '#fef3c7',
          color: '#92400e',
        };

      default:
        return {
          text: 'สิ้นสุดแล้ว',
          bg: '#e5e7eb',
          color: '#4b5563',
        };
    }
  };

  const getIcon = (tag: string) => {
    switch (tag) {
      case 'กิจกรรม':
        return <Music2 size={18} />;

      case 'เมนูใหม่':
        return <UtensilsCrossed size={18} />;

      case 'ประกาศ':
        return <Megaphone size={18} />;

      default:
        return <Sparkles size={18} />;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: p.bg,
        fontFamily: "'Noto Sans Thai', sans-serif",
      }}
    >
      <Navbar />

      {/* HERO */}
      <section
        style={{
          background: p.hero,
          borderBottom: `1px solid ${p.border}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* blur */}
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: '#f5d3b8',
            filter: 'blur(90px)',
            top: -120,
            left: -80,
            opacity: 0.5,
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '90px 24px 70px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px',
              borderRadius: 999,
              background: p.accentSoft,
              color: p.accent,
              fontWeight: 700,
              marginBottom: 24,
            }}
          >
            <Sparkles size={18} />
            ข่าวสารล่าสุดของร้าน
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 74px)',
              lineHeight: 1,
              margin: 0,
              color: p.text,
              fontWeight: 900,
              letterSpacing: '-2px',
              marginBottom: 22,
              maxWidth: 780,
            }}
          >
            อัปเดตเมนูใหม่
            <br />
            และข่าวสารของร้าน
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              color: p.muted,
              maxWidth: 720,
              marginBottom: 34,
            }}
          >
            รวมประกาศ เมนูใหม่ กิจกรรม และข่าวสารต่าง ๆ
            ของร้านกับข้าวแม่ อัปเดตแบบเรียลไทม์
          </p>

          <button
            style={{
              background: p.accent,
              color: '#fff',
              border: 'none',
              padding: '16px 26px',
              borderRadius: 18,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 10px 30px rgba(196,107,45,0.25)',
            }}
          >
            ดูข่าวล่าสุด
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FEATURED CARD */}
      <section
        style={{
          maxWidth: 1200,
          margin: '-40px auto 0',
          padding: '0 24px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 32,
            border: `1px solid ${p.border}`,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.06)',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
          }}
        >
          {/* LEFT */}
          <div
            style={{
              padding: 42,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#dcfce7',
                color: '#166534',
                padding: '7px 14px',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 22,
              }}
            >
              🍜 กำลังฮิต
            </div>

            <h2
              style={{
                fontSize: 40,
                lineHeight: 1.2,
                marginBottom: 18,
                color: p.text,
              }}
            >
              เปิดตัวเมนูใหม่
              <br />
              สูตรต้นตำรับของร้าน
            </h2>

            <p
              style={{
                color: p.muted,
                lineHeight: 1.9,
                fontSize: 15,
                maxWidth: 520,
                marginBottom: 30,
              }}
            >
              พบกับเมนูใหม่ประจำฤดูกาลที่พัฒนาสูตรจากครัวของร้าน
              พร้อมวัตถุดิบสดใหม่ทุกวัน
              และบรรยากาศอบอุ่นเหมือนทานข้าวที่บ้าน
            </p>

            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <button
                style={{
                  background: p.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  padding: '14px 22px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ดูรายละเอียด
              </button>

              <button
                style={{
                  background: p.surface,
                  color: p.text,
                  border: `1px solid ${p.border}`,
                  borderRadius: 16,
                  padding: '14px 22px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ดูเมนูทั้งหมด
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div
            style={{
              background:
                'linear-gradient(135deg,#f4e1cf 0%,#f8efe5 100%)',
              minHeight: 360,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 140,
            }}
          >
            🍲
          </div>
        </div>
      </section>

      {/* NEWS GRID */}
      <section
        style={{
          maxWidth: 1200,
          margin: '50px auto 0',
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 26,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 34,
                marginBottom: 10,
                color: p.text,
              }}
            >
              ข่าวสารล่าสุด
            </h2>

            <p
              style={{
                color: p.muted,
                margin: 0,
              }}
            >
              อัปเดตกิจกรรมและประกาศจากทางร้าน
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {selectedSeason.promos.map((promo) => {
            const status = getStatus(promo.status);

            return (
              <div
                key={promo.id}
                style={{
                  background: p.card,
                  borderRadius: 28,
                  border: `1px solid ${p.border}`,
                  overflow: 'hidden',
                  transition: '0.25s',
                  boxShadow: '0 10px 35px rgba(0,0,0,0.04)',
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    height: 210,
                    background:
                      'linear-gradient(135deg,#f6e5d6 0%,#fef7f2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 68,
                    position: 'relative',
                  }}
                >
                  {getIcon(promo.tag)}

                  <div
                    style={{
                      position: 'absolute',
                      top: 18,
                      left: 18,
                      background: status.bg,
                      color: status.color,
                      padding: '7px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {status.text}
                  </div>
                </div>

                {/* CONTENT */}
                <div
                  style={{
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 12px',
                      borderRadius: 999,
                      background: p.accentSoft,
                      color: p.accent,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 18,
                    }}
                  >
                    {promo.tag}
                  </div>

                  <h3
                    style={{
                      fontSize: 25,
                      lineHeight: 1.3,
                      color: p.text,
                      marginBottom: 14,
                    }}
                  >
                    {promo.title}
                  </h3>

                  <p
                    style={{
                      color: p.muted,
                      lineHeight: 1.9,
                      fontSize: 14,
                      marginBottom: 26,
                    }}
                  >
                    {promo.desc}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: p.accent,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <CalendarDays size={15} />
                      {promo.date}
                    </div>

                    <button
                      style={{
                        background: p.surface,
                        border: `1px solid ${p.border}`,
                        color: p.text,
                        borderRadius: 14,
                        padding: '10px 16px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      อ่านเพิ่มเติม
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}