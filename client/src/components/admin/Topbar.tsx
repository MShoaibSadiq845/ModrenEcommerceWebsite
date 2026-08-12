'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/store/services/notificationsApi';
import { Bell, LogOut, X, Search } from 'lucide-react';
import Image from 'next/image';

export function AdminTopbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    pollingInterval: 15000,
  });
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <header className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between font-['Rubik'] sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Real-time Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl relative transition-all"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 text-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <h3 className="font-bold text-sm text-gray-900">Admin Alerts & Socket.IO Events</h3>
                <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-black">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No admin notifications</p>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200 font-semibold'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900">{n.title}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
          <div className="w-9 h-9 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-semibold text-xs text-gray-900">{user?.name || 'Admin User'}</span>
            <span className="text-[10px] text-gray-400 font-['Open_Sans']">{user?.role || 'Super Admin'}</span>
          </div>
          <button
            onClick={() => {
              dispatch(logout());
              router.push('/login');
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-2"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
