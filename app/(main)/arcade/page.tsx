'use client';

/**
 * Arcade Games Page
 * Display arcade/mini games from GSC+
 */

import { FaGamepad } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function ArcadePage() {
  return (
    <GameGridPage
      category="arcade"
      title="Arcade Games"
      subtitle="Fun and fast arcade-style games"
      icon={<FaGamepad />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
