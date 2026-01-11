'use client';

/**
 * Banner Component
 * Hero banner carousel
 */

import { useState, useEffect } from 'react';

const banners = [
  {
    id: 1,
    title: 'CX AMBASSADOR 2025',
    subtitle: 'TANGIA ZAMAN METHILA',
    buttonText: 'SEE MORE',
    bgColor: 'from-blue-600 to-blue-800',
  },
  {
    id: 2,
    title: 'ROI BATTLE BEGINS',
    subtitle: '588% NON-STOP WINNING ACTION!',
    buttonText: 'SEE MORE',
    bgColor: 'from-red-600 to-red-800',
  },
  {
    id: 3,
    title: 'WELCOME BONUS',
    subtitle: 'Get 100% Bonus on First Deposit',
    buttonText: 'CLAIM NOW',
    bgColor: 'from-green-600 to-green-800',
  },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg h-64 md:h-80" />
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg">
      <div className="relative h-64 md:h-80">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${banner.bgColor} flex items-center justify-center px-8`}>
              <div className="text-center text-white">
                <h2 className="text-4xl md:text-6xl font-bold mb-2">{banner.title}</h2>
                <p className="text-xl md:text-2xl mb-6">{banner.subtitle}</p>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full transition">
                  {banner.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
      >
        ›
      </button>
    </div>
  );
}
