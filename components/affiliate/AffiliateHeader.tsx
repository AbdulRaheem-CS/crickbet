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
  const { availableBalance: walletBalance } = useWallet();

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
    <header className="bg-[#465065] text-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Left/Center: Links */}
        <div className="flex items-center gap-4 flex-1">
          {/* Default Player Sign-up Link */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white whitespace-nowrap">Default Player Sign-up Link</span>
            <div className="flex items-center gap-2 bg-[#596274] rounded-lg px-2 py-1">
              <a
                href={ensureHref(signupLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono hover:underline text-white"
              >
                {signupLink}
              </a>
              <button
                onClick={() => copyToClipboard(ensureHref(signupLink))}
                className="p-1 hover:bg-gray-300 rounded"
                title="Copy to clipboard"
              >
                <FaCopy className="text-sm text-gray-700" />
              </button>
            </div>
          </div>

          {/* Affiliate Referral Link */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white whitespace-nowrap">Affiliate Referral Link</span>
            <div className="flex items-center gap-2 bg-[#596274] rounded-lg px-2 py-1">
              <a
                href={ensureHref(referralLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono hover:underline text-white"
              >
                {referralLink}
              </a>
              <button
                onClick={() => copyToClipboard(ensureHref(referralLink))}
                className="p-1 hover:bg-gray-300 rounded"
                title="Copy to clipboard"
              >
                <FaCopy className="text-sm text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Currency, Balance & User */}
        <div className="flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="BDT">BDT</option>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>

          <div className="bg-gray-700 px-3 py-1.5 rounded font-semibold text-sm border border-gray-600">
            ৳ {walletBalance ? walletBalance.toFixed(2) : balance}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-200">{user.username || user.email}</div>
              <button
                onClick={() => logout()}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                title="Logout"
              >
                <FaSignOutAlt className="text-xs" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
