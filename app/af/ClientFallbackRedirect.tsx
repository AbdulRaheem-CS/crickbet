"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientFallbackRedirect({ pattern, queryKey }: { pattern: string; queryKey: string }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const path = window.location.pathname || '';
      const re = new RegExp(pattern);
      const m = path.match(re);
      const code = m && m[1] ? m[1] : '';
  // Build a dashboard URL that opens the register modal and passes the
  // referral code when available. Use URLSearchParams for safe encoding.
  const params = new URLSearchParams();
  if (code) params.set(queryKey, code);
  params.set('open', 'register');
  router.replace(`/?${params.toString()}`);
    } catch (err) {
  // if anything fails, open the register modal without ref
  router.replace('/?open=register');
    }
  }, [pattern, queryKey, router]);

  return null;
}
