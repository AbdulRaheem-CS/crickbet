'use client';

/**
 * Sports Page
 * Display sports betting games from GSC+
 */

import { FaFutbol } from 'react-icons/fa';
import GameGridPage from '@/components/casino/GameGridPage';

export default function SportsPage() {
  return (
    <GameGridPage
      category="sports"
      title="Sports"
      subtitle="Cricket, Football, Tennis and more"
      icon={<FaFutbol />}
      showProviderFilter={true}
      defaultLimit={40}
    />
  );
}
