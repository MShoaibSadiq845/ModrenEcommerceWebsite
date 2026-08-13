'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store/store';
import { updateUser } from '@/store/slices/authSlice';
import { useGetMyOrdersQuery } from '@/store/services/ordersApi';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdateShippingAddressMutation,
  useGetUserByIdQuery,
} from '@/store/services/usersApi';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import {
  Award, Package, User as UserIcon, Mail, Shield,
  TrendingUp, ShoppingBag, Clock, CheckCircle2, Truck,
  XCircle, Camera, Save, MapPin, Phone, Home,
  Globe, Loader2, Edit3, Check, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ── Status badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    Delivered:  { icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-green-50 text-green-700 border-green-200' },
    Shipped:    { icon: <Truck className="w-3 h-3" />,        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    Canceled:   { icon: <XCircle className="w-3 h-3" />,      cls: 'bg-red-50 text-red-700 border-red-200' },
    Pending:    { icon: <Clock className="w-3 h-3" />,         cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    Processing: { icon: <Clock className="w-3 h-3" />,         cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  const c = map[status] || map['Pending'];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${c.cls}`}>
      {c.icon} {status}
    </span>
  );
}

/* ── Section wrapper ──────────────────────────────────────────────── */
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-bold text-sm text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Field input helper ───────────────────────────────────────────── */
function Field({
  label, name, type = 'text', placeholder, icon: Icon,
  register, error, required = true,
}: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={type}
          placeholder={placeholder}
          {...register(name, { required: required ? `${label} is required` : false })}
          className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10'}`}
        />
      </div>
      {error && <span className="text-[10px] text-red-500 font-semibold">{error.message}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const { data: orders = [], isLoading: ordersLoading } = useGetMyOrdersQuery(undefined, { skip: !isAuthenticated });
  const { data: dbUser } = useGetUserByIdQuery(user?.id || '', { skip: !user?.id });

  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();
  const [updateShipping, { isLoading: savingAddr }] = useUpdateShippingAddressMutation();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* ── Profile form ── */
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({ defaultValues: { name: '', phone: '' } });

  /* ── Address form ── */
  const {
    register: regAddr,
    handleSubmit: handleAddr,
    reset: resetAddr,
    formState: { errors: addrErrors },
  } = useForm({
    defaultValues: { fullName: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'Pakistan' },
  });

  /* Pre-fill forms when DB data arrives */
  useEffect(() => {
    if (dbUser) {
      resetProfile({ name: dbUser.name || '', phone: (dbUser as any).phone || '' });
      if ((dbUser as any).shippingAddress?.street) {
        resetAddr({ ...(dbUser as any).shippingAddress });
      }
    }
  }, [dbUser, resetProfile, resetAddr]);

  /* ── Avatar upload ── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await uploadAvatar(fd).unwrap();
      dispatch(updateUser({ avatar: res.avatar }));
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  /* ── Save profile ── */
  const onSaveProfile = async (data: any) => {
    try {
      const res = await updateProfile({ name: data.name, phone: data.phone }).unwrap();
      dispatch(updateUser({ name: res.name }));
      toast.success('Profile saved!');
      setEditingProfile(false);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  /* ── Save address ── */
  const onSaveAddress = async (data: any) => {
    try {
      await updateShipping(data).unwrap();
      toast.success('Address saved!');
      setEditingAddress(false);
    } catch {
      toast.error('Failed to save address');
    }
  };

  /* ── Stats ── */
  const totalSpent       = (orders as any[]).reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalPtsEarned   = (orders as any[]).reduce((s, o) => s + (o.pointsEarned || 0), 0);
  const totalPtsUsed     = (orders as any[]).reduce((s, o) => s + (o.pointsUsed || 0), 0);

  const avatarUrl = (dbUser as any)?.avatar || (user as any)?.avatar || '';

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <StorefrontHeader />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Sign in Required</h2>
            <p className="text-sm text-gray-500 mt-1">Please sign in to view your profile.</p>
            <Link href="/login" className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-full text-sm font-bold">Sign In</Link>
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8] font-['Satoshi']">
      <StorefrontHeader />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col gap-6">

        {/* ── Hero banner ── */}
        <div className="w-full bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover rounded-2xl" />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Upload overlay */}
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Change avatar"
                >
                  {uploadingAvatar
                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                    : <Camera className="w-5 h-5 text-white" />
                  }
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold">{user.name}</h1>
                <div className="flex items-center gap-1.5 mt-1 opacity-70 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <span className={`mt-2 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  user.role === 'Super Admin' ? 'bg-purple-500/30 text-purple-200'
                  : user.role === 'Admin' ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-white/10 text-white/70'
                }`}>
                  <Shield className="w-3 h-3 inline mr-1" />{user.role}
                </span>
              </div>
            </div>

            {/* Points card */}
            <div className="bg-amber-500/20 border border-amber-500/30 px-5 py-4 rounded-2xl text-right">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
                <Award className="w-4 h-4" /> Loyalty Points
              </div>
              <div className="text-4xl font-extrabold text-white">{user.loyaltyPoints?.toLocaleString() || 0}</div>
              <div className="text-[10px] text-amber-300/70 mt-0.5">available to redeem</div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: orders.length, icon: <ShoppingBag className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
            { label: 'Total Spent',  value: `$${totalSpent.toFixed(0)}`, icon: <TrendingUp className="w-5 h-5 text-green-500" />, color: 'text-green-600' },
            { label: 'Points Earned',value: `+${totalPtsEarned}`, icon: <Award className="w-5 h-5 text-amber-500" />, color: 'text-amber-600' },
            { label: 'Points Used',  value: `-${totalPtsUsed}`, icon: <Award className="w-5 h-5 text-purple-500" />, color: 'text-purple-600' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-semibold">{label}</span>
                {icon}
              </div>
              <span className={`text-xl sm:text-2xl font-extrabold ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Edit Profile ── */}
          <Section title="Personal Info" icon={UserIcon}>
            {editingProfile ? (
              <form onSubmit={handleProfile(onSaveProfile)} className="flex flex-col gap-4">
                <Field label="Full Name" name="name" placeholder="John Doe" icon={UserIcon}
                  register={regProfile} error={profileErrors.name} />
                <Field label="Phone" name="phone" placeholder="+92 300 1234567" icon={Phone} type="tel"
                  register={regProfile} error={profileErrors.phone} required={false} />
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setEditingProfile(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button type="submit" disabled={savingProfile}
                    className="flex-1 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50">
                    {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-3 text-sm flex-1">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
                        <p className="font-bold text-gray-900">{(dbUser as any)?.name || user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                        <p className="font-bold text-gray-900">{user.email}</p>
                        <p className="text-[10px] text-gray-400">Email cannot be changed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone</p>
                        <p className="font-bold text-gray-900">{(dbUser as any)?.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditingProfile(true)}
                    className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all self-start">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* ── Delivery Address ── */}
          <Section title="Delivery Address" icon={MapPin}>
            {editingAddress ? (
              <form onSubmit={handleAddr(onSaveAddress)} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Full Name"    name="fullName"    placeholder="John Doe"        icon={UserIcon} register={regAddr} error={addrErrors.fullName} />
                  <Field label="Phone"        name="phone"       placeholder="+92 300 1234567"  icon={Phone}    register={regAddr} error={addrErrors.phone} type="tel" />
                  <div className="sm:col-span-2">
                    <Field label="Street"     name="street"      placeholder="123 Main St"       icon={Home}     register={regAddr} error={addrErrors.street} />
                  </div>
                  <Field label="City"         name="city"        placeholder="Karachi"          icon={MapPin}   register={regAddr} error={addrErrors.city} />
                  <Field label="State"        name="state"       placeholder="Sindh"            icon={MapPin}   register={regAddr} error={addrErrors.state} required={false} />
                  <Field label="Postal Code"  name="postalCode"  placeholder="75500"            icon={Package}  register={regAddr} error={addrErrors.postalCode} />
                  <Field label="Country"      name="country"     placeholder="Pakistan"         icon={Globe}    register={regAddr} error={addrErrors.country} />
                </div>
                <div className="flex gap-3 mt-1">
                  <button type="button" onClick={() => setEditingAddress(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button type="submit" disabled={savingAddr}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {savingAddr ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-4">
                {(() => {
                  const addr = (dbUser as any)?.shippingAddress;
                  return addr?.street ? (
                    <div className="flex flex-col gap-1.5 text-sm">
                      <p className="font-bold text-gray-900">{addr.fullName}</p>
                      <p className="text-gray-500 flex items-center gap-1.5"><Phone className="w-3 h-3" />{addr.phone}</p>
                      <p className="text-gray-600">{addr.street}</p>
                      <p className="text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                      <p className="text-gray-600">{addr.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No address saved yet.</p>
                  );
                })()}
                <button onClick={() => setEditingAddress(true)}
                  className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-xl transition-all shrink-0">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </Section>
        </div>

        {/* ── Loyalty info ── */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Loyalty Points System</h3>
            <ul className="mt-2 text-xs text-gray-600 flex flex-col gap-1.5">
              <li>✦ Earn <strong>1 point per $10</strong> spent on currency orders.</li>
              <li>✦ Accumulate <strong>1,000 points</strong> → redeem for a free item.</li>
              <li>✦ New accounts start with <strong>100 welcome bonus points</strong>.</li>
              <li>✦ Points never expire.</li>
            </ul>
          </div>
        </div>

        {/* ── Recent Orders ── */}
        <Section title="Recent Orders" icon={Package}>
          {ordersLoading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (orders as any[]).length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-500">No orders yet</p>
              <Link href="/shop" className="mt-3 inline-block px-5 py-2 bg-black text-white rounded-full text-xs font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(orders as any[]).slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-black">Order #{order._id.slice(-8)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-black">${order.totalAmount}</p>
                      {order.pointsEarned > 0 && (
                        <p className="text-[10px] text-amber-600 font-bold">+{order.pointsEarned} pts</p>
                      )}
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
              <Link href="/orders" className="text-xs font-bold text-black underline text-center mt-1">
                View All Orders →
              </Link>
            </div>
          )}
        </Section>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/shop',                  label: 'Browse Products', sub: 'Explore new arrivals & sales', icon: ShoppingBag, hover: 'hover:border-black' },
            { href: '/orders',                label: 'Order History',   sub: 'Track all past orders',         icon: Package,     hover: 'hover:border-black' },
            { href: '/shop?purchaseType=loyalty_only', label: 'Loyalty Shop', sub: 'Redeem your points', icon: Award, hover: 'hover:border-amber-400' },
          ].map(({ href, label, sub, icon: Icon, hover }) => (
            <Link key={href} href={href}
              className={`bg-white rounded-2xl p-5 border border-gray-100 ${hover} transition-all flex items-center gap-4 group`}>
              <div className="w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white text-gray-600 flex items-center justify-center transition-all">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
