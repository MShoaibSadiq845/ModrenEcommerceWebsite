'use client';

import React, { useState } from 'react';
import { Mail, Trash2, Search, Users, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetSubscribersQuery,
  useGetSubscriberCountQuery,
  useDeleteSubscriberMutation,
  type NewsletterSubscriber,
} from '@/store/services/newsletterApi';

export default function AdminNewsletterPage() {
  const [search, setSearch] = useState('');

  const { data: subscribers = [], isLoading, refetch } = useGetSubscribersQuery();
  const { data: countData } = useGetSubscriberCountQuery();
  const [deleteSubscriber] = useDeleteSubscriberMutation();

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from newsletter?`)) return;
    try {
      await deleteSubscriber(id).unwrap();
      toast.success(`${email} removed.`);
    } catch {
      toast.error('Failed to remove subscriber.');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Emails collected from the newsletter subscription form</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Subscribers</p>
            <p className="text-3xl font-bold text-gray-900">{countData?.count ?? subscribers.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-600">{subscribers.filter(s => s.active).length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-2 text-center">
            <Mail className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">No subscribers yet</p>
            <p className="text-xs text-gray-400">Emails submitted via the newsletter form will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((sub: NewsletterSubscriber, idx) => (
                <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {sub.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      sub.active
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {new Date(sub.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(sub._id, sub.email)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove subscriber"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
