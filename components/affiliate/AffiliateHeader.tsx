 'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { FaSignOutAlt } from 'react-icons/fa';
import { FaBars, FaCopy } from 'react-icons/fa';

interface AffiliateHeaderProps {
  onToggleSidebar: () => void;
}

export default function AffiliateHeader({ onToggleSidebar }: AffiliateHeaderProps) {
  const { user, logout } = useAuth();
  const { balance: walletBalance } = useWallet();

  const [balance, setBalance] = useState('0.00');
  const [currency, setCurrency] = useState('BDT');
  const [signupLink, setSignupLink] = useState('cxsport.vip/af/S97yYf27/join');
  const [referralLink, setReferralLink] = useState('playicc1.com/saf/S97yYf27');
  const [loadingLinks, setLoadingLinks] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoadingLinks(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5001/api/affiliate/links-short', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setSignupLink(data.data.signupLink);
          setReferralLink(data.data.referralLink);
        }
      } catch (err) {
        // ignore — keep defaults
      } finally {
        setLoadingLinks(false);
      }
    };

    fetchLinks();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const ensureHref = (link: string) => {
    if (!link) return '';
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    // default to http for local development
    return `http://${link}`;
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
              <a
                href={ensureHref(signupLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono hover:underline"
              >
                {signupLink}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(ensureHref(signupLink))}
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
              <a
                href={ensureHref(referralLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono hover:underline"
              >
                {referralLink}
              </a>
            </div>
            <button
              onClick={() => copyToClipboard(ensureHref(referralLink))}
              className="p-2 hover:bg-gray-600 rounded"
              title="Copy to clipboard"
            >
              <FaCopy />
            </button>
          </div>
        </div>

        {/* Right: Currency, Balance & User */}
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
            ৳ {walletBalance ? walletBalance.toFixed(2) : balance}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-200">{user.username || user.email}</div>
              <button
                onClick={() => logout()}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2"
                title="Logout"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Links */}
      <div className="lg:hidden px-4 pb-3 space-y-2">
        {/* Default Player Sign-up Link */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded text-sm">
          <div className="flex-1">
            <p className="text-xs text-gray-300">Default Player Sign-up Link</p>
            <a
              href={ensureHref(signupLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono truncate hover:underline block"
            >
              {signupLink}
            </a>
          </div>
          <button
            onClick={() => copyToClipboard(ensureHref(signupLink))}
            className="p-2 hover:bg-gray-600 rounded"
          >
            <FaCopy className="text-sm" />
          </button>
        </div>

        {/* Affiliate Referral Link */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded text-sm">
          <div className="flex-1">
            <p className="text-xs text-gray-300">Affiliate Referral Link</p>
            <a
              href={ensureHref(referralLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono truncate hover:underline block"
            >
              {referralLink}
            </a>
          </div>
          <button
            onClick={() => copyToClipboard(ensureHref(referralLink))}
            className="p-2 hover:bg-gray-600 rounded"
          >
            <FaCopy className="text-sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
