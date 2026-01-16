'use client';

import { useState, useEffect } from 'react';

/**
 * Material (Links) Page
 * Manage affiliate marketing tracking links
 */

interface AffiliateLink {
  _id: string;
  domain: string;
  status: string;
  keywords: string;
  page: string;
  trackingCode: string;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

export default function MaterialPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    domain: '',
    status: 'active',
    keywords: '',
    page: ''
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [editForm, setEditForm] = useState({
    domain: '',
    status: 'active',
    keywords: '',
    page: ''
  });

  useEffect(() => {
    fetchLinks();
  }, [page]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      const response = await fetch(
        `http://localhost:5001/api/affiliate/links?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setLinks(data.data.links);
        setTotal(data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching links:', err);
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLinks();
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (!createForm.domain || !createForm.page) {
        setError('Please fill all required fields');
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/affiliate/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Affiliate link created successfully!');
        setShowCreateModal(false);
        setCreateForm({
          domain: '',
          status: 'active',
          keywords: '',
          page: ''
        });
        fetchLinks();
      } else {
        setError(data.message || 'Failed to create link');
      }
    } catch (err) {
      setError('Error creating link. Please try again.');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLink = (link: AffiliateLink) => {
    setEditingLink(link);
    setEditForm({
      domain: link.domain,
      status: link.status,
      keywords: link.keywords,
      page: link.page
    });
    setShowEditModal(true);
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/affiliate/links/${editingLink._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Affiliate link updated successfully!');
        setShowEditModal(false);
        setEditingLink(null);
        fetchLinks();
      } else {
        setError(data.message || 'Failed to update link');
      }
    } catch (err) {
      setError('Error updating link. Please try again.');
      console.error('Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/affiliate/links/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Affiliate link deleted successfully!');
        fetchLinks();
      } else {
        setError(data.message || 'Failed to delete link');
      }
    } catch (err) {
      setError('Error deleting link. Please try again.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Links</h1>

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
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Domain</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Keywords</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Page</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : links.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  links.map((link, index) => (
                    <tr key={link._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {link.domain}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            link.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : link.status === 'inactive'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {link.keywords || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {link.page}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleEditLink(link)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
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
            <div className="text-sm text-gray-600">
              Showing {links.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <button
                className="px-3 py-1 bg-gray-700 text-white rounded"
              >
                {page}
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= total}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Create and Search Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Create
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create Affiliate Link
            </h2>

            <form onSubmit={handleCreateLink}>
              {/* Domain */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  value={createForm.domain}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example.com"
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

              {/* Keywords */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={createForm.keywords}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="join, signup, register"
                />
              </div>

              {/* Page */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page *
                </label>
                <select
                  value={createForm.page}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, page: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Page</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Login">Login</option>
                  <option value="Home">Home</option>
                  <option value="Sports">Sports</option>
                  <option value="Casino">Casino</option>
                  <option value="Promotions">Promotions</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({
                      domain: '',
                      status: 'active',
                      keywords: '',
                      page: ''
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

      {/* Edit Modal */}
      {showEditModal && editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Affiliate Link
            </h2>

            <form onSubmit={handleUpdateLink}>
              {/* Domain */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  value={editForm.domain}
                  onChange={(e) => setEditForm(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example.com"
                  required
                />
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  value={editForm.keywords}
                  onChange={(e) => setEditForm(prev => ({ ...prev, keywords: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="join, signup, register"
                />
              </div>

              {/* Page */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page *
                </label>
                <select
                  value={editForm.page}
                  onChange={(e) => setEditForm(prev => ({ ...prev, page: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Page</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Login">Login</option>
                  <option value="Home">Home</option>
                  <option value="Sports">Sports</option>
                  <option value="Casino">Casino</option>
                  <option value="Promotions">Promotions</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLink(null);
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
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
