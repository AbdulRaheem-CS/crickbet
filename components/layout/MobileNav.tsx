'use client';

/**
 * MobileNav Component
 * Dedicated mobile sidebar drawer — shown only on screens < md.
 * Renders a full-height slide-in panel with blur overlay.
 * Desktop sidebar is untouched.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IconType } from 'react-icons';
import { useWinnerBoard } from '@/context/WinnerBoardContext';
import {
  FaHome, FaFire, FaFutbol, FaDice, FaRocket,
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt,
  FaGift, FaHandshake, FaTrophy, FaUsers,
  FaMobileAlt, FaShieldAlt, FaChevronDown,
  FaCrown, FaBullhorn, FaHistory, FaFileAlt,
  FaMoneyBillWave, FaCog, FaQuestionCircle,
  FaStar, FaChartLine, FaTimes,
} from 'react-icons/fa';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem { label: string; href: string; }
interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  hasSubmenu?: boolean;
  openInNewTab?: boolean;
  submenuItems?: SubMenuItem[];
  isModal?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: FaHome, href: '/' },
  {
    label: 'HOT', icon: FaFire, href: '/hot', hasSubmenu: true,
    submenuItems: [
      { label: 'Popular Games', href: '/casino?filter=popular' },
      { label: 'Featured Games', href: '/casino?filter=featured' },
      { label: 'New Games', href: '/casino?filter=new' },
    ],
  },
  {
    label: 'Sports', icon: FaFutbol, href: '/sports', hasSubmenu: true,
    submenuItems: [{ label: 'All Sports', href: '/sports' }],
  },
  {
    label: 'Live Casino', icon: FaDice, href: '/casino', hasSubmenu: true,
    submenuItems: [
      { label: 'Evolution', href: '/casino?provider=Evolution' },
      { label: 'PragmaticPlay', href: '/casino?provider=PragmaticPlay' },
      { label: 'All Live Games', href: '/casino' },
    ],
  },
  {
    label: 'Slots', icon: FaStar, href: '/slots', hasSubmenu: true,
    submenuItems: [
      { label: 'PG Soft', href: '/slots?provider=PG+Soft' },
      { label: 'Jili', href: '/slots?provider=Jili' },
      { label: 'All Slots', href: '/slots' },
    ],
  },
  {
    label: 'Crash', icon: FaRocket, href: '/crash', hasSubmenu: true,
    submenuItems: [{ label: 'All Crash Games', href: '/crash' }],
  },
  {
    label: 'Table Games', icon: FaTableTennis, href: '/table', hasSubmenu: true,
    submenuItems: [{ label: 'All Table Games', href: '/table' }],
  },
  {
    label: 'Fishing', icon: FaFish, href: '/fishing', hasSubmenu: true,
    submenuItems: [
      { label: 'Jili Fishing', href: '/fishing?provider=Jili' },
      { label: 'All Fishing', href: '/fishing' },
    ],
  },
  { label: 'Arcade', icon: FaGamepad, href: '/arcade' },
  { label: 'Lottery', icon: FaTicketAlt, href: '/lottery' },
  { label: 'Promotions', icon: FaGift, href: '/promotions' },
  { label: 'Leaderboard', icon: FaChartLine, href: 'https://heyvipwin.com', openInNewTab: true },
  { label: 'Winner Board', icon: FaTrophy, href: '/winner-board', isModal: true },
  { label: 'Affiliate', icon: FaHandshake, href: '/affiliate/login', openInNewTab: true },
  {
    label: 'Referral', icon: FaUsers, href: '/referral', hasSubmenu: true,
    submenuItems: [
      { label: 'My Referrals', href: '/referral/my-referrals' },
      { label: 'Earnings', href: '/referral/earnings' },
    ],
  },
  { label: 'My Bets', icon: FaFileAlt, href: '/bets' },
  { label: 'Transactions', icon: FaMoneyBillWave, href: '/transactions' },
  { label: 'Download App', icon: FaMobileAlt, href: '/download' },
  { label: 'Help & Support', icon: FaQuestionCircle, href: '/support' },
  { label: 'Settings', icon: FaCog, href: '/settings' },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { openWinnerBoardModal } = useWinnerBoard();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (href: string) => {
    setOpenDropdowns(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* ── Blur overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.45)' }}
          onClick={handleClose}
        />
      )}

      {/* ── Drawer panel ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#005DAC] z-50 md:hidden flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1A79D3]">
          <span className="text-white font-bold text-lg tracking-wide">Menu</span>
          <button
            onClick={handleClose}
            className="text-white hover:text-[#7FFF00] p-1.5 rounded-lg transition"
            aria-label="Close menu"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || item.submenuItems?.some(s => pathname === s.href);
            const isDropOpen = openDropdowns[item.href];

            // External link
            if (item.openInNewTab) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-200 hover:bg-[#1A79D3] hover:text-white transition"
                >
                  <Icon className="text-xl shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              );
            }

            // Modal item
            if (item.isModal) {
              return (
                <button
                  key={item.href}
                  onClick={() => { openWinnerBoardModal(); handleClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-200 hover:bg-[#1A79D3] hover:text-white transition"
                >
                  <Icon className="text-xl shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            }

            // Item with submenu
            if (item.hasSubmenu && item.submenuItems && item.submenuItems.length > 0) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleDropdown(item.href)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition ${
                      isActive ? 'bg-[#1A79D3] text-white' : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-xl shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <FaChevronDown className={`w-3 h-3 transition-transform ${isDropOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDropOpen && (
                    <div className="ml-9 mt-0.5 space-y-0.5 border-l-2 border-[#1A79D3] pl-2 pb-1">
                      {item.submenuItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={handleClose}
                          className={`block px-3 py-2 rounded-md text-sm transition ${
                            pathname === sub.href
                              ? 'bg-white text-[#1A79D3] font-semibold'
                              : 'text-gray-300 hover:bg-[#1A79D3] hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular link
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isActive ? 'bg-[#1A79D3] text-white' : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
                }`}
              >
                <Icon className="text-xl shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
