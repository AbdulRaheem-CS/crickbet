'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/home' },
    { label: 'Referral', href: '/referral-info' },
    { label: 'VIP Program', href: '/vip-program' },
    { label: 'Topics', href: '/topics' },
    { label: 'Cricket News', href: '/cricket-news' },
  ];

  return (
    <header className="bg-[#1D549C] text-white sticky top-0 z-50 shadow-lg border-b border-[#7FFF00]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Crickex"
              width={160}
              height={48}
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
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-6 py-1.5 bg-white border border-white text-[#0F3D91] rounded hover:bg-gray-200 hover:text-[#0F3D91] transition font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
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
