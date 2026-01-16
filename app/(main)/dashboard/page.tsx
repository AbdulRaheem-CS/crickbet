'use client';

/**
 * Dashboard Page
 * Main landing page after login
 */

import Banner from '@/components/layout/Banner';
import CategoryNav from '@/components/layout/CategoryNav';
import { FaFire, FaMoneyBillWave, FaGift, FaChartBar, FaDice } from 'react-icons/fa';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Banner Section */}
      <div className="p-8">
        <Banner />
      </div>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Hot Games Section */}
      {/* <section className="p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFire className="text-orange-500" /> HOT
          </h2>
          <div className="flex gap-2">
            <button className="text-blue-600 hover:text-blue-700">Join Crickex</button>
            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <FaMoneyBillWave /> Earn unlimited rebate commission
            </button>
          </div>
        </div>

     
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {[
            'Super Ace', 'Fortune Gems 500', 'Boxing King', 'Super Ace Deluxe',
            'Fortuna Gems 3', 'Fortune Gems 2', 'Fortune Gems', 'Money Coming',
            'HEYVIP Super Elements', 'HEYVIP Golden Genie', 'HEYVIP Crash', 'HEYVIP Pirate Legends',
            'Aviator', 'Match Odds', 'Crazy Time', 'Sexy Baccarat',
            'Wild Bounty Showdown', 'Magic Ace Wild Lock', 'Boxing King Title Match', 'Piggy Bank'
          ].map((game, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center relative">
                <FaDice className="text-4xl text-white" />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition" />
              </div>
              <div className="p-2 text-center">
                <p className="text-sm font-medium text-gray-800 truncate">{game}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* Promotional Banner */}
      <section className="p-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
          <p className="text-lg flex items-center justify-center gap-2 flex-wrap">
            <FaGift /> Join Crickex <FaMoneyBillWave /> Earn unlimited rebate commission from every refer up to 3 tier <FaChartBar />. 
            Back & Lay, Premium Cricket, Fancy Bet & more.
          </p>
        </div>
      </section>
    </div>
  );
}
