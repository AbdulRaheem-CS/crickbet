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
  {/* Header box */}
  <section className="py-12">
    <div className="max-w-xl mx-auto flex items-center justify-center">
      <div className="w-full sm:w-2/3 lg:w-2/2 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Responsible Gambling</h1>
      </div>
    </div>
  </section>

  {/* Responsible Gambling content */}
  <section className="py-12">
    <div className="max-w-7xl mx-auto px-6 text-white">
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          Crickex places absolute importance in promoting responsible gaming. We are dedicated to ensuring that our platform performs and maintains the most efficient, responsible and safe gaming environment and experience. We strive to provide safe and fair gaming experiences for you. We believe and practice in responsible gaming as gambling experiences should be entertaining and fun, not tiring and draining.
        </p>

        <h3 className="font-semibold">Our Commitment to Responsible Gaming</h3>
        <p>
          At Crickex, we are committed to providing a safe and sound while practising responsible gaming. Like one says everything becomes better when done in moderation so gaming should always be done in moderation. We strive to protect our players from the potential adverse consequences of excessive gaming.
        </p>

        <h3 className="font-semibold">Tips for Responsible Gambling</h3>
        <p>We want your gaming experience to be enjoyable and safe. Here are some tips to help you gamble responsibly:</p>
        <ul className="list-disc pl-6">
          <li>View Gambling as Entertainment: Gambling should be seen as a form of entertainment, not a way to make money.</li>
          <li>Set Limits: Set a budget and stick to it. Only gamble with money you can afford to lose.</li>
          <li>Avoid Chasing Losses: Don’t try to win back money you’ve lost. This can lead to more significant financial problems.</li>
          <li>Take Breaks: Don’t gamble when you’re feeling upset or depressed. It’s essential to maintain a balanced lifestyle.</li>
          <li>Moderation is Key: Balance your gambling activities with other hobbies and interests.</li>
          <li>Avoid Alcohol: Drinking and gambling don’t mix well. Avoid excessive alcohol consumption while gambling.</li>
        </ul>

        <h3 className="font-semibold">Signs of Problem Gambling</h3>
        <p>It’s crucial to keep track and be aware of the signs of problem gambling. There are a few ways to keep track of your gaming habits. Constantly monitor yourself and definitely seek help if you experience the signals below.</p>
        <ul className="list-disc pl-6">
          <li>Constantly thinking or talking about gambling.</li>
          <li>Spending more time or money on gambling than you can afford.</li>
          <li>Difficulty controlling or stopping gambling.</li>
          <li>Feeling empty or lost when not gambling.</li>
          <li>Gambling to escape personal problems or negative emotions.</li>
        </ul>

        <h3 className="font-semibold">Getting Help</h3>
        <p>If you or someone you know is struggling with problem gambling, it is best to seek help immediately. Use the list above to confirm if you would need further help. If you are unsure despite using the list, it is best that you contact help either way as it is the best solution. For help, you may contact any one of the helpline listed below:</p>
        <ul className="list-disc pl-6">
          <li><a href="https://www.gamblingtherapy.org" className="text-[#7FFF00] hover:underline">www.gamblingtherapy.org</a></li>
          <li><a href="https://www.gamblersanonymous.org" className="text-[#7FFF00] hover:underline">www.gamblersanonymous.org</a></li>
          <li><a href="https://www.gamcare.org.uk" className="text-[#7FFF00] hover:underline">www.gamcare.org.uk</a></li>
          <li><a href="https://www.gambleaware.org" className="text-[#7FFF00] hover:underline">www.gambleaware.org</a></li>
        </ul>

        <h3 className="font-semibold">Preventing Underage Gambling</h3>
        <p>Crickex strictly prohibits anyone under the age of 18 from registering an account or participating in any form of gambling on our platform. We have robust verification systems in place to prevent underage users from accessing our site. Any attempts to provide false information about one’s age will result in the forfeiture of winnings and the refund of all deposits.</p>

        <h3 className="font-semibold">Parental Controls</h3>
        <p>If you share your devices with children, we recommend using parental control software to restrict their internet access. The following websites offer helpful parental control tools:</p>
        <ul className="list-disc pl-6">
          <li><a href="https://www.netnanny.com" className="text-[#7FFF00] hover:underline">www.netnanny.com</a></li>
          <li><a href="https://www.cybersitter.com" className="text-[#7FFF00] hover:underline">www.cybersitter.com</a></li>
        </ul>

        <h3 className="font-semibold">Restricting Access to Minors</h3>
        <p>To further prevent minors from accessing our site, we advise parents to take the following precautions:</p>
        <ul className="list-disc pl-6">
          <li>Use child protection software to block remote gambling sites.</li>
          <li>Do not leave computers unattended while logged in to our site.</li>
          <li>Do not share bank account details with minors.</li>
          <li>Do not save passwords on the login screen.</li>
          <li>Create separate profiles for minors on family computers.</li>
        </ul>
      </div>
    </div>
  </section>
    </div>
  );
}