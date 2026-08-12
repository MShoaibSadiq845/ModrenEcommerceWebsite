'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { Eye, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { data: orders = [], isLoading } = useGetAllOrdersQuery(selectedStatus || undefined);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateOrderStatus({ id, status: newStatus });
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">View customer orders and update shipping statuses in real-time</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Filter:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 text-xs font-semibold">
          No orders found matching the criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Points Earned/Used</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {orders.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-all">
                  <td className="py-4 font-bold text-black">#{order._id.slice(-6)}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{order.user?.name || 'Shopper'}</span>
                      <span className="text-[10px] text-gray-400">{order.user?.email}</span>
                    </div>
                  </td>
                  <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 font-extrabold text-black">${order.totalAmount}</td>
                  <td className="py-4 text-amber-600 font-bold">
                    +{order.pointsEarned || 0} / -{order.pointsUsed || 0} pts
                  </td>
                  <td className="py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="bg-gray-100 border border-transparent rounded-xl px-2.5 py-1 text-xs font-bold outline-none focus:border-black"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 inline-flex items-center gap-1 text-xs font-bold"
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
