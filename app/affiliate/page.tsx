'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';

interface DashboardData {
  commission: {
    thisMonth: number;
    lastMonth: number;
  };
  activePlayers: {
    thisMonth: number;
    lastMonth: number;
  };
  registeredUsers: Array<{ _id: string; count: number }>;
  firstDeposits: Array<{ _id: string; count: number; amount: number }>;
  deposits: Array<{ _id: string; count: number; amount: number }>;
  withdrawals: Array<{ _id: string; count: number; amount: number }>;
  bonuses: Array<{ _id: string; count: number; amount: number }>;
  recycleAmount: Array<{ _id: string; count: number; amount: number }>;
  cancelFees: Array<{ _id: string; count: number; amount: number }>;
  vipCashBonus: Array<{ _id: string; count: number; amount: number }>;
  referralCommissions: Array<{ _id: string; count: number; amount: number }>;
  turnover: Array<{ _id: string; count: number; amount: number }>;
  profitLoss: Array<{ _id: string; count: number; amount: number }>;
}

/**
 * Affiliate Dashboard Page
 * Main landing page for affiliate program
 */

export default function AffiliatePage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/affiliate/dashboard');
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Track your earnings and performance</p>
        </div>

        {/* Commission and Active Players Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commission Card */}
          <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Commission</h3>
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-green-500">{formatCurrency(data?.commission.thisMonth || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-xl font-semibold text-gray-700">{formatCurrency(data?.commission.lastMonth || 0)}</p>
              </div>
              {data && (
                <div className={`flex items-center gap-2 ${calculateChange(data.commission.thisMonth, data.commission.lastMonth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateChange(data.commission.thisMonth, data.commission.lastMonth) >= 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(calculateChange(data.commission.thisMonth, data.commission.lastMonth)).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Active Players Card */}
          <div className="bg-linear-to-br from-blue-50 to-green-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Players</h3>
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-blue-500">{data?.activePlayers.thisMonth || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-xl font-semibold text-gray-700">{data?.activePlayers.lastMonth || 0}</p>
              </div>
              {data && (
                <div className={`flex items-center gap-2 ${calculateChange(data.activePlayers.thisMonth, data.activePlayers.lastMonth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateChange(data.activePlayers.thisMonth, data.activePlayers.lastMonth) >= 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(calculateChange(data.activePlayers.thisMonth, data.activePlayers.lastMonth)).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registered Users */}
          <DataTable
            title="Registered Users"
            data={data?.registeredUsers || []}
            showAmount={false}
          />

          {/* First Deposit */}
          <DataTable
            title="First Deposit"
            data={data?.firstDeposits || []}
            showAmount={true}
          />

          {/* Deposit */}
          <DataTable
            title="Deposit"
            data={data?.deposits || []}
            showAmount={true}
          />

          {/* Withdrawal */}
          <DataTable
            title="Withdrawal"
            data={data?.withdrawals || []}
            showAmount={true}
          />

          {/* Bonus */}
          <DataTable
            title="Bonus"
            data={data?.bonuses || []}
            showAmount={true}
          />

          {/* Recycle Amount */}
          <DataTable
            title="Recycle Amount"
            data={data?.recycleAmount || []}
            showAmount={true}
          />

          {/* Cancel Fee */}
          <DataTable
            title="Cancel Fee"
            data={data?.cancelFees || []}
            showAmount={true}
          />

          {/* VIP Cash Bonus */}
          <DataTable
            title="VIP Cash Bonus"
            data={data?.vipCashBonus || []}
            showAmount={true}
          />

          {/* Referral Commission */}
          <DataTable
            title="Referral Commission"
            data={data?.referralCommissions || []}
            showAmount={true}
          />

          {/* Turnover */}
          <DataTable
            title="Turnover"
            data={data?.turnover || []}
            showAmount={true}
          />

          {/* Affiliate Profit & Loss */}
          <DataTable
            title="Affiliate Profit & Loss"
            data={data?.profitLoss || []}
            showAmount={true}
          />
        </div>
      </div>
    </div>
  );
}

interface DataTableProps {
  title: string;
  data: Array<{ _id: string; count: number; amount?: number }>;
  showAmount: boolean;
}

function DataTable({ title, data, showAmount }: DataTableProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Count
              </th>
              {showAmount && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.count}
                  </td>
                  {showAmount && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(item.amount || 0)}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showAmount ? 3 : 2} className="px-6 py-8 text-center text-gray-600">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

