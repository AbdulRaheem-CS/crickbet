'use client';

/**
 * Sidebar Component
 * Left navigation sidebar
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { IconType } from 'react-icons';
import { useWinnerBoard } from '@/context/WinnerBoardContext';
import { 
  FaHome, FaFire, FaFutbol, FaDice, FaRocket, 
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt, 
  FaGift, FaHandshake, FaTrophy, FaUsers, 
  FaMobileAlt, FaShieldAlt, FaChevronDown,
  FaCrown, FaBullhorn, FaHistory, FaFileAlt,
  FaMoneyBillWave, FaCog, FaQuestionCircle,
  FaStar, FaChartLine, FaChevronLeft, FaChevronRight,
  FaSpinner
} from 'react-icons/fa';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame } from '@/lib/services/casino.service';

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
  dynamicSubmenu?: boolean; // For items that fetch submenu items from API
  apiCategory?: string; // The casino category to fetch games from
}

const menuItems: MenuItem[] = [
  { label: 'Home', icon: FaHome, href: '/dashboard' },
  { 
    label: 'HOT', 
    icon: FaFire, 
    href: '/hot',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Popular Games', href: '/casino?filter=popular' },
      { label: 'Featured Games', href: '/casino?filter=featured' },
      { label: 'New Games', href: '/casino?filter=new' },
    ]
  },
  { 
    label: 'Sports', 
    icon: FaFutbol, 
    href: '/sports', 
    hasSubmenu: true,
    dynamicSubmenu: true,
    apiCategory: 'live', // Using 'live' category as sports games are often under live casino
    submenuItems: []
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
  // { label: 'VIP Club', icon: FaCrown, href: '/vip' },
  { label: 'Leaderboard', icon: FaChartLine, href: 'https://heyvipwin.com' },
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
  { label: 'Responsible Gaming', icon: FaShieldAlt, href: '/responsible-gambling' },
  { label: 'About Us', icon: FaShieldAlt, href: '/about-us' },
  { label: 'FAQS', icon: FaShieldAlt, href: '/home' },


];

export default function Sidebar({ isMinimized, onToggleMinimize }: SidebarProps) {
  const pathname = usePathname();
  const { openWinnerBoardModal } = useWinnerBoard();
  const [mounted, setMounted] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [dynamicItems, setDynamicItems] = useState<Record<string, SubMenuItem[]>>({});
  const [loadingDynamic, setLoadingDynamic] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dynamic submenu items for a category
  const fetchDynamicSubmenu = useCallback(async (item: MenuItem) => {
    if (!item.dynamicSubmenu || !item.apiCategory) return;
    if (dynamicItems[item.href]) return; // Already loaded

    setLoadingDynamic(item.href);
    try {
      console.log(`Fetching dynamic submenu for category: ${item.apiCategory}`);
      
      // Fetch games - try category-specific first, then fall back to general games with filter
      let res;
      try {
        res = await casinoService.getGamesByCategory(item.apiCategory, { limit: 20 });
        console.log(`Category fetch result:`, res);
      } catch (err) {
        console.log('Category fetch failed, trying general games with category filter');
        res = await casinoService.getGames({ category: item.apiCategory, limit: 20 });
        console.log(`General games fetch result:`, res);
      }
      
      if (res.success && res.data.length > 0) {
        const subs: SubMenuItem[] = res.data.map((game: CasinoGame) => ({
          label: game.gameName,
          href: `/sports?game=${game._id}`,
        }));
        // Add "All Sports" at the end
        subs.push({ label: 'All Sports', href: '/sports' });
        setDynamicItems(prev => ({ ...prev, [item.href]: subs }));
      } else {
        console.warn(`No games found for category: ${item.apiCategory}`);
        // Set empty array so it doesn't keep trying to fetch
        setDynamicItems(prev => ({ ...prev, [item.href]: [] }));
      }
    } catch (error) {
      console.error('Failed to fetch dynamic submenu:', error);
      // Set empty array on error
      setDynamicItems(prev => ({ ...prev, [item.href]: [] }));
    } finally {
      setLoadingDynamic(null);
    }
  }, [dynamicItems]);

  const toggleDropdown = (href: string, item?: MenuItem) => {
    const willOpen = !openDropdowns[href];
    setOpenDropdowns(prev => ({
      ...prev,
      [href]: willOpen
    }));
    // Fetch dynamic items when opening a dynamic submenu
    if (willOpen && item?.dynamicSubmenu) {
      fetchDynamicSubmenu(item);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={`hidden md:block fixed top-0 left-0 h-screen bg-[#005DAC] border-r-4 border-gray-500 overflow-y-auto scrollbar-hide z-40 transition-all duration-300 ${
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
          if (item.hasSubmenu && (item.dynamicSubmenu || (item.submenuItems && item.submenuItems.length > 0))) {
            // Use dynamic items if available, otherwise fall back to static submenuItems
            const resolvedSubmenu = item.dynamicSubmenu
              ? (dynamicItems[item.href] || [])
              : (item.submenuItems || []);
            const isDynamicLoading = loadingDynamic === item.href;

            return (
              <div key={item.href}>
                <div className="group relative">
                  <button
                    onClick={() => toggleDropdown(item.href, item)}
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
                  <div className=" mt-1 space-y-1 border-l-2 border-[#1A79D3] bg-white shadow-sm max-h-64 overflow-y-auto scrollbar-hide">
                    {isDynamicLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <FaSpinner className="animate-spin text-[#1A79D3] mr-2" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : resolvedSubmenu.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-400 text-center">No items found</div>
                    ) : (
                      resolvedSubmenu.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-md text-sm transition ${
                            pathname === subItem.href
                              ? 'bg-white text-[#1A79D3] font-semibold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))
                    )}
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
