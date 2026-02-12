'use client';

/**
 * Sports Page
 * Display sports betting games and handle game launches
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { casinoService } from '@/lib/services/casino.service';
import type { CasinoGame } from '@/lib/services/casino.service';
import GameLauncher from '@/components/casino/GameLauncher';
import { FaPlay, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function SportsPage() {
	const searchParams = useSearchParams();
	const { user, openAuthModal } = useAuth();
	const [games, setGames] = useState<CasinoGame[]>([]);
	const [loading, setLoading] = useState(true);
	const [launchUrl, setLaunchUrl] = useState<string | null>(null);
	const [launchName, setLaunchName] = useState('');
	const [launching, setLaunching] = useState<string | null>(null);

	useEffect(() => {
		// Check if a specific game was selected
		const gameId = searchParams?.get('game');
		if (gameId) {
			// Auto-launch the selected game
			handlePlayById(gameId);
		} else {
			// Load all sports games
			fetchSportsGames();
		}
	}, [searchParams]);

	const fetchSportsGames = async () => {
		try {
			// Fetch from 'live' category (where sports games are typically stored)
			const res = await casinoService.getGamesByCategory('live', { limit: 50 });
			if (res.success) {
				setGames(res.data);
			}
		} catch (error) {
			console.error('Failed to fetch sports games:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePlayById = async (gameId: string) => {
		if (!user) {
			openAuthModal('login');
			return;
		}

		setLaunching(gameId);
		try {
			const res = await casinoService.launchGame(gameId);
			if (res.success && res.data.gameUrl) {
				setLaunchUrl(res.data.gameUrl);
				setLaunchName('Sports Game');
			}
		} catch (error) {
			console.error('Failed to launch game:', error);
		} finally {
			setLaunching(null);
		}
	};

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
		} catch (error) {
			console.error('Failed to launch game:', error);
		} finally {
			setLaunching(null);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="flex items-center gap-2 text-gray-400">
					<FaSpinner className="animate-spin" />
					<span className="text-sm">Loading sports games...</span>
				</div>
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

			<div className="min-h-screen bg-white p-8">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Sports Betting</h1>
					<p className="text-gray-600">Place your bets on live sports events</p>
				</div>

				{/* Games Grid */}
				{games.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-gray-400 text-sm">No sports games available yet</p>
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
									className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative group"
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
											<div className="w-full h-full bg-linear-to-br from-green-500 to-blue-600 flex items-center justify-center">
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
									<div className="p-3 bg-white">
										<p className="text-sm font-medium text-gray-800 truncate text-center">
											{game.gameName}
										</p>
									</div>
								</button>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
