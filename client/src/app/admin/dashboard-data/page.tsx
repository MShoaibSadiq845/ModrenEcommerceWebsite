'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare, Mail, Users, RefreshCw, TrendingUp,
  AlertCircle, CheckCircle2, Clock, ExternalLink,
} from 'lucide-react';
import {
  useGetContactMessagesQuery,
  useGetContactUnreadCountQuery,
} from '@/store/services/contactApi';
import {
  useGetSubscribersQuery,
  useGetSubscriberCountQuery,
} from '@/store/services/newsletterApi';

export default function AdminDataDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: contactMessages = [], isLoading: contactLoading } = useGetContactMessagesQuery();
  const { data: contactUnreadData } = useGetContactUnreadCountQuery();
  const { data: subscribers = [], isLoading: newsletterLoading } = useGetSubscribersQuery();
  const { data: subscriberCountData } = useGetSubscriberCountQuery();

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload(); // Force fresh API calls
  };

  const recentContacts = contactMessages.slice(0, 5);
  const recentSubscribers = subscribers.slice(0, 5);
  const unreadCount = contactUnreadData?.count || 0;
  const totalSubscribers = subscriberCountData?.count || subscribers.length;

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> Data Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contact messages and newsletter subscriptions overview
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{contactMessages.length}</p>
            </div>
          </div>
          <Link
            href="/admin/queries"
            className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Unread Messages</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
          </div>
          <Link
            href="/admin/queries?filter=unread"
            className="flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:text-red-800 transition-colors"
          >
            View unread <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Newsletter Subs</p>
              <p className="text-2xl font-bold text-green-600">{totalSubscribers}</p>
            </div>
          </div>
          <Link
            href="/admin/newsletter"
            className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:text-green-800 transition-colors"
          >
            Manage list <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">{contactMessages.length + totalSubscribers}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Combined engagement</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Contact Messages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-sm text-gray-900">Recent Queries</h3>
            </div>
            <Link
              href="/admin/queries"
              className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="p-5">
            {contactLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                Loading messages...
              </div>
            ) : recentContacts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Clock className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-bold text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400">Contact form submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContacts.map((msg: any) => (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-xl border transition-all hover:shadow-sm ${
                      msg.status === 'unread'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-gray-900 truncate">{msg.name}</p>
                      <div className="flex items-center gap-2">
                        {msg.status === 'unread' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                        {msg.status === 'replied' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 truncate mb-1">{msg.subject}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Newsletter Subscriptions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-sm text-gray-900">Recent Subscriptions</h3>
            </div>
            <Link
              href="/admin/newsletter"
              className="text-xs text-green-600 font-semibold hover:text-green-800 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="p-5">
            {newsletterLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                Loading subscribers...
              </div>
            ) : recentSubscribers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Mail className="w-8 h-8 text-gray-300" />
                <p className="text-sm font-bold text-gray-500">No subscribers yet</p>
                <p className="text-xs text-gray-400">Newsletter signups will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubscribers.map((sub: any) => (
                  <div
                    key={sub._id}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm text-gray-900 truncate">{sub.email}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        sub.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Subscribed {new Date(sub.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> System Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">Contact API: Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              newsletterLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-xs text-gray-600">
              Newsletter API: {newsletterLoading ? 'Loading...' : 'Connected'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">Database: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}