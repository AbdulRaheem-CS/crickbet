'use client';

import { useState, useEffect } from 'react';
import { FaBars, FaCopy } from 'react-icons/fa';

interface AffiliateHeaderProps {
  onToggleSidebar: () => void;
}

export default function AffiliateHeader({ onToggleSidebar }: AffiliateHeaderProps) {
  const [balance, setBalance] = useState('0.00');
  const [currency, setCurrency] = useState('BDT');
  const [signupLink, setSignupLink] = useState('cxsport.vip/af/S97yYf27/join');
  const [referralLink, setReferralLink] = useState('playicc1.com/saf/S97yYf27');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  return (
    <header className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu Toggle & Welcome */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-600 rounded lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>
          <h1 className="text-lg font-semibold">Welcome</h1>
        </div>

        {/* Center: Links */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {/* Default Player Sign-up Link */}
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded">
            <div>
              <p className="text-xs text-gray-300">Default Player Sign-up Link</p>
              <p className="text-sm font-mono">{signupLink}</p>
            </div>
            <button
              onClick={() => copyToClipboard(`https://${signupLink}`)}
              className="p-2 hover:bg-gray-600 rounded"
              title="Copy to clipboard"
            >
              <FaCopy />
            </button>
          </div>

          {/* Affiliate Referral Link */}
          <div className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded">
            <div>
              <p className="text-xs text-gray-300">Affiliate Referral Link</p>
              <p className="text-sm font-mono">{referralLink}</p>
            </div>
            <button
              onClick={() => copyToClipboard(`https://${referralLink}`)}
              className="p-2 hover:bg-gray-600 rounded"
              title="Copy to clipboard"
            >
              <FaCopy />
            </button>
          </div>
        </div>

        {/* Right: Currency & Balance */}
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="BDT">BDT</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
          <div className="bg-gray-700 px-4 py-2 rounded font-semibold">
            ৳ {balance}
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      <div className="lg:hidden px-4 pb-3 space-y-2">
        {/* Default Player Sign-up Link */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded text-sm">
          <div className="flex-1">
            <p className="text-xs text-gray-300">Default Player Sign-up Link</p>
            <p className="text-xs font-mono truncate">{signupLink}</p>
          </div>
          <button
            onClick={() => copyToClipboard(`https://${signupLink}`)}
            className="p-2 hover:bg-gray-600 rounded"
          >
            <FaCopy className="text-sm" />
          </button>
        </div>

        {/* Affiliate Referral Link */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded text-sm">
          <div className="flex-1">
            <p className="text-xs text-gray-300">Affiliate Referral Link</p>
            <p className="text-xs font-mono truncate">{referralLink}</p>
          </div>
          <button
            onClick={() => copyToClipboard(`https://${referralLink}`)}
            className="p-2 hover:bg-gray-600 rounded"
          >
            <FaCopy className="text-sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
