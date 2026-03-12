'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const { user, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [regForm, setRegForm] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    refCode: ''
  });

  // Pre-fill referral code from URL (?ref=) or localStorage
  useEffect(() => {
    const urlRef = searchParams?.get('ref') || '';
    const storedRef = (typeof window !== 'undefined' && localStorage.getItem('affiliateRef')) || '';
    const code = urlRef || storedRef;
    if (code) {
      setRegForm(prev => ({ ...prev, refCode: code }));
    }
  }, [searchParams]);

  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    setRegLoading(true);
    try {
      await register({
        username: regForm.username,
        phone: regForm.phone,
        password: regForm.password,
        refCode: regForm.refCode || undefined,
      });
      // Clean up referral code from localStorage and URL after successful registration
      if (typeof window !== 'undefined') {
        localStorage.removeItem('affiliateRef');
      }
      router.push('/');
    } catch (err: any) {
      setRegError(err?.message || String(err));
    } finally {
      setRegLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="bg-[#015DAC] text-white py-3 px-4 rounded-t-2xl">
          <div className="text-sm font-medium">Register</div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-t-0 border-gray-100 max-h-[80vh] overflow-y-auto">
          {/* Logo centered */}
          <div className="flex justify-center mb-4">
            <Image src="/blue-logo.png" alt="KingBaji" width={140} height={36} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {regError && <div className="text-red-500 text-sm">{regError}</div>}

            {/* Choose Currency */}
            <div className="text-sm text-gray-800">
              Choose currency
              <select className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-100 mt-2">
                <option value="BDT">🇧🇩 BDT</option>
                <option value="INR">🇮🇳 INR</option>
                <option value="PKR">🇵🇰 PKR</option>
              </select>
            </div>

            {/* Username */}
            <div className="text-sm text-gray-800">
              Username
              <input
                placeholder="4-16 char, allow numbers, no space"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                className="w-full border border-gray-300 mt-2 px-3 py-2 rounded bg-gray-100"
                required
                minLength={4}
                maxLength={16}
              />
            </div>

            {/* Password */}
            <div className="text-sm text-gray-800">
              Password
              <div className="relative mt-2">
                <input
                  placeholder="Enter your password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  type={showRegPassword ? 'text' : 'password'}
                  className={`w-full border px-3 py-2 rounded bg-gray-100 pr-10 ${regForm.password ? 'border-green-500' : 'border-gray-300'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showRegPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="text-sm text-gray-800">
              Confirm Password
              <div className="relative mt-2">
                <input
                  placeholder="Re-enter your password"
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  className={`w-full border px-3 py-2 rounded bg-gray-100 pr-10 ${regForm.confirmPassword && regForm.confirmPassword === regForm.password ? 'border-green-500' : 'border-gray-300'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showRegConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div className="text-sm text-gray-800">
              Phone Number
              <div className="flex gap-2 mt-2">
                <select className="border border-gray-300 px-2 py-2 rounded bg-gray-100">
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+92">🇵🇰 +92</option>
                </select>
                <input
                  placeholder="Enter your phone number."
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded bg-gray-100"
                  required
                />
              </div>
            </div>

            {/* Referral Code */}
            <div className="text-sm text-gray-800">
              Referral Code (Optional)
              <input
                placeholder="Enter referral code if you have one"
                value={regForm.refCode || ''}
                onChange={(e) => setRegForm({ ...regForm, refCode: e.target.value })}
                className="w-full border border-gray-300 mt-2 px-3 py-2 rounded bg-gray-100"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button type="submit" disabled={regLoading} className={`w-full py-2 rounded font-semibold ${regForm.username && regForm.password && regForm.confirmPassword && regForm.phone ? 'bg-[#015DAC] text-white' : 'bg-[#999999] text-white'}`}>
                {regLoading ? 'Creating...' : 'Submit'}
              </button>
            </div>

            {/* Already a member */}
            <div className="text-center text-sm text-gray-600">
              Already a member? <Link href="/login" className="text-blue-600 font-medium">Log in</Link>
            </div>

            {/* Terms */}
            <div className="text-xs text-gray-500 text-center pt-2">
              Registering means you are over 18 years old, have read and agree to the Terms & Conditions.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
