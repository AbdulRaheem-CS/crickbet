'use client';

/**
 * Sidebar Component
 * Left navigation sidebar
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { useWinnerBoard } from '@/context/WinnerBoardContext';
import { 
  FaHome, FaFire, FaFutbol, FaDice, FaRocket, 
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt, 
  FaGift, FaHandshake, FaTrophy, FaUsers, 
  FaMobileAlt, FaShieldAlt, FaChevronDown,
  FaCrown, FaBullhorn, FaHistory, FaFileAlt,
  FaMoneyBillWave, FaCog, FaQuestionCircle,
  FaStar, FaChartLine, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

interface SidebarProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  hasSubmenu?: boolean;
  openInNewTab?: boolean;
  submenuItems?: SubMenuItem[];
  isModal?: boolean; // For items that open modals instead of navigating
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: FaHome, href: '/dashboard' },
  { label: 'HOT', icon: FaFire, href: '/hot' },
  { 
    label: 'Sports', 
    icon: FaFutbol, 
    href: '/sports', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'Cricket', href: '/sports/cricket' },
      { label: 'Football', href: '/sports/football' },
      { label: 'Tennis', href: '/sports/tennis' },
      { label: 'Basketball', href: '/sports/basketball' },
      { label: 'Horse Racing', href: '/sports/horse-racing' },
    ]
  },
  { 
    label: 'Live Casino', 
    icon: FaDice, 
    href: '/casino', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'Evolution', href: '/casino?provider=Evolution' },
      { label: 'PragmaticPlay', href: '/casino?provider=PragmaticPlay' },
      { label: 'PrettyGaming', href: '/casino?provider=PrettyGaming' },
      { label: 'CT855', href: '/casino?provider=CT855' },
      { label: 'All Live Games', href: '/casino' },
    ]
  },
  { 
    label: 'Slots', 
    icon: FaStar, 
    href: '/slots', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'PG Soft', href: '/slots?provider=PG+Soft' },
      { label: 'PragmaticPlay', href: '/slots?provider=PragmaticPlay' },
      { label: 'Jili', href: '/slots?provider=Jili' },
      { label: 'PLAYTECH', href: '/slots?provider=PLAYTECH' },
      { label: 'KA Gaming', href: '/slots?provider=KA+Gaming' },
      { label: 'All Slots', href: '/slots' },
    ]
  },
  { 
    label: 'Crash', 
    icon: FaRocket, 
    href: '/crash', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'All Crash Games', href: '/crash' },
    ]
  },
  { 
    label: 'Table Games', 
    icon: FaTableTennis, 
    href: '/table', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'All Table Games', href: '/table' },
    ]
  },
  { 
    label: 'Fishing', 
    icon: FaFish, 
    href: '/fishing', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'Jili Fishing', href: '/fishing?provider=Jili' },
      { label: 'JDB Fishing', href: '/fishing?provider=JDB' },
      { label: 'All Fishing', href: '/fishing' },
    ]
  },
  { 
    label: 'Arcade', 
    icon: FaGamepad, 
    href: '/arcade', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'All Arcade Games', href: '/arcade' },
    ]
  },
  { 
    label: 'Lottery', 
    icon: FaTicketAlt, 
    href: '/lottery', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'All Lottery Games', href: '/lottery' },
    ]
  },
  { label: 'Promotions', icon: FaGift, href: '/promotions' },
  { label: 'VIP Club', icon: FaCrown, href: '/vip' },
  { label: 'Tournaments', icon: FaTrophy, href: '/tournaments' },
  { label: 'Leaderboard', icon: FaChartLine, href: '/leaderboard' },
  { label: 'Winner Board', icon: FaTrophy, href: '/winner-board', isModal: true },
  { label: 'Affiliate', icon: FaHandshake, href: '/affiliate/login', openInNewTab: true },
  { 
    label: 'Referral', 
    icon: FaUsers, 
    href: '/referral', 
    hasSubmenu: true,
    submenuItems: [
      { label: 'My Referrals', href: '/referral/my-referrals' },
      { label: 'Referral Stats', href: '/referral/stats' },
      { label: 'Earnings', href: '/referral/earnings' },
    ]
  },
  { label: 'Sponsorship', icon: FaBullhorn, href: '/sponsorship' },
  { label: 'My Bets', icon: FaFileAlt, href: '/bets' },
  { label: 'Bet History', icon: FaHistory, href: '/bet-history' },
  { label: 'Transactions', icon: FaMoneyBillWave, href: '/transactions' },
  { label: 'Announcements', icon: FaBullhorn, href: '/announcements' },
  { label: 'Download App', icon: FaMobileAlt, href: '/download' },
  { label: 'Help & Support', icon: FaQuestionCircle, href: '/support' },
  { label: 'Settings', icon: FaCog, href: '/settings' },
  { label: 'Responsible Gaming', icon: FaShieldAlt, href: '/responsible-gaming' },
];

export default function Sidebar({ isMinimized, onToggleMinimize }: SidebarProps) {
  const pathname = usePathname();
  const { openWinnerBoardModal } = useWinnerBoard();
  const [mounted, setMounted] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDropdown = (href: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#005DAC] border-r-4 border-gray-500 overflow-y-auto z-40 transition-all duration-300 ${
        isMinimized ? 'w-20' : 'w-[17%]'
      }`}
    >
      {/* Navigation - Home at top with minimize button */}
      <nav className=" space-y-1">
        {/* Home item with integrated minimize button */}
        <div className="group relative">
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'justify-start'} px-4 py-3 rounded-lg transition ${
                pathname === '/dashboard'
                  ? 'bg-[#1A79D3] text-white'
                  : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
              }`}
              title={isMinimized ? 'Home' : ''}
            >
              <div className={`flex items-center ${isMinimized ? '' : 'gap-3'}`}>
                <FaHome className="text-xl" />
                {!isMinimized && <span className="font-extrabold text-md">Home</span>}
              </div>
            </Link>
            {/* {!isMinimized && (
              <button
                onClick={onToggleMinimize}
                className="text-white hover:bg-[#1A79D3] p-2 rounded-lg transition"
                title="Minimize Sidebar"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
            )} */}
          </div>
          {/* Tooltip for minimized state */}
          {isMinimized && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Home
            </div>
          )}
        </div>

        {/* Expand button when minimized */}
        {isMinimized && (
          <div className="group relative">
            <button
              onClick={onToggleMinimize}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition text-gray-200 hover:bg-[#1A79D3] hover:text-white"
              title="Expand Sidebar"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Expand
            </div>
          </div>
        )}

        {/* Rest of menu items (skip Home as it's shown above) */}
        {menuItems.filter(item => item.href !== '/dashboard').map((item) => {
          const IconComponent = item.icon;
          const isOpen = openDropdowns[item.href];
          const isActive = pathname === item.href || (item.submenuItems?.some(sub => pathname === sub.href));
          
          // If the item should open in a new tab
          if (item.openInNewTab) {
            return (
              <div key={item.href} className="group relative">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-[#1A79D3] text-white'
                        : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
                  }`}
                  title={isMinimized ? item.label : ''}
                >
                  <div className={`flex items-center ${isMinimized ? '' : 'gap-3'}`}>
                    <IconComponent className="text-xl" />
                    {!isMinimized && <span className="font-medium text-sm">{item.label}</span>}
                  </div>
                  {!isMinimized && item.hasSubmenu && (
                    <FaChevronDown className="w-4 h-4" />
                  )}
                </a>
                {/* Tooltip for minimized state */}
                {isMinimized && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          }
          
          // Menu item with submenu
          if (item.hasSubmenu && item.submenuItems && item.submenuItems.length > 0) {
            return (
              <div key={item.href}>
                <div className="group relative">
                  <button
                    onClick={() => toggleDropdown(item.href)}
                    className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-[#1A79D3] text-white'
                        : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
                    }`}
                    title={isMinimized ? item.label : ''}
                  >
                    <div className={`flex items-center ${isMinimized ? '' : 'gap-3'}`}>
                      <IconComponent className="text-xl" />
                      {!isMinimized && <span className="font-extrabold text-md">{item.label}</span>}
                    </div>
                    {!isMinimized && (
                      <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {/* Tooltip for minimized state */}
                  {isMinimized && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
                
                {/* Submenu items */}
                {!isMinimized && isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#1A79D3] pl-4">
                    {item.submenuItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          pathname === subItem.href
                            ? 'bg-[#1A79D3] text-white font-semibold'
                            : 'text-gray-300 hover:bg-[#1A79D3]/50 hover:text-white'
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Modal items (opens modal instead of navigating)
          if (item.isModal) {
            return (
              <div key={item.href} className="group relative">
                <button
                  onClick={openWinnerBoardModal}
                  className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition text-gray-200 hover:bg-[#1A79D3] hover:text-white`}
                  title={isMinimized ? item.label : ''}
                >
                  <div className={`flex items-center ${isMinimized ? '' : 'gap-3'}`}>
                    <IconComponent className="text-xl" />
                    {!isMinimized && <span className="font-extrabold text-md">{item.label}</span>}
                  </div>
                </button>
                {/* Tooltip for minimized state */}
                {isMinimized && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          }
          
          // Regular Link for internal navigation (no submenu)
          return (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className={`w-full flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-[#1A79D3] text-white'
                    : 'text-gray-200 hover:bg-[#1A79D3] hover:text-white'
                }`}
                title={isMinimized ? item.label : ''}
              >
                <div className={`flex items-center ${isMinimized ? '' : 'gap-3'}`}>
                  <IconComponent className="text-xl" />
                    {!isMinimized && <span className="font-extrabold text-md">{item.label}</span>}
                </div>
                {!isMinimized && item.hasSubmenu && (
                  <FaChevronDown className="w-4 h-4" />
                )}
              </Link>
              {/* Tooltip for minimized state */}
              {isMinimized && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
