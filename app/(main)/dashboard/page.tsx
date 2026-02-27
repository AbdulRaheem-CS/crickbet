"use client";

/**
 * Dashboard Page
 * Main landing page after login
 */

import Banner from '@/components/layout/Banner';
import { FavouritesSection, PopularGamesSection } from '@/components/casino';
import CategoryNav from '@/components/layout/CategoryNav';
import ScrollingHeadline from '@/components/layout/ScrollingHeadline';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function DashboardPage() {
  const { openAuthModal } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // If the URL contains open=register (and optional ref=code), open the
  // site-wide register modal. After consuming the params, remove them using
  // router.replace to avoid re-triggering on back navigation.
  useEffect(() => {
    try {
      const open = searchParams?.get('open');
      if (open === 'register') {
        openAuthModal('register');
        // Only remove the 'open' param — keep 'ref' in the URL so AuthModal can read it
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    } catch (err) {
      console.error('Failed to auto-open register modal from URL params', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      {/* Banner Section */}
      <div className="banner-wrapper">
        <Banner />
      </div>
      <style jsx>{`
        .banner-wrapper {
          padding: 0;
        }
        @media (min-width: 768px) {
          .banner-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
      
      {/* Scrolling Headline Section */}
      <ScrollingHeadline />

      {/* Category Navigation */}
      <CategoryNav />  
          {/* Favourites Section */}
      <FavouritesSection />

      {/* Popular Games Section */}
      <PopularGamesSection />

      {/* Dashboard image banner (desktop for md+, mobile for smaller screens) */}
      <div className="mx-0 md:mx-8 mt-8">
        {/* Desktop */}
        <div className="hidden md:block">
          <Image
            src="/dashboard.png"
            alt="Dashboard banner"
            width={1200}
            height={300}
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>

        {/* Mobile */}
        <div className="block md:hidden">
          <Image
            src="/dashboard_mobile.png"
            alt="Dashboard mobile banner"
            width={800}
            height={300}
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-10 bg-white px-0 md:px-8 py-6">


<div className=" bg-white px-2 md:px-8 py-6">
  {/* Links Row */}
  <hr className="my-4 border-gray-300 mb-6" />
  <div className="flex flex-wrap items-center justify-start gap-x-1 gap-y-2 text-xs md:text-sm font-semibold text-[#005DAC] mb-6 pl-4 md:pl-0">
    <span className="mr-2 md:mr-3">
      <a href="/about-us" className="hover:underline">About Us</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/contact-us" className="hover:underline mr-2 md:mr-3">Contact Us</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/terms-and-conditions" className="hover:underline mr-2 md:mr-3">Terms &amp; Conditions</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/faq" className="hover:underline mr-2 md:mr-3">FAQ</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/affiliate" className="hover:underline mr-2 md:mr-3">Affiliate</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/sponsor" className="hover:underline mr-2 md:mr-3">Sponsor</a>
    </span>
    
    <span className="flex items-center">
      <span className="border-l-2 border-[#005DAC] h-4 mr-2 md:mr-3"></span>
      <a href="/blog" className="hover:underline">Crickex Blog</a>
    </span>
  </div>
  <hr className="my-4 border-gray-300 mb-3" />
</div>
  
        {/* Bottom Row: Logo + Copyright */}
        <div className="flex items-center gap-4 mb-8 px-2 md:px-0 pl-4">
          <Image
            src="/blue-logo.png"
            alt="Crickex"
            width={80}
            height={20}
            className="object-contain w-16 md:w-20"
          />
          <div>
            <p className="text-[#005DAC] font-bold text-xs md:text-sm">Best Quality Platform</p>
            <p className="text-gray-400 text-[10px] md:text-xs">© 2026 CRICKEX Copyrights. All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
