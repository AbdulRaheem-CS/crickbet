'use client';

/**
 * Crash Games Page
 * Display crash/instant win games from GSC+
 */

import { FaRocket } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function CrashPage() {
  return (
    <GameGridPage
      category="crash"
      title="Crash Games"
      subtitle="Fast-paced instant win games"
      icon={<FaRocket />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
