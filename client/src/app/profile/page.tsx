'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetMyOrdersQuery } from '@/store/services/ordersApi';
import {
  Award,
  Package,
  User as UserIcon,
  Mail,
  Shield,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; style: string }> = {
    Delivered: { icon: <CheckCircle2 className="w-3 h-3" />, style: 'bg-green-50 text-green-700 border-green-200' },
    Shipped: { icon: <Truck className="w-3 h-3" />, style: 'bg-blue-50 text-blue-700 border-blue-200' },
    Canceled: { icon: <XCircle className="w-3 h-3" />, style: 'bg-red-50 text-red-700 border-red-200' },
    Pending: { icon: <Clock className="w-3 h-3" />, style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    Processing: { icon: <Clock className="w-3 h-3" />, style: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  const config = map[status] || map['Pending'];
  return (
    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${config.style}`}>
      {config.icon} {status}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: orders = [], isLoading } = useGetMyOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <StorefrontHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900">Sign in Required</h2>
            <p className="text-sm text-gray-500 mt-1">Please sign in to view your profile.</p>
            <Link href="/login" className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-bold">
              Sign In
            </Link>
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  // Stats from orders
  const totalOrders = orders.length;
  const totalSpent = (orders as any[]).reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const totalPointsEarned = (orders as any[]).reduce((sum: number, o: any) => sum + (o.pointsEarned || 0), 0);
  const totalPointsUsed = (orders as any[]).reduce((sum: number, o: any) => sum + (o.pointsUsed || 0), 0);
  const recentOrders = (orders as any[]).slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8] font-['Satoshi']">
      <StorefrontHeader />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col gap-8">

        {/* Profile Hero Card */}
        <div className="w-full bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm opacity-70">{user.email}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Shield className="w-3.5 h-3.5 opacity-60" />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    user.role === 'Super Admin'
                      ? 'bg-purple-500/30 text-purple-200'
                      : user.role === 'Admin'
                      ? 'bg-blue-500/30 text-blue-200'
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="bg-amber-500/20 border border-amber-500/30 backdrop-blur-md px-6 py-5 rounded-2xl flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Loyalty Points</span>
              </div>
              <span className="text-4xl font-extrabold text-white">
                {user.loyaltyPoints?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-amber-300/70 mt-0.5">available to redeem</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: totalOrders, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
            { label: 'Total Spent', value: `$${totalSpent.toFixed(0)}`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: 'text-green-600' },
            { label: 'Points Earned', value: `+${totalPointsEarned}`, icon: <Award className="w-5 h-5 text-amber-500" />, color: 'text-amber-600' },
            { label: 'Points Used', value: `-${totalPointsUsed}`, icon: <Award className="w-5 h-5 text-purple-500" />, color: 'text-purple-600' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-semibold">{label}</span>
                {icon}
              </div>
              <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Loyalty Points Info */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">How Loyalty Points Work</h3>
              <ul className="mt-2 text-sm text-gray-600 flex flex-col gap-1.5 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✦</span>
                  Earn <strong>1 point for every $10</strong> you spend on currency orders.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✦</span>
                  Use points to buy <strong>Loyalty-Only</strong> and <strong>Hybrid</strong> products.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✦</span>
                  New accounts receive <strong>100 welcome bonus points</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">✦</span>
                  Points never expire — they accumulate with every purchase.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" /> Recent Orders
            </h2>
            <Link href="/orders" className="text-xs font-bold text-black underline">
              View All Orders
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">No orders yet</p>
              <Link href="/shop" className="mt-3 inline-block px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order: any) => (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-black">Order #{order._id.slice(-8)}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-extrabold text-black text-sm">${order.totalAmount}</span>
                      {order.pointsEarned > 0 && (
                        <div className="text-[10px] text-amber-600 font-bold">+{order.pointsEarned} pts earned</div>
                      )}
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/shop" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-black transition-all flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white text-gray-600 flex items-center justify-center transition-all">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Browse Products</p>
              <p className="text-xs text-gray-400">Explore new arrivals & sales</p>
            </div>
          </Link>
          <Link href="/orders" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-black transition-all flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white text-gray-600 flex items-center justify-center transition-all">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Order History</p>
              <p className="text-xs text-gray-400">Track all past orders</p>
            </div>
          </Link>
          <Link href="/shop?purchaseType=loyalty_only" className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-400 transition-all flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-white text-amber-600 flex items-center justify-center transition-all">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">Loyalty Shop</p>
              <p className="text-xs text-gray-400">Redeem your points</p>
            </div>
          </Link>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
