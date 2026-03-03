'use client';

/**
 * Banner Component
 * Hero banner carousel
 * Mobile: peek-style slider with prev/next banners visible on sides
 * Desktop: full-width fade carousel
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

const banners = [
  { id: 1, image: '/banners/image_282634.jpg', title: 'CX AMBASSADOR 2025', subtitle: 'TANGIA ZAMAN METHILA', buttonText: 'SEE MORE' },
  { id: 2, image: '/banners/image_294118.jpg', title: 'ROI BATTLE BEGINS', subtitle: '588% NON-STOP WINNING ACTION!', buttonText: 'SEE MORE' },
  { id: 3, image: '/banners/image_319646.jpg', title: 'WELCOME BONUS', subtitle: 'Get 100% Bonus on First Deposit', buttonText: 'CLAIM NOW' },
  { id: 4, image: '/banners/image_320643.jpg', title: '', subtitle: '', buttonText: '' },
  { id: 5, image: '/banners/image_322614.jpg', title: '', subtitle: '', buttonText: '' },
];

const mobileBanners = [
  { id: 1, image: '/mobile_banners/image_285309.jpg' },
  { id: 2, image: '/mobile_banners/image_337226.jpg' },
  { id: 3, image: '/mobile_banners/image_344530.jpg' },
  { id: 4, image: '/mobile_banners/image_346330.jpg' },
];

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setMobileSlide((prev) => (prev + 1) % mobileBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mounted]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setMobileSlide((prev) => (prev + 1) % mobileBanners.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setMobileSlide((prev) => (prev - 1 + mobileBanners.length) % mobileBanners.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!mounted) {
    return (
      <div className="relative overflow-hidden rounded-none md:rounded-lg h-40 md:h-80 bg-gray-100" />
    );
  }

  return (
    <>
      {/* ── MOBILE: Peek-style horizontal slider ── */}
      <div
        className="block md:hidden relative overflow-hidden bg-[#1E5DAC]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative flex items-center justify-center py-2" style={{ height: 155 }}>
          {mobileBanners.map((banner, index) => {
            // Calculate position relative to current slide (with wrapping)
            let offset = index - mobileSlide;
            if (offset > Math.floor(mobileBanners.length / 2)) offset -= mobileBanners.length;
            if (offset < -Math.floor(mobileBanners.length / 2)) offset += mobileBanners.length;

            // Only render visible slides (-1, 0, 1)
            if (Math.abs(offset) > 1) return null;

            return (
              <div
                key={banner.id}
                className="absolute transition-all duration-500 ease-in-out bg-[#1E5DAC]"
                style={{
                  width: '75%',
                  height: 140,
                  transform: `translateX(calc(${offset * 100}% + ${offset * 12}px))`,
                  zIndex: offset === 0 ? 10 : 5,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={banner.image}
                  alt={`Banner ${banner.id}`}
                  fill
                  className="object-contain"
                  style={{ borderRadius: 10 }}
                  priority={index === 0}
                />
              </div>
            );
          })}
        </div>

        {/* Mobile Line Indicators */}
        <div className="flex justify-center gap-1 pb-2 px-12">
          {mobileBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setMobileSlide(index)}
              className={`h-0.75 flex-1 rounded-full transition-all duration-300 ${
                index === mobileSlide
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: Full-width fade carousel (unchanged) ── */}
      <div className="hidden md:block relative overflow-hidden rounded-lg">
        <div className="relative h-80">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-full w-full relative">
                <Image src={banner.image} alt={banner.title || `Banner ${banner.id}`} fill className="object-cover" priority={index === 0} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Navigation Dots */}
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

        {/* Desktop Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          ‹
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          ›
        </button>
      </div>
    </>
  );
}
