'use client';

/**
 * Sports Page
 * Display all sports and markets
 */

export default function SportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Sports</h1>

      {/* Sport Tabs */}
      <div className="flex gap-4 border-b border-gray-700 pb-2">
        <button className="px-4 py-2 text-white bg-blue-600 rounded-t-lg">Cricket</button>
        <button className="px-4 py-2 text-gray-400 hover:text-white">Football</button>
        <button className="px-4 py-2 text-gray-400 hover:text-white">Tennis</button>
      </div>

      {/* Markets */}
      <div className="space-y-4">
        {/* TODO: Map markets */}
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">No markets available</p>
        </div>
      </div>
    </div>
  );
}
