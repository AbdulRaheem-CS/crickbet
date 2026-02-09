'use client';

/**
 * Table Games Page
 * Display table games from GSC+
 */

import { FaTableTennis } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function TableGamesPage() {
  return (
    <GameGridPage
      category="table"
      title="Table Games"
      subtitle="Blackjack, Roulette, Baccarat, Poker and more"
      icon={<FaTableTennis />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
