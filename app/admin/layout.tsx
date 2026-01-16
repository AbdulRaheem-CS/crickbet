'use client';

/**
 * Admin Layout
 * Layout wrapper for admin panel pages
 * Phase 5: Admin Panel Implementation
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import {
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiCheckSquare,
  FiTrendingUp,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin' && user.role !== 'super_admin') {
        router.push('/');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: FiBarChart2,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: FiUsers,
    },
    {
      name: 'Bets',
      href: '/admin/bets',
      icon: FiFileText,
    },
    {
      name: 'Markets',
      href: '/admin/markets',
      icon: FiTrendingUp,
    },
    {
      name: 'Withdrawals',
      href: '/admin/withdrawals',
      icon: FiDollarSign,
    },
    {
      name: 'KYC Verification',
      href: '/admin/kyc',
      icon: FiCheckSquare,
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: FiDollarSign,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: FiSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-3">
            <Link href="/admin" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CrickBet</span>
              <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                ADMIN
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 group"
                >
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Logout */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-red-50 group"
            >
              <FiLogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
              <span className="ml-3 group-hover:text-red-600">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <span className="ml-3 text-xl font-semibold text-gray-900">
                Admin Panel
              </span>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
