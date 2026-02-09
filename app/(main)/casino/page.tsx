'use client';

/**
 * Casino / Live Casino Page
 * Display all live casino games from GSC+
 */

import { FaDice } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function CasinoPage() {
  return (
    <GameGridPage
      category="live"
      title="Live Casino"
      subtitle="Play live dealer games with real croupiers"
      icon={<FaDice />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
