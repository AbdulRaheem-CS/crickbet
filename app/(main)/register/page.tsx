'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type FieldStatus = null | 'checking' | 'available' | 'taken' | 'invalid';

function useAvailability(value: string, field: 'username' | 'phone', minLen: number): FieldStatus {
  const [status, setStatus] = useState<FieldStatus>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value || value.length < minLen) { setStatus(null); return; }
    setStatus('checking');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/check-availability?${field}=${encodeURIComponent(value)}`);
        const data = await res.json();
        setStatus(data.available ? 'available' : 'taken');
      } catch { setStatus(null); }
    }, 600);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, field, minLen]);

  return status;
}

function StatusHint({ status, availableText, takenText }: { status: FieldStatus; availableText: string; takenText: string }) {
  if (status === 'checking') return <p className="text-gray-400 text-xs mt-1">Checking…</p>;
  if (status === 'available') return <p className="text-green-500 text-xs mt-1">✓ {availableText}</p>;
  if (status === 'taken') return <p className="text-red-500 text-xs mt-1">✗ {takenText}</p>;
  return null;
}

function borderClass(status: FieldStatus) {
  if (status === 'available') return 'border-green-500';
  if (status === 'taken') return 'border-red-500';
  return 'border-gray-300';
}

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

  useEffect(() => {
    const urlRef = searchParams?.get('ref') || '';
    const storedRef = (typeof window !== 'undefined' && localStorage.getItem('affiliateRef')) || '';
    const code = urlRef || storedRef;
    if (code) setRegForm(prev => ({ ...prev, refCode: code }));
  }, [searchParams]);

  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Phone: 10 or 11 digits, any start
  const phoneValid = /^\d{10,11}$/.test(regForm.phone.replace(/\s/g, ''));

  const usernameStatus = useAvailability(regForm.username, 'username', 4);
  const rawPhoneStatus = useAvailability(regForm.phone, 'phone', 10);
  const phoneStatus: FieldStatus = !regForm.phone ? null : !phoneValid ? 'invalid' : rawPhoneStatus;

  useEffect(() => { if (user) router.replace('/'); }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regForm.password !== regForm.confirmPassword) { setRegError('Passwords do not match'); return; }
    if (usernameStatus === 'taken') { setRegError('Username is already taken'); return; }
    if (!phoneValid) { setRegError('Phone number must be 10 or 11 digits'); return; }
    if (phoneStatus === 'taken') { setRegError('Phone number is already registered'); return; }
    setRegLoading(true);
    try {
      await register({
        username: regForm.username,
        phone: regForm.phone,
        password: regForm.password,
        refCode: regForm.refCode || undefined,
      });
      if (typeof window !== 'undefined') localStorage.removeItem('affiliateRef');
      router.push('/');
    } catch (err: any) {
      setRegError(err?.message || String(err));
    } finally {
      setRegLoading(false);
    }
  };

  if (user) return null;

  const phoneBorder = !regForm.phone ? 'border-gray-300' : !phoneValid ? 'border-red-500' : borderClass(phoneStatus);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        <div className="bg-[#015DAC] text-white py-3 px-4 rounded-t-2xl">
          <div className="text-sm font-medium">Register</div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 border border-t-0 border-gray-100 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-center mb-4">
            <Image src="/blue-logo.png" alt="KingBaji" width={140} height={36} />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {regError && <div className="text-red-500 text-sm">{regError}</div>}

            {/* Currency */}
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
              Username <span className="text-red-500">*</span>
              <input
                placeholder="4-16 chars, numbers allowed, no spaces"
                value={regForm.username}
                onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                className={`w-full border mt-2 px-3 py-2 rounded bg-gray-100 transition-colors ${borderClass(usernameStatus)}`}
                required
                minLength={4}
                maxLength={16}
              />
              <StatusHint status={usernameStatus} availableText="Username available" takenText="Username already taken" />
            </div>

            {/* Password */}
            <div className="text-sm text-gray-800">
              Password <span className="text-red-500">*</span>
              <div className="relative mt-2">
                <input
                  placeholder="Enter your password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  type={showRegPassword ? 'text' : 'password'}
                  className={`w-full border px-3 py-2 rounded bg-gray-100 pr-10 transition-colors ${regForm.password ? 'border-green-500' : 'border-gray-300'}`}
                  required
                />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showRegPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="text-sm text-gray-800">
              Confirm Password <span className="text-red-500">*</span>
              <div className="relative mt-2">
                <input
                  placeholder="Re-enter your password"
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  className={`w-full border px-3 py-2 rounded bg-gray-100 pr-10 transition-colors ${regForm.confirmPassword ? (regForm.confirmPassword === regForm.password ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`}
                  required
                />
                <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showRegConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {regForm.confirmPassword && regForm.confirmPassword !== regForm.password && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Phone */}
            <div className="text-sm text-gray-800">
              Phone Number <span className="text-red-500">*</span>
              <div className="flex gap-2 mt-2">
                <select className="border border-gray-300 px-2 py-2 rounded bg-gray-100">
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+92">🇵🇰 +92</option>
                </select>
                <input
                  placeholder="10 or 11 digit number"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                  className={`flex-1 border px-3 py-2 rounded bg-gray-100 transition-colors ${phoneBorder}`}
                  required
                  maxLength={11}
                />
              </div>
              {regForm.phone && !phoneValid && (
                <p className="text-red-500 text-xs mt-1">Must be 10 or 11 digits</p>
              )}
              {phoneValid && (
                <StatusHint status={phoneStatus} availableText="Phone number available" takenText="Phone number already registered" />
              )}
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={regLoading || usernameStatus === 'taken' || phoneStatus === 'taken' || !phoneValid}
                className={`w-full py-2 rounded font-semibold transition-colors ${
                  regForm.username && regForm.password && regForm.confirmPassword && regForm.phone && usernameStatus !== 'taken' && phoneStatus !== 'taken' && phoneValid
                    ? 'bg-[#015DAC] text-white'
                    : 'bg-[#999999] text-white cursor-not-allowed'
                }`}
              >
                {regLoading ? 'Creating...' : 'Submit'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already a member? <Link href="/login" className="text-blue-600 font-medium">Log in</Link>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2">
              Registering means you are over 18 years old, have read and agree to the Terms & Conditions.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
