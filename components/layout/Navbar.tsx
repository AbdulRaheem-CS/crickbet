'use client';

/**
 * Navbar Component
 * Top navigation bar - Right side only (Sidebar handles left)
 */

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FaWallet, FaMoon, FaSignOutAlt, FaHandshake, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface NavbarProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function Navbar({ isMinimized, onToggleMinimize }: NavbarProps) {
  const { user, logout, openAuthModal } = useAuth();
  const { balance } = useWallet();

  return (
    <nav className="bg-[#005DAC] shadow-md sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between relative">
        {/* Floating oval toggle button overlapping sidebar/navbar */}
        <button
          onClick={onToggleMinimize}
          aria-label="Toggle sidebar"
          className="absolute -left-6 top-1/2 -translate-y-1/2 bg-[#003f6b] hover:bg-[#003457] text-white w-12 h-8 rounded-full flex items-center justify-center px-2 shadow-lg z-50"
        >
          {isMinimized ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
        </button>
        {/* Left - Logo */}
        <div className="flex items-center gap-3 ml-5">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo.png" alt="Crickex" width={130} height={32} priority />
          </Link>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Wallet Balance */}
              <div className="hidden md:flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg">
                <FaWallet className="text-yellow-400" />
                <span className="text-gray-200 text-sm">Balance:</span>
                <span className="text-white font-bold">₹{balance.toFixed(2)}</span>
              </div>
              
              <Link
                href="/wallet"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Deposit
              </Link>

              {/* Affiliate Link */}
              {/* <Link
                href="/affiliate"
                className="hidden md:flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition"
                title="Affiliate Dashboard"
              >
                <FaHandshake />
                <span>Affiliate</span>
              </Link> */}

              {/* User Dropdown */}
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <p className="text-white font-medium text-sm">{user?.username}</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </div>

              {/* Dark Mode Toggle */}
              {/* <button className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white transition">
                <FaMoon />
              </button> */}
            </>
          ) : (
            <>
              <button onClick={() => openAuthModal('register')} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition">Sign up</button>
              <button onClick={() => openAuthModal('login')} className="bg-[#1A79D3] hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition">Login</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
