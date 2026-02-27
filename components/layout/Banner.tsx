'use client';

/**
 * Banner Component
 * Hero banner carousel
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';

const banners = [
  { id: 1, image: '/banners/image_282634.jpg', title: 'CX AMBASSADOR 2025', subtitle: 'TANGIA ZAMAN METHILA', buttonText: 'SEE MORE' },
  { id: 2, image: '/banners/image_294118.jpg', title: 'ROI BATTLE BEGINS', subtitle: '588% NON-STOP WINNING ACTION!', buttonText: 'SEE MORE' },
  { id: 3, image: '/banners/image_319646.jpg', title: 'WELCOME BONUS', subtitle: 'Get 100% Bonus on First Deposit', buttonText: 'CLAIM NOW' },
  { id: 4, image: '/banners/image_320643.jpg', title: '', subtitle: '', buttonText: '' },
  { id: 5, image: '/banners/image_322614.jpg', title: '', subtitle: '', buttonText: '' },
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
      <div className="relative overflow-hidden rounded-none md:rounded-lg h-64 md:h-80 bg-gray-100 p-8" />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-none md:rounded-lg">
      <div className="relative h-64 md:h-80">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-full w-full relative">
              <Image src={banner.image} alt={banner.title || `Banner ${banner.id}`} fill className="object-cover" priority={index === 0} />
              {/* No overlay text/buttons - show image only */}
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
