'use client';

/**
 * Admin Dashboard
 * Overview of platform statistics
 * Phase 5: Admin Panel Implementation
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api-client';
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiAlertCircle,
} from 'react-icons/fi';

interface Stats {
  users: {
    total: number;
    active: number;
    new: number;
  };
  bets: {
    total: number;
    active: number;
  };
  revenue: {
    total: number;
    deposits: number;
    withdrawals: number;
    netRevenue: number;
  };
  pending: {
    withdrawals: number;
    kyc: number;
  };
  period: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOverviewStats({ period });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total.toLocaleString(),
      change: `+${stats.users.new} new`,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: stats.users.active.toLocaleString(),
      change: `Last ${stats.period}`,
      icon: FiActivity,
      color: 'bg-green-500',
    },
    {
      title: 'Total Bets',
      value: stats.bets.total.toLocaleString(),
      change: `${stats.bets.active} active`,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Net Revenue',
      value: `₹${stats.revenue.netRevenue.toLocaleString()}`,
      change: `Last ${stats.period}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and statistics</p>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Deposits</span>
              <span className="font-semibold text-green-600">
                ₹{stats.revenue.deposits.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Withdrawals</span>
              <span className="font-semibold text-red-600">
                ₹{stats.revenue.withdrawals.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Platform Revenue</span>
              <span className="font-semibold text-blue-600">
                ₹{stats.revenue.total.toLocaleString()}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Net Revenue</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{stats.revenue.netRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Actions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Pending Withdrawals</p>
                  <p className="text-sm text-gray-600">Require approval</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {stats.pending.withdrawals}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Pending KYC</p>
                  <p className="text-sm text-gray-600">Require verification</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats.pending.kyc}
              </span>
            </div>

            <div className="pt-4">
              <button
                onClick={() => (window.location.href = '/admin/withdrawals')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Pending Items
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = '/admin/users')}
            className="px-6 py-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <FiUsers className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-600">View and manage all users</p>
          </button>

          <button
            onClick={() => (window.location.href = '/admin/bets')}
            className="px-6 py-4 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
          >
            <FiTrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-semibold text-gray-900">Manage Bets</p>
            <p className="text-sm text-gray-600">View and void bets</p>
          </button>

          <button
            onClick={() => (window.location.href = '/admin/markets')}
            className="px-6 py-4 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
          >
            <FiActivity className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-semibold text-gray-900">Manage Markets</p>
            <p className="text-sm text-gray-600">Create and settle markets</p>
          </button>
        </div>
      </div>
    </div>
  );
}
