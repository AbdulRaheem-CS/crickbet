'use client';

/**
 * Navbar Component
 * Top navigation bar - Right side only (Sidebar handles left)
 * Mobile: hamburger | logo | live-chat  (Sign up / Login moved to sticky bottom bar)
 */

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useDeposit } from '@/context/DepositContext';
import { useState, useRef, useEffect } from 'react';
import { 
  FaWallet, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBars, FaHeadset, FaGlobe,
  FaUserCircle, FaMoneyBillWave, FaGift, FaDice, FaTrophy, FaClipboardList,
  FaSyncAlt, FaExchangeAlt, FaUser, FaLock, FaEnvelope, FaSpinner
} from 'react-icons/fa';
import { useWithdrawal } from '@/context/WithdrawalContext';
import { useRouter } from 'next/navigation';
import CurrencyLanguageModal from './CurrencyLanguageModal';
import BD from 'country-flag-icons/react/1x1/BD';

interface NavbarProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onMobileMenuOpen: () => void;
}

export default function Navbar({ isMinimized, onToggleMinimize, onMobileMenuOpen }: NavbarProps) {
  const { user, logout, openAuthModal } = useAuth();
  const { balance, availableBalance, lockedFunds } = useWallet();
  const { openDepositModal } = useDeposit();
  const { openWithdrawalModal, openPersonalInfoModal, openChangePasswordModal } = useWithdrawal();
  const [profileOpen, setProfileOpen] = useState(false);
  const [currencyLanguageOpen, setCurrencyLanguageOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileMenuItems: { label: string; icon: React.ReactNode; href: string; disabled?: boolean; action?: () => void }[] = [
    { label: 'Deposit', icon: <FaMoneyBillWave />, href: '#', action: () => openDepositModal() },
    { label: 'Withdrawal', icon: <FaWallet />, href: '#', action: () => openWithdrawalModal() },
    { label: 'Bonus Wallet', icon: <FaGift />, href: '#', disabled: true },
    { label: 'Free Spin', icon: <FaSpinner />, href: '#', disabled: true },
    { label: 'Real-Time Bonus', icon: <FaGift />, href: '#', disabled: true },
    { label: 'Refer Bonus', icon: <FaGift />, href: '#', disabled: true },
    { label: 'Winner Board', icon: <FaTrophy />, href: '/winner-board' },
    { label: 'Betting Records', icon: <FaClipboardList />, href: '#', disabled: true },
    { label: 'Turnover', icon: <FaSyncAlt />, href: '#', disabled: true },
    { label: 'Transaction Records', icon: <FaExchangeAlt />, href: '#', disabled: true },
    { label: 'Personal Info', icon: <FaUser />, href: '#', action: () => openPersonalInfoModal() },
    { label: 'Change Password', icon: <FaLock />, href: '#', action: () => openChangePasswordModal() },
    { label: 'Inbox', icon: <FaEnvelope />, href: '#', disabled: true },
  ];

  const handleMenuClick = (item: typeof profileMenuItems[0]) => {
    if (item.disabled) return;
    setProfileOpen(false);
    if (item.action) {
      item.action();
    } else {
      router.push(item.href);
    }
  };

  return (
    <>
      <nav className="bg-[#005DAC] shadow-md sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center relative">

          {/* ── Desktop sidebar toggle (md+) ── */}
          <button
            onClick={onToggleMinimize}
            aria-label="Toggle sidebar"
            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-[#003f6b] hover:bg-[#003457] text-white w-12 h-8 rounded-full items-center justify-center px-2 shadow-lg z-50"
          >
            {isMinimized ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
          </button>

          {/* ── Mobile hamburger (< md) ── */}
          <button
            onClick={onMobileMenuOpen}
            aria-label="Open menu"
            className="md:hidden text-white p-1.5 rounded-lg hover:bg-[#1A79D3] transition"
          >
            <FaBars className="w-5 h-5" />
          </button>

          {/* Logo — centered on mobile */}
          <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo.png" alt="Crickex" width={130} height={32} priority />
            </Link>
          </div>

          {/* Logo — left-aligned on desktop */}
          <div className="hidden md:block">
            <Link href="/dashboard" className="flex items-center pl-4">
              <Image src="/logo.png" alt="Crickex" width={130} height={32} priority />
            </Link>
          </div>

          {/* Spacer — pushes everything after it to the right */}
          <div className="flex-1" />

          {/* ── Mobile right: Live Chat icon (< md) ── */}
          <button
            className="md:hidden flex flex-col items-center text-white hover:text-gray-200 transition"
            aria-label="Live Chat"
          >
            <FaHeadset className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">Live Chat</span>
          </button>

          {/* ── Desktop right section (md+) ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Deposit Button - blurry white bg */}
                <button
                  onClick={openDepositModal}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold px-5 py-2 rounded transition text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <FaMoneyBillWave className="w-4 h-4" />
                  Deposit
                </button>

                {/* Main Wallet */}
                <div className="flex items-center gap-2 bg-green-500 hover:bg-green-700 px-4 py-2 rounded-sm cursor-pointer whitespace-nowrap transition">
                  <FaWallet className="text-white w-4 h-4" />
                  <span className="text-white font-semibold text-sm">Main Wallet</span>
                  <span className="text-white font-bold text-sm">৳{availableBalance.toFixed(0)}</span>
                </div>

                {/* Profile Icon with Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-[#005DAC] transition"
                  >
                    <FaUserCircle className="w-6 h-6" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 max-h-[50vh] overflow-y-auto">
                      {/* User Info Header */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                        <p className="text-xs text-gray-500">₹{availableBalance.toFixed(2)}</p>
                      </div>

                      {profileMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleMenuClick(item)}
                          disabled={item.disabled}
                          className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition ${
                            item.disabled
                              ? 'text-gray-400 cursor-default opacity-50'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-[#005DAC] cursor-pointer'
                          }`}
                        >
                          <span className={`text-base ${item.disabled ? 'text-gray-400' : 'text-[#005DAC]'}`}>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}

                      {/* Logout */}
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          <FaSignOutAlt className="text-base" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Currency / Language icon - BD flag SVG in circle */}
                <button
                  onClick={() => setCurrencyLanguageOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden bg-[#e0e0e0] hover:bg-gray-300 transition"
                  aria-label="Language & Currency"
                  title="Currency & Language"
                >
                  <BD className="w-full h-full object-cover" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2.5 rounded-sm transition text-sm"
                >
                  Sign up
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-[#1A79D3] hover:bg-blue-400 text-white font-semibold px-8 py-2.5 rounded-sm transition text-sm"
                >
                  Login
                </button>

                {/* Currency / Language globe icon */}
                <button
                  onClick={() => setCurrencyLanguageOpen(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1A79D3] hover:bg-blue-400 text-white transition"
                  aria-label="Language & Currency"
                >
                  <FaGlobe className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* ── Mobile logged-in right section (< md) ── hide the live-chat area above via conditional ── */}
        </div>
      </nav>

      {/* Currency & Language Modal */}
      <CurrencyLanguageModal 
        isOpen={currencyLanguageOpen}
        onClose={() => setCurrencyLanguageOpen(false)}
      />
    </>
  );
}
