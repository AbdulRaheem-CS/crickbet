'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTelegram } from 'react-icons/fa';

export default function PublicFooter() {
  return (
    <footer className="bg-[#00335F] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section (use logo from public) */}
          <div>
            <div className="mb-4">
              <img src="/logo-2.svg" alt="KingBaji logo" className="w-40 h-auto" />
            </div>
            <p className="text-white text-sm">© 2026 KingBaji Copyright</p>
          </div>

          {/* Quick Links */}
          <div>
            <ul className="space-y-2 text-md">
              <li>
                <Link href="/about-us" className="text-white hover:text-[#7FFF00] transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-white hover:text-[#7FFF00] transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <ul className="space-y-2 text-md">
              <li>
                <Link href="/privacy-policy" className="text-white hover:text-[#7FFF00] transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-white hover:text-[#7FFF00] transition">
                  Terms And Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-md">
              <li>
                <Link href="/rules-and-regulations" className="text-white hover:text-[#7FFF00] transition">
                  Rules and Regulations
                </Link>
              </li>
              <li>
                <Link href="/responsible-gambling" className="text-white hover:text-[#7FFF00] transition">
                  Responsible Gambling
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-bold mb-4">Community Websites</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                <FaFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                <FaInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">
                <FaYoutube />
              </a>
              <a href="#" className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                <FaTelegram />
              </a>
            </div>
          </div>
        </div>
      </div>

  {/* Contact Section removed per request */}
    </footer>
  );
}
