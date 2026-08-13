'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { RootState } from '@/store/store';
import { updateUser } from '@/store/slices/authSlice';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdateShippingAddressMutation,
  useGetUserByIdQuery,
} from '@/store/services/usersApi';
import {
  X, Camera, Save, User as UserIcon, Mail, Phone,
  MapPin, Home, Globe, Package, Loader2, CheckCircle,
  Shield, Award,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthToken } from '@/lib/getAuthToken';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Tab = 'info' | 'address';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: Props) {
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const avatarRef = useRef<HTMLInputElement>(null);

  const { data: dbUser, refetch } = useGetUserByIdQuery(user?.id || '', {
    skip: !user?.id,
  });

  const [updateProfile, { isLoading: savingInfo }] = useUpdateProfileMutation();
  const [updateShipping, { isLoading: savingAddr }] = useUpdateShippingAddressMutation();

  const [tab, setTab] = useState<Tab>('info');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Profile form ─────────────────────────────────────────────── */
  const {
    register: rInfo,
    handleSubmit: hInfo,
    reset: resetInfo,
    formState: { errors: infoErr },
  } = useForm({ defaultValues: { name: '', phone: '' } });

  /* ── Address form ─────────────────────────────────────────────── */
  const {
    register: rAddr,
    handleSubmit: hAddr,
    reset: resetAddr,
    formState: { errors: addrErr },
  } = useForm({
    defaultValues: {
      fullName: '', phone: '', street: '',
      city: '', state: '', postalCode: '', country: 'Pakistan',
    },
  });

  /* Pre-fill from DB when drawer opens */
  useEffect(() => {
    if (!open || !dbUser) return;
    resetInfo({ name: (dbUser as any).name || '', phone: (dbUser as any).phone || '' });
    const addr = (dbUser as any).shippingAddress;
    if (addr?.street) resetAddr({ ...addr });
  }, [open, dbUser, resetInfo, resetAddr]);

  /* ── Avatar upload ─────────────────────────────────────────────── */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getAuthToken();
    if (!token) { toast.error('Not authenticated'); return; }

    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await fetch(`${API}/users/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      dispatch(updateUser({ avatar: data.avatar }));
      await refetch();
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  /* ── Save personal info ─────────────────────────────────────────── */
  const onSaveInfo = async (data: any) => {
    try {
      const res = await updateProfile({ name: data.name, phone: data.phone }).unwrap();
      dispatch(updateUser({ name: res.name }));
      await refetch();
      flash();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  /* ── Save address ─────────────────────────────────────────────── */
  const onSaveAddr = async (data: any) => {
    try {
      await updateShipping(data).unwrap();
      await refetch();
      flash();
      toast.success('Address saved!');
    } catch {
      toast.error('Failed to save address');
    }
  };

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarUrl = (dbUser as any)?.avatar || (user as any)?.avatar || '';
  const initials = (user?.name || '?').charAt(0).toUpperCase();

  /* ── Field helper ─────────────────────────────────────────────── */
  const Field = ({ label, name, type = 'text', placeholder, icon: Icon, reg, err, required = true }: any) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={type}
          placeholder={placeholder}
          {...reg(name, { required: required ? `${label} is required` : false })}
          className={`w-full pl-8 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-all font-medium
            ${err?.[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10'}`}
        />
      </div>
      {err?.[name] && <span className="text-[10px] text-red-500">{err[name]?.message}</span>}
    </div>
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-lg text-gray-900">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Avatar section ── */}
        <div className="px-6 py-6 bg-gradient-to-r from-gray-900 to-black flex items-center gap-5 shrink-0">
          {/* Avatar + upload button stacked */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-3xl font-extrabold text-white">{initials}</span>
                )}
              </div>
              {/* Uploading spinner overlay */}
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Visible upload button — always shown, not hover-only */}
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-full text-[11px] font-bold text-white transition-all disabled:opacity-50"
            >
              <Camera className="w-3 h-3" />
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </button>

            <input
              ref={avatarRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <p className="font-extrabold text-white text-base truncate">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                user?.role === 'Super Admin' ? 'bg-purple-500/30 text-purple-200'
                : user?.role === 'Admin' ? 'bg-blue-500/30 text-blue-200'
                : 'bg-white/10 text-white/60'
              }`}>
                <Shield className="w-2.5 h-2.5 inline mr-0.5" />{user?.role}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                <Award className="w-2.5 h-2.5 inline mr-0.5" />{user?.loyaltyPoints || 0} pts
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-gray-100 shrink-0">
          {(['info', 'address'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
                tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t === 'info' ? '👤 Personal Info' : '📦 Delivery Address'}
            </button>
          ))}
        </div>

        {/* ── Scrollable form content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ─ Personal Info tab ─ */}
          {tab === 'info' && (
            <form onSubmit={hInfo(onSaveInfo)} className="flex flex-col gap-4">
              <Field label="Full Name"    name="name"  placeholder="John Doe"         icon={UserIcon} reg={rInfo} err={infoErr} />
              <Field label="Phone Number" name="phone" placeholder="+92 300 0000000"  icon={Phone}    reg={rInfo} err={infoErr} type="tel" required={false} />

              {/* Email — read-only */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-[10px] text-gray-400">Email cannot be changed</p>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 flex items-center gap-2">
                <Camera className="w-4 h-4 shrink-0 text-gray-400" />
                <span>PNG, JPG or WEBP · max 5MB. Click <strong>Upload Photo</strong> above to change your avatar.</span>
              </div>

              <button
                type="submit"
                disabled={savingInfo}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {savingInfo
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : saved
                  ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Profile</>
                }
              </button>
            </form>
          )}

          {/* ─ Address tab ─ */}
          {tab === 'address' && (
            <form onSubmit={hAddr(onSaveAddr)} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name"   name="fullName"   placeholder="John Doe"        icon={UserIcon} reg={rAddr} err={addrErr} />
                <Field label="Phone"       name="phone"      placeholder="+92 300 0000000"  icon={Phone}    reg={rAddr} err={addrErr} type="tel" />
              </div>
              <Field label="Street Address" name="street"    placeholder="123 Main Street"  icon={Home}     reg={rAddr} err={addrErr} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City"        name="city"       placeholder="Karachi"          icon={MapPin}   reg={rAddr} err={addrErr} />
                <Field label="State"       name="state"      placeholder="Sindh"            icon={MapPin}   reg={rAddr} err={addrErr} required={false} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postal Code" name="postalCode" placeholder="75500"            icon={Package}  reg={rAddr} err={addrErr} />
                <Field label="Country"     name="country"    placeholder="Pakistan"         icon={Globe}    reg={rAddr} err={addrErr} />
              </div>

              <button
                type="submit"
                disabled={savingAddr}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              >
                {savingAddr
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : saved
                  ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                  : <><Save className="w-4 h-4" /> Save Address</>
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
