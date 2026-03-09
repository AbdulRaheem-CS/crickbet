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
      {/* Hero slider (reusable component) */}
      <HeroSlider banners={banners} className="h-50 md:h-105" />

      {/* Privacy header box */}
      <section className="py-12">
        <div className="max-w-xl mx-auto flex items-center justify-center">
          <div className="w-full sm:w-2/3 lg:w-2/3 border-1 border-[#7FFF00] rounded-xl px-8 md:px-12 py-4 md:py-6 text-center shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
        </div>
      </section>

      {/* Privacy content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 text-white">
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              Welcome to KingBaji, the best gaming destination for players from South Asia. Your privacy is extremely important to us, and we are committed to protecting your personal information. We take pride in constantly improving the security of site to protect all your private information. This Privacy Policy outlines how we collect, use, and protect your information when you use our online casino services.
            </p>

            <h3 className="font-semibold">Information We Collect</h3>
            <p>
              When you use our services, we may collect the following types of information’s when needed:
            </p>
            <ul className="list-disc pl-6">
              <li>
                <strong>Personal Details</strong> – When you browse our website and register, we will collect your name, contact information, address, email address, phone number, credit/debit card details, and any other details required for using our services.
              </li>
              <li>
                <strong>IP Addresses</strong> – Details such as traffic information, location data, IP address, browser type, and other communication data are collected when you access our site as we use these data for our research.
              </li>
              <li>
                <strong>Browser And URLs</strong> – All the pages visited, content viewed, links clicked, and URLs visited before and after using our services will be collected, this will help us suggest more relevant games for your ease.
              </li>
              <li>
                <strong>KingBaji Transactions</strong> – All the betting, gaming, deposits, payments, transaction history, and other transactions done on site will be on record. This will provide an extra layer of security for you as all your transactions can be recorded.
              </li>
              <li>
                <strong>Customer Care Chats</strong> – All customer support messages; emails and live Chat conversations will be collected. This information will help shape our site to suit your needs better.
              </li>
              <li>
                <strong>Promotion/Marketing Visits</strong> – Your visits and clicks on the promotions listed on our page will be recorded. All the responses to marketing campaigns run will be collected as well. This information will help us curate more diverse and suitable promotions for you.
              </li>
              <li>
                <strong>Connected social media Pages</strong> – When you follow our social media profile, the details when you connect with or contact us through social media accounts will be stored.
              </li>
            </ul>

            <h3 className="font-semibold">Cookie Collection</h3>
            <p>
              We collect browser and cookie information when you first navigate to our website. Cookies are small text files stored on your device that help enhance your browsing experience and provide access to various features.
            </p>
            <p>
              Certain cookies allow you to navigate our websites without re-entering your password, and they help us monitor website traffic to improve our services.
            </p>
            <p>
              You may choose to disable cookies on your device, but please note that this may affect your user experience and the functionality of our site.
            </p>

            <h3 className="font-semibold">Account Setup, Verification, and Management</h3>
            <p>
              We use personal information such as name, email address, phone number, and device information to set up and administer your account, provide technical and customer support, verify your identity, process payment information, and send important account and service information.
            </p>

            <h3 className="font-semibold">Personalization</h3>
            <p>
              We use personal information to deliver tailored content and personalize your experience with our services.
            </p>

            <h3 className="font-semibold">Marketing and Events</h3>
            <p>
              All the information collected when you browse our marketing and promotion pages will be utilized to enhance your experience on our site further. Subject to your preferences, we use personal information to deliver marketing and event communications that’s tailored according to our players.
            </p>

            <h3 className="font-semibold">Risk Management</h3>
            <p>
              We process personal data to evaluate and manage risks to our business.
            </p>

            <h3 className="font-semibold">How Information is Shared</h3>
            <p>
              Your personal information may be transferred or disclosed to any company within the group, third-party service providers, and partners for processing based on our instructions and in compliance with this policy and other confidentiality and security measures.
            </p>

            <h3 className="font-semibold">Retention</h3>
            <p>
              We retain personal information for as long as reasonably required for legal or business purposes. Your information will not be kept for longer than 7 years post account closure.
            </p>

            <h3 className="font-semibold">Security</h3>
            <p>
              We are committed to employing security measures to protect your information from unauthorized access, processing, disclosure, destruction, loss, alteration, and damage.
            </p>

            <h3 className="font-semibold">How to Contact Us</h3>
            <p>
              For any requests or doubts related to your personal information or your rights, please do not hesitate to contact us at{' '}
              <a href="mailto:support.pk@KingBaji.com" className="text-[#7FFF00] hover:underline">support.pk@KingBaji.com</a>.
            </p>

            <p>
              Thank you for choosing KingBaji Online Casino. We value your privacy and are dedicated to providing you with a safe and enjoyable gaming experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}