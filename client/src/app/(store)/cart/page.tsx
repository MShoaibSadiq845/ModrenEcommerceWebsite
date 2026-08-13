'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import {
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  removePromoCode,
  clearCart,
} from '@/store/slices/cartSlice';
import {
  Trash2, Tag, ArrowRight, Award,
  CheckCircle, Minus, Plus, ChevronRight,
  Loader2, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { items, promoCode, discountPercentage } = useSelector((s: RootState) => s.cart);

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  /* ── Totals ── */
  const currencySubtotal = items.reduce((acc, item) => {
    if (item.paymentMethod !== 'currency') return acc;
    return acc + (item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity;
  }, 0);

  const totalPointsRequired = items.reduce((acc, item) =>
    item.paymentMethod === 'points' ? acc + (item.pointsPrice || 0) * item.quantity : acc, 0);

  const discountAmount = Math.round((currencySubtotal * discountPercentage) / 100);
  const deliveryFee = currencySubtotal > 0 ? 15 : 0;
  const grandTotal = Math.max(0, currencySubtotal - discountAmount + deliveryFee);

  /* ── Validate coupon against DB ── */
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setPromoError('');
    setPromoLoading(true);

    try {
      const res = await fetch(`${API}/coupons/validate/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setPromoError(data.message || 'Invalid or expired coupon code.');
        toast.error(data.message || 'Invalid or expired coupon code.');
        return;
      }

      // Valid — save to Redux store (discount % comes from DB)
      dispatch(applyPromoCode({
        code: data.code,
        discountPercentage: data.discountPercentage,
      }));
      setPromoInput('');
      toast.success(`🎉 Coupon "${data.code}" applied — ${data.discountPercentage}% OFF!`);
    } catch {
      const msg = 'Failed to validate coupon. Please try again.';
      setPromoError(msg);
      toast.error(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    dispatch(removePromoCode());
    setPromoInput('');
    setPromoError('');
    toast('Coupon removed', { icon: '🗑️' });
  };

  const handleGoToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in first.');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="w-full font-['Satoshi']">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8 flex flex-col gap-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-medium">Cart</span>
        </nav>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-black"
          style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>
          YOUR CART
        </h1>

        {items.length === 0 ? (
          <div className="w-full py-24 flex flex-col items-center gap-5 bg-[#f2f0f1] rounded-[30px] text-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.4 6M7 13l2.4 6m0 0h8m-8 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <p className="text-xl font-bold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-400">Browse our store and add items you love.</p>
            <Link href="/shop"
              className="mt-2 px-10 py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

            {/* ── Cart Items ── */}
            <div className="border border-gray-200 rounded-[24px] p-4 sm:p-6 flex flex-col divide-y divide-gray-100">
              {items.map((item, idx) => {
                const itemPrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                return (
                  <div key={item.id + idx} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 sm:w-[100px] sm:h-[100px] bg-[#f2f0f1] rounded-xl overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1">{item.name}</h3>
                        <button onClick={() => dispatch(removeFromCart(idx))}
                          className="text-red-400 hover:text-red-600 transition-colors shrink-0 p-1">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      {item.size && (
                        <p className="text-xs text-gray-500">Size: <span className="font-semibold text-black">{item.size}</span></p>
                      )}
                      {item.color && (
                        <p className="text-xs text-gray-500">Color: <span className="font-semibold text-black">{item.color}</span></p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        {item.paymentMethod === 'points' ? (
                          <span className="font-bold text-base sm:text-lg text-amber-600 flex items-center gap-1">
                            <Award className="w-4 h-4" />{(item.pointsPrice || 0) * item.quantity} pts
                          </span>
                        ) : (
                          <span className="font-bold text-lg sm:text-xl text-black">${itemPrice * item.quantity}</span>
                        )}
                        <div className="flex items-center gap-2 sm:gap-3 bg-[#f0f0f0] rounded-full px-3 sm:px-4 py-2">
                          <button onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity - 1 }))}
                            className="text-gray-600 hover:text-black transition-colors">
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity + 1 }))}
                            className="text-gray-600 hover:text-black transition-colors">
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div className="border border-gray-200 rounded-[24px] p-5 sm:p-6 flex flex-col gap-5 sticky top-24">
              <h3 className="font-bold text-xl text-black">Order Summary</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${currencySubtotal}</span>
                </div>
                {totalPointsRequired > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl text-xs">
                    <span>Points Required</span>
                    <span>{totalPointsRequired} pts</span>
                  </div>
                )}
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount (-{discountPercentage}%)</span>
                    <span>-${discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-black">${deliveryFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-bold text-lg text-black">Total</span>
                  <span className="font-bold text-2xl text-black">${grandTotal}</span>
                </div>
              </div>

              {/* ── Promo Code — DB-validated ── */}
              {promoCode ? (
                /* Applied state */
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-full px-4 py-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">{promoCode} — {discountPercentage}% OFF</span>
                  </div>
                  <button onClick={handleRemovePromo}
                    className="text-green-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Input state */
                <div className="flex flex-col gap-1.5">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                        className={`w-full bg-[#f0f0f0] rounded-full py-3 pl-10 pr-3 text-sm outline-none transition-all
                          ${promoError ? 'ring-2 ring-red-400' : 'focus:ring-2 focus:ring-black/20'}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-5 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                    >
                      {promoLoading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Apply'
                      }
                    </button>
                  </form>
                  {promoError && (
                    <p className="text-xs text-red-500 font-semibold pl-2">{promoError}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleGoToCheckout}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-colors"
              >
                Go to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
