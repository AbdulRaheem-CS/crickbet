'use client';

/**
 * Category Navigation Component
 * Horizontal category navigation with inline games cards
 */

import { useState, useEffect } from 'react';
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
} from 'react-icons/fa';

interface Category {
  name: string;
  icon: IconType;
  key: string;
}

const categories: Category[] = [
  { name: 'HOT', icon: FaFire, key: 'HOT' },
  { name: 'SPORTS', icon: FaFutbol, key: 'SPORTS' },
  { name: 'CASINO', icon: FaDice, key: 'CASINO' },
  { name: 'SLOTS', icon: FaDice, key: 'SLOTS' },
  { name: 'CRASH', icon: FaRocket, key: 'CRASH' },
  { name: 'TABLE', icon: FaTableTennis, key: 'TABLE' },
  { name: 'FISHING', icon: FaFish, key: 'FISHING' },
  { name: 'ARCADE', icon: FaGamepad, key: 'ARCADE' },
  { name: 'LOTTERY', icon: FaTicketAlt, key: 'LOTTERY' },
];

export default function CategoryNav() {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState(categories[0].key);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample games per category — replace with API-driven data if available
  const gamesByCategory: Record<string, { name: string; img?: string }[]> = {
    HOT: [
      { name: 'Super Ace', img: '/banners/image_282634.jpg' },
      { name: 'Fortune Gems 500', img: '/banners/image_294118.jpg' },
      { name: 'Boxing King', img: '/banners/image_319646.jpg' },
      { name: 'Super Ace Deluxe', img: '/banners/image_320643.jpg' },
      { name: 'Fortune Gems 3', img: '/banners/image_322614.jpg' },
      { name: 'Fortune Gems 2', img: '/banners/image_294118.jpg' },
      { name: 'Fortune Gems', img: '/banners/image_322614.jpg' },
      { name: 'Money Coming', img: '/banners/image_282634.jpg' },
      { name: 'HEYVIP Super Elements', img: '/banners/image_320643.jpg' },
      { name: 'HEYVIP Chinese New Year', img: '/banners/image_319646.jpg' },
      { name: 'HEYVIP Golden Game', img: '/banners/image_294118.jpg' },
      { name: 'HEYVIP Pirate Legend', img: '/banners/image_322614.jpg' },
      { name: 'Aviator', img: '/banners/image_282634.jpg' },
      { name: 'Match Odds', img: '/banners/image_320643.jpg' },
      { name: 'Crazy Time', img: '/banners/image_319646.jpg' },
      { name: 'Sexy Baccarat', img: '/banners/image_294118.jpg' },
      { name: 'HEYVIP Crash', img: '/banners/image_322614.jpg' },
      { name: 'Boxing King Title Match', img: '/banners/image_282634.jpg' },
      { name: 'Wild Bounty Showdown', img: '/banners/image_320643.jpg' },
      { name: 'Magic Ace Wild Lock', img: '/banners/image_319646.jpg' },
    ],
    SPORTS: [
      { name: 'CRICKET' },
      { name: 'HORSE RACING' },
      { name: 'SABA' },
      { name: 'HORSE' },
      { name: 'BTi' },
    ],
    CASINO: [
      { name: 'SEXY' },
      { name: 'EVO' },
      { name: 'HOTROAD' },
      { name: 'PP' },
      { name: 'DG' },
      { name: 'MG' },
    ],
    SLOTS: [],
    CRASH: [],
    TABLE: [],
    FISHING: [],
    ARCADE: [],
    LOTTERY: [],
  };

  if (!mounted) {
    return (
      <div className="bg-white overflow-x-auto">
        <div className="bg-[#004179] mx-4 md:mx-8 h-28 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white">
  <div className="bg-[#004179] mx-4 md:mx-8 flex items-center gap-1 py-0 rounded-lg overflow-hidden">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const active = selected === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelected(cat.key)}
              className={`flex flex-col items-center justify-center h-20 shrink-4 rounded-lg px-2 transition ${
                  active ? 'bg-[#005DAC] text-white' : 'text-gray-200 hover:bg-[#005DAC] hover:text-white'
                }`}
                style={{ minWidth: 88 }}
            >
                <Icon className="text-2xl md:text-3xl mb-0" />
                <span className="text-sm font-extrabold">{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-4 md:mx-8 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-8 bg-[#005DAC] rounded" />
          <h3 className="text-2xl font-extrabold">{selected}</h3>
        </div>

    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {(gamesByCategory[selected] || []).map((game, i) => (
            <button
              key={i}
      className="bg-white rounded-sm border border-gray-100 p-2 flex flex-col items-center gap-1 hover:shadow-sm transition text-left"
              type="button"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center overflow-hidden">
                {game.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.img} alt={game.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded" />
                )}
              </div>
              <div className="w-full">
                <p className="text-xs font-medium text-gray-800 truncate">{game.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

