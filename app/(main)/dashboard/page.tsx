"use client";

/**
 * Dashboard Page
 * Main landing page after login
 */

import Banner from '@/components/layout/Banner';
import { FavouritesSection, PopularGamesSection } from '@/components/casino';
import CategoryNav from '@/components/layout/CategoryNav';
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
      <div className="p-8">
        <Banner />
      </div>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Favourites Section */}
      <FavouritesSection />

      {/* Popular Games Section */}
      <PopularGamesSection />

      {/* Dashboard image banner (desktop for md+, mobile for smaller screens) */}
      <div className="mx-4 md:mx-8 mt-8">
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
    </div>
  );
}
