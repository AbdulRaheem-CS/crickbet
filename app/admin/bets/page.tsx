'use client';

/**
 * Admin Bets Management Page
 * Manage all platform bets
 * Phase 5: Admin Panel Implementation
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api-client';
import {
  FiSearch,
  FiEye,
  FiXCircle,
  FiFilter,
} from 'react-icons/fi';

interface Bet {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  market: {
    _id: string;
    name: string;
  };
  event?: {
    name: string;
    sportName: string;
  };
  selection?: {
    name: string;
  };
  betType: string;
  stake: number;
  odds: number;
  potentialWin: number;
  liability: number;
  status: 'pending' | 'matched' | 'partially_matched' | 'won' | 'lost' | 'void' | 'cancelled';
  createdAt: string;
}

export default function AdminBetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  useEffect(() => {
    fetchBets();
  }, [page, statusFilter]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const response: any = await adminAPI.getAllBets({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setBets(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoidBet = async () => {
    if (!selectedBet || !voidReason.trim()) {
      alert('Please provide a reason for voiding this bet');
      return;
    }

    try {
      await adminAPI.voidBet(selectedBet._id, { reason: voidReason });
      setShowModal(false);
      setVoidReason('');
      fetchBets();
      alert('Bet voided successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to void bet');
    }
  };

  const viewBetDetails = async (betId: string) => {
    try {
      const response = await adminAPI.getBetById(betId);
      setSelectedBet(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching bet details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bet Management</h1>
        <p className="text-gray-600 mt-1">View and manage all platform bets</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="void">Void</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={() => {
              setStatusFilter('');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Bets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bets...</p>
          </div>
        ) : bets.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No bets found</p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stake
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odds
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Potential Win
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bets.map((bet) => (
                  <tr key={bet._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {bet.user?.username || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bet.event?.name || bet.market?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{bet.stake}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bet.odds}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{bet.potentialWin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bet.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : bet.status === 'won'
                            ? 'bg-green-100 text-green-800'
                            : bet.status === 'lost'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bet.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(bet.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewBetDetails(bet._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                        {bet.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedBet(bet);
                              setShowModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Void Bet"
                          >
                            <FiXCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Void Bet Modal */}
      {showModal && selectedBet && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => {
                setShowModal(false);
                setVoidReason('');
              }}
            ></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Void Bet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bet ID</label>
                  <p className="text-sm text-gray-900">{selectedBet._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-sm text-gray-900">
                    {selectedBet.user?.username || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stake</label>
                  <p className="text-sm text-gray-900">₹{selectedBet.stake}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Voiding *
                  </label>
                  <textarea
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for voiding this bet..."
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setVoidReason('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVoidBet}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Void Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
