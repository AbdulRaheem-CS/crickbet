"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

type PendingAffiliate = {
  _id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export default function AdminAffiliatePending() {
  const [pending, setPending] = useState<PendingAffiliate[]>([]);
  const [error, setError] = useState<string>('');

  const fetchPending = async () => {
    try {
      const res = await axios.get('/api/admin/affiliates/pending');
      setPending((res.data?.data as PendingAffiliate[]) || []);
    } catch (err) {
      setError('Failed to load pending affiliates');
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (userId: string) => {
    try {
      await axios.put(`/api/affiliate/approve/${userId}`);
      setPending((p) => p.filter((x) => x._id !== userId));
    } catch (err) {
      setError('Failed to approve');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Pending Affiliates</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-3">
        {pending.map((a) => (
          <li key={a._id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{a.username || a.email}</div>
              <div className="text-sm text-gray-600">{a.firstName} {a.lastName}</div>
            </div>
            <div>
              <button onClick={() => approve(a._id)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
