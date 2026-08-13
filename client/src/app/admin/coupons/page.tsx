'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useGetAllCouponsQuery,
  useCreateCouponMutation,
  useToggleCouponMutation,
  useDeleteCouponMutation,
} from '@/store/services/couponsApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { Tag, PlusCircle, Trash2, ToggleLeft, ToggleRight, CheckCircle, XCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

type CouponFormInputs = {
  code: string;
  discountPercentage: number;
};

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useGetAllCouponsQuery(undefined);
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [toggleCoupon] = useToggleCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormInputs>({
    defaultValues: { code: '', discountPercentage: 10 },
  });

  const onSubmit = async (data: CouponFormInputs) => {
    try {
      await createCoupon({
        code: data.code.toUpperCase().trim(),
        discountPercentage: Number(data.discountPercentage),
        isActive: true,
      }).unwrap();
      toast.success(`Coupon "${data.code.toUpperCase()}" created!`);
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create coupon');
    }
  };

  const handleToggle = async (id: string, code: string, isActive: boolean) => {
    try {
      await toggleCoupon(id).unwrap();
      toast.success(`Coupon "${code}" ${isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to toggle coupon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id).unwrap();
      toast.success('Coupon deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  if (isLoading) return <PageLoader message="Loading coupons..." />;

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            Create and manage promo codes for customer discounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all w-fit shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold">Total Coupons</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {(coupons as any[]).filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-semibold">Inactive</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            {(coupons as any[]).filter((c) => !c.isActive).length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Tag className="w-10 h-10 text-gray-200" />
          <p className="text-gray-400 text-sm font-semibold">No coupons created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 px-6 py-2.5 bg-black text-white rounded-full text-xs font-bold"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-['Open_Sans']">
            <thead>
              <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Coupon Code</th>
                <th className="pb-3 text-center">Discount</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3">Created</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {(coupons as any[]).map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50 transition-all">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-black font-mono text-sm">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                      {coupon.discountPercentage}% OFF
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        coupon.isActive
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {coupon.isActive ? (
                        <><CheckCircle className="w-3 h-3" /> Active</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Inactive</>
                      )}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">
                    {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(coupon._id, coupon.code, coupon.isActive)}
                        className={`p-1.5 rounded-lg transition-all ${
                          coupon.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-600'
                        }`}
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(coupon._id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-black" /> Create New Coupon
              </h3>
              <button
                onClick={() => { setShowForm(false); reset(); }}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Coupon Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SAVE30"
                  {...register('code', {
                    required: 'Coupon code is required',
                    minLength: { value: 3, message: 'Code must be at least 3 characters' },
                  })}
                  className={`border rounded-xl p-3 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-black uppercase ${
                    errors.code ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.code && (
                  <span className="text-[10px] text-red-500 font-semibold">{errors.code.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g. 20"
                    {...register('discountPercentage', {
                      required: 'Discount percentage is required',
                      min: { value: 1, message: 'Minimum is 1%' },
                      max: { value: 100, message: 'Maximum is 100%' },
                    })}
                    className={`border rounded-xl p-3 pr-8 text-sm font-bold outline-none focus:ring-2 focus:ring-black w-full ${
                      errors.discountPercentage ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">%</span>
                </div>
                {errors.discountPercentage && (
                  <span className="text-[10px] text-red-500 font-semibold">
                    {errors.discountPercentage.message}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                The coupon will be active immediately after creation and customers can apply it at checkout.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); reset(); }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Delete Coupon</h3>
              <p className="text-xs text-gray-500 mt-1">
                This coupon will be permanently deleted and can no longer be used by customers.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
