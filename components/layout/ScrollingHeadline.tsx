'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaBullhorn } from 'react-icons/fa';
import { publicAPI } from '@/lib/api-client';

/**
 * Scrolling Headline Component
 * Continuously scrolling marquee-style announcement banner
 * Headlines are managed from Admin Panel → Headlines tab
 */

const DEFAULT_HEADLINES = [
  "Join KingBaji 🏏 Earn unlimited rebate commission from every refer up to 3 tier. Back & Lay, Premium Cricket Market, 20+ Sports",
  "Weekly Leaderboard Rs.12,000 - Hit Big Multiplier on Aviator",
  "New Games Added! Check out our latest casino games",
];

export default function ScrollingHeadline() {
  const [headlines, setHeadlines] = useState<string[]>([]);

  const fetchHeadlines = useCallback(async () => {
    try {
      const res = await publicAPI.getHeadlines();
      // apiClient interceptor returns response.data directly,
      // so res = { success: true, data: [...] }
      const active: string[] = ((res as any)?.data ?? [])
        .filter((h: { enabled: boolean }) => h.enabled)
        .map((h: { text: string }) => h.text);
      setHeadlines(active.length > 0 ? active : DEFAULT_HEADLINES);
    } catch {
      setHeadlines(DEFAULT_HEADLINES);
    }
  }, []);

  useEffect(() => {
    fetchHeadlines();

    // Re-fetch when user returns to this tab (e.g. after saving in admin)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchHeadlines();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchHeadlines]);

  // Show defaults while loading to avoid empty banner flash
  const displayHeadlines = headlines.length > 0 ? headlines : DEFAULT_HEADLINES;
  const duplicated = [...displayHeadlines, ...displayHeadlines];

  return (
    <div className="bg-[#1E5DAC] md:bg-[#F6F6F6] text-white md:text-black py-3 overflow-hidden relative px-1 md:p-8">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="flex items-center">
        {/* Icon - Fixed on the left */}
        <div className="shrink-0 pl-4 pr-4 z-10">
          <FaBullhorn className="text-white md:text-yellow-400 text-xl animate-pulse" />
        </div>

        {/* Scrolling Content */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap" style={{ animation: 'marquee 5s linear infinite' }}>
            {duplicated.map((headline, index) => (
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
