"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

type FormState = { login: string; password: string };

export default function AffiliateLogin() {
  const [form, setForm] = useState<FormState>({ login: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // If opened from another tab, sever the reference to prevent opener-driven navigation
    if (typeof window !== 'undefined' && window.opener) {
      try { window.opener = null; } catch (e) { /* ignore */ }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value } as FormState));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await login(form.login, form.password);
      // If successful, auth guard will redirect to /affiliate
      setMessage('Login successful! Redirecting...');
      router.push('/affiliate');
    } catch (error: unknown) {
      // Extract error message
      const msg = (error && typeof error === 'object' && 'response' in error && (error as any).response?.data?.message)
        || (error instanceof Error && error.message)
        || 'Login failed. Please check your credentials.';
      setError(msg as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Affiliate Login</h1>
          <p className="text-gray-600">Sign in to access your affiliate dashboard</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone
            </label>
            <input
              name="login"
              type="text"
              placeholder="Enter your email or phone"
              value={form.login}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an affiliate account?{' '}
            <Link href="/affiliate/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> New affiliate registrations require admin approval before you can sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
