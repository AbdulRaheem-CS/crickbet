'use client';

/**
 * Admin Withdrawals Management Page
 * Approve/Reject withdrawal requests
 * Phase 5: Admin Panel Implementation
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api-client';
import {
  FiCheck,
  FiX,
  FiEye,
  FiDollarSign,
} from 'react-icons/fi';

interface Withdrawal {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: string;
  method?: string;
  paymentDetails?: any;
  reference?: string;
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [txnId, setTxnId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [page]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response: any = await adminAPI.getPendingWithdrawals({
        page,
        limit: 20,
      });
      setWithdrawals(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal || !txnId.trim()) {
      alert('Please provide a bank transaction ID');
      return;
    }

    try {
      await adminAPI.approveWithdrawal(selectedWithdrawal._id, {
        txnId,
        remarks: 'Approved by admin',
      });
      setShowModal(false);
      setTxnId('');
      fetchWithdrawals();
      alert('Withdrawal approved successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await adminAPI.rejectWithdrawal(selectedWithdrawal._id, {
        reason: rejectReason,
      });
      setShowModal(false);
      setRejectReason('');
      fetchWithdrawals();
      alert('Withdrawal rejected successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to reject withdrawal');
    }
  };

  const openModal = (withdrawal: Withdrawal, type: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdrawal Management</h1>
        <p className="text-gray-600 mt-1">Approve or reject pending withdrawal requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-yellow-900">{withdrawals.length}</p>
            </div>
            <FiDollarSign className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹
                {withdrawals
                  .reduce((sum, w) => sum + w.amount, 0)
                  .toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading withdrawals...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No pending withdrawals</p>
            <p className="text-gray-500 text-sm mt-2">All withdrawal requests have been processed</p>
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
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
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {withdrawal.user?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {withdrawal.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{withdrawal.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {withdrawal.method || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(withdrawal, 'approve')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <FiCheck className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openModal(withdrawal, 'reject')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                          <FiX className="w-4 h-4 mr-1" />
                          Reject
                        </button>
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

      {/* Approve/Reject Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => {
                setShowModal(false);
                setTxnId('');
                setRejectReason('');
              }}
            ></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">
                {modalType === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p className="text-sm text-gray-900">
                    {selectedWithdrawal.user?.username || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{selectedWithdrawal.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Method</label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedWithdrawal.method || 'N/A'}
                  </p>
                </div>

                {modalType === 'approve' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter transaction ID..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter reason for rejection..."
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTxnId('');
                    setRejectReason('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={modalType === 'approve' ? handleApprove : handleReject}
                  className={`px-4 py-2 text-white rounded-lg ${
                    modalType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {modalType === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
