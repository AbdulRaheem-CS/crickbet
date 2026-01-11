'use client';

/**
 * Crash Game Page
 */

import { FaRocket } from 'react-icons/fa';

export default function CrashPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Crash Game</h1>
      
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">Crash game will appear here</p>
        <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <FaRocket className="text-white text-4xl" />
            <p className="text-white text-xl">Game Area</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">My Bets</h3>
          {/* TODO: Show user's crash game bets */}
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">All Bets</h3>
          {/* TODO: Show all players' bets */}
        </div>
      </div>
    </div>
  );
}
