'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { Eye, Clock, CheckCircle2, Truck, XCircle, Award, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  Processing: 'bg-purple-50 text-purple-700 border-purple-200',
  Shipped:    'bg-blue-50 text-blue-700 border-blue-200',
  Delivered:  'bg-green-50 text-green-700 border-green-200',
  Canceled:   'bg-red-50 text-red-700 border-red-200',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending:    <Clock className="w-3 h-3" />,
  Processing: <Clock className="w-3 h-3" />,
  Shipped:    <Truck className="w-3 h-3" />,
  Delivered:  <CheckCircle2 className="w-3 h-3" />,
  Canceled:   <XCircle className="w-3 h-3" />,
};

function UserAvatar({ user }: { user: any }) {
  if (!user) return (
    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm shrink-0">?</div>
  );

  if (user.avatar) {
    return (
      <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-gray-200">
        <Image src={user.avatar} alt={user.name || ''} fill className="object-cover" />
      </div>
    );
  }

  const initial = (user.name || user.email || '?').charAt(0).toUpperCase();
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-indigo-500'];
  const colorIdx = (user.name || '').charCodeAt(0) % colors.length;

  return (
    <div className={`w-9 h-9 rounded-xl ${colors[colorIdx]} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
      {initial}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const { data: orders = [], isLoading } = useGetAllOrdersQuery(selectedStatus || undefined);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus({ id, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const statusCounts = (orders as any[]).reduce((acc: Record<string, number>, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <PageLoader message="Loading orders..." />;

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">View customer orders, avatars and update statuses in real-time</p>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-black w-fit"
        >
          <option value="">All Statuses</option>
          {['Pending','Processing','Shipped','Delivered','Canceled'].map(s => (
            <option key={s} value={s}>{s} {statusCounts[s] ? `(${statusCounts[s]})` : ''}</option>
          ))}
        </select>
      </div>

      {/* Quick stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['Pending','Processing','Shipped','Delivered','Canceled'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(selectedStatus === s ? '' : s)}
              className={`flex flex-col gap-1 p-3 rounded-2xl border text-left transition-all ${
                selectedStatus === s
                  ? 'border-black bg-black text-white'
                  : `${STATUS_STYLES[s] || 'bg-gray-50 border-gray-100'} hover:scale-[1.02]`
              }`}
            >
              <span className="text-xs font-semibold opacity-70">{s}</span>
              <span className="text-xl font-extrabold">{statusCounts[s] || 0}</span>
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (orders as any[]).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Package className="w-10 h-10 text-gray-200" />
          <p className="text-gray-400 text-sm font-semibold">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Points</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
              {(orders as any[]).map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-4 font-bold text-black font-mono">
                    #{order._id.slice(-6)}
                  </td>

                  {/* Customer with avatar */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={order.user} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 truncate max-w-[100px]">
                          {order.user?.name || 'Guest'}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                          {order.user?.email || '—'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 font-extrabold text-black">${order.totalAmount}</td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
                      <Award className="w-3 h-3" />
                      +{order.pointsEarned || 0} / -{order.pointsUsed || 0}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`border rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-black transition-all ${
                        STATUS_STYLES[order.status] || 'bg-gray-100'
                      }`}
                    >
                      {['Pending','Processing','Shipped','Delivered','Canceled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
