'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useRegisterMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setErrorMsg('');
    try {
      // By default role is 'User'
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'User',
      }).unwrap();
      toast.success('Registration successful! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      const msg = err?.data?.message || 'Registration failed';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f0f0f0] font-['Satoshi']">
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <StorefrontHeader />
      </Suspense>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-['Integral_CF'] text-black">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Get 20% off & 100 bonus loyalty points!</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...registerField('name', { required: 'Full name is required' })}
                className={`w-full bg-[#f0f0f0] border rounded-2xl py-3 px-4 text-sm outline-none transition-all ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:bg-white bg-red-50'
                    : 'border-transparent focus:border-black focus:bg-white'
                }`}
              />
              {errors.name && (
                <span className="text-xs text-red-500 font-semibold px-1">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                {...registerField('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full bg-[#f0f0f0] border rounded-2xl py-3 px-4 text-sm outline-none transition-all ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:bg-white bg-red-50'
                    : 'border-transparent focus:border-black focus:bg-white'
                }`}
              />
              {errors.email && (
                <span className="text-xs text-red-500 font-semibold px-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                {...registerField('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full bg-[#f0f0f0] border rounded-2xl py-3 px-4 text-sm outline-none transition-all ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500 focus:bg-white bg-red-50'
                    : 'border-transparent focus:border-black focus:bg-white'
                }`}
              />
              {errors.password && (
                <span className="text-xs text-red-500 font-semibold px-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold py-3.5 rounded-full text-sm hover:bg-gray-800 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-black underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
