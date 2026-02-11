'use client';

/**
 * Lottery Page
 * Display lottery games from GSC+
 */

import { FaTicketAlt } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function LotteryPage() {
  return (
    <GameGridPage
      category="lottery"
      title="Lottery"
      subtitle="Buy tickets and win big prizes"
      icon={<FaTicketAlt />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
