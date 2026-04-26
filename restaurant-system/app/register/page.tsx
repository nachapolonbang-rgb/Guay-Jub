'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  // 🔹 validation functions
  const validateEmail = (email: string) =>
    /\S+@\S+\.\S+/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  // 🔹 state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 realtime validation (UX ดีขึ้น)
  const emailValid = validateEmail(email);
  const passwordValid = validatePassword(password);
  const match = password === confirm;

  const isValid =
    name &&
    emailValid &&
    passwordValid &&
    match;

  // 🔹 submit
  const handleRegister = async () => {
    setError('');

    if (!name || !email || !password || !confirm) {
      setError('Please fill all fields');
      return;
    }

    if (!emailValid) {
      setError('Email must include @');
      return;
    }

    if (!passwordValid) {
      setError('Password must be 8+ chars, include A-Z, a-z, 0-9');
      return;
    }

    if (!match) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Register failed');
      }
    } catch {
      setError('Something went wrong');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E8] to-[#FFE0CC] px-4">

      <div className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 space-y-5">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#3d200a]">Create Account</h1>
          <p className="text-sm text-gray-500">Join Grandma's Restaurant 🍜</p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full bg-white border border-gray-300 p-3 rounded-xl mt-1
              focus:ring-2 focus:ring-[#e3523d] outline-none text-gray-800"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full p-3 rounded-xl mt-1 border
              ${email.length > 0 && !emailValid ? 'border-red-400' : 'border-gray-300'}
              focus:ring-2 focus:ring-[#e3523d] outline-none text-gray-800`}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email.length > 0 && !emailValid && (
              <p className="text-xs text-red-500 mt-1">Invalid email format</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className={`w-full p-3 rounded-xl mt-1 border
              ${password.length > 0 && !passwordValid ? 'border-red-400' : 'border-gray-300'}
              focus:ring-2 focus:ring-[#e3523d] outline-none text-gray-800`}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Must be 8+ chars, include A-Z, a-z, 0-9
            </p>
          </div>

          {/* CONFIRM */}
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              className={`w-full p-3 rounded-xl mt-1 border
              ${confirm.length > 0 && !match ? 'border-red-400' : 'border-gray-300'}
              focus:ring-2 focus:ring-[#e3523d] outline-none text-gray-800`}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {confirm.length > 0 && !match && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={!isValid || loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition
          ${isValid ? 'bg-[#e3523d] hover:bg-[#c94432]' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          {loading ? 'Creating...' : 'Register'}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* LINK */}
        <p className="text-sm text-center text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-orange-500 font-semibold">Login</a>
        </p>

      </div>
    </div>
  );
}