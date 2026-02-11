'use client';

import { useState, useEffect } from 'react';

interface Registration {
  _id: string;
  username: string;
  keywords: string;
  currency: string;
  registrationTime: string;
  firstDepositTime: string | null;
  firstDepositAmount: number;
  firstBetTime: string | null;
  firstBetAmount: number;
}

interface Totals {
  firstDeposit: number;
  firstBet: number;
  lastBet: number;
}

interface RegistrationsData {
  registrations: Registration[];
  pageTotal: Totals;
  grandTotal: Totals;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export default function RegistrationsFTDsPage() {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keywords, setKeywords] = useState('All');
  const [currency, setCurrency] = useState('BDT');
  const [data, setData] = useState<RegistrationsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const params = new URLSearchParams();
      if (showDateFilter && startDate) params.append('startDate', startDate);
      if (showDateFilter && endDate) params.append('endDate', endDate);
      if (keywords !== 'All') params.append('keywords', keywords);
      if (currency !== 'All') params.append('currency', currency);

      const response = await fetch(
        `http://localhost:5001/api/affiliate/registrations-ftds?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch registrations');
      }
    } catch (err) {
      setError('An error occurred while fetching registrations');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleSearch = () => {
    fetchRegistrations();
  };

  const handleExport = () => {
    if (!data || data.registrations.length === 0) return;

    const headers = [
      '#',
      'Username',
      'Keywords',
      'Currency',
      'Registration Time',
      'First Deposit Time',
      'First Deposit',
      'First Bet Time',
      'First Bet',
      'Last Bet Time',
      'Last Bet',
    ];

    const rows = data.registrations.map((reg, index) => [
      index + 1,
      reg.username,
      reg.keywords,
      reg.currency,
      formatDateTime(reg.registrationTime),
      reg.firstDepositTime ? formatDateTime(reg.firstDepositTime) : '-',
      reg.firstDepositAmount,
      reg.firstBetTime ? formatDateTime(reg.firstBetTime) : '-',
      reg.firstBetAmount,
      reg.firstBetTime ? formatDateTime(reg.firstBetTime) : '-',
      reg.firstBetAmount,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_ftds_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Registrations & FTDs
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Filter Toggle */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDateFilter}
                  onChange={(e) => setShowDateFilter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Date Filter
                </span>
              </label>
            </div>

            {/* From Date */}
            {showDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* To Date */}
            {showDateFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Keywords Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <select
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="BDT">BDT</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keywords
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Deposit Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Deposit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Bet Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Bet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Bet Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Bet
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data && data.registrations.length > 0 ? (
                  <>
                    {data.registrations.map((reg, index) => (
                      <tr key={reg._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.username}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.keywords}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.currency}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(reg.registrationTime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(reg.firstDepositTime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.firstDepositAmount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(reg.firstBetTime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.firstBetAmount}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(reg.firstBetTime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {reg.firstBetAmount}
                        </td>
                      </tr>
                    ))}

                    {/* Page Total Row */}
                    <tr className="bg-blue-50 font-semibold">
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-sm text-gray-900"
                      >
                        Page Total
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.pageTotal.firstDeposit}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.pageTotal.firstBet}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.pageTotal.lastBet}
                      </td>
                    </tr>

                    {/* Grand Total Row */}
                    <tr className="bg-green-50 font-bold">
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-sm text-gray-900"
                      >
                        Grand Total
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.grandTotal.firstDeposit}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.grandTotal.firstBet}
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {data.grandTotal.lastBet}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {data && data.registrations.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing {data.pagination.page} of {data.pagination.pages} pages
                ({data.pagination.total} total entries)
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleExport}
            disabled={!data || data.registrations.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
}
