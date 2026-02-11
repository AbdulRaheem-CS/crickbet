'use client';

/**
 * Slots Page
 * Display all slot games from GSC+
 */

import { FaStar } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function SlotsPage() {
  return (
    <GameGridPage
      category="slots"
      title="Slots"
      subtitle="Spin and win with 4,000+ slot games"
      icon={<FaStar />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
