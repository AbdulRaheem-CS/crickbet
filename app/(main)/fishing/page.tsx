'use client';

/**
 * Fishing Games Page
 * Display fishing games from GSC+
 */

import { FaFish } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function FishingPage() {
  return (
    <GameGridPage
      category="fishing"
      title="Fishing Games"
      subtitle="Catch fish and win big prizes"
      icon={<FaFish />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
