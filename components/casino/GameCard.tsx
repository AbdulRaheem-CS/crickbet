'use client';

/**
 * Game Card Component
 * Displays a casino game card with image, name, and provider
 * Used across all casino category pages
 */

import { useState } from 'react';
import { FaPlay, FaStar, FaFire } from 'react-icons/fa';
import type { CasinoGame } from '@/lib/services/casino.service';

interface GameCardProps {
  game: CasinoGame;
  onPlay: (game: CasinoGame) => void;
  onDemo?: (game: CasinoGame) => void;
  compact?: boolean;
}

export default function GameCard({ game, onPlay, onDemo, compact = false }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Get the best image URL
  const getImageUrl = () => {
    if (imageError) return null;
    // Try langIcon first (usually higher quality)
    if (game.langIcon && typeof game.langIcon === 'object') {
      const iconUrl = (game.langIcon as any)['en'] || (game.langIcon as any)['0'] || Object.values(game.langIcon)[0];
      if (iconUrl) return iconUrl;
    }
    if (game.imageUrl) return game.imageUrl;
    return null;
  };

  const imageUrl = getImageUrl();

  // Color palette for fallback backgrounds
  const colors = [
    'from-purple-600 to-blue-600',
    'from-pink-600 to-red-600',
    'from-green-600 to-teal-600',
    'from-orange-600 to-yellow-600',
    'from-indigo-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-red-600 to-pink-600',
    'from-teal-600 to-green-600',
  ];
  const colorIndex = game.gameCode ? game.gameCode.charCodeAt(0) % colors.length : 0;

  if (compact) {
    return (
      <button
        onClick={() => onPlay(game)}
        className="bg-white rounded-sm border border-gray-100 p-2 flex flex-col items-center gap-1 hover:shadow-sm transition text-left"
        type="button"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={game.gameName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {game.gameName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="w-full">
          <p className="text-xs font-medium text-gray-800 truncate">{game.gameName}</p>
        </div>
      </button>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      onClick={() => onPlay(game)}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={game.gameName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
            <span className="text-white text-2xl font-bold">
              {game.gameName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {game.isHot && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <FaFire className="text-[8px]" /> HOT
            </span>
          )}
          {game.isNew && (
            <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {game.isPopular && (
            <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <FaStar className="text-[8px]" /> TOP
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 ${
            showOverlay ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(game);
            }}
            className="bg-[#005DAC] hover:bg-[#004179] text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition"
          >
            <FaPlay className="text-xs" /> Play Now
          </button>
          {onDemo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDemo(game);
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-5 py-1.5 rounded-lg text-xs font-medium transition"
            >
              Try Demo
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-semibold text-gray-900 truncate">{game.gameName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{game.productName || 'Unknown Provider'}</p>
      </div>
    </div>
  );
}
