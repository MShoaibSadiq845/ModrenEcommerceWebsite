'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetMyOrdersQuery } from '@/store/services/ordersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { Award, Package, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserOrdersPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-20 text-center font-['Satoshi']">
        <h2 className="text-2xl font-bold text-gray-900">Sign in Required</h2>
        <p className="text-xs text-gray-500 mt-2">Please sign in to view your order history and loyalty points.</p>
        <Link href="/login" className="mt-4 inline-block px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader message="Loading your orders..." />;

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 py-8 flex flex-col gap-8 font-['Satoshi']">
      {/* Loyalty Points Profile Card */}
      <div className="w-full bg-gradient-to-r from-black via-gray-900 to-amber-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-['Integral_CF']">{user?.name}</h2>
            <p className="text-xs opacity-75">{user?.email} • {user?.role}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl flex flex-col items-end border border-white/10">
          <span className="text-xs text-amber-300 uppercase tracking-wider font-bold">Accumulated Loyalty Points</span>
          <span className="text-3xl font-extrabold text-white mt-1">
            {user?.loyaltyPoints || 0} PTS
          </span>
        </div>
      </div>

      {/* Orders Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold font-['Integral_CF'] text-black flex items-center gap-2">
          <Package className="w-6 h-6" /> Order History
        </h2>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : orders.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-3 text-center">
            <p className="font-bold text-gray-700">No past orders yet</p>
            <p className="text-xs text-gray-400">Items you purchase will appear here along with live order statuses.</p>
            <Link href="/shop" className="mt-2 px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order: any) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400">Order ID</span>
                    <span className="font-bold text-sm text-black">#{order._id.slice(-8)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400">Date</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400">Total Amount</span>
                    <span className="font-extrabold text-sm text-black">${order.totalAmount}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="flex flex-col gap-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-800">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-gray-500">
                        {item.paymentMethod === 'points'
                          ? `${item.pointsPrice * item.quantity} pts`
                          : `$${item.price * item.quantity}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  let icon = <Clock className="w-3.5 h-3.5" />;
  let style = 'bg-yellow-50 text-yellow-700 border-yellow-200';

  if (status === 'Delivered') {
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    style = 'bg-green-50 text-green-700 border-green-200';
  } else if (status === 'Shipped') {
    icon = <Truck className="w-3.5 h-3.5" />;
    style = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (status === 'Canceled') {
    icon = <XCircle className="w-3.5 h-3.5" />;
    style = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${style}`}>
      {icon}
      <span>{status}</span>
    </div>
  );
}
