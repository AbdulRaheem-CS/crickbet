'use client';

import { FaBullhorn } from 'react-icons/fa';

/**
 * Scrolling Headline Component
 * Continuously scrolling marquee-style announcement banner
 */

export default function ScrollingHeadline() {
  const headlines = [
    "Join Crickex 🏏 Earn unlimited rebate commission from every refer up to 3 tier. Back & Lay, Premium Clicket Market, 20+ Sports",
    "Weekly Leaderboard Rs.12,000 - Hit Big Multiplier on Aviator",
    "New Games Added! Check out our latest casino games "
  ];

  // Duplicate the headlines to create seamless infinite scroll
  const duplicatedHeadlines = [...headlines, ...headlines];

  return (
    <div className="bg-gradient-to-r from-[#F6F6F6] to-[#F6F6F6] text-black py-3 overflow-hidden relative p-8">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex items-center">
        {/* Icon - Fixed on the left */}
        <div className="shrink-0 pl-4 pr-4 z-10">
          <FaBullhorn className="text-yellow-400 text-xl animate-pulse" />
        </div>

        {/* Scrolling Content Container - Takes remaining width */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 10s linear infinite' }}>
            {duplicatedHeadlines.map((headline, index) => (
              <span
                key={index}
                className="inline-flex items-center mx-8 text-sm md:text-base font-medium"
              >
                {headline}
                <span className="mx-4 text-yellow-400">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
