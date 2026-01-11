'use client';

/**
 * Casino Page
 * Display all casino games
 */

export default function CasinoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Casino</h1>

      {/* Category Tabs */}
      <div className="flex gap-4 border-b border-gray-700 pb-2">
        <button className="px-4 py-2 text-white bg-purple-600 rounded-t-lg">All Games</button>
        <button className="px-4 py-2 text-gray-400 hover:text-white">Live Casino</button>
        <button className="px-4 py-2 text-gray-400 hover:text-white">Table Games</button>
        <button className="px-4 py-2 text-gray-400 hover:text-white">Popular</button>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* TODO: Map casino games */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 cursor-pointer transition">
            <div className="aspect-square bg-gray-700"></div>
            <div className="p-3">
              <p className="text-white font-medium">Game {i + 1}</p>
              <p className="text-gray-400 text-sm">Provider</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
