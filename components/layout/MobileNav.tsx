'use client';

/**
 * MobileNav Component
 * Narrow sidebar on the left with white bg + blue circular icons.
 * When a game category is tapped, a sub-panel opens to the RIGHT
 * of the sidebar (not overlapping) showing game items as a scrollable list.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { IconType } from 'react-icons';
import { useWinnerBoard } from '@/context/WinnerBoardContext';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame } from '@/lib/services/casino.service';
import {
  FaHome, FaFire, FaFutbol, FaDice, FaRocket,
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt,
  FaGift, FaHandshake, FaTrophy, FaUsers,
  FaMobileAlt, FaShieldAlt, FaChevronRight,
  FaStar, FaChartLine, FaTimes, FaArrowLeft,
  FaSpinner, FaQuestionCircle, FaInfoCircle,
} from 'react-icons/fa';

const SIDEBAR_WIDTH = 200; // px — narrow sidebar

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubMenuItem { label: string; href: string; image?: string; }
interface MenuItem {
  label: string;
  icon: IconType;
  href: string;
  hasSubmenu?: boolean;
  openInNewTab?: boolean;
  submenuItems?: SubMenuItem[];
  isModal?: boolean;
  section: 'main' | 'games' | 'others';
  dynamicSubmenu?: boolean;
  apiCategory?: string;
}

const menuItems: MenuItem[] = [
  // Main section
  { label: 'Home', icon: FaHome, href: '/', section: 'main' },
  { label: 'Promotions', icon: FaGift, href: '/promotions', section: 'main' },
  {
    label: 'Referral', icon: FaUsers, href: '/referral', section: 'main',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Refer Bonus', href: '#' },
      { label: 'Refer Program', href: '/referral' },
    ],
  },
  { label: 'Sponsorship', icon: FaHandshake, href: '/sponsorship', section: 'main' },
  { label: 'Leaderboard', icon: FaChartLine, href: '/leaderboard', section: 'main' },
  { label: 'Winner Board', icon: FaTrophy, href: '/winner-board', isModal: true, section: 'main' },

  // Games section
  {
    label: 'HOT', icon: FaFire, href: '/hot', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'hot', submenuItems: [],
  },
  {
    label: 'Sports', icon: FaFutbol, href: '/sports', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'live', submenuItems: [],
  },
  {
    label: 'Casino', icon: FaDice, href: '/casino', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'live', submenuItems: [],
  },
  {
    label: 'Slots', icon: FaStar, href: '/slots', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'slots', submenuItems: [],
  },
  {
    label: 'Crash', icon: FaRocket, href: '/crash', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'crash', submenuItems: [],
  },
  {
    label: 'Table', icon: FaTableTennis, href: '/table', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'table', submenuItems: [],
  },
  {
    label: 'Fishing', icon: FaFish, href: '/fishing', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'fishing', submenuItems: [],
  },
  {
    label: 'Arcade', icon: FaGamepad, href: '/arcade', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'arcade', submenuItems: [],
  },
  {
    label: 'Lottery', icon: FaTicketAlt, href: '/lottery', section: 'games',
    hasSubmenu: true, dynamicSubmenu: true, apiCategory: 'lottery', submenuItems: [],
  },

  // Others section
  { label: 'Affiliate', icon: FaHandshake, href: '/affiliate/login', openInNewTab: true, section: 'others' },
  { label: 'Download App', icon: FaMobileAlt, href: '/download', section: 'others' },
  { label: 'Responsible Gaming', icon: FaShieldAlt, href: '/responsible-gambling', section: 'others' },
  { label: 'About Us', icon: FaInfoCircle, href: '/about-us', section: 'others' },
  { label: 'FAQS', icon: FaQuestionCircle, href: '/home', section: 'others' },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { openWinnerBoardModal } = useWinnerBoard();

  const [activeSubmenu, setActiveSubmenu] = useState<MenuItem | null>(null);
  const [subPanelOpen, setSubPanelOpen] = useState(false);

  const [dynamicItems, setDynamicItems] = useState<Record<string, { label: string; href: string; image?: string }[]>>({});
  const [loadingDynamic, setLoadingDynamic] = useState<string | null>(null);

  // Reset when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubPanelOpen(false);
        setActiveSubmenu(null);
      }, 300);
    }
  }, [isOpen]);

  const fetchDynamicSubmenu = useCallback(async (item: MenuItem) => {
    if (!item.dynamicSubmenu || !item.apiCategory) return;
    if (dynamicItems[item.href]) return;

    setLoadingDynamic(item.href);
    try {
      let res;
      try {
        res = await casinoService.getGamesByCategory(item.apiCategory, { limit: 20 });
      } catch {
        res = await casinoService.getGames({ category: item.apiCategory, limit: 20 });
      }

      if (res.success && res.data.length > 0) {
        const subs = res.data.map((game: CasinoGame) => ({
          label: game.gameName,
          href: `${item.href}?game=${game._id}`,
          image: game.imageUrl || '',
        }));
        setDynamicItems(prev => ({ ...prev, [item.href]: subs }));
      } else {
        setDynamicItems(prev => ({ ...prev, [item.href]: [] }));
      }
    } catch (error) {
      console.error('Failed to fetch dynamic submenu:', error);
      setDynamicItems(prev => ({ ...prev, [item.href]: [] }));
    } finally {
      setLoadingDynamic(null);
    }
  }, [dynamicItems]);

  const openSubmenu = (item: MenuItem) => {
    if (activeSubmenu?.href === item.href && subPanelOpen) {
      // Toggle off if same item tapped
      setSubPanelOpen(false);
      setTimeout(() => setActiveSubmenu(null), 200);
      return;
    }
    setActiveSubmenu(item);
    setSubPanelOpen(true);
    if (item.dynamicSubmenu) {
      fetchDynamicSubmenu(item);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const mainItems = menuItems.filter(i => i.section === 'main');
  const gameItems = menuItems.filter(i => i.section === 'games');
  const otherItems = menuItems.filter(i => i.section === 'others');

  const getSubmenuItems = () => {
    if (!activeSubmenu) return [];
    if (activeSubmenu.dynamicSubmenu && dynamicItems[activeSubmenu.href]) {
      return dynamicItems[activeSubmenu.href];
    }
    return activeSubmenu.submenuItems || [];
  };

  const ActiveIcon = activeSubmenu?.icon;

  return (
    <>
      {/* ── Overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden"
          style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.35)', zIndex: 9999 }}
          onClick={handleClose}
        />
      )}

      {/* ── Sidebar + Sub-panel wrapper ── */}
      <div
        className={`fixed top-0 left-0 h-full md:hidden flex
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: 10000 }}
      >
        {/* ── LEFT: Narrow sidebar ── */}
        <aside
          className="h-full flex flex-col border-r border-gray-200"
          style={{ width: `${SIDEBAR_WIDTH}px`, backgroundColor: '#FFFFFF' }}
        >
          <nav className="flex-1 overflow-y-auto">
            {/* Main section */}
            <div className="py-3">
              {mainItems.map((item) => {
                const Icon = item.icon;

                if (item.isModal) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => { openWinnerBoardModal(); handleClose(); }}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                        <Icon className="text-white text-[15px]" />
                      </div>
                      <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                    </button>
                  );
                }

                if (item.hasSubmenu && item.submenuItems && item.submenuItems.length > 0) {
                  const isActive = activeSubmenu?.href === item.href && subPanelOpen;
                  return (
                    <button
                      key={item.href}
                      onClick={() => openSubmenu(item)}
                      className={`w-full flex items-center justify-between px-3 py-3 transition
                        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                          <Icon className="text-white text-[15px]" />
                        </div>
                        <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                      </div>
                    </button>
                  );
                }

                if (item.openInNewTab) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleClose}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                        <Icon className="text-white text-[15px]" />
                      </div>
                      <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClose}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                      <Icon className="text-white text-[15px]" />
                    </div>
                    <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-gray-200" />

            {/* Games section */}
            <div className="py-2">
              <div className="px-3 py-2">
                <span className="text-[15px] font-bold text-gray-900">Games</span>
              </div>
              {gameItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubmenu?.href === item.href && subPanelOpen;

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      if (item.hasSubmenu) {
                        openSubmenu(item);
                      } else {
                        handleClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-3 transition
                      ${isActive ? 'bg-blue-50 border-l-3 border-[#005DAC]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                        <Icon className="text-white text-[15px]" />
                      </div>
                      <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-gray-200" />

            {/* Others section */}
            <div className="py-2">
              <div className="px-3 py-2">
                <span className="text-[15px] font-bold text-gray-900">Others</span>
              </div>
              {otherItems.map((item) => {
                const Icon = item.icon;

                if (item.openInNewTab) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleClose}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                        <Icon className="text-white text-[15px]" />
                      </div>
                      <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClose}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#005DAC] flex items-center justify-center shrink-0">
                      <Icon className="text-white text-[15px]" />
                    </div>
                    <span className="text-[14.5px] font-medium text-gray-800">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* ── RIGHT: Sub-panel (appears to the right of sidebar) ── */}
        <div
          className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: subPanelOpen ? '100px' : '0px',
            backgroundColor: '#F9FCFF',
            borderRight: subPanelOpen ? '1px solid #e5e7eb' : 'none',
          }}
        >
          <div className="flex-1 overflow-y-auto" style={{ minWidth: '100px' }}>
            {loadingDynamic === activeSubmenu?.href ? (
              <div className="flex flex-col items-center justify-center py-10">
                <FaSpinner className="animate-spin text-[#005DAC] text-lg mb-2" />
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : getSubmenuItems().length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-xs text-gray-400">No items</span>
              </div>
            ) : (
              <div className="py-1">
                {getSubmenuItems().map((sub, idx) => (
                  <Link
                    key={sub.href + idx}
                    href={sub.href}
                    onClick={handleClose}
                    className="flex flex-col items-center gap-1 px-1.5 py-2.5 hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    {sub.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <img
                          src={sub.image}
                          alt={sub.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                        {ActiveIcon && <ActiveIcon className="text-[#005DAC] text-lg" />}
                      </div>
                    )}
                    <span className="text-[11px] font-medium text-gray-700 text-center leading-tight line-clamp-2 w-full">
                      {sub.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
