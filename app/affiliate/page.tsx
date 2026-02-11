'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api-client';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

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
      const response: any = await apiClient.get('/affiliate/dashboard');

      // apiClient returns response.data (the JSON body). Backend uses { success, data }.
      // normalize to the inner data object that contains dashboard metrics
      let payload: any = response;
      if (payload && payload.success && payload.data) {
        payload = payload.data;
      } else if (payload && payload.data && payload.data.data) {
        payload = payload.data.data;
      }

      setData(payload || null);
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
    <div className="min-h-screen bg-white">
      <div className="space-y-0">
        {/* Commission and Active Players Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Commission Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-gray-300 p-6">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Commission</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Period</span>
                  <span className="text-2xl font-bold text-gray-800">৳{(data?.commission.thisMonth || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-300 pt-2">
                  <span className="text-sm text-gray-600">Last Period</span>
                  <span className="text-2xl font-bold text-gray-800">৳{(data?.commission.lastMonth || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Players Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-gray-300 p-6">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-700 mb-4">Active Players</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Period</span>
                  <span className="text-2xl font-bold text-gray-800">{data?.activePlayers.thisMonth || 0}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-300 pt-2">
                  <span className="text-sm text-gray-600">Last Period</span>
                  <span className="text-2xl font-bold text-gray-800">{data?.activePlayers.lastMonth || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables Grid - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Registered Users */}
          <CollapsibleDataTable
            title="Registered Users"
            data={data?.registeredUsers || []}
            showAmount={false}
          />

          {/* First Deposit */}
          <CollapsibleDataTable
            title="First Deposit"
            data={data?.firstDeposits || []}
            showAmount={true}
          />

          {/* Deposit */}
          <CollapsibleDataTable
            title="Deposit"
            data={data?.deposits || []}
            showAmount={true}
          />

          {/* Withdrawal */}
          <CollapsibleDataTable
            title="Withdrawal"
            data={data?.withdrawals || []}
            showAmount={true}
          />

          {/* Bonus */}
          <CollapsibleDataTable
            title="Bonus"
            data={data?.bonuses || []}
            showAmount={true}
          />

          {/* Recycle Amount */}
          <CollapsibleDataTable
            title="Recycle Amount"
            data={data?.recycleAmount || []}
            showAmount={true}
          />

          {/* Cancel Fee */}
          <CollapsibleDataTable
            title="Cancel Fee"
            data={data?.cancelFees || []}
            showAmount={true}
          />

          {/* VIP Cash Bonus */}
          <CollapsibleDataTable
            title="VIP Cash Bonus"
            data={data?.vipCashBonus || []}
            showAmount={true}
          />

          {/* Referral Commission */}
          <CollapsibleDataTable
            title="Referral Commission"
            data={data?.referralCommissions || []}
            showAmount={true}
          />

          {/* Turnover */}
          <CollapsibleDataTable
            title="Turnover"
            data={data?.turnover || []}
            showAmount={true}
          />

          {/* Affiliate Profit & Loss */}
          <CollapsibleDataTable
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

function CollapsibleDataTable({ title, data, showAmount }: DataTableProps) {
  const [isOpen, setIsOpen] = useState(true);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Transform period labels
  const getPeriodLabel = (period: string) => {
    const periodMap: Record<string, string> = {
      'Today': 'Today',
      'Yesterday': 'Yesterday',
      'This Week': 'This Week',
      'Last Week': 'Last Week',
      'This Month': 'This Month',
      'Last Month': 'Last Month',
    };
    return periodMap[period] || period;
  };

  return (
    <div className="bg-white border border-gray-300">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-5 bg-gray-800"></span>
          {title}
        </h3>
        {isOpen ? (
          <FaChevronUp className="text-gray-500 text-sm" />
        ) : (
          <FaChevronDown className="text-gray-500 text-sm" />
        )}
      </button>

      {/* Table Content */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Count
                </th>
                {showAmount && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Amount
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPeriodLabel(item._id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.count}
                    </td>
                    {showAmount && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.amount || 0)}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <>
                  {['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'].map((period, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                      {showAmount && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0.00</td>
                      )}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

