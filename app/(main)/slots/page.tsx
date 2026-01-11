'use client';

/**
 * Slots Page
 */

export default function SlotsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Slots</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* TODO: Load slot games from API */}
        <p className="text-gray-400 col-span-full text-center py-8">Loading slots...</p>
      </div>
    </div>
  );
}
