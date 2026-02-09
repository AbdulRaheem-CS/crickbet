"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroSlider from '@/components/public/HeroSlider';

export default function PublicHomePage() {
  const banners = [
    '/public-sliders/slider1.webp',
    '/public-sliders/slider2.webp',
    '/public-sliders/slider3.webp',
  ];

  const [index, setIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    // ensure index stays in bounds
    if (index < 0) setIndex(len - 1);
    if (index >= len) setIndex(0);
  }, [index, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div className="m-0 p-0">
      {/* Hero Banner Section - full width slider with overlayed buttons */}
      {/* Slider: fixed responsive height to avoid layout shift and empty area */}

  {/* Hero slider (reusable component) */}
  <HeroSlider banners={banners} className="h-50 md:h-105" />

      {/* Help Topics Section */}
      <section className="bg-[#1D549C] py-12 px-0 w-full">
        <div className="w-full">
          {/* Greeting */}
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">Good Day!</h1>
          <p className="text-xl md:text-2xl text-white text-center mb-8">
            How can we <span className="text-[#7FFF00]">help you</span> today?
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search our help articles..."
                className="w-full py-4 px-6 pr-14 rounded-full bg-white text-gray-700 placeholder-blue-900 text-lg focus:outline-none focus:ring-2 focus:ring-[#7FFF00] shadow-lg"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-800 hover:text-[#1D549C] transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Topics Header */}
          <div className="px-6 md:px-18 mb-6">
            <div className="flex items-center justify-between pb-3 border-b border-white">
              <span className="text-white text-lg font-medium ">Topics</span>
              <Link href="/topics" className="text-white hover:text-[#7FFF00] transition text-sm font-medium">
                View All
              </Link>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="px-6 md:px-18">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Account */}
            <Link href="/topics/account" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Account</span>
            </Link>

            {/* Payment */}
            <Link href="/topics/payment" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Payment</span>
            </Link>

            {/* Promotions */}
            <Link href="/topics/promotions" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Promotions</span>
            </Link>

            {/* Crickex Tips */}
            <Link href="/topics/tips" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Crickex Tips</span>
            </Link>

            {/* Sports */}
            <Link href="/topics/sports" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Sports</span>
            </Link>

            {/* Casino */}
            <Link href="/topics/casino" className="bg-[#103C6E] border border-white rounded-xl p-6 flex items-center gap-4 h-28 md:h-32 hover:border-[#7FFF00] transition group">
              <div className="w-14 h-14 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#7FFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-white text-xl font-semibold group-hover:text-[#7FFF00] transition">Casino</span>
            </Link>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
