'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Send, Loader2, Mail, User, MessageSquare, FileText } from 'lucide-react';
import { useSubmitContactMutation } from '@/store/services/contactApi';
import { toast } from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactModal({ open, onClose }: Props) {
  const [submitContact, { isLoading }] = useSubmitContactMutation();
  const hasOpenedOnce = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  /* Reset form only on the FIRST open, never while user is typing */
  useEffect(() => {
    if (open && !hasOpenedOnce.current) {
      hasOpenedOnce.current = true;
      reset({ name: '', email: '', subject: '', message: '' });
    }
    if (!open) {
      // Allow reset again next time it opens after being closed + submitted
      hasOpenedOnce.current = false;
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      await submitContact(values).unwrap();
      toast.success("Message sent! We'll get back to you soon.");
      reset({ name: '', email: '', subject: '', message: '' });
      hasOpenedOnce.current = false;
      onClose();
    } catch (err: any) {
      const serverMsg =
        err?.data?.message
          ? Array.isArray(err.data.message)
            ? err.data.message.join(', ')
            : err.data.message
          : 'Failed to send message. Please try again.';
      toast.error(serverMsg);
    }
  };

  /* ── Always rendered, hidden via CSS when closed ── */
  return (
    <div
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-200 ${
          open ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900">Contact Us</h2>
              <p className="text-[11px] text-gray-400">We usually reply within 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">

          {/* Name + Email row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', {
                    required: 'Name is required',
                    maxLength: { value: 100, message: 'Max 100 chars' },
                  })}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-all font-medium ${
                    errors.name
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black'
                  }`}
                />
              </div>
              {errors.name && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                  })}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-all font-medium ${
                    errors.email
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-500 font-semibold">{errors.email.message}</span>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Subject
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="What is your query about?"
                {...register('subject', {
                  required: 'Subject is required',
                  maxLength: { value: 200, message: 'Max 200 chars' },
                })}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none transition-all font-medium ${
                  errors.subject
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black'
                }`}
              />
            </div>
            {errors.subject && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.subject.message}</span>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Your Message
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
              <textarea
                rows={4}
                placeholder="Describe your query in detail..."
                {...register('message', {
                  required: 'Message is required',
                  minLength: { value: 10, message: 'At least 10 characters' },
                  maxLength: { value: 2000, message: 'Max 2000 chars' },
                })}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none resize-none transition-all font-medium ${
                  errors.message
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-black'
                }`}
              />
            </div>
            {errors.message && (
              <span className="text-[10px] text-red-500 font-semibold">{errors.message.message}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
