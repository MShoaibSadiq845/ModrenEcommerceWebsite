import React from 'react';

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 animate-pulse shadow-sm">
      <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-2.5 bg-gray-200 rounded-full w-16" />
            <div className="h-4 bg-gray-200 rounded-full w-24" />
          </div>
        ))}
        <div className="h-7 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="flex flex-col gap-2.5">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 bg-gray-100 rounded-full w-2/3" />
            <div className="h-3 bg-gray-100 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className="w-full bg-gray-900 rounded-3xl p-8 animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gray-700" />
        <div className="flex flex-col gap-2">
          <div className="h-6 bg-gray-700 rounded-full w-40" />
          <div className="h-3 bg-gray-700 rounded-full w-28" />
          <div className="h-5 bg-gray-600 rounded-full w-20 mt-1" />
        </div>
      </div>
      <div className="bg-gray-700/50 rounded-2xl px-6 py-5 flex flex-col gap-2 w-40">
        <div className="h-3 bg-gray-600 rounded-full w-full" />
        <div className="h-8 bg-gray-500 rounded-full w-3/4" />
        <div className="h-2.5 bg-gray-600 rounded-full w-1/2" />
      </div>
    </div>
  );
}
