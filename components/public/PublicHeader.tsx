'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const TOPIC_CATEGORIES = [
  { label: 'Account',    href: '/topics' },
  { label: 'Casino',     href: '/topics' },
  { label: 'Lottery',    href: '/topics' },
  { label: 'Payment',    href: '/topics' },
  { label: 'Promotions', href: '/topics' },
  { label: 'Slots',      href: '/topics' },
  { label: 'Sports',     href: '/topics' },
  { label: 'Table',      href: '/topics' },
  { label: 'Technical',  href: '/topics' },
];

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [topicsMobileOpen, setTopicsMobileOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const navLinks = [
    { label: 'Home',         href: '/home' },
    { label: 'Referral',     href: '/referral' },
    { label: 'VIP Program',  href: '/vip-program' },
    { label: 'Cricket News', href: '/cricket-news' },
  ];

  return (
    <header
      className="text-white sticky top-0 z-50 shadow-lg border-b border-[#7FFF00]"
      style={{ WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(30,84,156,.7)' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 ml-8 ">
            <Image
              src="/logo.png"
              alt="Crickex"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-[#7FFF00] transition font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Topics dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTopicsOpen(true)}
              onMouseLeave={() => setTopicsOpen(false)}
            >
              <Link
                href="/topics"
                className="flex items-center gap-1.5 text-white hover:text-[#7FFF00] transition font-medium"
              >
                Topics
                <FaChevronDown
                  className={`text-xs mt-0.5 transition-transform duration-200 ${topicsOpen ? 'rotate-180' : ''}`}
                />
              </Link>

              {/* Dropdown panel */}
              {topicsOpen && (
                <div className="absolute left-0 top-full z-50 pt-1 min-w-50">
                  <div className="bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                    {TOPIC_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="block px-5 py-2.5 hover:text-[#0F3D91] bg-white transition font-medium text-[15px] whitespace-nowrap"
                        style={{ color: '#1D3A7A' }}
                        onClick={() => setTopicsOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="px-6 py-1.5 bg-white border border-white text-[#0F3D91] rounded hover:bg-gray-200 hover:text-[#0F3D91] transition font-medium"
            >
              Login
            </Link>
            <Link
              href="/"
              className="px-6 py-1.5 bg-[#7FFF00] text-[#0F3D91] rounded hover:bg-[#6BE000] transition font-bold"
            >
              Register
            </Link>
            
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:text-[#7FFF00] transition font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Topics accordion for mobile */}
              <div>
                <button
                  onClick={() => setTopicsMobileOpen(!topicsMobileOpen)}
                  className="flex items-center justify-between w-full text-white hover:text-[#7FFF00] transition font-medium py-2"
                >
                  Topics
                  <FaChevronDown
                    className={`text-xs transition-transform duration-200 ${topicsMobileOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {topicsMobileOpen && (
                  <div className="pl-4 mt-1 flex flex-col gap-1 border-l-2 border-[#7FFF00]/40">
                    {TOPIC_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.label}
                        href={cat.href}
                        className="text-white/80 hover:text-[#7FFF00] transition py-1.5 text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
                <Link
                  href="/login"
                  className="px-6 py-2 bg-transparent border border-white text-white rounded hover:bg-white hover:text-[#0F3D91] transition font-medium text-center"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-[#7FFF00] text-[#0F3D91] rounded hover:bg-[#6BE000] transition font-bold text-center"
                >
                  Register
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
