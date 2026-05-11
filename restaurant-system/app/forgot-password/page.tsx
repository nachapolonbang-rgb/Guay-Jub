'use client';

import { useState, useEffect } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<'idle' | 'success'>('idle');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const handlePasswordChange = (val: string) => {
    setNewPassword(val);
    setPasswordStrength(calcStrength(val));
  };

  const strengthLabel = ['', 'อ่อนแอมาก', 'อ่อน', 'พอใช้', 'ดี', 'แข็งแกร่ง'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#84a862', '#4d7c0f'];

  const handleReset = async () => {
    setError('');
    if (!email || !newPassword || !confirmPassword) { setError('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    if (newPassword !== confirmPassword) { setError('รหัสผ่านใหม่กับการยืนยันไม่ตรงกัน'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร พร้อมตัวพิมพ์ใหญ่ พิมพ์เล็ก และตัวเลข'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { setStep('success'); setEmail(''); setNewPassword(''); setConfirmPassword(''); }
      else { setError(data.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้'); }
    } catch { setError('เกิดข้อผิดพลาดในการเชื่อมต่อ'); }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Sarabun:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Sarabun', sans-serif;
          background: #f5e6d3;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }
        .fp-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 15% 20%, rgba(255,220,185,0.75) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 85% 80%, rgba(245,195,150,0.55) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,235,210,0.4) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* Steam particles */
        .steam { position: fixed; border-radius: 50%; background: rgba(200,130,60,0.1); pointer-events: none; z-index: 0; animation: steamRise linear infinite; }
        @keyframes steamRise { 0% { transform: translateY(0) scale(1); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 0.4; } 100% { transform: translateY(-110px) scale(0.2); opacity: 0; } }

        /* Back btn */
        .back-btn {
          position: fixed; top: 20px; left: 20px; z-index: 10;
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.8); border: 1px solid rgba(180,120,60,0.2);
          border-radius: 20px; padding: 8px 16px;
          font-family: 'Sarabun', sans-serif; font-size: 13.5px; color: #3d200a;
          text-decoration: none; backdrop-filter: blur(8px);
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(150,80,20,0.1);
        }
        .back-btn:hover { background: rgba(255,255,255,0.96); box-shadow: 0 4px 14px rgba(150,80,20,0.15); }

        /* Card layout */
        .fp-layout {
          position: relative; z-index: 1;
          display: flex; width: 100%; max-width: 1060px;
          border-radius: 28px; overflow: hidden;
          box-shadow: 0 20px 70px rgba(100,50,10,0.16);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(22px)'};
          transition: opacity 0.55s ease, transform 0.55s ease;
        }

        /* Left panel */
        .fp-left {
          flex: 1;
          background: linear-gradient(155deg, #fde8c8 0%, #f5cfa0 55%, #edba78 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px;
          position: relative; overflow: hidden;
        }
        .fp-left::after {
          content: ''; position: absolute; bottom: -50px; right: -50px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(220,140,50,0.2), transparent 70%);
          border-radius: 50%;
        }
        .jp-deco {
          position: absolute; font-family: 'Noto Serif JP', serif;
          color: rgba(140,70,10,0.08); font-weight: 900;
          pointer-events: none; user-select: none;
        }
        .fp-bowl {
          font-size: 88px; line-height: 1; margin-bottom: 18px;
          animation: bowlBob 3.2s ease-in-out infinite;
          filter: drop-shadow(0 10px 22px rgba(150,80,10,0.18));
        }
        @keyframes bowlBob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-9px) rotate(2deg); }
        }
        .fp-left-title {
          font-family: 'Noto Serif JP', serif; font-size: 19px; font-weight: 700;
          color: #3d200a; text-align: center; margin-bottom: 8px; letter-spacing: 0.3px;
        }
        .fp-left-sub { font-size: 13px; color: rgba(61,32,10,0.5); text-align: center; line-height: 1.7; }

        /* Right panel */
        .fp-right {
          width: 430px; background: #ffffff;
          display: flex; flex-direction: column; justify-content: center;
          padding: 48px 42px; position: relative;
        }
        .fp-right-title {
          font-family: 'Noto Serif JP', serif; font-size: 25px; font-weight: 900;
          color: #3d200a; margin-bottom: 4px; letter-spacing: -0.2px;
        }
        .fp-right-sub { font-size: 13px; color: rgba(61,32,10,0.44); margin-bottom: 26px; line-height: 1.5; }

        /* Fields */
        .field-group { margin-bottom: 14px; }
        .field-label { display: block; font-size: 13px; font-weight: 600; color: #5c2e0e; margin-bottom: 7px; }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; background: #fdf4ec; border: 1.5px solid #e8d0b8;
          border-radius: 50px; padding: 12px 44px 12px 18px;
          font-family: 'Sarabun', sans-serif; font-size: 14.5px; color: #3d200a;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-input::placeholder { color: rgba(100,55,15,0.28); }
        .field-input:focus {
          border-color: #c97b3c; background: #fff9f4;
          box-shadow: 0 0 0 3px rgba(201,123,60,0.12);
        }
        .field-input.has-error { border-color: #e87070; box-shadow: 0 0 0 3px rgba(232,112,112,0.1); }
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 15px; padding: 4px;
          color: rgba(100,55,15,0.32); display: flex; align-items: center;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: #c97b3c; }

        /* Strength */
        .strength-wrap { margin-top: 7px; display: flex; gap: 4px; align-items: center; }
        .s-seg { flex: 1; height: 3px; border-radius: 99px; background: #f0dece; overflow: hidden; }
        .s-fill { height: 100%; border-radius: 99px; transition: width 0.3s ease, background 0.3s ease; }
        .s-label { font-size: 11px; min-width: 66px; text-align: right; }

        /* Match */
        .match-hint { font-size: 12px; margin-top: 6px; display: flex; align-items: center; gap: 5px; }

        /* Alert */
        .alert {
          margin-top: 10px; padding: 10px 14px; border-radius: 12px;
          font-size: 13px; display: flex; align-items: flex-start; gap: 7px;
          line-height: 1.5; animation: alertIn 0.25s ease;
        }
        @keyframes alertIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .alert-error { background: #fff0f0; border: 1px solid #f5c0c0; color: #b84040; }

        /* Buttons */
        .btn-primary {
          width: 100%; margin-top: 18px; padding: 14px;
          border-radius: 50px; border: none;
          background: #3d200a; color: #fff;
          font-family: 'Sarabun', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; position: relative; overflow: hidden;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(61,32,10,0.22); letter-spacing: 0.3px;
        }
        .btn-primary:hover:not(:disabled) { background: #5c2e0e; transform: translateY(-1px); box-shadow: 0 8px 22px rgba(61,32,10,0.28); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.44; cursor: not-allowed; }
        .btn-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%);
          transform: translateX(-100%); animation: shimmer 2.6s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(220%); } }

        .btn-secondary {
          display: block; text-align: center; margin-top: 10px; padding: 13px;
          border-radius: 50px; border: 1.5px solid #e8d0b8; background: #fdf4ec;
          color: #3d200a; font-family: 'Sarabun', sans-serif; font-size: 15px; font-weight: 600;
          text-decoration: none; cursor: pointer;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .btn-secondary:hover { background: #fde6cc; border-color: #c97b3c; box-shadow: 0 2px 10px rgba(201,123,60,0.14); }

        /* Divider */
        .divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 0; }
        .divider-line { flex: 1; height: 1px; background: #f0dece; }
        .divider-text { font-size: 12px; color: rgba(100,55,15,0.35); }

        /* Spinner */
        .spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 7px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success */
        .success-wrap { text-align: center; padding: 12px 0; animation: successFade 0.45s ease; }
        @keyframes successFade { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .success-circle {
          width: 70px; height: 70px; border-radius: 50%;
          background: linear-gradient(135deg, #c97b3c, #8b4513);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 16px;
          box-shadow: 0 8px 26px rgba(201,123,60,0.32);
          animation: pop 0.45s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
        .success-title { font-family: 'Noto Serif JP', serif; font-size: 19px; font-weight: 700; color: #3d200a; margin-bottom: 6px; }
        .success-sub { font-size: 13px; color: rgba(61,32,10,0.48); margin-bottom: 22px; line-height: 1.6; }

        @media (max-width: 700px) {
          .fp-left { display: none; }
          .fp-right { width: 100%; padding: 36px 26px; }
          .fp-layout { max-width: 400px; }
        }
      `}</style>

      <div className="fp-root">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="steam" style={{
            left: `${8 + i * 10}%`, bottom: `${5 + (i % 4) * 7}%`,
            width: `${4 + (i % 3) * 3}px`, height: `${4 + (i % 3) * 3}px`,
            animationDuration: `${3.2 + i * 0.35}s`, animationDelay: `${i * 0.5}s`,
          }} />
        ))}

        <a href="/" className="back-btn">← หน้าหลัก</a>

        <div className="fp-layout">

          {/* LEFT */}
          <div className="fp-left">
            <span className="jp-deco" style={{ top: 20, left: 18, fontSize: 52 }}>パ</span>
            <span className="jp-deco" style={{ bottom: 36, right: 14, fontSize: 68 }}>ス</span>
            <span className="jp-deco" style={{ top: '38%', right: 22, fontSize: 34 }}>ワ</span>
            <span className="jp-deco" style={{ top: '60%', left: 16, fontSize: 28 }}>ド</span>

            <div className="fp-bowl">🍜</div>
            <div className="fp-left-title">ลืมรหัสผ่าน?</div>
            <div className="fp-left-sub">
              ไม่เป็นไรนะ~<br />
              ตั้งรหัสผ่านใหม่แล้ว<br />
              กลับมาสั่งอาหารได้เลย 🍱
            </div>
          </div>

          {/* RIGHT */}
          <div className="fp-right">
            {step === 'success' ? (
              <div className="success-wrap">
                <div className="success-circle">✓</div>
                <div className="success-title">เปลี่ยนรหัสผ่านสำเร็จ!</div>
                <div className="success-sub">คุณสามารถเข้าสู่ระบบ<br />ด้วยรหัสผ่านใหม่ได้แล้ว</div>
                <a href="/login" className="btn-primary" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 0 }}>
                  เข้าสู่ระบบ
                </a>
                <a href="/" className="btn-secondary">กลับหน้าหลัก</a>
              </div>
            ) : (
              <>
                <div className="fp-right-title">Reset Password</div>
                <div className="fp-right-sub">ตั้งรหัสผ่านใหม่เพื่อเข้าใช้งาน 🔑</div>

                <div className="field-group">
                  <label className="field-label">Email</label>
                  <div className="field-wrap">
                    <input type="email" className={`field-input${error && !email ? ' has-error' : ''}`}
                      placeholder="Enter your email" value={email}
                      onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">รหัสผ่านใหม่</label>
                  <div className="field-wrap">
                    <input type={showPassword ? 'text' : 'password'} className="field-input"
                      placeholder="New password" value={newPassword}
                      onChange={e => handlePasswordChange(e.target.value)} />
                    <button className="eye-btn" type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="strength-wrap">
                      {[1,2,3,4,5].map(i => (
                        <div className="s-seg" key={i}>
                          <div className="s-fill" style={{ width: passwordStrength >= i ? '100%' : '0%', background: strengthColors[passwordStrength] }} />
                        </div>
                      ))}
                      <span className="s-label" style={{ color: strengthColors[passwordStrength] }}>{strengthLabel[passwordStrength]}</span>
                    </div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label">ยืนยันรหัสผ่าน</label>
                  <div className="field-wrap">
                    <input type={showConfirm ? 'text' : 'password'} className="field-input"
                      placeholder="Confirm new password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} />
                    <button className="eye-btn" type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="match-hint" style={{ color: newPassword === confirmPassword ? '#84a862' : '#e87070' }}>
                      {newPassword === confirmPassword ? '✅ รหัสผ่านตรงกัน' : '❌ รหัสผ่านไม่ตรงกัน'}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="alert alert-error"><span>⚠️</span><span>{error}</span></div>
                )}

                <button className="btn-primary" onClick={handleReset} disabled={loading}>
                  <div className="btn-shimmer" />
                  {loading ? <><span className="spinner" />กำลังรีเซ็ต...</> : 'รีเซ็ตรหัสผ่าน'}
                </button>

                <div className="divider">
                  <div className="divider-line" /><span className="divider-text">OR</span><div className="divider-line" />
                </div>

                <a href="/login" className="btn-secondary">กลับไปหน้าล็อกอิน</a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}