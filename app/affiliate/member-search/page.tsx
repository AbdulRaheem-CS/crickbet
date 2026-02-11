'use client';

import { useState } from 'react';

/**
 * Member Search Page
 * Search and view affiliate members/referrals
 */

interface Member {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  registeredTime: string;
  lastLoginIP: string;
  lastLoginTime: string | null;
  lastBetTime: string | null;
  lastDepositTime: string | null;
  currencyType: string;
  affiliateURL: string;
}

export default function MemberSearchPage() {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Search filters
  const [filters, setFilters] = useState({
    startDate: '2026-01-09',
    endDate: '2026-01-16',
    username: '',
    lastLoginIP: '',
    lastBetSince: '',
    lastDepositSince: '',
    currencyType: 'BDT'
  });

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.username) queryParams.append('username', filters.username);
      if (filters.lastLoginIP) queryParams.append('lastLoginIP', filters.lastLoginIP);
      if (filters.lastBetSince) queryParams.append('lastBetSince', filters.lastBetSince);
      if (filters.lastDepositSince) queryParams.append('lastDepositSince', filters.lastDepositSince);
      if (filters.currencyType) queryParams.append('currencyType', filters.currencyType);

      const response = await fetch(
        `http://localhost:5001/api/affiliate/member-search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMembers(data.data.members);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.message || 'Failed to search members');
      }
    } catch (err) {
      console.error('Error searching members:', err);
      setError('Failed to search members');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export functionality - convert to CSV
    if (members.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Registered Time',
      'Username',
      'Affiliate URL',
      'Phone Number',
      'Email Address',
      'Last Login IP',
      'Sign Up',
      'Last Login Time',
      'Last Deposit',
      'Last Bet Time',
      'Currency Type'
    ];

    const csvData = members.map(member => [
      formatDateTime(member.registeredTime),
      member.username,
      member.affiliateURL,
      member.phoneNumber,
      member.email,
      member.lastLoginIP,
      formatDateTime(member.registeredTime),
      member.lastLoginTime ? formatDateTime(member.lastLoginTime) : 'N/A',
      member.lastDepositTime ? formatDateTime(member.lastDepositTime) : 'N/A',
      member.lastBetTime ? formatDateTime(member.lastBetTime) : 'N/A',
      member.currencyType
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `member-search-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Member Search</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Date Filter Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Date Filter
            </button>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Registered Date Range */}
            {showDateFilter && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Date Range
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={filters.username}
                onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by username"
              />
            </div>

            {/* Last Login IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Login IP
              </label>
              <input
                type="text"
                value={filters.lastLoginIP}
                onChange={(e) => setFilters(prev => ({ ...prev, lastLoginIP: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Last Login IP"
              />
            </div>

            {/* Last Bet Time Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Bet Time Since
              </label>
              <input
                type="date"
                value={filters.lastBetSince}
                onChange={(e) => setFilters(prev => ({ ...prev, lastBetSince: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Last Deposit Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Deposit Since
              </label>
              <input
                type="date"
                value={filters.lastDepositSince}
                onChange={(e) => setFilters(prev => ({ ...prev, lastDepositSince: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Currency Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Type
              </label>
              <select
                value={filters.currencyType}
                onChange={(e) => setFilters(prev => ({ ...prev, currencyType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BDT">BDT</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Column Visibility and Search */}
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Column visibility
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Search:</label>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">Registered Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Affiliate URL</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Phone Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Email Address</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Login IP</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Sign Up</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Login Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Deposit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Last Bet Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Currency Type</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(member.registeredTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.username}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">
                        <a href={member.affiliateURL} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {member.affiliateURL}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.phoneNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.lastLoginIP}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(member.registeredTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(member.lastLoginTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(member.lastDepositTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateTime(member.lastBetTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {member.currencyType}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="mt-6 text-sm text-gray-600">
            Showing 0 to 0 of {total} entries
          </div>

          {/* Export and Search Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleExport}
              disabled={members.length === 0}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
