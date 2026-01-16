'use client';

import { useState, useEffect } from 'react';

interface CommissionRecord {
  _id: string;
  startDate: string;
  currency: string;
  netProfit: number;
  commission: number;
  period: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
}

interface CommissionTotals {
  netProfit: number;
  commission: number;
}

interface CommissionData {
  commissions: CommissionRecord[];
  pageTotal: CommissionTotals;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export default function CommissionPage() {
  const [activeTab, setActiveTab] = useState<'myAccount' | 'downline'>('myAccount');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('09/01/2026');
  const [endDate, setEndDate] = useState('16/01/2026');
  const [currency, setCurrency] = useState('BDT');
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    startDate: true,
    currency: true,
    netProfit: true,
    commission: true,
    period: true,
    status: true,
    action: true,
  });

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const params = new URLSearchParams();
      if (showDateFilter && startDate) params.append('startDate', convertDateFormat(startDate));
      if (showDateFilter && endDate) params.append('endDate', convertDateFormat(endDate));
      if (currency !== 'All') params.append('currency', currency);
      params.append('type', activeTab);

      const response = await fetch(
        `http://localhost:5001/api/affiliate/commissions?${params.toString()}`,
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
        setError(result.message || 'Failed to fetch commission data');
      }
    } catch (err) {
      setError('An error occurred while fetching commission data');
      console.error('Error fetching commissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [activeTab]);

  const handleSearch = () => {
    fetchCommissions();
  };

  const handleExport = () => {
    if (!data || data.commissions.length === 0) return;

    const headers = ['#', 'Start Date', 'Currency', 'Net Profit', 'Commission', 'Period', 'Status'];

    const rows = data.commissions.map((record, index) => [
      index + 1,
      formatDate(record.startDate),
      record.currency,
      record.netProfit.toFixed(2),
      record.commission.toFixed(2),
      record.period,
      record.status,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission_${activeTab}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const convertDateFormat = (dateStr: string) => {
    // Convert DD/MM/YYYY to YYYY-MM-DD
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'approved':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Commission</h1>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('myAccount')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'myAccount'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Account
            </button>
            <button
              onClick={() => setActiveTab('downline')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'downline'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Downline
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 space-y-4">
            {/* Date Filter Toggle */}
            <div>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
              >
                Date Filter {showDateFilter ? '▼' : '▶'}
              </button>
            </div>

            {/* Date Range and Currency */}
            {showDateFilter && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BDT">BDT</option>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>
            )}

            {/* Column Visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColumnVisibility(!showColumnVisibility)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Column Visibility
              </button>
              {showColumnVisibility && (
                <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                  <div className="space-y-2">
                    {Object.keys(visibleColumns).map((column) => (
                      <label key={column} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={visibleColumns[column as keyof typeof visibleColumns]}
                          onChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">
                          {column.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button - Top Right */}
            <div className="flex justify-end">
              <div className="text-sm text-gray-600">Search:</div>
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
        <div className="bg-white rounded-b-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    #
                  </th>
                  {visibleColumns.startDate && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Start Date
                    </th>
                  )}
                  {visibleColumns.currency && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Currency
                    </th>
                  )}
                  {visibleColumns.netProfit && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Net Profit
                    </th>
                  )}
                  {visibleColumns.commission && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Commission
                    </th>
                  )}
                  {visibleColumns.period && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Period
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  {visibleColumns.action && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data && data.commissions.length > 0 ? (
                  <>
                    {data.commissions.map((record, index) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        {visibleColumns.startDate && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(record.startDate)}
                          </td>
                        )}
                        {visibleColumns.currency && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {record.currency}
                          </td>
                        )}
                        {visibleColumns.netProfit && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {record.netProfit.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.commission && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {record.commission.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.period && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {record.period}
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        )}
                        {visibleColumns.action && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <button className="text-blue-600 hover:text-blue-800">
                              View
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Page Total Row */}
                    <tr className="bg-gray-700 font-semibold text-white">
                      <td colSpan={visibleColumns.currency ? 3 : 2} className="px-4 py-3 text-sm">
                        Page Total
                      </td>
                      {visibleColumns.netProfit && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.netProfit.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.commission && (
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.commission.toFixed(2)}
                        </td>
                      )}
                      <td colSpan={3}></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {data && data.commissions.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing {((data.pagination.page - 1) * 10) + 1} to{' '}
                {Math.min(data.pagination.page * 10, data.pagination.total)} of{' '}
                {data.pagination.total} entries
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleExport}
            disabled={!data || data.commissions.length === 0}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            📊 Export
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            🔍 {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  );
}
