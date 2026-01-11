'use client';

/**
 * Sidebar Component
 * Left navigation sidebar
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
  FaHome, FaFire, FaFutbol, FaDice, FaRocket, 
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt, 
  FaGift, FaHandshake, FaTrophy, FaUsers, 
  FaMobileAlt, FaShieldAlt, FaChevronDown,
  FaCrown, FaBullhorn, FaHistory, FaFileAlt,
  FaMoneyBillWave, FaCog, FaQuestionCircle,
  FaStar, FaChartLine
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  hasSubmenu?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: FaHome, href: '/dashboard' },
  { label: 'HOT', icon: FaFire, href: '/hot' },
  { label: 'Sports', icon: FaFutbol, href: '/sports', hasSubmenu: true },
  { label: 'Live Casino', icon: FaDice, href: '/casino', hasSubmenu: true },
  { label: 'Slots', icon: FaStar, href: '/slots', hasSubmenu: true },
  { label: 'Crash', icon: FaRocket, href: '/crash', hasSubmenu: true },
  { label: 'Table Games', icon: FaTableTennis, href: '/table', hasSubmenu: true },
  { label: 'Fishing', icon: FaFish, href: '/fishing', hasSubmenu: true },
  { label: 'Arcade', icon: FaGamepad, href: '/arcade', hasSubmenu: true },
  { label: 'Lottery', icon: FaTicketAlt, href: '/lottery', hasSubmenu: true },
  { label: 'Promotions', icon: FaGift, href: '/promotions' },
  { label: 'VIP Club', icon: FaCrown, href: '/vip' },
  { label: 'Tournaments', icon: FaTrophy, href: '/tournaments' },
  { label: 'Leaderboard', icon: FaChartLine, href: '/leaderboard' },
  { label: 'Referral', icon: FaUsers, href: '/referral', hasSubmenu: true },
  { label: 'Sponsorship', icon: FaHandshake, href: '/sponsorship' },
  { label: 'My Bets', icon: FaFileAlt, href: '/bets' },
  { label: 'Bet History', icon: FaHistory, href: '/bet-history' },
  { label: 'Transactions', icon: FaMoneyBillWave, href: '/transactions' },
  { label: 'Announcements', icon: FaBullhorn, href: '/announcements' },
  { label: 'Download App', icon: FaMobileAlt, href: '/download' },
  { label: 'Help & Support', icon: FaQuestionCircle, href: '/support' },
  { label: 'Settings', icon: FaCog, href: '/settings' },
  { label: 'Responsible Gaming', icon: FaShieldAlt, href: '/responsible-gaming' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-15 left-0 h-[calc(100vh-60px)] bg-blue-900 border-r border-blue-800 overflow-y-auto z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="text-xl" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <FaChevronDown className="w-4 h-4" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
