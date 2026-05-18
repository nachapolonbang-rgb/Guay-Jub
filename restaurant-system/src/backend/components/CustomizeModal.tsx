'use client';

import { useState, useEffect } from 'react';

/* ── Types ─────────────────────────────────────────── */
export type Topping = {
  id: string;
  name: string;
  price: number;
};

export type CustomizeTarget = {
  id: number;
  name: string;
  price: number;
  image: string;
  ingredients: string[];
  toppings: Topping[];
};

export type CustomizeResult = {
  removedIngredients: string[];
  selectedToppings: Topping[];
  note: string;
  totalPrice: number;
};

type Props = {
  item: CustomizeTarget | null;
  onConfirm: (item: CustomizeTarget, result: CustomizeResult) => void;
  onClose: () => void;
};

/* ── Ingredient Pill ────────────────────────────────── */
function IngredientPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 13px',
        borderRadius: 999,
        border: `1.5px solid ${active ? '#dc4e00' : '#e8d5c4'}`,
        background: active ? '#fff4ef' : '#fffaf7',
        color: active ? '#b83c00' : '#8a6248',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        transform: active ? 'scale(1.04)' : 'scale(1)',
        boxShadow: active ? '0 2px 12px rgba(220,78,0,0.18)' : 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 16, height: 16, borderRadius: '50%',
        background: active ? '#dc4e00' : '#e8d5c4',
        color: '#fff', fontSize: 9, fontWeight: 900,
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}>
        {active ? '✕' : '−'}
      </span>
      {label}
    </button>
  );
}

/* ── Topping Pill ───────────────────────────────────── */
function ToppingPill({ topping, active, onClick }: { topping: Topping; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 13px',
        borderRadius: 999,
        border: `1.5px solid ${active ? '#15803d' : '#c8e6d4'}`,
        background: active ? '#f0fdf4' : '#f8fffe',
        color: active ? '#15803d' : '#5a9070',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        transform: active ? 'scale(1.04)' : 'scale(1)',
        boxShadow: active ? '0 2px 12px rgba(21,128,61,0.18)' : 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 16, height: 16, borderRadius: '50%',
        background: active ? '#15803d' : '#c8e6d4',
        color: '#fff', fontSize: 9, fontWeight: 900,
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}>
        {active ? '✓' : '+'}
      </span>
      {topping.name}
      {topping.price > 0 && (
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: active ? '#15803d' : '#d1fae5',
          color: active ? '#fff' : '#166534',
          borderRadius: 999,
          padding: '1px 7px',
          transition: 'all 0.2s ease',
        }}>
          +฿{topping.price}
        </span>
      )}
    </button>
  );
}

/* ── Section Header ─────────────────────────────────── */
function Section({ icon, title, sub, children }: { icon: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize: 13, lineHeight: 1,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg,#fff3eb,#ffe0c8)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
        }}>
          {icon}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#2d1400', letterSpacing: '-0.2px' }}>
          {title}
        </span>
        {sub && (
          <span style={{ fontSize: 12, color: '#b08060' }}>{sub}</span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Main Modal ─────────────────────────────────────── */
export default function CustomizeModal({ item, onConfirm, onClose }: Props) {
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedToppings, setSelectedToppings]     = useState<Topping[]>([]);
  const [note, setNote]                             = useState('');
  const [visible, setVisible]                       = useState(false);

  useEffect(() => {
    if (item) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [item]);

  if (!item) return null;

  const extraPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const totalPrice = item.price + extraPrice;
  const hasChanges = removedIngredients.length > 0 || selectedToppings.length > 0 || note.trim();

  function toggleIngredient(name: string) {
    setRemovedIngredients(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  }

  function toggleTopping(topping: Topping) {
    setSelectedToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, topping]
    );
  }

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      setRemovedIngredients([]);
      setSelectedToppings([]);
      setNote('');
      onClose();
    }, 280);
  }

  function handleConfirm() {
    if (!item) return;
    onConfirm(item, { removedIngredients, selectedToppings, note, totalPrice });
    setRemovedIngredients([]);
    setSelectedToppings([]);
    setNote('');
  }

  return (
    <>
      <style>{`
        @keyframes backdropIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes backdropOut { from { opacity:1 } to { opacity:0 } }
        @keyframes sheetIn     { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes sheetOut    { from { transform:translateY(0) } to { transform:translateY(100%) } }
        @keyframes sheetInDesk { from { transform:translateY(24px) scale(0.97); opacity:0 } to { transform:translateY(0) scale(1); opacity:1 } }
        @keyframes sheetOutDesk{ from { transform:translateY(0) scale(1); opacity:1 } to { transform:translateY(24px) scale(0.97); opacity:0 } }
        @keyframes summaryIn   { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

        .cm-backdrop {
          position: fixed; inset: 0; z-index: 60;
          background: rgba(15,5,0,0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
        }
        .cm-backdrop.in  { animation: backdropIn  0.25s ease forwards }
        .cm-backdrop.out { animation: backdropOut 0.25s ease forwards }

        .cm-sheet {
          background: #fffaf7;
          border-radius: 28px 28px 0 0;
          width: 100%;
          max-width: 540px;
          max-height: 92vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 -20px 80px rgba(0,0,0,0.22), 0 -1px 0 rgba(255,200,150,0.4);
          scrollbar-width: thin;
          scrollbar-color: #e8d5c4 transparent;
        }
        .cm-sheet.in  { animation: sheetIn  0.35s cubic-bezier(.32,1.1,.64,1) forwards }
        .cm-sheet.out { animation: sheetOut 0.28s cubic-bezier(.4,0,1,1) forwards }

        @media (min-width: 640px) {
          .cm-backdrop { align-items: center; padding: 24px }
          .cm-sheet { border-radius: 28px; max-height: 88vh; }
          .cm-sheet.in  { animation: sheetInDesk  0.3s cubic-bezier(.32,1.1,.64,1) forwards }
          .cm-sheet.out { animation: sheetOutDesk 0.25s cubic-bezier(.4,0,1,1) forwards }
        }

        .cm-note:focus {
          outline: none;
          border-color: #E05A00 !important;
          box-shadow: 0 0 0 3px rgba(224,90,0,0.12) !important;
        }
        .cm-note::placeholder { color: #c4a585 }

        .cm-confirm-btn {
          width: 100%;
          padding: 15px 0;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #FF7A20 0%, #E05A00 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(224,90,0,0.38), inset 0 1px 0 rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: -0.3px;
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          position: relative;
          overflow: hidden;
        }
        .cm-confirm-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }
        .cm-confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(224,90,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .cm-confirm-btn:active { transform: scale(0.98) }

        .cm-close-btn {
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid #e8d5c4;
          background: #fff;
          font-size: 15px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #9a7a60;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }
        .cm-close-btn:hover {
          background: #fff4ef;
          border-color: #E05A00;
          color: #E05A00;
          transform: rotate(90deg);
        }

        .cm-summary {
          animation: summaryIn 0.25s ease;
          background: linear-gradient(135deg, #fff9f5 0%, #fff4ed 100%);
          border-radius: 16px;
          border: 1px solid #f0d8c4;
          padding: 12px 14px;
          margin-bottom: 14px;
        }
      `}</style>

      <div className={`cm-backdrop ${visible ? 'in' : 'out'}`} onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className={`cm-sheet ${visible ? 'in' : 'out'}`}>

          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 8px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e0c8b4' }} />
          </div>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '8px 20px 16px',
            borderBottom: '1px solid #f0e0d0',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg,#fff3eb,#ffe8d0)',
                border: '1px solid #f0d0b0',
                borderRadius: 999,
                padding: '3px 10px 3px 6px',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 14 }}>🍜</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8a5030', letterSpacing: 0.5 }}>
                  ปรับแต่งรายการ
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a0a00', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {item.name}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9a7a60' }}>
                ราคาเริ่มต้น ฿{item.price}
              </p>
            </div>
            <button className="cm-close-btn" onClick={handleClose}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 20px 0' }}>

            {/* Ingredients */}
            {item.ingredients.length > 0 && (
              <Section icon="🥦" title="วัตถุดิบ" sub="แตะเพื่อเอาออก">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {item.ingredients.map(ing => (
                    <IngredientPill
                      key={ing}
                      label={ing}
                      active={removedIngredients.includes(ing)}
                      onClick={() => toggleIngredient(ing)}
                    />
                  ))}
                </div>
                {removedIngredients.length > 0 && (
                  <p style={{
                    margin: '10px 0 0', fontSize: 12, color: '#dc4e00', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                    animation: 'summaryIn 0.2s ease',
                  }}>
                    <span>✕</span> ไม่เอา: {removedIngredients.join(', ')}
                  </p>
                )}
              </Section>
            )}

            {/* Toppings */}
            {item.toppings.length > 0 && (
              <Section icon="✨" title="เพิ่มท็อปปิ้ง" sub="เพิ่มราคาตามที่ระบุ">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {item.toppings.map(top => (
                    <ToppingPill
                      key={top.id}
                      topping={top}
                      active={!!selectedToppings.find(t => t.id === top.id)}
                      onClick={() => toggleTopping(top)}
                    />
                  ))}
                </div>
                {selectedToppings.length > 0 && (
                  <p style={{
                    margin: '10px 0 0', fontSize: 12, color: '#15803d', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                    animation: 'summaryIn 0.2s ease',
                  }}>
                    <span>✓</span> เพิ่ม: {selectedToppings.map(t => `${t.name} (+฿${t.price})`).join(', ')}
                  </p>
                )}
              </Section>
            )}

            {/* Note */}
            <Section icon="📝" title="หมายเหตุ" sub="ถ้ามี">
              <textarea
                className="cm-note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="เช่น ไม่เผ็ด, น้ำน้อย, ไม่ใส่ผงชูรส..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 14,
                  border: '1.5px solid #e8d5c4',
                  background: '#fff',
                  fontSize: 14,
                  color: '#1a0a00',
                  resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.6,
                }}
              />
            </Section>

          </div>

          {/* Footer */}
          <div style={{
            position: 'sticky', bottom: 0,
            background: 'linear-gradient(to top, #fffaf7 85%, transparent)',
            padding: '12px 20px 24px',
          }}>
            {/* Summary */}
            {hasChanges && (
              <div className="cm-summary">
                {removedIngredients.length > 0 && (
                  <div style={{ fontSize: 12, color: '#b83c00', marginBottom: selectedToppings.length > 0 ? 4 : 0 }}>
                    <span style={{ fontWeight: 700 }}>✕ ไม่เอา:</span> {removedIngredients.join(', ')}
                  </div>
                )}
                {selectedToppings.length > 0 && (
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: note.trim() ? 4 : 0 }}>
                    <span style={{ fontWeight: 700 }}>✓ เพิ่ม:</span> {selectedToppings.map(t => t.name).join(', ')}
                  </div>
                )}
                {note.trim() && (
                  <div style={{ fontSize: 12, color: '#8a5030' }}>
                    <span style={{ fontWeight: 700 }}>📝</span> {note}
                  </div>
                )}
              </div>
            )}

            {/* Price row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <span style={{ fontSize: 13, color: '#9a7a60' }}>ราคารวม</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {extraPrice > 0 && (
                  <span style={{ fontSize: 12, color: '#c4a585', textDecoration: 'line-through' }}>
                    ฿{item.price}
                  </span>
                )}
                <span style={{
                  fontSize: 22, fontWeight: 800, color: '#E05A00', letterSpacing: '-0.5px',
                  transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
                }}>
                  ฿{totalPrice}
                </span>
                {extraPrice > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#15803d',
                    background: '#f0fdf4', border: '1px solid #c8e6d4',
                    borderRadius: 999, padding: '1px 8px',
                    animation: 'summaryIn 0.2s ease',
                  }}>
                    +฿{extraPrice}
                  </span>
                )}
              </div>
            </div>

            <button className="cm-confirm-btn" onClick={handleConfirm}>
              <span>🛒 เพิ่มลงตะกร้า</span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                borderRadius: 999,
                padding: '3px 12px',
                fontSize: 14,
                fontWeight: 700,
              }}>
                ฿{totalPrice}
              </span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}