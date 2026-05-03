'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.includes('@') && password.length >= 6;

  const handleLogin = async () => {
    if (!isValid) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = '/';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 24px rgba(251,146,60,0.4); }
          50% { box-shadow: 0 4px 40px rgba(251,146,60,0.75); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease both;
        }
        .animate-slide-up {
          animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .btn-login:not(:disabled) {
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        .btn-login:not(:disabled):hover {
          animation: none;
          box-shadow: 0 8px 32px rgba(251,146,60,0.6);
        }

        .home-btn {
          transition: all 0.2s ease;
        }
        .home-btn:hover {
          transform: translateX(-3px);
          background: rgba(255,255,255,0.95);
        }

        .input-field {
          transition: all 0.25s ease;
        }
        .input-field:focus {
          transform: scale(1.01);
        }
      `}</style>

      <div className="min-h-screen flex bg-gradient-to-br from-[#fff6ee] to-[#ffe0cc] animate-fade-in">

        {/* BACK TO HOME BUTTON */}
        <a
          href="/"
          className="home-btn animate-slide-in-left absolute top-5 left-5 z-50 flex items-center gap-2 
            bg-white/70 backdrop-blur-md text-[#3d200a] font-semibold text-sm 
            px-4 py-2 rounded-full shadow-md border border-orange-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          หน้าหลัก
        </a>

        {/* LEFT IMAGE */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-10 animate-fade-in delay-200">
          <img
            src="/images/login-anime.png"
            className="animate-float max-h-[80vh] object-contain drop-shadow-2xl"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex w-full md:w-1/2 items-center justify-center px-6">
          <div className="animate-slide-up delay-100 w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

            {/* HEADER */}
            <div className="animate-slide-up delay-200 mb-6 text-center">
              <h1 className="text-4xl font-black text-[#3d200a]">
                Member Login
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                เข้าสู่ระบบเพื่อสั่งอาหาร 🍜
              </p>
            </div>

            {/* EMAIL */}
            <div className="animate-slide-up delay-300 mb-4">
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full mt-1 px-5 py-3 rounded-full border border-orange-200 
                bg-orange-50 text-gray-800 outline-none 
                focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* PASSWORD */}
            <div className="animate-slide-up delay-400 mb-2">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full mt-1 px-5 py-3 rounded-full border border-orange-200 
                bg-orange-50 text-gray-800 outline-none 
                focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="animate-slide-up delay-400 text-right text-xs text-gray-400 mb-4">
              Forgot password?
            </div>

            {/* LOGIN BUTTON */}
            <div className="animate-slide-up delay-500">
              <button
                onClick={handleLogin}
                disabled={!isValid || loading}
                className={`btn-login w-full py-3 rounded-full font-bold text-white text-lg transition-all duration-200
                  ${!isValid || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-400 to-orange-600 hover:scale-[1.03]'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Logging in...
                  </span>
                ) : 'Login'}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <p className="animate-fade-in text-red-500 text-sm text-center mt-3">
                {error}
              </p>
            )}

            {/* DIVIDER */}
            <div className="animate-slide-up delay-500 flex items-center gap-3 my-6">
              <div className="flex-1 h-[1px] bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-[1px] bg-gray-200" />
            </div>

            {/* REGISTER */}
            <div className="animate-slide-up delay-600">
              <a href="/register">
                <button className="w-full py-3 rounded-full bg-orange-100 text-[#3d200a] font-bold hover:bg-orange-200 transition-all duration-200 hover:scale-[1.02]">
                  Create account
                </button>
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}