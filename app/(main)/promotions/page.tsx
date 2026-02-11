'use client';

import { useState } from 'react';
import TabFilter from '@/components/promotions/TabFilter';
import PromotionCard from '@/components/promotions/PromotionCard';

const categories = [
  'ALL',
  'Slots',
  'Live Casino',
  'Sports',
  'Fishing',
  'Lottery',
  'Table',
  'Arcade',
  'Crash',
  'Other'
];

// Sample promotion data - replace with actual data from API
const promotions = [
  {
    id: '1',
    title: '3% Unlimited Deposit Bonus',
    description: 'Deposit + Free Spin',
    image: '/promotions/deposit-bonus.jpg',
    badge: 'CX',
    offerType: 'Daily Deposit Offer',
    isNew: true,
    category: 'ALL'
  },
  {
    id: '2',
    title: '150% Welcome Bonus on JILI Slots',
    description: 'Play JILI Slots now and make every spin count!',
    image: '/promotions/welcome-bonus.jpg',
    badge: 'CX',
    offerType: 'Welcome Offer',
    isNew: true,
    category: 'Slots'
  },
  {
    id: '3',
    title: 'Daily 60% Reload Bonus on JILI Slots',
    description: 'Grab the JILI Slots Reload Bonus up to Rs.5,000 now!',
    image: '/promotions/reload-bonus.jpg',
    badge: 'CX',
    offerType: 'Daily Offer',
    isNew: true,
    category: 'Slots'
  },
  {
    id: '4',
    title: '20% Daily Cashback up to Rs.20,000',
    description: 'Play Money Time & Get 20% Daily Cashback',
    image: '/promotions/cashback.jpg',
    badge: 'CX',
    offerType: 'Daily Cashback',
    isNew: true,
    category: 'Live Casino'
  },
  {
    id: '5',
    title: 'Deposit Rs.500 Get Free Rs.500',
    description: 'Enjoy Rs.500 First Deposit Bonus immediately!',
    image: '/promotions/first-deposit.jpg',
    badge: 'CX',
    offerType: 'Long term',
    isNew: true,
    category: 'ALL'
  },
  {
    id: '6',
    title: 'Daily JILI Free Spin Challenge!',
    description: 'Log in daily, earn up to 100 Free Spins.',
    image: '/promotions/free-spin.jpg',
    badge: 'CX',
    offerType: 'Daily Login Rewards',
    isNew: true,
    category: 'Slots'
  },
  {
    id: '7',
    title: 'FREE 20 HEY! SUPERIMENTS',
    description: 'Deposit & Claim instantly!',
    image: '/promotions/super-elements.jpg',
    badge: 'CX',
    offerType: 'Daily Offer',
    isNew: true,
    category: 'Slots'
  },
  {
    id: '8',
    title: '30% Weekly Cashback',
    description: 'Play any game, anytime',
    image: '/promotions/weekly-cashback.jpg',
    badge: 'CX',
    offerType: 'Weekly Offer',
    isNew: true,
    category: 'ALL'
  },
  {
    id: '9',
    title: '1.45% Slots Rebate Instant Daily Bonus',
    description: 'Earn rebate on every bet instantly!',
    image: '/promotions/slots-rebate.jpg',
    badge: 'CX',
    offerType: 'Daily Offer',
    isNew: true,
    category: 'Slots'
  },
];

export default function PromotionsPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Filter promotions based on active category
  const filteredPromotions = activeCategory === 'ALL'
    ? promotions
    : promotions.filter(promo => promo.category === activeCategory);

  const handleRegister = (promoId: string) => {
    // TODO: Implement registration logic
    console.log('Register for promotion:', promoId);
    // Could open a modal or redirect to registration
  };

  const handleDetail = (promoId: string) => {
    // TODO: Implement detail view logic
    console.log('View promotion details:', promoId);
    // Could open a modal with full promotion details
  };

  return (
    <div className="space-y-6 p-6 mr-8 ml-8">
      {/* Tab Filter */}
      <TabFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promotion) => (
          <PromotionCard
            key={promotion.id}
            id={promotion.id}
            title={promotion.title}
            description={promotion.description}
            image={promotion.image}
            badge={promotion.badge}
            offerType={promotion.offerType}
            isNew={promotion.isNew}
            onRegister={() => handleRegister(promotion.id)}
            onDetail={() => handleDetail(promotion.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No promotions available in this category.</p>
        </div>
      )}
    </div>
  );
}
