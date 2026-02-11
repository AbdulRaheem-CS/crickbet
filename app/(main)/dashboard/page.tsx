"use client";

/**
 * Dashboard Page
 * Main landing page after login
 */

import Banner from '@/components/layout/Banner';
import CategoryNav from '@/components/layout/CategoryNav';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

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
        // Clear query parameters without adding a history entry
        const url = new URL(window.location.href);
        url.searchParams.delete('open');
        url.searchParams.delete('ref');
        router.replace(url.pathname + url.search, { scroll: false });
      }
    } catch (err) {
      // If something goes wrong, silently ignore — modal still works via
      // programmatic calls elsewhere.
      console.error('Failed to auto-open register modal from URL params', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="p-8">
        <Banner />
      </div>

      {/* Category Navigation */}
      <CategoryNav />
    </div>
  );
}
