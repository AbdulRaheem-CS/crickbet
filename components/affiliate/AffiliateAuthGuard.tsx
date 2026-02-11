"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AffiliateAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if we're already on login/register pages
    const isAuthPage = pathname === '/affiliate/login' || pathname === '/affiliate/register';
    
    if (!loading) {
      if (!user && !isAuthPage) {
        // No user logged in - redirect to login
        router.push('/affiliate/login');
      } else if (user && user.role !== 'affiliate' && !isAuthPage) {
        // User is logged in but not an affiliate - redirect to main site
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow auth pages to be shown without authentication
  const isAuthPage = pathname === '/affiliate/login' || pathname === '/affiliate/register';
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Check if user is authenticated and has affiliate role
  if (!user || user.role !== 'affiliate') {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
