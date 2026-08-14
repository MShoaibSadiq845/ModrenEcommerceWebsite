'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetMyOrdersQuery } from '@/store/services/ordersApi';
import { PageLoader } from '@/components/ui/PageLoader';
import { Award, Package, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/* ─── Order status step config ─── */
const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'] as const;
type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';

function getStepIndex(status: OrderStatus): number {
  if (status === 'Canceled') return -1;
  return STEPS.indexOf(status as any);
}

/* ─── Progress Bar component ─── */
function OrderProgressBar({ status }: { status: OrderStatus }) {
  const isCanceled = status === 'Canceled';
  const activeIdx = getStepIndex(status);

  if (isCanceled) {
    return (
      <div className="flex items-center gap-2 mt-4 px-1">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl w-full">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-600">Order Canceled</p>
            <p className="text-[10px] text-red-400">This order has been canceled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 px-1">
      {/* Step dots + connecting line */}
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 rounded-full -z-0" />
        {/* Active fill line */}
        <div
          className="absolute left-0 top-4 h-1 bg-black rounded-full -z-0 transition-all duration-700"
          style={{ width: activeIdx >= 0 ? `${(activeIdx / (STEPS.length - 1)) * 100}%` : '0%' }}
        />

        {STEPS.map((step, i) => {
          const done = i <= activeIdx;
          const current = i === activeIdx;
          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              {/* Dot */}
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  done
                    ? 'bg-black border-black'
                    : 'bg-white border-gray-300'
                } ${current ? 'ring-4 ring-black/10 scale-110' : ''}`}
              >
                {done && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!done && (
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              {/* Label */}
              <span className={`text-[10px] font-bold whitespace-nowrap ${done ? 'text-black' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Status badge (compact, for header row) ─── */
function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    Processing: 'bg-blue-50   text-blue-700   border-blue-200',
    Shipped:    'bg-indigo-50 text-indigo-700  border-indigo-200',
    Delivered:  'bg-green-50  text-green-700   border-green-200',
    Canceled:   'bg-red-50    text-red-700     border-red-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function UserOrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined);

  if (isLoading) return <PageLoader message="Loading your orders..." />;

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[1240px] mx-auto px-4 py-8 flex flex-col gap-8 font-['Satoshi']">

        {/* ── Loyalty / Profile card ── */}
        <div className="w-full bg-gradient-to-r from-black via-gray-900 to-amber-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-xs opacity-75">{user?.email} · {user?.role}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl flex flex-col items-end border border-white/10">
            <span className="text-xs text-amber-300 uppercase tracking-wider font-bold">Loyalty Points</span>
            <span className="text-3xl font-extrabold text-white mt-1">{user?.loyaltyPoints || 0} PTS</span>
          </div>
        </div>

        {/* ── Orders ── */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <Package className="w-6 h-6" /> Order History
          </h2>

          {orders.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-3 text-center">
              <p className="font-bold text-gray-700">No past orders yet</p>
              <p className="text-xs text-gray-400">Items you purchase will appear here with live progress tracking.</p>
              <Link href="/shop" className="mt-2 px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {orders.map((order: any) => (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">

                  {/* ── Header row ── */}
                  <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                      <span className="font-bold text-sm text-black font-mono">#{order._id.slice(-8)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                      <span className="font-extrabold text-sm text-black">Rs. {order.totalAmount}</span>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* ── Progress bar ── */}
                  <OrderProgressBar status={order.status} />

                  {/* ── Items ── */}
                  <div className="flex flex-col gap-2 mt-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                        <span className="font-semibold text-gray-800">
                          {item.quantity}× {item.name}
                          {item.size ? <span className="text-gray-400 font-normal"> · {item.size}</span> : null}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {item.paymentMethod === 'points'
                            ? `${item.pointsPrice * item.quantity} pts`
                            : `Rs. ${item.price * item.quantity}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ── Delivery info if shipped/delivered ── */}
                  {(order.status === 'Shipped' || order.status === 'Delivered') && (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      {order.status === 'Delivered'
                        ? 'Your order has been delivered!'
                        : 'Your order is on its way — estimated 3–5 business days'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
