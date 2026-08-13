import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {/* image */}
      <div className="w-full aspect-square sm:aspect-[3/4] bg-gray-200 rounded-[20px]" />
      {/* name */}
      <div className="h-4 bg-gray-200 rounded-full w-3/4" />
      {/* stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-3.5 h-3.5 bg-gray-200 rounded-full" />
        ))}
        <div className="h-3.5 bg-gray-100 rounded-full w-8 ml-1" />
      </div>
      {/* price */}
      <div className="flex items-center gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-14" />
        <div className="h-4 bg-gray-100 rounded-full w-10" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* image */}
        <div className="w-full aspect-square bg-gray-200 rounded-3xl" />
        {/* details */}
        <div className="flex flex-col gap-5">
          <div className="h-8 bg-gray-200 rounded-full w-3/4" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 rounded-full" />
            ))}
            <div className="h-5 bg-gray-100 rounded-full w-12 ml-2" />
          </div>
          <div className="h-10 bg-gray-200 rounded-full w-1/3" />
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded-full w-full" />)}
            <div className="h-3 bg-gray-100 rounded-full w-2/3" />
          </div>
          <div className="h-px bg-gray-200 my-2" />
          {/* size picker */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 w-20 bg-gray-100 rounded-full" />
            ))}
          </div>
          {/* button */}
          <div className="h-14 bg-gray-200 rounded-full w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
