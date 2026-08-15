'use client';

import React, { useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/store/services/notificationsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { Bell, CheckCheck, Flame, ShoppingCart, Info, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  // Track which notification is being individually marked as read
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    setMarkingReadId(id);
    try {
      await markAsRead(id).unwrap();
    } catch {
      toast.error('Failed to mark notification as read');
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(undefined).unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (isLoading) return <PageLoader message="Loading notifications..." />;

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System & Sales Notifications</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            Real-time Socket.IO sales alerts and customer order dispatches
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={isMarkingAll || notifications.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMarkingAll ? (
            <><Loader2 className="w-4 h-4 animate-spin text-green-600" /> Marking all...</>
          ) : (
            <><CheckCheck className="w-4 h-4 text-green-600" /> Mark All as Read</>
          )}
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
          {(notifications as any[]).map((n: any) => {
            let icon = <Info className="w-5 h-5 text-blue-500" />;
            if (n.type === 'sale') icon = <Flame className="w-5 h-5 text-red-500" />;
            if (n.type === 'order') icon = <ShoppingCart className="w-5 h-5 text-green-600" />;

            const isMarkingThis = markingReadId === n._id;

            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && !isMarkingThis && handleMarkRead(n._id)}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-blue-50/50 border-blue-200 shadow-sm font-semibold cursor-pointer hover:bg-blue-50'
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

                <div className="shrink-0 mt-2">
                  {isMarkingThis ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : !n.isRead ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
