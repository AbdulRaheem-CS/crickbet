'use client';

import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { FaCheck, FaGift } from 'react-icons/fa';

/**
 * Lucky Spin Component
 * Floating lucky wheel button
 */

export default function LuckySpin() {
  return (
    <div className="fixed bottom-6 right-6 z-30 mb-8">
      <button className="relative group">
        {/* Spinning Wheel (GIF) */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://jwrcdn.monopolygaming.com/spinwin.gif" alt="Lucky Spin" className="w-full h-full object-cover" />
        </div>
        
        {/* Checkmark Badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
          <FaCheck className="text-white text-xs" />
        </div>

        {/* Hover Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap flex items-center gap-1">
            Lucky Spin <FaGift className="inline" />
          </div>
        </div>
      </button>
    </div>
  );
}
