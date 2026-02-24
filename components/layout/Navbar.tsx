'use client';

/**
 * Navbar Component
 * Top navigation bar - Right side only (Sidebar handles left)
 */

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useDeposit } from '@/context/DepositContext';
import { FaWallet, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaBars } from 'react-icons/fa';

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
    <nav className="bg-[#005DAC] shadow-md sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between relative">

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
          className="md:hidden text-white p-1.5 rounded-lg hover:bg-[#1A79D3] transition mr-2"
        >
          <FaBars className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 md:ml-5">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="Crickex" width={130} height={32} priority />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              {/* Balance — hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                <FaWallet className="text-yellow-400" />
                <span className="text-gray-200 text-sm">Balance:</span>
                <span className="text-white font-bold">₹{availableBalance.toFixed(2)}</span>
                {lockedFunds > 0 && (
                  <span className="text-yellow-300 text-xs">(₹{lockedFunds.toFixed(0)} in bets)</span>
                )}
              </div>

              {/* Mobile balance (compact) */}
              <div className="flex md:hidden items-center gap-1 bg-blue-600 px-2 py-1.5 rounded-lg">
                <FaWallet className="text-yellow-400 text-sm" />
                <span className="text-white font-bold text-xs">₹{availableBalance.toFixed(0)}</span>
              </div>

              <button
                onClick={openDepositModal}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 md:px-6 py-2 rounded-lg transition text-sm"
              >
                Deposit
              </button>

              <div className="flex items-center gap-2">
                <p className="hidden md:block text-white font-medium text-sm">{user?.username}</p>
                <button
                  onClick={() => logout()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 rounded-lg transition text-sm"
                >
                  <span className="hidden md:inline">Logout</span>
                  <FaSignOutAlt className="md:hidden w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('register')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 md:px-6 py-2 rounded-lg transition text-sm"
              >
                Sign up
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="bg-[#1A79D3] hover:bg-blue-500 text-white font-semibold px-3 md:px-6 py-2 rounded-lg transition text-sm"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

