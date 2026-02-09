"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SafRedirect({ params }: { params?: { code?: string } }) {
  const code = params?.code || '';
  const router = useRouter();

  useEffect(() => {
    try {
      if (code) {
        // Persist referral code in localStorage as a reliable fallback for the
        // registration page, then navigate to the affiliate register route.
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliateRef', code);
        }
      }
      router.replace('/affiliate/register');
    } catch (err) {
      router.replace('/affiliate/register');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return null;
}
