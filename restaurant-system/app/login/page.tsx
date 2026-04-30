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
    <div className="min-h-screen flex bg-gradient-to-br from-[#fff6ee] to-[#ffe0cc]">

      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-10">
        <img
          src="/images/login-anime.png"
          className="max-h-[80vh] object-contain drop-shadow-2xl"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

          {/* HEADER */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-black text-[#3d200a]">
              Member Login
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              เข้าสู่ระบบเพื่อสั่งอาหาร 🍜
            </p>
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-5 py-3 rounded-full border border-orange-200 
              bg-orange-50 text-gray-800 outline-none 
              focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-5 py-3 rounded-full border border-orange-200 
              bg-orange-50 text-gray-800 outline-none 
              focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="text-right text-xs text-gray-400 mb-4">
            Forgot password?
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={!isValid || loading}
            className={`w-full py-3 rounded-full font-bold text-white text-lg transition-all
              ${!isValid || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-400 to-orange-600 hover:scale-[1.03] shadow-lg'
              }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-3">
              {error}
            </p>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-[1px] bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>

          {/* REGISTER */}
          <a href="/register">
            <button className="w-full py-3 rounded-full bg-orange-100 text-[#3d200a] font-bold hover:bg-orange-200 transition">
              Create account
            </button>
          </a>

        </div>
      </div>
    </div>
  );
}