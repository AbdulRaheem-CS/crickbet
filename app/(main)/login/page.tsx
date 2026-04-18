'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<null | 'wrong' | 'correct'>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setPasswordStatus(null);
    setLoginLoading(true);
    try {
      await login(emailOrPhone, password);
      setPasswordStatus('correct');
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      setPasswordStatus('wrong');
      setLoginError(err?.message || String(err));
    } finally {
      setLoginLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="bg-[#015DAC] text-white py-3 px-4 rounded-t-2xl">
          <div className="text-sm font-medium">Login</div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-t-0 border-gray-100">
          {/* Logo centered */}
          <div className="flex justify-center mb-4">
            <Image src="/blue-logo.png" alt="KingBaji" width={140} height={36} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="text-red-500 text-sm">{loginError}</div>}

            <div className="text-sm text-gray-800 mt-10">
              Username
              <input
                placeholder="4-16 char, allow numbers, no space"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 mt-3 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="text-sm text-gray-800 mt-2">
              Password
              <div className="relative mt-3">
                <input
                  placeholder="Enter your password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordStatus(null); }}
                  className={`w-full border bg-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 pr-10 transition-colors ${
                    passwordStatus === 'wrong'
                      ? 'border-red-500 focus:ring-red-200'
                      : passwordStatus === 'correct'
                      ? 'border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordStatus === 'wrong' && (
                <p className="text-red-500 text-xs mt-1">Wrong password</p>
              )}
              {passwordStatus === 'correct' && (
                <p className="text-green-500 text-xs mt-1">Password correct</p>
              )}
            </div>
            <div className="text-right mt-2">
              <Link href="/forgot-password" className="text-blue-600 text-sm">Forgot password?</Link>
            </div>

            <div>
              <button type="submit" disabled={loginLoading} className={`w-full py-2 rounded font-semibold ${emailOrPhone && password ? 'bg-[#015DAC] text-white' : 'bg-[#999999] text-gray-100'}`}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Do not have an account? <Link href="/register" className="text-blue-600 font-medium">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
