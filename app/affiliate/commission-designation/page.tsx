'use client';

import { useState, useEffect } from 'react';

/**
 * Commission Designation Page
 * View and manage commission structure and designation
 */

interface Player {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
}

interface CommissionDesignation {
  _id: string;
  playerId: Player;
  currency: string;
  commissionRate: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function CommissionDesignationPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [designations, setDesignations] = useState<CommissionDesignation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [currencyFilter, setCurrencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    playerId: '',
    playerUsername: '',
    currency: 'INR',
    commissionRate: 0,
    status: 'active',
    notes: ''
  });

  // Available players for dropdown
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchDesignations();
  }, [page, currencyFilter, statusFilter]);

  useEffect(() => {
    fetchAvailablePlayers();
  }, []);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (currencyFilter !== 'All') {
        queryParams.append('currency', currencyFilter);
      }
      if (statusFilter !== 'All') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(
        `http://localhost:5001/api/affiliate/commission-designations?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setDesignations(data.data.designations);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
      setError('Failed to load designations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch referred users as available players
      const response = await fetch('http://localhost:5001/api/affiliate/hierarchy', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const body = await response.json();

      // backend returns { success, data }
      const payload = body && body.success && body.data ? body.data : (body.data || body);

      const players = (payload?.downline && payload.downline.length > 0)
        ? payload.downline
        : (payload?.availablePlayers || []);

      setAvailablePlayers(players || []);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!createForm.playerId || createForm.commissionRate < 0 || createForm.commissionRate > 100) {
        setError('Please fill all required fields correctly');
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/affiliate/commission-designations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId: createForm.playerId,
          currency: createForm.currency,
          commissionRate: createForm.commissionRate,
          status: createForm.status,
          notes: createForm.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Commission designation created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          playerId: '',
          playerUsername: '',
          currency: 'INR',
          commissionRate: 0,
          status: 'active',
          notes: ''
        });
        fetchDesignations();
      } else {
        setError(data.message || 'Failed to create designation');
      }
    } catch (err) {
      setError('Error creating designation. Please try again.');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDesignation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission designation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/affiliate/commission-designations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Commission designation deleted successfully!');
        fetchDesignations();
      } else {
        setError(data.message || 'Failed to delete designation');
      }
    } catch (err) {
      setError('Error deleting designation. Please try again.');
      console.error('Error:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDesignations();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Commission Designation</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </div>

          {/* Create Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Create
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">Player</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Currency</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Commission Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Created Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Update Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : designations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  designations.map((designation) => (
                    <tr key={designation._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {designation.playerId?.username || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {designation.currency}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {designation.commissionRate}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(designation.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(designation.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            designation.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : designation.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {designation.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteDesignation(designation._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={limit}
                className="px-2 py-1 border border-gray-300 rounded"
                disabled
              >
                <option value="10">10</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="text-sm text-gray-600">
              Showing {designations.length === 0 ? 0 : (page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, total)} of {total} entries
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Commission Designation
            </h2>

            <form onSubmit={handleCreateDesignation}>
              {/* Player Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player *
                </label>
                <select
                  value={createForm.playerId}
                  onChange={(e) => {
                    const selectedPlayer = availablePlayers.find(p => p._id === e.target.value);
                    setCreateForm(prev => ({
                      ...prev,
                      playerId: e.target.value,
                      playerUsername: selectedPlayer?.username || ''
                    }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Player</option>
                  {availablePlayers.map((player) => (
                    <option key={player._id} value={player._id}>
                      {player.username} ({player.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={createForm.currency}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* Commission Rate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={createForm.commissionRate}
                  onChange={(e) => {
                    const v = e.target.value;
                    const parsed = v === '' ? 0 : parseFloat(v);
                    setCreateForm(prev => ({ ...prev, commissionRate: Number.isNaN(parsed) ? 0 : parsed }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({
                      playerId: '',
                      playerUsername: '',
                      currency: 'INR',
                      commissionRate: 0,
                      status: 'active',
                      notes: ''
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
