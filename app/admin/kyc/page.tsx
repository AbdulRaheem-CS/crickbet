'use client';

/**
 * Admin KYC Verification Page
 * Manage KYC verifications for users
 * Phase 5: Admin Panel Implementation
 */

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api-client';
import {
  FiUser,
  FiCheck,
  FiX,
  FiEye,
  FiFileText,
  FiCalendar,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiDownload,
} from 'react-icons/fi';

interface KYCDocument {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  documentType: string;
  documentNumber: string;
  documentFront?: string;
  documentBack?: string;
  selfieImage?: string;
  addressProof?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  submittedAt: string;
}

export default function AdminKYCPage() {
  const [kycDocs, setKycDocs] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchKYCDocs();
  }, [page]);

  const fetchKYCDocs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingKYC({ page, limit: 20 });
      setKycDocs(response.data.kyc || response.data);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (kycId: string) => {
    if (!confirm('Are you sure you want to approve this KYC document?')) return;

    try {
      await adminAPI.approveKYC(kycId, { verificationLevel: 1 });
      alert('KYC approved successfully');
      fetchKYCDocs();
      setShowModal(false);
    } catch (error: any) {
      alert(error.message || 'Failed to approve KYC');
    }
  };

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this KYC document?')) return;

    try {
      await adminAPI.rejectKYC(kycId, { reason: rejectionReason });
      alert('KYC rejected successfully');
      fetchKYCDocs();
      setShowModal(false);
      setRejectionReason('');
    } catch (error: any) {
      alert(error.message || 'Failed to reject KYC');
    }
  };

  const viewDetails = (doc: KYCDocument) => {
    setSelectedDoc(doc);
    setRejectionReason('');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading KYC documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
          <p className="text-gray-600 mt-1">Review and verify user KYC documents</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <p className="text-sm font-medium text-yellow-800">
              Pending: {kycDocs.length}
            </p>
          </div>
        </div>
      </div>

      {/* KYC List */}
      {kycDocs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FiCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pending KYC Documents
          </h3>
          <p className="text-gray-600">All KYC verifications have been processed</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kycDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.userId?.username || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-gray-400" />
                        <span className="text-sm text-gray-900 capitalize">
                          {doc.documentType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-mono">
                        {doc.documentNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {new Date(doc.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doc.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewDetails(doc)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FiEye />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* KYC Detail Modal */}
      {showModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">KYC Document Review</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">
                        {selectedDoc.userId?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMail className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {selectedDoc.userId?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {selectedDoc.userId?.phone && (
                    <div className="flex items-center gap-3">
                      <FiPhone className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">
                          {selectedDoc.userId.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedDoc.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Document Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedDoc.documentType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Document Number</p>
                    <p className="font-medium text-gray-900 font-mono">
                      {selectedDoc.documentNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDoc.documentFront && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Document Front</p>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={selectedDoc.documentFront}
                          alt="Document Front"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <a
                        href={selectedDoc.documentFront}
                        download
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  )}
                  {selectedDoc.documentBack && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Document Back</p>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={selectedDoc.documentBack}
                          alt="Document Back"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <a
                        href={selectedDoc.documentBack}
                        download
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  )}
                  {selectedDoc.selfieImage && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Selfie with Document</p>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={selectedDoc.selfieImage}
                          alt="Selfie"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <a
                        href={selectedDoc.selfieImage}
                        download
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  )}
                  {selectedDoc.addressProof && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Address Proof</p>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={selectedDoc.addressProof}
                          alt="Address Proof"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                      <a
                        href={selectedDoc.addressProof}
                        download
                        className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection Reason Input (if rejecting) */}
              {selectedDoc.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              {/* Status Display */}
              {selectedDoc.status !== 'pending' && (
                <div
                  className={`p-4 rounded-lg ${
                    selectedDoc.status === 'approved'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedDoc.status === 'approved' ? (
                      <FiCheck className="text-green-600 w-5 h-5 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="text-red-600 w-5 h-5 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedDoc.status === 'approved' ? 'Approved' : 'Rejected'}
                      </p>
                      {selectedDoc.rejectionReason && (
                        <p className="text-sm text-gray-600 mt-1">
                          Reason: {selectedDoc.rejectionReason}
                        </p>
                      )}
                      {selectedDoc.verifiedAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(selectedDoc.verifiedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedDoc.status === 'pending' && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => handleApprove(selectedDoc._id)}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FiCheck />
                  Approve KYC
                </button>
                <button
                  onClick={() => handleReject(selectedDoc._id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FiX />
                  Reject KYC
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
