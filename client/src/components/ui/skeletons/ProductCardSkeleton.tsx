import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[20px] bg-[#f0f0f0] p-4 flex flex-col gap-3 animate-pulse w-full max-w-[295px]">
      <div className="w-full h-[250px] bg-gray-300 rounded-[13.42px]"></div>
      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-6 bg-gray-300 rounded w-1/3 mt-1"></div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
