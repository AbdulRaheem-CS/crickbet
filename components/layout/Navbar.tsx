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
import { FaWallet, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBars, FaHeadset, FaGlobe } from 'react-icons/fa';

interface NavbarProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onMobileMenuOpen: () => void;
}

export default function Navbar({ isMinimized, onToggleMinimize, onMobileMenuOpen }: NavbarProps) {
  const { user, logout, openAuthModal } = useAuth();
  const { balance, availableBalance, lockedFunds } = useWallet();
  const { openDepositModal } = useDeposit();

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
                {/* Balance */}
                <div className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                  <FaWallet className="text-yellow-400" />
                  <span className="text-gray-200 text-sm">Balance:</span>
                  <span className="text-white font-bold">₹{availableBalance.toFixed(2)}</span>
                  {lockedFunds > 0 && (
                    <span className="text-yellow-300 text-xs">(₹{lockedFunds.toFixed(0)} in bets)</span>
                  )}
                </div>

                <button
                  onClick={openDepositModal}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition text-sm"
                >
                  Deposit
                </button>

                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm">{user?.username}</p>
                  <button
                    onClick={() => logout()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2.5 rounded-full transition text-sm"
                >
                  Sign up
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="bg-[#1A79D3] hover:bg-blue-400 text-white font-semibold px-8 py-2.5 rounded-full transition text-sm"
                >
                  Login
                </button>
              </>
            )}

            {/* Currency / Language globe icon */}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1A79D3] hover:bg-blue-400 text-white transition"
              aria-label="Language & Currency"
            >
              <FaGlobe className="w-4 h-4" />
            </button>
          </div>

          {/* ── Mobile logged-in right section (< md) ── hide the live-chat area above via conditional ── */}
        </div>

        {/* Mobile logged-in mini-bar (balance + deposit) — sits below the header row */}
        {user && (
          <div className="md:hidden flex items-center justify-between px-4 pb-2 gap-2">
            <div className="flex items-center gap-1 bg-blue-600 px-2 py-1.5 rounded-lg">
              <FaWallet className="text-yellow-400 text-sm" />
              <span className="text-white font-bold text-xs">₹{availableBalance.toFixed(0)}</span>
              {lockedFunds > 0 && (
                <span className="text-yellow-300 text-[10px]">(₹{lockedFunds.toFixed(0)} in bets)</span>
              )}
            </div>
            <button
              onClick={openDepositModal}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-1.5 rounded-lg transition text-xs"
            >
              Deposit
            </button>
            <span className="text-white text-xs font-medium">{user?.username}</span>
            <button
              onClick={() => logout()}
              className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg transition"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}

