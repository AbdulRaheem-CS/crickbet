'use client';

/**
 * Game Launcher Component
 * Full-screen iframe overlay for playing casino games
 */

import { useState, useCallback } from 'react';
import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

interface GameLauncherProps {
  gameUrl: string;
  gameName: string;
  onClose: () => void;
}

export default function GameLauncher({ gameUrl, gameName, onClose }: GameLauncherProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#004179] text-white shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold truncate max-w-[200px] md:max-w-[400px]">
            {gameName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Close game"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Game iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm">Loading {gameName}...</p>
            </div>
          </div>
        )}
        <iframe
          src={gameUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          onLoad={() => setLoading(false)}
          title={gameName}
        />
      </div>
    </div>
  );
}
