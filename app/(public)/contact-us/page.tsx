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

   <section className="py-30">
    <div className="max-w-xl mx-auto flex items-center justify-center">
      <div className="w-full sm:w-3/3 lg:w-4/7 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Contact Us</h1>
      </div>
    </div>
  </section>

  {/* Contact instructions */}
  <section className="pb-30">
    <div className="max-w-7xl mx-auto px-4 text-start">
      <div className="text-start mb-4">
        <p className="text-white mb-2 font-semibold">HERE’S HOW TO GET IN TOUCH</p>
      </div>
      <div className="text-start space-y-4 text-md text-white">
        <p>
          If you wish to contact KingBaji support team regarding any issue, please drop us an email at{' '}
          <a href="mailto:support.pk@KingBaji.com" className="text-[#7FFF00] hover:underline">support.pk@KingBaji.com</a>
        </p>
        <p>
          If you wish to contact KingBaji corporate team, please drop us an email at{' '}
          <a href="mailto:marketing@KingBaji.com" className="text-[#7FFF00] hover:underline">marketing@KingBaji.com</a>
        </p>
      </div>
    </div>
  </section>

    </div>
  );
}