import React from 'react';

export function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-[1240px] mx-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <div className="w-20 h-24 bg-gray-300 rounded-xl"></div>
          <div className="w-20 h-24 bg-gray-300 rounded-xl"></div>
          <div className="w-20 h-24 bg-gray-300 rounded-xl"></div>
        </div>
        <div className="flex-1 h-[500px] bg-gray-300 rounded-2xl"></div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="h-10 bg-gray-300 rounded w-3/4"></div>
        <div className="h-5 bg-gray-300 rounded w-1/4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-20 bg-gray-300 rounded w-full"></div>
        <div className="h-12 bg-gray-300 rounded w-full mt-5"></div>
      </div>
    </div>
  );
}
