'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store/store';
import { clearCart } from '@/store/slices/cartSlice';
import { useCreateOrderMutation } from '@/store/services/ordersApi';
import { useUpdateShippingAddressMutation } from '@/store/services/usersApi';
import { useGetUserByIdQuery } from '@/store/services/usersApi';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import {
  MapPin, Phone, User as UserIcon, Home, Globe,
  ChevronRight, CheckCircle, Award, Loader2,
  Package, Tag, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

type ShippingForm = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Step = 'shipping' | 'review' | 'success';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { items, promoCode, discountPercentage } = useSelector((s: RootState) => s.cart);

  const [step, setStep] = useState<Step>('shipping');
  const [orderResult, setOrderResult] = useState<any>(null);

  const [createOrder, { isLoading: ordering }] = useCreateOrderMutation();
  const [saveShipping, { isLoading: savingAddr }] = useUpdateShippingAddressMutation();

  // Load saved address from DB
  const { data: userData } = useGetUserByIdQuery(user?.id || '', {
    skip: !user?.id,
  });

  const {
    register, handleSubmit, reset,
    formState: { errors },
    watch,
  } = useForm<ShippingForm>({
    defaultValues: {
      fullName: '', phone: '', street: '',
      city: '', state: '', postalCode: '', country: 'Pakistan',
    },
  });

  // Pre-fill form with saved address from DB
  useEffect(() => {
    if (userData?.shippingAddress?.street) {
      reset({ ...userData.shippingAddress });
    } else if (user) {
      reset({ fullName: user.name, phone: '', street: '', city: '', state: '', postalCode: '', country: 'Pakistan' });
    }
  }, [userData, user, reset]);

  // Redirect if not authenticated or cart empty
  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (items.length === 0 && step !== 'success') { router.push('/cart'); }
  }, [isAuthenticated, items.length, router, step]);

  /* ── Totals ── */
  const currencySubtotal = items.reduce((acc, item) => {
    if (item.paymentMethod === 'currency') {
      return acc + (item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity;
    }
    return acc;
  }, 0);
  const pointsTotal = items.reduce((acc, item) =>
    item.paymentMethod === 'points' ? acc + (item.pointsPrice || 0) * item.quantity : acc, 0);
  const discountAmt = Math.round((currencySubtotal * discountPercentage) / 100);
  const delivery = currencySubtotal > 0 ? 15 : 0;
  const grandTotal = Math.max(0, currencySubtotal - discountAmt + delivery);

  /* ── Step 1: Save address → go to review ── */
  const onShippingSubmit = async (data: ShippingForm) => {
    try {
      await saveShipping(data).unwrap();
      toast.success('Address saved!');
      setStep('review');
    } catch {
      toast.error('Failed to save address. Please try again.');
    }
  };

  /* ── Step 2: Place order ── */
  const handlePlaceOrder = async () => {
    const addr = watch();
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
        shippingAddress: {
          street: addr.street,
          city: addr.city,
          postalCode: addr.postalCode,
          country: addr.country,
        },
      }).unwrap();
      setOrderResult(res);
      dispatch(clearCart());
      setStep('success');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Order failed. Please try again.');
    }
  };

  /* ── Field helper ── */
  const Field = ({
    label, name, type = 'text', placeholder, icon: Icon, required = true,
  }: {
    label: string;
    name: keyof ShippingForm;
    type?: string;
    placeholder: string;
    icon: React.ElementType;
    required?: boolean;
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={type}
          placeholder={placeholder}
          {...register(name, {
            required: required ? `${label} is required` : false,
          })}
          className={`w-full pl-9 pr-3 py-3 border rounded-xl text-sm outline-none transition-all font-medium
            ${errors[name]
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10'
            }`}
        />
      </div>
      {errors[name] && (
        <span className="text-[10px] text-red-500 font-semibold px-1">{errors[name]?.message}</span>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════
     SUCCESS SCREEN
  ═══════════════════════════════════════════════════ */
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f8f8] font-['Satoshi']">
        <StorefrontHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF',sans-serif" }}>
                ORDER CONFIRMED!
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Thank you! Your order{' '}
                <span className="font-bold text-black">#{orderResult?._id?.slice(-8)}</span>{' '}
                has been placed successfully.
              </p>
            </div>

            {orderResult?.pointsEarned > 0 && (
              <div className="w-full flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 font-bold">
                <Award className="w-6 h-6 text-amber-500 shrink-0" />
                <span>You earned <strong>{orderResult.pointsEarned} Loyalty Points</strong> on this order!</span>
              </div>
            )}

            <div className="w-full bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Total</span>
                <span className="font-bold">${orderResult?.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-amber-600">Pending</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Delivery</span>
                <span className="font-bold">3 – 5 business days</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/orders"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all"
              >
                <Package className="w-4 h-4" /> View My Orders
              </Link>
              <Link
                href="/shop"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-200 rounded-full text-sm font-bold hover:bg-gray-50 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8] font-['Satoshi']">
      <StorefrontHeader />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/cart" className="hover:text-black transition-colors">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-semibold">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF',sans-serif" }}>
          CHECKOUT
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-3 text-sm font-bold">
          {(['shipping', 'review'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => s === 'shipping' && step === 'review' ? setStep('shipping') : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step === s
                    ? 'bg-black text-white'
                    : step === 'review' && s === 'shipping'
                    ? 'bg-green-100 text-green-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold
                  ${step === s ? 'bg-white text-black' : 'bg-current/20'}`}>
                  {step === 'review' && s === 'shipping' ? '✓' : i + 1}
                </span>
                {s === 'shipping' ? 'Delivery Address' : 'Review & Pay'}
              </button>
              {i === 0 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ══════════════════════════════════════
              STEP 1 — SHIPPING ADDRESS FORM
          ══════════════════════════════════════ */}
          {step === 'shipping' && (
            <form
              onSubmit={handleSubmit(onShippingSubmit)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-gray-900">Delivery Address</h2>
                  <p className="text-xs text-gray-400">This address will be saved to your account for future orders</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"    name="fullName"    placeholder="John Doe"        icon={UserIcon} />
                <Field label="Phone Number" name="phone"       placeholder="+92 300 1234567"  icon={Phone} type="tel" />
                <div className="sm:col-span-2">
                  <Field label="Street Address" name="street" placeholder="123 Main Street, Apt 4B" icon={Home} />
                </div>
                <Field label="City"         name="city"        placeholder="Karachi"          icon={MapPin} />
                <Field label="State / Province" name="state"  placeholder="Sindh"            icon={MapPin} required={false} />
                <Field label="Postal Code"  name="postalCode"  placeholder="75500"            icon={Package} />
                <Field label="Country"      name="country"     placeholder="Pakistan"         icon={Globe} />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Your address is encrypted and stored securely. We never share your personal information.</span>
              </div>

              <button
                type="submit"
                disabled={savingAddr}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {savingAddr
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving address...</>
                  : <>Continue to Review <ChevronRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          )}

          {/* ══════════════════════════════════════
              STEP 2 — REVIEW & PLACE ORDER
          ══════════════════════════════════════ */}
          {step === 'review' && (
            <div className="flex flex-col gap-5">
              {/* Saved address display */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-black" /> Delivery Address
                  </h2>
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit
                  </button>
                </div>
                {(() => {
                  const addr = watch();
                  return (
                    <div className="flex flex-col gap-1 text-sm text-gray-700">
                      <p className="font-bold text-black">{addr.fullName}</p>
                      <p className="flex items-center gap-1.5 text-gray-500 text-xs"><Phone className="w-3 h-3" />{addr.phone}</p>
                      <p className="text-xs text-gray-600 mt-1">{addr.street}</p>
                      <p className="text-xs text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                      <p className="text-xs text-gray-600">{addr.country}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Order items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" /> Order Items ({items.length})
                </h2>
                <div className="flex flex-col divide-y divide-gray-50">
                  {items.map((item, idx) => {
                    const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                    return (
                      <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-black line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity}
                            {item.size ? ` · Size: ${item.size}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {item.paymentMethod === 'points'
                            ? <span className="font-bold text-amber-600 text-sm flex items-center gap-1"><Award className="w-3 h-3" />{(item.pointsPrice || 0) * item.quantity} pts</span>
                            : <span className="font-bold text-sm">${price * item.quantity}</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Place order button */}
              <button
                onClick={handlePlaceOrder}
                disabled={ordering}
                className="w-full bg-black hover:bg-gray-800 text-white font-extrabold py-5 rounded-full text-base flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-black/20"
              >
                {ordering
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                  : <><ShieldCheck className="w-5 h-5" /> Place Order · ${grandTotal}</>
                }
              </button>

              {promoCode && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-bold">
                  <Tag className="w-4 h-4" /> Promo <strong>{promoCode}</strong> applied — {discountPercentage}% OFF
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              ORDER SUMMARY SIDEBAR (both steps)
          ══════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 sticky top-24">
            <h3 className="font-bold text-base text-gray-900">Order Summary</h3>

            {/* Mini item list */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="relative w-9 h-9 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <span className="flex-1 text-gray-700 line-clamp-1 font-medium">{item.name}</span>
                    <span className="font-bold text-gray-900 shrink-0">
                      {item.paymentMethod === 'points'
                        ? `${(item.pointsPrice||0)*item.quantity}pts`
                        : `$${price * item.quantity}`
                      }
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-black">${currencySubtotal}</span>
              </div>
              {pointsTotal > 0 && (
                <div className="flex justify-between text-amber-700 font-bold text-xs bg-amber-50 p-2 rounded-lg">
                  <span>Points Used</span>
                  <span>{pointsTotal} pts</span>
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-${discountAmt}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className="font-bold text-black">${delivery}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-base text-black">Total</span>
                <span className="font-extrabold text-xl text-black">${grandTotal}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
              {['🔒 Secure', '📦 Tracked', '↩️ Easy Returns'].map(b => (
                <span key={b} className="text-[10px] text-gray-400 font-medium">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
