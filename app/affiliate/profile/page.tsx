'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';

interface ProfileData {
  profile: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    referralCode: string;
    accountStatus: string;
    approvedDate: string;
    lastLoginTime: string;
    lastWithdrawalTime: string | null;
  };
  potential: {
    totalProfitLoss: number;
    totalDeduction: number;
    totalRevenueTurnover: number;
    totalBonus: number;
    totalRecycleAmount: number;
    totalReferralCommission: number;
    totalRevenueAdjustment: number;
    totalCancelFee: number;
    totalVipCashBonus: number;
    totalPaymentFee: number;
    negativeCarryForward: number;
    totalNetProfit: number;
    commissionPercentage: number;
    earnings: number;
  };
  commission: {
    pending: number;
    available: number;
    processingWithdrawal: number;
  };
}

/**
 * Affiliate Profile Page
 * Manage affiliate profile information
 */

export default function AffiliateProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'earnings' | 'revenue'>('earnings');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/affiliate/profile');
      setData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile data');
      console.error('Profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '');
  };

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading profile...</div>
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
        {/* Top Section - Profile and Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Username</label>
                  <p className="text-gray-900 font-medium">{data?.profile.username || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Status</label>
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {data?.profile.accountStatus || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-gray-900">{data?.profile.firstName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Approved Date and Time</label>
                  <p className="text-gray-900 text-sm">{formatDate(data?.profile.approvedDate || '')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-gray-900">{data?.profile.lastName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Login Time</label>
                  <p className="text-gray-900 text-sm">{formatDate(data?.profile.lastLoginTime || '')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-gray-900">{formatDateOnly(data?.profile.dateOfBirth || '')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Referral Code</label>
                  <p className="text-gray-900 font-mono">{data?.profile.referralCode || '-'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Last Withdrawal Time</label>
                <p className="text-gray-900">{formatDate(data?.profile.lastWithdrawalTime || null)}</p>
              </div>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Info
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number 1</label>
                <div className="flex items-center justify-between mt-1 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{data?.profile.phoneNumber || '-'}</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center justify-between mt-1 p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{data?.profile.email || '-'}</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Potential and Commission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Potential (This Period) Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Potential (This Period)
              </h2>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700">
                <option>BDT</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('earnings')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'earnings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Earnings
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'revenue'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Total Revenue
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Earnings Tab Content */}
              {activeTab === 'earnings' && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-red-600">(-) Total Profit & Loss</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalProfitLoss || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">(-) Total Bonus</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalBonus || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">(-) Total Revenue Adjustment</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalRevenueAdjustment || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Negative Carry Forward</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.negativeCarryForward || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t pt-2">
                    <span className="text-sm font-medium text-gray-700">Total Net Profit</span>
                    <span className="text-sm text-gray-900 font-mono font-medium">{formatCurrency(data?.potential.totalNetProfit || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Commission(%)</span>
                    <span className="text-sm text-gray-900 font-mono">{data?.potential.commissionPercentage || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t pt-2">
                    <span className="text-sm font-medium text-gray-700">Earnings</span>
                    <span className="text-sm text-gray-900 font-mono font-medium">{formatCurrency(data?.potential.earnings || 0)}</span>
                  </div>
                </>
              )}

              {/* Total Revenue Tab Content */}
              {activeTab === 'revenue' && (
                <>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-red-600">(-) Total Deduction</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalDeduction || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Total Revenue From Turnover</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalRevenueTurnover || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Total Recycle Amount</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalRecycleAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-red-600">(-) Total Referral Commission</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalReferralCommission || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Total Cancel Fee</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalCancelFee || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-red-600">(-) Total VIP Cash Bonus</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalVipCashBonus || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-red-600">(-) Total Payment Fee</span>
                    <span className="text-sm text-gray-900 font-mono">{formatCurrency(data?.potential.totalPaymentFee || 0)}</span>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={fetchProfileData}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Commission Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Commission
              </h2>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-700">
                <option>BDT</option>
              </select>
            </div>

            <div className="p-6 space-y-4">
              {/* Contact Info Badges */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Contact Info</label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-300">
                    Email
                  </span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium border border-yellow-300">
                    Phone Number
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-300">
                    Identity(Any One)
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-300">
                    Identity Card
                  </span>
                </div>
              </div>

              {/* Commission Amounts */}
              <div className="space-y-3 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Pending</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data?.commission.pending || 0)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Available</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data?.commission.available || 0)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Processing Withdrawal</label>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(data?.commission.processingWithdrawal || 0)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors">
                  View
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
                  Apply
                </button>
                <button
                  onClick={fetchProfileData}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

