'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';

interface AffiliateUser {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  status: string;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalBets?: number;
}

interface HierarchyData {
  upline: AffiliateUser | null;
  downline: AffiliateUser[];
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
  };
}

/**
 * Affiliate Hierarchy Page
 * View affiliate network hierarchy and referrals
 */

export default function AffiliateHierarchyPage() {
  const { user } = useAuth();
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/affiliate/hierarchy');
      setData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load hierarchy data');
      console.error('Hierarchy error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading hierarchy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{data?.stats.totalReferrals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Referrals</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{data?.stats.activeReferrals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(data?.stats.totalEarnings || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Upline Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Upline
            </h2>
          </div>
          <div className="p-6">
            {data?.upline ? (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {data.upline.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{data.upline.username}</h3>
                  <p className="text-sm text-gray-500">{data.upline.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(data.upline.createdAt)}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upline found. You are a top-level affiliate.</p>
            )}
          </div>
        </div>

        {/* Downline Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Downline
            </h2>
          </div>
          <div className="p-6">
            {data?.downline && data.downline.length > 0 ? (
              <div className="space-y-3">
                {data.downline.map((referral, index) => (
                  <div 
                    key={referral._id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 p-4 bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {referral.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{referral.username}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              referral.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {referral.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{referral.phoneNumber || referral.email}</p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Joined</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(referral.createdAt)}</p>
                        </div>
                        {referral.totalBets !== undefined && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Bets</p>
                            <p className="text-sm font-medium text-gray-900">{referral.totalBets}</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleExpand(referral._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg 
                          className={`w-5 h-5 text-gray-600 transition-transform ${
                            expandedUsers.has(referral._id) ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedUsers.has(referral._id) && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900 mt-1">{referral.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900 mt-1">{referral.phoneNumber || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Total Deposits</p>
                            <p className="text-sm text-gray-900 mt-1">{formatCurrency(referral.totalDeposits || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Total Withdrawals</p>
                            <p className="text-sm text-gray-900 mt-1">{formatCurrency(referral.totalWithdrawals || 0)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h3>
                <p className="text-gray-500 mb-4">Start referring users to build your network</p>
                <button
                  onClick={() => {
                    const referralCode = (user as any)?.referralCode;
                    if (referralCode) {
                      navigator.clipboard.writeText(window.location.origin + '/register?ref=' + referralCode);
                      alert('Referral link copied to clipboard!');
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Copy Referral Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
