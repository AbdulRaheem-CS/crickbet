'use client';

import { useState, useEffect } from 'react';

interface PerformanceData {
  _id: string;
  username: string;
  keyword: string;
  signUpCountry: string;
  currency: string;
  registrationTime: string;
  firstDepositTime: string | null;
  phoneNumber: string;
  emailAddress: string;
  signUpIP: string;
  lastLoginIP: string;
  lastLoginTime: string | null;
  totalDeposit: number;
  totalDepositPaymentFee: number;
  totalWithdrawal: number;
  totalWithdrawalPaymentFee: number;
  totalNumberOfBets: number;
  totalTurnover: number;
  profitLoss: number;
  totalJackpot: number;
}

interface PerformanceTotals {
  totalDeposit: number;
  totalDepositPaymentFee: number;
  totalWithdrawal: number;
  totalWithdrawalPaymentFee: number;
  totalNumberOfBets: number;
  totalTurnover: number;
  profitLoss: number;
  totalJackpot: number;
}

interface PerformanceResponse {
  players: PerformanceData[];
  pageTotal: PerformanceTotals;
  grandTotal: PerformanceTotals;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'player' | 'downline'>('player');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [player, setPlayer] = useState('');
  const [startDate, setStartDate] = useState('09/01/2026');
  const [endDate, setEndDate] = useState('16/01/2026');
  const [currency, setCurrency] = useState('BDT');
  const [keywords, setKeywords] = useState('All');
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    username: true,
    keyword: true,
    signUpCountry: true,
    currency: true,
    registrationTime: true,
    firstDepositTime: true,
    phoneNumber: true,
    emailAddress: true,
    signUpIP: true,
    lastLoginIP: true,
    lastLoginTime: true,
    totalDeposit: true,
    totalDepositPaymentFee: true,
    totalWithdrawal: true,
    totalWithdrawalPaymentFee: true,
    totalNumberOfBets: true,
    totalTurnover: true,
    profitLoss: true,
    totalJackpot: true,
  });

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const params = new URLSearchParams();
      if (player) params.append('player', player);
      if (showDateFilter && startDate) params.append('startDate', convertDateFormat(startDate));
      if (showDateFilter && endDate) params.append('endDate', convertDateFormat(endDate));
      if (currency !== 'All') params.append('currency', currency);
      if (keywords !== 'All') params.append('keywords', keywords);
      params.append('type', activeTab);

      const response = await fetch(
        `http://localhost:5001/api/affiliate/performance?${params.toString()}`,
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
        setError(result.message || 'Failed to fetch performance data');
      }
    } catch (err) {
      setError('An error occurred while fetching performance data');
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [activeTab]);

  const handleSearch = () => {
    fetchPerformance();
  };

  const handleExport = () => {
    if (!data || data.players.length === 0) return;

    const headers = [
      '#',
      'Username',
      'Keyword',
      'Sign Up Country',
      'Currency',
      'Registration Time',
      'First Deposit Time',
      'Phone Number',
      'Email Address',
      'Sign Up IP',
      'Last Login IP',
      'Last Login Time',
      'Total Deposit',
      'Total Deposit Payment Fee',
      'Total Withdrawal',
      'Total Withdrawal Payment Fee',
      'Total Number of Bets',
      'Total Turnover',
      'Profit/Loss',
      'Total Jackpot',
    ];

    const rows = data.players.map((player, index) => [
      index + 1,
      player.username,
      player.keyword,
      player.signUpCountry,
      player.currency,
      formatDateTime(player.registrationTime),
      player.firstDepositTime ? formatDateTime(player.firstDepositTime) : '-',
      player.phoneNumber || '-',
      player.emailAddress || '-',
      player.signUpIP || '-',
      player.lastLoginIP || '-',
      player.lastLoginTime ? formatDateTime(player.lastLoginTime) : '-',
      player.totalDeposit,
      player.totalDepositPaymentFee,
      player.totalWithdrawal,
      player.totalWithdrawalPaymentFee,
      player.totalNumberOfBets,
      player.totalTurnover,
      player.profitLoss,
      player.totalJackpot,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_${activeTab}_${new Date().getTime()}.csv`;
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[98%] mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Performance</h1>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === 'player'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Player
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

            {/* Player Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player
              </label>
              <input
                type="text"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                placeholder="Search player..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date Range */}
            {showDateFilter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            )}

            {/* Currency and Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Column Visibility */}
            <div className="relative">
              <button
                onClick={() => setShowColumnVisibility(!showColumnVisibility)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Column Visibility
              </button>
              {showColumnVisibility && (
                <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(visibleColumns).map((column) => (
                      <label key={column} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={visibleColumns[column as keyof typeof visibleColumns]}
                          onChange={() => toggleColumn(column as keyof typeof visibleColumns)}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{column.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
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
                  <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    #
                  </th>
                  {visibleColumns.username && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Username
                    </th>
                  )}
                  {visibleColumns.keyword && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Keyword
                    </th>
                  )}
                  {visibleColumns.signUpCountry && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sign Up Country
                    </th>
                  )}
                  {visibleColumns.currency && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Currency
                    </th>
                  )}
                  {visibleColumns.registrationTime && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Registration Time
                    </th>
                  )}
                  {visibleColumns.firstDepositTime && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      First Deposit Time
                    </th>
                  )}
                  {visibleColumns.phoneNumber && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Phone Number
                    </th>
                  )}
                  {visibleColumns.emailAddress && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email Address
                    </th>
                  )}
                  {visibleColumns.signUpIP && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sign Up IP
                    </th>
                  )}
                  {visibleColumns.lastLoginIP && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Last Login IP
                    </th>
                  )}
                  {visibleColumns.lastLoginTime && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Last Login Time
                    </th>
                  )}
                  {visibleColumns.totalDeposit && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Deposit
                    </th>
                  )}
                  {visibleColumns.totalDepositPaymentFee && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Deposit Payment Fee
                    </th>
                  )}
                  {visibleColumns.totalWithdrawal && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Withdrawal
                    </th>
                  )}
                  {visibleColumns.totalWithdrawalPaymentFee && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Withdrawal Payment Fee
                    </th>
                  )}
                  {visibleColumns.totalNumberOfBets && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Number of Bets
                    </th>
                  )}
                  {visibleColumns.totalTurnover && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Turnover
                    </th>
                  )}
                  {visibleColumns.profitLoss && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Profit/Loss
                    </th>
                  )}
                  {visibleColumns.totalJackpot && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Total Jackpot
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={20}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data && data.players.length > 0 ? (
                  <>
                    {data.players.map((player, index) => (
                      <tr key={player._id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        {visibleColumns.username && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.username}
                          </td>
                        )}
                        {visibleColumns.keyword && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.keyword}
                          </td>
                        )}
                        {visibleColumns.signUpCountry && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.signUpCountry || '-'}
                          </td>
                        )}
                        {visibleColumns.currency && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.currency}
                          </td>
                        )}
                        {visibleColumns.registrationTime && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(player.registrationTime)}
                          </td>
                        )}
                        {visibleColumns.firstDepositTime && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(player.firstDepositTime)}
                          </td>
                        )}
                        {visibleColumns.phoneNumber && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.phoneNumber || '-'}
                          </td>
                        )}
                        {visibleColumns.emailAddress && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.emailAddress || '-'}
                          </td>
                        )}
                        {visibleColumns.signUpIP && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.signUpIP || '-'}
                          </td>
                        )}
                        {visibleColumns.lastLoginIP && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.lastLoginIP || '-'}
                          </td>
                        )}
                        {visibleColumns.lastLoginTime && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(player.lastLoginTime)}
                          </td>
                        )}
                        {visibleColumns.totalDeposit && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalDeposit.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.totalDepositPaymentFee && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalDepositPaymentFee.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.totalWithdrawal && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalWithdrawal.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.totalWithdrawalPaymentFee && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalWithdrawalPaymentFee.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.totalNumberOfBets && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalNumberOfBets}
                          </td>
                        )}
                        {visibleColumns.totalTurnover && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalTurnover.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.profitLoss && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.profitLoss.toFixed(2)}
                          </td>
                        )}
                        {visibleColumns.totalJackpot && (
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                            {player.totalJackpot.toFixed(2)}
                          </td>
                        )}
                      </tr>
                    ))}

                    {/* Page Total Row */}
                    <tr className="bg-gray-700 font-semibold text-white">
                      <td colSpan={visibleColumns.username ? 12 : 11} className="px-3 py-3 text-sm">
                        Page Total
                      </td>
                      {visibleColumns.totalDeposit && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalDeposit.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalDepositPaymentFee && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalDepositPaymentFee.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalWithdrawal && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalWithdrawal.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalWithdrawalPaymentFee && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalWithdrawalPaymentFee.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalNumberOfBets && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalNumberOfBets}
                        </td>
                      )}
                      {visibleColumns.totalTurnover && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalTurnover.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.profitLoss && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.profitLoss.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalJackpot && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.pageTotal.totalJackpot.toFixed(2)}
                        </td>
                      )}
                    </tr>

                    {/* Grand Total Row */}
                    <tr className="bg-gray-800 font-bold text-white">
                      <td colSpan={visibleColumns.username ? 12 : 11} className="px-3 py-3 text-sm">
                        Grand Total
                      </td>
                      {visibleColumns.totalDeposit && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalDeposit.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalDepositPaymentFee && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalDepositPaymentFee.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalWithdrawal && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalWithdrawal.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalWithdrawalPaymentFee && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalWithdrawalPaymentFee.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalNumberOfBets && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalNumberOfBets}
                        </td>
                      )}
                      {visibleColumns.totalTurnover && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalTurnover.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.profitLoss && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.profitLoss.toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.totalJackpot && (
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          {data.grandTotal.totalJackpot.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={20} className="px-4 py-8 text-center text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          {data && data.players.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing {((data.pagination.page - 1) * 10) + 1} to {Math.min(data.pagination.page * 10, data.pagination.total)} of {data.pagination.total} entries
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleExport}
            disabled={!data || data.players.length === 0}
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
