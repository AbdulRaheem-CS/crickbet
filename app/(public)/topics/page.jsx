"use client";

import { useState } from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/public/HeroSlider';
import { TOPICS, TABS, PAGE_SIZE, slugify } from './topicsData';

export default function TopicsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currentTopic = TOPICS[activeTab];
  const allArticles = currentTopic.articles;

  const filtered = searchQuery.trim()
    ? allArticles.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : allArticles;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const half = Math.ceil(paginated.length / 2);
  const leftCol = paginated.slice(0, half);
  const rightCol = paginated.slice(half);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
  };

  return (
    <div className="m-0 p-0 bg-[#1a4c8a]">

      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Header area: Greeting + Search ── */}
      <div className="pt-8 pb-4 text-center" style={{  }}>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Good Day!</h1>
        <p className="text-lg md:text-xl text-white mb-5">
          How can we <span className="text-[#7FFF00]">help you</span> today?
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search our help articles..."
              className="w-full py-3 px-5 pr-12 rounded-full bg-white text-gray-700 placeholder-gray-500 text-[15px] focus:outline-none shadow-md"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="w-full" style={{ }}>
        <div className="max-w-4xl mx-auto px-4 pt-5">
          <div className="rounded-lg border border-[#2e6aaf] overflow-hidden" style={{borderColor: '#61d81d',marginBottom: '1rem' }}>
            <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className="relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0"
                    style={{ color: isActive ? '#7FFF00' : 'rgba(255,255,255,0.85)' }}
                  >
                    {TOPICS[tab].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Articles Section ── */}
      <div className="w-full" style={{ }}>
        <div className="max-w-4xl mx-auto px-6 md:px-8 pt-8 pb-12">
          {/* Category Title */}
          <h2 className="text-white text-lg font-bold mb-6">{currentTopic.label}</h2>

          {filtered.length === 0 ? (
            <p className="text-white/50 text-center py-12 text-sm">No articles found for &ldquo;{searchQuery}&rdquo;</p>
          ) : (
            <>
              {/* Two-column article list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {/* Left */}
                <ul>
                  {leftCol.map((article, i) => (
                    <li key={i}>
                      <Link
                        href={`/topics/${slugify(article.title)}`}
                        className="flex items-start gap-2.5 py-3 text-white hover:text-[#7FFF00] transition"
                      >
                        <span className="text-[#7FFF00] text-sm mt-px shrink-0">›</span>
                        <span className="text-[14px] leading-relaxed">{article.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Right */}
                <ul>
                  {rightCol.map((article, i) => (
                    <li key={i}>
                      <Link
                        href={`/topics/${slugify(article.title)}`}
                        className="flex items-start gap-2.5 py-3 text-white hover:text-[#7FFF00] transition"
                      >
                        <span className="text-[#7FFF00] text-sm mt-px shrink-0">›</span>
                        <span className="text-[14px] leading-relaxed">{article.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition"
                      style={{
                        background: currentPage === page ? '#22c55e' : '#2563a8',
                        color: '#fff',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition hover:bg-[#2563a8]"
                      style={{ background: '#1a5099' }}
                    >
                      Next »
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
