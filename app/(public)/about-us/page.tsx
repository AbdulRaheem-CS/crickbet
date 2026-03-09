"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import HeroSlider from '@/components/public/HeroSlider';

export default function PublicHomePage() {
  const banners = [
    '/public-sliders/slider1.webp',
    '/public-sliders/slider2.webp',
    '/public-sliders/slider3.webp',
  ];

  const [index, setIndex] = useState(0);
  const len = banners.length;

  useEffect(() => {
    // ensure index stays in bounds
    if (index < 0) setIndex(len - 1);
    if (index >= len) setIndex(0);
  }, [index, len]);

  const prev = () => setIndex((i) => (i - 1 + len) % len);
  const next = () => setIndex((i) => (i + 1) % len);

  return (
    <div className="m-0 p-0">
      {/* Hero Banner Section - full width slider with overlayed buttons */}
      {/* Slider: fixed responsive height to avoid layout shift and empty area */}

  {/* Hero slider (reusable component) */}
  <HeroSlider banners={banners} className="h-50 md:h-105" />
  
  {/* Centered About Box */}
  <section className="py-30">
    <div className="max-w-xl mx-auto flex items-center justify-center">
      <div className="w-full sm:w-3/3 lg:w-4/8 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white">About Us</h1>
      </div>
    </div>
  </section>

  {/* About Content */}
  <section className="py-1">
    <div className="max-w-7xl mx-auto px-6 text-white">
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Welcome to KingBaji, the best gaming destination for players from South Asia. We are an exciting blend of games, excitement and entertainment. Gear up for an unparalleled gaming experience that’s especially tailored according to your skills and preferences.
        </p>

        <h3 className="font-semibold mt-4">Our Company:</h3>
        <p>
          KingBaji is operated by VB Digital N.V Company, whose registered office is 9 Abraham de Veerstraat, Curacao. We are officially regulated by the Curacao Gaming Comission under the license number GLH-OCCHKTW0712302019 (Sub-license number 365/JAZ). So you wouldn’t need to worry about anything when you register with us.
        </p>

        <h3 className="font-semibold mt-4">KingBaji Vision:</h3>
        <p>
          At KingBaji, our vision is to introduce a revolutionized online gaming platform that offers not only thrilling gaming experiences but also gives players the ultimate gaming satisfaction while promoting healthy gaming habits. We are committed to creating a calm environment where players can enjoy their favourite casino games, explore exciting promotions and have lots of fun.
        </p>

        <h3 className="font-semibold mt-4">The Trusted Name in Market:</h3>
        <p>
          KingBaji has quickly emerged as one of the most trusted gaming platforms in the market and among the online gaming community. We take immense pleasure and pride in our integrity, so players will get nothing short of the best site treatment, fairness, and transparency. As avid supporters of responsible gaming, we place major priority in site safety and the well-being of our players while ensuring that players get the best gaming experiences.
        </p>

        <h3 className="font-semibold mt-4">Wide Range of Games</h3>
        <p>
          In KingBaji, players can find a wide-range of games that will definitely cater to all of your preferences and tastes. Whether you’re a fan of classic slots, table games like blackjack and roulette, or you’re seeking the challenge of poker, our diverse library of games has something for everyone. Our game collections are continuously updated so that you will always have something new to look forward to when you visit our site.
        </p>

        <h3 className="font-semibold mt-4">Our Ambassadors:</h3>
        <p>
          KingBaji is proud to inform you that we are associated with some of the most beloved personalities from India and Bangladesh. Our brand ambassadors, Robin Uthappa, Srabanti Chatterjee, and Pori Moni, represent the spirit of KingBaji. They embody the values of excellence, integrity, and entertainment. With their support and love, we aim to reach new heights and further our connections with our players.
        </p>

        <h3 className="font-semibold mt-4">Diverse Promotions:</h3>
        <p>
          In KingBaji, we believe in providing our players with generous promotion and bonuses. Rewarding and giving back to our players to enhance their gaming experiences are our way of thanking our players for their loyalty. Our promotions are tailored to cater for both new and existing players. We ensure that our promotions will boost your bankroll and increase your overall gaming budget.
        </p>

        <h3 className="font-semibold mt-4">Good Customer Support</h3>
        <p>
          We provide a 24/7 around the clock customer support team that will assist you with any queries or concerns that you may have. We fully understand the importance of good customer support that’s dedicated to solving your problems. Do not hesitate in contacting our customer support in any time of the day as we have carefully trained them to help you with all your problems.
        </p>

        <h3 className="font-semibold mt-4">Secure and Fair Gaming:</h3>
        <p>
          Safety and security are our top priorities at KingBaji. Players can rest assured as we utilize state-of-the-art encryption technology to safeguard all your personal and financial information. To ensure fairness and randomness, all our games undergo rigorous testing. So, choose a game and play with peace of mind.
        </p>

        <h3 className="font-semibold mt-4">A Future with Us</h3>
        <p>
          At KingBaji, we believe in building a community with lasting relationships with our players. We are committed to continuously improving our services, diversifying our game selection, and constantly providing you with new gaming experiences. Your feedback and suggestions are invaluable to us, so feel free to send us any and all the feedback and suggestions you have. We openly accept each and every one of them.
        </p>

        <h3 className="font-semibold mt-4">Join Us Today:</h3>
        <p>
          The KingBaji team invites you to join us and experience the gaming community and world. Come join us to explore the world of online casino gaming. We promise you constant warm welcomes, tailored gaming experiences and 24/7 help whenever it’s needed. Let’s embark on this gaming adventure together and create unforgettable moments at KingBaji, the land of endless posibilities and excitements!
        </p>
      </div>
    </div>
  </section>
    </div>
  );
}