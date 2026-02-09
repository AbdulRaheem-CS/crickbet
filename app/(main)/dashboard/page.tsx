"use client";

/**
 * Dashboard Page
 * Main landing page after login
 */

import Banner from '@/components/layout/Banner';
import CategoryNav from '@/components/layout/CategoryNav';
import { FaFire, FaMoneyBillWave, FaGift, FaChartBar, FaDice, FaTimes } from 'react-icons/fa';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const { user, loading, showAuthModal, authModalTab, openAuthModal, closeAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(authModalTab || 'login');

  // No local auto-open; use site-wide auth modal from context. Keep local tab in sync.
  useEffect(() => {
    setTab(authModalTab);
  }, [authModalTab]);

  // If the URL contains open=register (and optional ref=code), open the
  // site-wide register modal and prefill the referral code into the
  // registration form. After consuming the params, remove them using
  // router.replace to avoid re-triggering on back navigation.
  useEffect(() => {
    try {
      const open = searchParams?.get('open');
      const ref = searchParams?.get('ref');
      if (open === 'register') {
        setTab('register');
        openAuthModal('register');
        if (ref) {
          setRegForm((s) => ({ ...s, refCode: ref }));
        }
        // Clear query parameters without adding a history entry
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        url.searchParams.delete('ref');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    } catch (err) {
      // If something goes wrong, silently ignore — modal still works via
      // programmatic calls elsewhere.
      console.error('Failed to auto-open register modal from URL params', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Local form state
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regForm, setRegForm] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '', refCode: '' });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(emailOrPhone, password);
  closeAuthModal();
      router.refresh();
    } catch (err: any) {
      setLoginError(err?.message || String(err));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Passwords do not match');
      return;
    }
    setRegLoading(true);
    try {
  await register({ username: regForm.username, email: regForm.email, phone: regForm.phone, password: regForm.password, refCode: regForm.refCode });
  closeAuthModal();
      router.refresh();
    } catch (err: any) {
      setRegError(err?.message || String(err));
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="p-8">
        <Banner />
      </div>

      {/* Category Navigation */}
      <CategoryNav />

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-[420px]">
            {/* Header */}
            <div className="bg-[#015DAC] text-white py-3 px-4 rounded-t flex items-center justify-between">
              <div className="text-sm font-medium">{tab === 'login' ? 'Login' : 'Register'}</div>
              <button onClick={() => closeAuthModal()} aria-label="Close" className="text-white/90 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className={`p-6 ${tab === 'register' ? 'max-h-[70vh] overflow-y-auto' : ''}`}>
              {/* Logo centered */}
              <div className="flex justify-center mb-4">
                <Image src="/blue-logo.png" alt="Crickex" width={140} height={36} />
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && <div className="text-red-500 text-sm">{loginError}</div>}

                  <div className='text-sm text-gray-800 mt-10'>
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
                    <input
                      placeholder="6-20 characters and numbers"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border bg-gray-100 mt-3 border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div className="text-right mt-2">
                    <button type="button" onClick={() => router.push('/forgot-password')} className="text-blue-600 text-sm">Forgot password?</button>
                  </div>
                  
                  <div>
                    <button type="submit" disabled={loginLoading} className="w-full bg-[#999999] text-gray-100 py-2 rounded font-semibold">
                      {loginLoading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    Do not have an account? <button type="button" onClick={() => { setTab('register'); openAuthModal('register'); }} className="text-blue-600 font-medium">Sign Up</button>
                  </div>
                </form>
              ) : (
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

                  {/* Email */}
                  <div className="text-sm text-gray-800">
                    Email
                    <input 
                      placeholder="Enter your email" 
                      type="email"
                      value={regForm.email} 
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} 
                      className="w-full border border-gray-300 mt-2 px-3 py-2 rounded bg-gray-100" 
                      required 
                    />
                  </div>

                  {/* Password */}
                  <div className="text-sm text-gray-800">
                    Password
                    <input 
                      placeholder="6-20 characters and numbers" 
                      value={regForm.password} 
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} 
                      type="password" 
                      className="w-full border border-gray-300 mt-2 px-3 py-2 rounded bg-gray-100" 
                      required 
                      minLength={6}
                      maxLength={20}
                    />
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div>Between 6~20 characters.</div>
                      <div>At least one alphabet.</div>
                      <div>At least one number. (Special character, symbols are allowed)</div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="text-sm text-gray-800">
                    Confirm Password
                    <input 
                      placeholder="Re-enter your password" 
                      value={regForm.confirmPassword} 
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} 
                      type="password" 
                      className="w-full border border-gray-300 mt-2 px-3 py-2 rounded bg-gray-100" 
                      required 
                      minLength={6}
                      maxLength={20}
                    />
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
                    <button type="submit" disabled={regLoading} className="w-full bg-[#999999] text-white py-2 rounded font-semibold">
                      {regLoading ? 'Creating...' : 'Submit'}
                    </button>
                  </div>

                  {/* Already a member */}
                  <div className="text-center text-sm text-gray-600">
                    Already a member? <button type="button" onClick={() => { setTab('login'); openAuthModal('login'); }} className="text-blue-600 font-medium">Log in</button>
                  </div>

                  {/* Terms */}
                  <div className="text-xs text-gray-500 text-center pt-2">
                    Registering means you are over 18 years old, have read and agree to the Terms & Conditions.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900">
        <Banner />
        <CategoryNav />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
