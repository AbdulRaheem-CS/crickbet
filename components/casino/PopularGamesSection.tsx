'use client';

/**
 * Popular Games Section Component
 * Displays popular games in a grid layout with game cards
 */

import { useState, useEffect } from 'react';
import { FaChevronRight, FaPlay, FaSpinner } from 'react-icons/fa';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame } from '@/lib/services/casino.service';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import GameLauncher from '@/components/casino/GameLauncher';

export default function PopularGamesSection() {
  const { user } = useAuth();
  const popRouter = useRouter();
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [launchName, setLaunchName] = useState('');
  const [launching, setLaunching] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularGames();
  }, []);

  const fetchPopularGames = async () => {
    try {
      const res = await casinoService.getGames({ limit: 16, sort: '-stats.totalPlays' });
      if (res.success) {
        setGames(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch popular games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (game: CasinoGame) => {
    if (!user) {
      popRouter.push('/login');
      return;
    }

    setLaunching(game._id);
    try {
      const res = await casinoService.launchGame(game._id);
      if (res.success && res.data.gameUrl) {
        setLaunchUrl(res.data.gameUrl);
        setLaunchName(game.gameName);
      }
    } catch (error) {
      console.error('Failed to launch game:', error);
    } finally {
      setLaunching(null);
    }
  };

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

      <div className="mx-0 md:mx-8 mt-0 mb-2 p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 py-[11px] md:py-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-[#005DAC] rounded" />
            <h3 className="font-extrabold text-[17.2px] md:text-[17.2px] text-black">Popular Games</h3>
          </div>
          <button className="flex items-center gap-1 text-[#005DAC] text-sm font-medium hover:underline">
            View All <FaChevronRight className="text-xs" />
          </button>
        </div>

				{/* Games Grid - Horizontal Scrollable */}
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="flex items-center gap-2 text-gray-400">
							<FaSpinner className="animate-spin" />
							<span className="text-sm">Loading games...</span>
						</div>
					</div>
				) : games.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-gray-400 text-sm">No games available yet</p>
					</div>
				) : (
					<div className="overflow-x-auto pb-4 -mx-2 scrollbar-hide">
						<div className="flex gap-3 px-2">
							{games.map((game) => {
								// Get image
								let imageUrl: string | null = null;
								if (game.langIcon && typeof game.langIcon === 'object') {
									imageUrl =
										(game.langIcon as any)['en'] ||
										(game.langIcon as any)['0'] ||
										(Object.values(game.langIcon)[0] as string) ||
										null;
								}
								if (!imageUrl && game.imageUrl) imageUrl = game.imageUrl;

								return (
									<button
										key={game._id}
										className="bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0 hover:shadow-lg transition-shadow relative group w-40 h-35 sm:w-56"
										type="button"
										onClick={() => handlePlay(game)}
									>
										<div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
											{imageUrl ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={imageUrl}
													alt={game.gameName}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
													<span className="text-white text-2xl font-bold">
														{game.gameName.slice(0, 2).toUpperCase()}
													</span>
												</div>
											)}
											{/* Play overlay */}
											<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
												{launching === game._id ? (
													<FaSpinner className="text-white text-2xl animate-spin" />
												) : (
													<FaPlay className="text-white text-xl" />
												)}
											</div>
											
										</div>
										<div className="p-2 bg-white">
											<p className="text-sm font-medium text-gray-800 truncate text-center">
												{game.gameName}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}
      </div>
    </>
  );
}
