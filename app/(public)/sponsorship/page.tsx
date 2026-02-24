'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SponsorshipIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/sponsorship/tangia-zaman-methila');
  }, [router]);

  return null;
}
