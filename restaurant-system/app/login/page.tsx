'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ validation
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
        // 🔥 สำคัญ: reload เพื่อให้ Navbar detect user
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E8] to-[#FFE0CC] px-4">

      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#3d200a]">Welcome Back</h1>
          <p className="text-sm text-gray-500">Login to continue 🍜</p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-xl mt-1 outline-none text-gray-800 border
                ${email && !email.includes('@') 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300 bg-white'}
                focus:ring-2 focus:ring-[#e3523d]`}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-xl mt-1 outline-none text-gray-800 border
                ${password && password.length < 6 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-gray-300 bg-white'}
                focus:ring-2 focus:ring-[#e3523d]`}
            />
          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={!isValid || loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition
            ${!isValid || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#e3523d] hover:bg-[#c94432] hover:scale-[1.02]'}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* LINK */}
        <p className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <a href="/register" className="text-orange-500 font-semibold">
            Register
          </a>
        </p>

      </div>
    </div>
  );
}