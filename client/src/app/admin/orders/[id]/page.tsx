'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from '@/store/services/ordersApi';
import { ArrowLeft, User, MapPin, Package, Award } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderByIdQuery(id as string);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  if (isLoading) return <div className="p-8 text-center font-['Rubik']">Loading order details...</div>;

  if (!order) {
    return (
      <div className="p-8 text-center font-['Rubik']">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <Link href="/admin/orders" className="text-xs text-blue-600 underline mt-2 block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    await updateOrderStatus({ id: order._id, status: newStatus });
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 bg-white rounded-xl border hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h1>
            <p className="text-xs text-gray-400 font-['Open_Sans']">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
        >
          <option value="Pending">Status: Pending</option>
          <option value="Processing">Status: Processing</option>
          <option value="Shipped">Status: Shipped</option>
          <option value="Delivered">Status: Delivered</option>
          <option value="Canceled">Status: Canceled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b pb-2">
            <User className="w-4 h-4 text-blue-600" /> Customer Information
          </h3>
          <div className="text-xs flex flex-col gap-1 text-gray-600">
            <p>Name: <strong className="text-black">{order.user?.name || 'Customer'}</strong></p>
            <p>Email: <strong className="text-black">{order.user?.email}</strong></p>
            <p className="flex items-center gap-1 text-amber-600 font-bold mt-1">
              <Award className="w-3.5 h-3.5" /> Customer Points: {order.user?.loyaltyPoints || 0} PTS
            </p>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b pb-2">
            <MapPin className="w-4 h-4 text-red-500" /> Shipping Destination
          </h3>
          <div className="text-xs flex flex-col gap-1 text-gray-600">
            <p>{order.shippingAddress?.street || '123 Main St'}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
            <p>{order.shippingAddress?.country || 'USA'}</p>
          </div>
        </div>
      </div>

      {/* Itemized Order List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3">
          <Package className="w-5 h-5 text-gray-700" /> Order Items ({order.items?.length || 0})
        </h3>

        <div className="flex flex-col gap-3 divide-y">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                <span className="text-gray-400">Qty: {item.quantity}</span>
              </div>
              <div className="text-right">
                {item.paymentMethod === 'points' ? (
                  <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                    {item.pointsPrice * item.quantity} Points
                  </span>
                ) : (
                  <span className="font-extrabold text-black text-sm">${item.price * item.quantity}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex flex-col items-end gap-1 text-xs font-['Open_Sans']">
          <div className="flex justify-between w-48 text-gray-500">
            <span>Currency Total:</span>
            <span className="font-bold text-black">${order.totalAmount}</span>
          </div>
          <div className="flex justify-between w-48 text-amber-600 font-bold">
            <span>Points Earned:</span>
            <span>+{order.pointsEarned} PTS</span>
          </div>
          <div className="flex justify-between w-48 text-purple-600 font-bold">
            <span>Points Spent:</span>
            <span>-{order.pointsUsed} PTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
