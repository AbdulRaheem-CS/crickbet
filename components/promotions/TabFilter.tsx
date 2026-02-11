'use client';

import { useState } from 'react';

interface TabFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function TabFilter({ categories, activeCategory, onCategoryChange }: TabFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
      <div className="flex gap-2 p-2 min-w-max">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-6 py-2.5 rounded font-medium transition whitespace-nowrap ${
              activeCategory === category
                ? 'bg-[#015DAC] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
