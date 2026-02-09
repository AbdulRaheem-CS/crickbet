"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

type Props = {
  banners?: string[];
  className?: string;
};

export default function HeroSlider({ banners = ['/public-sliders/slider1.webp', '/public-sliders/slider2.webp', '/public-sliders/slider3.webp'], className = '' }: Props) {
  const [index, setIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    if (index < 0) setIndex(len - 1);
    if (index >= len) setIndex(0);
  }, [index, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <section className={`relative w-full overflow-hidden h-[200px] md:h-[420px] m-0 p-0 ${className}`}>
      <div className="flex transition-transform duration-500 ease-out h-full" style={{ width: `${len * 100}%`, transform: `translateX(-${index * (100 / len)}%)` }}>
        {banners.map((src, i) => (
          <div key={src} className="relative shrink-0 w-full h-full bg-[#1D549C]" style={{ width: `${100 / len}%` }}>
            <Image src={src} alt={`banner-${i}`} fill className="object-contain" />
          </div>
        ))}
      </div>

      {/* Prev/Next buttons placed on the image */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/40 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition"
      >
        ‹
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/40 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-sm transition"
      >
        ›
      </button>
    </section>
  );
}
