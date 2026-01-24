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
      const query = code ? `?${encodeURIComponent(queryKey)}=${encodeURIComponent(code)}` : '';
      router.replace(`/register${query}`);
    } catch (err) {
      // if anything fails, go to register without ref
      router.replace('/register');
    }
  }, [pattern, queryKey, router]);

  return null;
}
