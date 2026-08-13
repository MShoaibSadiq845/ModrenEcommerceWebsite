'use client';

import React from 'react';

/**
 * Full-screen loading overlay — shown while any page-level data fetch is in progress.
 * Import and use like:
 *
 *   if (isLoading) return <PageLoader />;
 */
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Spinning ring */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-black animate-spin" />
      </div>
      {/* Brand mark */}
      <span
        className="mt-5 text-xl font-extrabold tracking-tight text-black select-none"
        style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}
      >
        SHOP.CO
      </span>
      <p className="mt-1.5 text-xs text-gray-400 font-medium">{message}</p>
    </div>
  );
}

/**
 * Inline section-level loader — use inside a card or a section instead of
 * replacing the whole page. Smaller footprint than PageLoader.
 */
export function SectionLoader({ rows = 1 }: { rows?: number }) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-black animate-spin" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 w-48 bg-gray-100 rounded-full animate-pulse" />
      ))}
    </div>
  );
}
