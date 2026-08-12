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
  clearCart,
} from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/services/ordersApi';
import { Trash2, Tag, ArrowRight, Award, CheckCircle, Minus, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, promoCode, discountPercentage } = useSelector((state: RootState) => state.cart);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [promoInput, setPromoInput] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* Totals */
  const currencySubtotal = items.reduce((acc, item) => {
    if (item.paymentMethod === 'currency') {
      const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
      return acc + price * item.quantity;
    }
    return acc;
  }, 0);

  const totalPointsRequired = items.reduce((acc, item) => {
    if (item.paymentMethod === 'points') return acc + (item.pointsPrice || 0) * item.quantity;
    return acc;
  }, 0);

  const discountAmount = Math.round((currencySubtotal * discountPercentage) / 100);
  const deliveryFee = currencySubtotal > 0 ? 15 : 0;
  const grandTotal = Math.max(0, currencySubtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim().toUpperCase() === 'SHOP20') {
      dispatch(applyPromoCode(promoInput));
      toast.success('Promo code applied — 20% OFF!');
    } else {
      toast.error('Invalid promo code. Try SHOP20.');
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) { toast.error('Please log in first.'); router.push('/login'); return; }
    if (items.length === 0) return;
    setErrorMsg('');
    try {
      const res = await createOrder({
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.isOnSale && item.salePrice ? item.salePrice : item.price,
          pointsPrice: item.pointsPrice || 0,
          quantity: item.quantity,
          paymentMethod: item.paymentMethod,
        })),
        promoCode: promoCode || undefined,
        shippingAddress: { street: '123 Main St', city: 'New York', postalCode: '10001', country: 'USA' },
      }).unwrap();
      setOrderSuccess(res);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
    } catch (err: any) {
      const msg = err?.data?.message || 'Checkout failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  /* Order success screen */
  if (orderSuccess) {
    return (
      <div className="w-full max-w-[700px] mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center font-['Satoshi']">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
          ORDER CONFIRMED!
        </h1>
        <p className="text-sm text-gray-600 max-w-sm">
          Thank you! Order <strong>#{orderSuccess._id?.slice(-6)}</strong> has been placed successfully.
        </p>
        {orderSuccess.pointsEarned > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" /> You earned {orderSuccess.pointsEarned} Loyalty Points!
          </div>
        )}
        <div className="flex gap-4">
          <Link href="/orders" className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold">View My Orders</Link>
          <Link href="/shop" className="px-6 py-3 border border-gray-300 rounded-full text-sm font-bold">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-['Satoshi']">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-medium">Cart</span>
        </nav>

        <h1 className="text-3xl lg:text-4xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
          YOUR CART
        </h1>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl">{errorMsg}</div>
        )}

        {items.length === 0 ? (
          /* Empty state */
          <div className="w-full py-24 flex flex-col items-center gap-5 bg-[#f2f0f1] rounded-[30px] text-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.4 6M7 13l2.4 6m0 0h8m-8 0a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <p className="text-xl font-bold text-gray-700">Your cart is empty</p>
            <p className="text-sm text-gray-400">Browse our store and add items you love.</p>
            <Link href="/shop" className="mt-2 px-10 py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
            {/* ─── Cart Items ─── */}
            <div className="border border-gray-200 rounded-[24px] p-6 flex flex-col divide-y divide-gray-100">
              {items.map((item, idx) => {
                const itemPrice = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                return (
                  <div key={item.id + idx} className="flex items-start gap-4 py-6 first:pt-0 last:pb-0">
                    {/* Product thumbnail */}
                    <div className="relative w-[100px] h-[100px] bg-[#f2f0f1] rounded-[12px] overflow-hidden shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-black line-clamp-1">{item.name}</h3>
                        <button
                          onClick={() => dispatch(removeFromCart(idx))}
                          className="text-red-500 hover:text-red-700 transition-colors shrink-0 p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
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
                          <span className="font-bold text-lg text-amber-600 flex items-center gap-1">
                            <Award className="w-4 h-4" /> {(item.pointsPrice || 0) * item.quantity} pts
                          </span>
                        ) : (
                          <span className="font-bold text-xl text-black">${itemPrice * item.quantity}</span>
                        )}

                        {/* Quantity counter */}
                        <div className="flex items-center gap-3 bg-[#f0f0f0] rounded-full px-4 py-2">
                          <button
                            onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity - 1 }))}
                            className="text-gray-600 hover:text-black transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ index: idx, quantity: item.quantity + 1 }))}
                            className="text-gray-600 hover:text-black transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Order Summary ─── */}
            <div className="border border-gray-200 rounded-[24px] p-6 flex flex-col gap-5 sticky top-24">
              <h3 className="font-bold text-xl text-black">Order Summary</h3>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black">${currencySubtotal}</span>
                </div>
                {totalPointsRequired > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl text-xs">
                    <span>Points Total</span>
                    <span>{totalPointsRequired} pts</span>
                  </div>
                )}
                {discountPercentage > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount (-{discountPercentage}%)</span>
                    <span className="font-bold">-${discountAmount}</span>
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

              {/* Promo Code */}
              <form onSubmit={handleApplyPromo} className="flex gap-3">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full bg-[#f0f0f0] rounded-full py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors shrink-0"
                >
                  Apply
                </button>
              </form>

              {promoCode && (
                <p className="text-xs text-green-600 font-bold">✓ Promo {promoCode} applied!</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Processing...' : 'Go to Checkout'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
