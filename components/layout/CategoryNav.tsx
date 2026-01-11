'use client';

/**
 * Category Navigation Component
 * Horizontal category navigation
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { 
  FaFire, FaFutbol, FaDice, FaRocket, 
  FaTableTennis, FaFish, FaGamepad, FaTicketAlt 
} from 'react-icons/fa';

interface Category {
  name: string;
  icon: IconType;
  href: string;
}

const categories: Category[] = [
  { name: 'HOT', icon: FaFire, href: '/dashboard' },
  { name: 'SPORTS', icon: FaFutbol, href: '/sports' },
  { name: 'CASINO', icon: FaDice, href: '/casino' },
  { name: 'SLOTS', icon: FaDice, href: '/slots' },
  { name: 'CRASH', icon: FaRocket, href: '/crash' },
  { name: 'TABLE', icon: FaTableTennis, href: '/table' },
  { name: 'FISHING', icon: FaFish, href: '/fishing' },
  { name: 'ARCADE', icon: FaGamepad, href: '/arcade' },
  { name: 'LOTTERY', icon: FaTicketAlt, href: '/lottery' },
];

export default function CategoryNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-blue-800 overflow-x-auto">
        <div className="flex items-center justify-center gap-2 px-4 py-3 h-24" />
      </div>
    );
  }

  return (
    <div className="bg-blue-800 overflow-x-auto">
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.href}
              href={category.href}
              className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg transition min-w-[90px] ${
                pathname === category.href
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-200 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <IconComponent className="text-2xl mb-1" />
              <span className="text-xs font-semibold">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
