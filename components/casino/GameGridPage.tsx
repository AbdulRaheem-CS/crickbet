'use client';

/**
 * Game Grid Page Component
 * Shared component used by all game category pages
 * Handles fetching, filtering, search, pagination, and game launching
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaFilter, FaTh, FaThLarge, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame, ProviderInfo } from '@/lib/services/casino.service';
import { useAuth } from '@/context/AuthContext';
import GameCard from './GameCard';
import GameLauncher from './GameLauncher';

interface GameGridPageProps {
  category?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showProviderFilter?: boolean;
  showCategoryFilter?: boolean;
  defaultLimit?: number;
}

function GameGridContent({
  category,
  title,
  subtitle,
  icon,
  showProviderFilter = true,
  showCategoryFilter = false,
  defaultLimit = 40,
}: GameGridPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  // Read initial provider filter from URL query params (e.g., /casino?provider=Evolution)
  const initialProvider = searchParams.get('provider') || '';

  // State
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProvider);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [gridSize, setGridSize] = useState<'normal' | 'large'>('normal');

  // Game launcher
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [launchName, setLaunchName] = useState('');
  const [launching, setLaunching] = useState<string | null>(null);

  // Fetch providers
  useEffect(() => {
    if (showProviderFilter) {
      casinoService.getProviders().then((res) => {
        if (res.success) {
          // Filter providers that have games in this category
          const filtered = category
            ? res.data.filter((p) => p.categories.includes(category))
            : res.data;
          setProviders(filtered);
        }
      }).catch(() => {});
    }
  }, [showProviderFilter, category]);

  // Fetch games
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: defaultLimit,
      };
      if (category) params.category = category;
      if (search) params.search = search;

      let res: any;
      // selectedProvider can be either a numeric productCode or a provider name like 'Evolution'
      if (selectedProvider) {
        const asNumber = parseInt(selectedProvider, 10);
        if (!Number.isNaN(asNumber)) {
          params.productCode = asNumber;
          res = await casinoService.getGames(params);
        } else {
          // provider name -- use provider-specific endpoint which expects provider name
          // If category is set, fetch a large limit (all games) since the provider endpoint doesn't support category param
          // Then we'll filter and paginate client-side
          if (category) {
            res = await casinoService.getGamesByProvider(selectedProvider, { page: 1, limit: 10000 });
            if (res && res.success) {
              let fetched = res.data || [];
              // Filter by category client-side
              fetched = fetched.filter((g: any) => g.category === category);
              // Apply search filter if present
              if (search) {
                const searchLower = search.toLowerCase();
                fetched = fetched.filter((g: any) =>
                  g.gameName?.toLowerCase().includes(searchLower) ||
                  g.gameCode?.toLowerCase().includes(searchLower)
                );
              }
              const totalFiltered = fetched.length;
              const start = (page - 1) * defaultLimit;
              const pageItems = fetched.slice(start, start + defaultLimit);
              setGames(pageItems);
              setTotalPages(Math.ceil(totalFiltered / defaultLimit) || 1);
              setTotalGames(totalFiltered);
              setLoading(false);
              return;
            }
          } else {
            // No category filter - use server-side pagination
            res = await casinoService.getGamesByProvider(selectedProvider, { page, limit: defaultLimit });
          }
        }
      } else {
        res = await casinoService.getGames(params);
      }
      if (res.success) {
        setGames(res.data);
        setTotalPages(res.pagination.pages);
        setTotalGames(res.pagination.total);
      } else {
        setError('Failed to load games');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [page, category, search, selectedProvider, defaultLimit]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Sync provider filter when URL query param changes
  useEffect(() => {
    const urlProvider = searchParams.get('provider') || '';
    if (urlProvider !== selectedProvider) {
      setSelectedProvider(urlProvider);
      setPage(1);
    }
  }, [searchParams]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      } else {
        alert(res.message || 'Failed to launch game. Please try again.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to launch game';
      alert(message);
    } finally {
      setLaunching(null);
    }
  };

  // Handle demo play
  const handleDemo = async (game: CasinoGame) => {
    setLaunching(game._id);
    try {
      const res = await casinoService.launchDemo(game._id);
      if (res.success && res.data.gameUrl) {
        setLaunchUrl(res.data.gameUrl);
        setLaunchName(`${game.gameName} (Demo)`);
      } else {
        alert(res.message || 'Demo mode is not available for this game.');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Demo not available';
      alert(message);
    } finally {
      setLaunching(null);
    }
  };

  const gridCols = gridSize === 'large'
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
    : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7';

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

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-[#004179] text-white px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h1 className="text-2xl font-bold">{title}</h1>
            {totalGames > 0 && (
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {totalGames} games
              </span>
            )}
          </div>
          {subtitle && <p className="text-blue-200 text-sm">{subtitle}</p>}
        </div>

        {/* Filters Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
              />
            </div>

            {/* Provider filter */}
            {showProviderFilter && providers.length > 0 && (
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Providers</option>
                {providers.map((p) => (
                  <option key={p._id} value={p.productCode}>
                    {p.productName} ({p.gameCount})
                  </option>
                ))}
              </select>
            )}

            {/* Grid size toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setGridSize('normal')}
                className={`p-2 rounded-md transition ${
                  gridSize === 'normal' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
                title="Small grid"
              >
                <FaTh className="text-sm" />
              </button>
              <button
                onClick={() => setGridSize('large')}
                className={`p-2 rounded-md transition ${
                  gridSize === 'large' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
                title="Large grid"
              >
                <FaThLarge className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Loading games...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 mb-3">{error}</p>
              <button
                onClick={fetchGames}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 text-lg mb-2">No games found</p>
              <p className="text-gray-400 text-sm">
                {search ? 'Try a different search term' : 'No games available in this category'}
              </p>
            </div>
          ) : (
            <>
              <div className={`grid ${gridCols} gap-3`}>
                {games.map((game) => (
                  <div key={game._id} className="relative">
                    <GameCard
                      game={game}
                      onPlay={handlePlay}
                      onDemo={handleDemo}
                    />
                    {launching === game._id && (
                      <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                        <FaSpinner className="text-blue-600 text-xl animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FaChevronLeft className="text-xs" /> Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                            page === pageNum
                              ? 'bg-[#005DAC] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next <FaChevronRight className="text-xs" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function GameGridPage(props: GameGridPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    }>
      <GameGridContent {...props} />
    </Suspense>
  );
}
