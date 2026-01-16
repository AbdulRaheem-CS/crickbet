'use client';

/**
 * Navbar Component
 * Top navigation bar
 */

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FaBars, FaWallet, FaMoon, FaSignOutAlt, FaHandshake } from 'react-icons/fa';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const { balance } = useWallet();

  return (
    <nav className="bg-blue-700 shadow-md sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left Section - Logo and Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="text-white hover:bg-blue-600 p-2 rounded-lg transition"
          >
            <FaBars className="w-6 h-6" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">CRICKEX</span>
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
              <Link
                href="/affiliate"
                className="hidden md:flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition"
                title="Affiliate Dashboard"
              >
                <FaHandshake />
                <span>Affiliate</span>
              </Link>

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
              <button className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white transition">
                <FaMoon />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg transition"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
