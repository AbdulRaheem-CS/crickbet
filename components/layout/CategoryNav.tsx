'use client';

/**
 * Category Navigation Component
 * Horizontal category navigation with real game cards from GSC+
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconType } from 'react-icons';
import {
  FaFire,
  FaFutbol,
  FaDice,
  FaRocket,
  FaTableTennis,
  FaFish,
  FaGamepad,
  FaTicketAlt,
  FaStar,
  FaChevronRight,
  FaPlay,
  FaSpinner,
} from 'react-icons/fa';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame } from '@/lib/services/casino.service';
import { useAuth } from '@/context/AuthContext';
import GameLauncher from '@/components/casino/GameLauncher';

interface Category {
  name: string;
  icon: IconType;
  key: string;
  apiCategory?: string; // maps to backend category
  href: string;
}

const categories: Category[] = [
  { name: 'HOT', icon: FaFire, key: 'HOT', href: '/slots' },
  { name: 'SPORTS', icon: FaFutbol, key: 'SPORTS', apiCategory: 'sports', href: '/sports' },
  { name: 'CASINO', icon: FaDice, key: 'CASINO', apiCategory: 'live', href: '/casino' },
  { name: 'SLOTS', icon: FaStar, key: 'SLOTS', apiCategory: 'slots', href: '/slots' },
  { name: 'CRASH', icon: FaRocket, key: 'CRASH', apiCategory: 'crash', href: '/crash' },
  { name: 'TABLE', icon: FaTableTennis, key: 'TABLE', apiCategory: 'table', href: '/table' },
  { name: 'FISHING', icon: FaFish, key: 'FISHING', apiCategory: 'fishing', href: '/fishing' },
  { name: 'ARCADE', icon: FaGamepad, key: 'ARCADE', apiCategory: 'arcade', href: '/arcade' },
  { name: 'LOTTERY', icon: FaTicketAlt, key: 'LOTTERY', apiCategory: 'lottery', href: '/lottery' },
];

export default function CategoryNav() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(categories[0].key);
  const [games, setGames] = useState<Record<string, CasinoGame[]>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [launchName, setLaunchName] = useState('');
  const [launching, setLaunching] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Intersection Observer for sticky behavior
  useEffect(() => {
    if (!mounted || !navRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the original nav is not intersecting (scrolled past), show sticky
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' } // account for navbar height
    );
    observer.observe(navRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // Fetch games for a category
  const fetchCategoryGames = useCallback(async (catKey: string) => {
    if (games[catKey]) return; // Already loaded

    const cat = categories.find((c) => c.key === catKey);
    if (!cat) return;

    setLoading(catKey);
    try {
      let res;
      if (catKey === 'HOT') {
        // HOT = popular games across all categories
        res = await casinoService.getGames({ limit: 20, sort: '-stats.totalPlays' });
      } else if (cat.apiCategory) {
        res = await casinoService.getGamesByCategory(cat.apiCategory, { limit: 20 });
      } else {
        res = await casinoService.getGames({ limit: 20 });
      }

      if (res.success) {
        setGames((prev) => ({ ...prev, [catKey]: res.data }));
      }
    } catch {
      // silent fail - show empty
    } finally {
      setLoading(null);
    }
  }, [games]);

  // Fetch games when category changes
  useEffect(() => {
    if (mounted) {
      fetchCategoryGames(selected);
    }
  }, [selected, mounted, fetchCategoryGames]);

  // Handle game play
  const handlePlay = async (game: CasinoGame) => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    setLaunching(game._id);
    try {
      const res = await casinoService.launchGame(game._id);
      if (res.success && res.data.gameUrl) {
        setLaunchUrl(res.data.gameUrl);
        setLaunchName(game.gameName);
      }
    } catch {
      // silent
    } finally {
      setLaunching(null);
    }
  };

  const selectedCat = categories.find((c) => c.key === selected);
  const currentGames = games[selected] || [];

  if (!mounted) {
    return (
      <div className="bg-[#F6F6F6] overflow-x-auto">
        <div className="category-nav-bar bg-[#004179]" style={{ height: 100 }} />
        <style>{`
          .category-nav-bar {
            border-radius: 0;
            margin-left: 0;
            margin-right: 0;
          }
          @media (min-width: 768px) {
            .category-nav-bar {
              border-radius: 0.5rem;
              margin-left: 2rem;
              margin-right: 2rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Game Launcher Overlay */}
      {launchUrl && (
        <GameLauncher
          gameUrl={launchUrl}
          gameName={launchName}
          onClose={() => {
            setLaunchUrl(null);
            setLaunchName('');
          }}
        />
      )}

      <div className="bg-[#F6F6F6]">
        <style>{`
          .category-nav-bar {
            border-radius: 0;
            margin-left: 0;
            margin-right: 0;
            overflow-x: auto;
          }
          @media (min-width: 768px) {
            .category-nav-bar {
              border-radius: 0.5rem;
              margin-left: 2rem;
              margin-right: 2rem;
              overflow: hidden;
            }
          }
          .category-sticky-bar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .category-sticky-bar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Sticky compact bar - appears when original nav is scrolled out (mobile only) */}
        {isSticky && (
          <div className="category-sticky-bar fixed top-13 left-0 right-0 z-30 bg-[#004179] flex md:hidden items-center gap-0 overflow-x-auto scrollbar-hide shadow-md" style={{ height: 40 }}>
            {categories.map((cat) => {
              const active = selected === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelected(cat.key)}
                  className={`flex items-center justify-center h-full shrink-0 transition ${
                    active ? 'bg-[#005DAC] text-white' : 'text-gray-200 hover:bg-[#005DAC] hover:text-white'
                  }`}
                  style={{ minWidth: 70, fontSize: 13.5, fontWeight: 700 }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Original nav bar */}
        <div ref={navRef} className="category-nav-bar bg-[#004179] flex items-center gap-0 md:gap-2 py-0 scrollbar-hide" style={{ height: 100 }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selected === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelected(cat.key)}
                className={`flex flex-col items-center justify-center h-full shrink-0 rounded-lg px-1.5 md:px-4 transition ${
                  active ? 'bg-[#005DAC] text-white' : 'text-gray-200 hover:bg-[#005DAC] hover:text-white'
                }`}
                style={{ minWidth: 70 }}
              >
                <Icon className="text-2xl md:text-3xl mb-0" />
                <span className="text-sm font-extrabold">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mx-0 md:mx-8 mt-0 p-2">
          <div className="flex items-center justify-between mb-4 py-[11px] md:py-0">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-[#005DAC] rounded" />
              <h3 className="font-extrabold text-[17.2px] md:text-[17.2px] text-black">{selected}</h3>
            </div>
            {selectedCat && (
              <button
                onClick={() => router.push(selectedCat.href)}
                className="flex items-center gap-1 text-[#005DAC] text-sm font-medium hover:underline"
              >
                View All <FaChevronRight className="text-xs" />
              </button>
            )}
          </div>

          {loading === selected ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-gray-400">
                <FaSpinner className="animate-spin" />
                <span className="text-sm">Loading games...</span>
              </div>
            </div>
          ) : currentGames.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-400 text-sm">No games available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {currentGames.map((game) => {
                // Get image
                let imageUrl: string | null = null;
                if (game.langIcon && typeof game.langIcon === 'object') {
                  imageUrl =
                    (game.langIcon as any)['en'] ||
                    (game.langIcon as any)['0'] ||
                    Object.values(game.langIcon)[0] as string || null;
                }
                if (!imageUrl && game.imageUrl) imageUrl = game.imageUrl;

                return (
                  <button
                    key={game._id}
                    className="bg-white rounded-sm border border-gray-100 p-2 flex flex-col items-center gap-1 hover:shadow-sm transition text-left relative group"
                    type="button"
                    onClick={() => handlePlay(game)}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden relative">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={game.gameName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {game.gameName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {launching === game._id ? (
                          <FaSpinner className="text-white text-sm animate-spin" />
                        ) : (
                          <FaPlay className="text-white text-xs" />
                        )}
                      </div>
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-medium text-gray-800 truncate">{game.gameName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

