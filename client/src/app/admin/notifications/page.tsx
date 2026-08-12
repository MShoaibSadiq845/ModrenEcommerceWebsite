'use client';

import React from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/store/services/notificationsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Bell, CheckCheck, Flame, ShoppingCart, Info } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System & Sales Notifications</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">Real-time Socket.IO sales alerts and customer order dispatches</p>
        </div>

        <button
          onClick={() => markAllAsRead(undefined)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
        >
          <CheckCheck className="w-4 h-4 text-green-600" /> Mark All as Read
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-xs font-semibold">
          No notifications dispatched yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n: any) => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            if (n.type === 'sale') icon = <Flame className="w-5 h-5 text-red-500" />;
            if (n.type === 'order') icon = <ShoppingCart className="w-5 h-5 text-green-600" />;

            return (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50/50 border-blue-200 shadow-sm font-semibold'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 shrink-0">
                    {icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm text-gray-900">{n.title}</h3>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <span className="text-[10px] text-gray-400 font-['Open_Sans'] mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
