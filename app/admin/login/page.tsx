"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<null | 'wrong' | 'correct'>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasswordStatus(null);
    try {
      await login(form.email, form.password);
      const meResp: any = await authService.me();
      const user = meResp?.data || meResp?.user || meResp;
      if (!user || user.role !== 'admin') {
        setError('Access denied: not an admin');
        setPasswordStatus('wrong');
        localStorage.removeItem('authToken');
        setLoading(false);
        return;
      }
      setPasswordStatus('correct');
      setTimeout(() => router.push('/admin'), 600);
    } catch (err: any) {
      setPasswordStatus('wrong');
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Sign In</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => { handleChange(e); setPasswordStatus(null); }}
                required
                className={`w-full px-4 py-2 border rounded pr-12 transition-colors ${
                  passwordStatus === 'wrong'
                    ? 'border-red-500 focus:ring-red-300'
                    : passwordStatus === 'correct'
                    ? 'border-green-500 focus:ring-green-300'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordStatus === 'wrong' && (
              <p className="text-red-500 text-xs mt-1">Wrong password</p>
            )}
            {passwordStatus === 'correct' && (
              <p className="text-green-500 text-xs mt-1">Password correct</p>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
