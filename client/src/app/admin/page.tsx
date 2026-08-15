'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetAdminMetricsQuery } from '@/store/services/ordersApi';
import { DashboardWidgetSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { ShoppingCart, PackageCheck, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading } = useGetAdminMetricsQuery(undefined, {
    pollingInterval: 10000,
    refetchOnMountOrArgChange: true,
  });

  const [mounted, setMounted] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<string>('All');
  const [selectedMonth, setSelectedMonth] = React.useState<string>('All');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) return <PageLoader message="Loading dashboard..." />;

  const {
    totalOrders = 0,
    activeOrders = 0,
    completedOrders = 0,
    totalRevenue = 0,
    salesGraphData = [],
    bestSellers = [],
    recentOrders = [],
  } = metrics || {};

  // Extract unique years from real aggregated sales data
  const availableYears = Array.from(
    new Set<number>(salesGraphData.map((d: any) => d.year).filter(Boolean))
  ).sort((a: number, b: number) => b - a);

  // Filter sales data by selected year and month
  const filteredSalesData = salesGraphData.filter((item: any) => {
    const yearMatch = selectedYear === 'All' || String(item.year) === selectedYear;
    const monthMatch = selectedMonth === 'All' || item.month === selectedMonth;
    return yearMatch && monthMatch;
  });

  return (
    <div className="flex flex-col gap-8 font-['Rubik']">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">Home &gt; Dashboard Overview</p>
        </div>
        <div className="text-xs bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-600 font-semibold w-fit">
          📅 Real-time Data Aggregation Active
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
            <span>Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{totalOrders}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              All Time
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
            <span>Active Orders</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{activeOrders}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              Pending
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
            <span>Completed Orders</span>
            <PackageCheck className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">{completedOrders}</span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
              Delivered
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center text-gray-500 text-xs font-semibold">
            <span>Total Revenue</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Gross
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Sales Chart + Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Analytics Chart Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">Sales Analytics</h3>
              <p className="text-xs text-gray-400 font-['Open_Sans']">Monthly revenue distribution in real-time</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Year Dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black"
              >
                <option value="All">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>{yr}</option>
                ))}
                {!availableYears.includes(2026) && (
                  <option value="2026">2026</option>
                )}
              </select>

              {/* Month Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-black"
              >
                <option value="All">All Months</option>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 min-h-64 flex items-center justify-center">
            {mounted ? (
              filteredSalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={filteredSalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-xl flex flex-col gap-1.5 font-['Rubik']">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {payload[0].payload.month} {payload[0].payload.year || ''}
                              </span>
                              <span className="text-sm font-extrabold text-black">
                                Income: ${Number(payload[0].value).toLocaleString()}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#000000"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 text-xs font-semibold bg-gray-50 rounded-2xl border border-dashed border-gray-200 gap-2">
                  <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  No income data for the selected filters.
                </div>
              )
            ) : (
              <div className="w-full h-64 bg-gray-50 animate-pulse rounded-2xl" />
            )}
          </div>
        </div>

        {/* Best Sellers Widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-base text-gray-900">Best Sellers</h3>
            <Link href="/admin/products" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {bestSellers.slice(0, 4).map((product: any) => (
              <div key={product._id} className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={product.images?.[0] || '/images/7.png'}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-gray-900 line-clamp-1">{product.name}</span>
                    <span className="text-[10px] text-gray-400">${product.price}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-black bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                  {product.totalSales || 0} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Customer Orders Table */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="font-bold text-base text-gray-900">Recent Customer Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            Manage Orders <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {recentOrders.map((order: any) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-all">
                  <td className="py-3.5 font-bold text-black">#{order._id.slice(-6)}</td>
                  <td className="py-3.5">{order.user?.name || 'Customer'}</td>
                  <td className="py-3.5">{order.items?.length || 1} Products</td>
                  <td className="py-3.5 font-bold text-black">${order.totalAmount}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
