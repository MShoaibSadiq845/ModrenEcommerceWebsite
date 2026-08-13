import React from 'react';

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* header row */}
      <div className="p-5 border-b border-gray-100 flex gap-4 animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`h-3 bg-gray-200 rounded-full ${i === 0 ? 'w-1/4' : 'flex-1'}`} />
        ))}
      </div>
      {/* data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b last:border-0 border-gray-50 flex items-center gap-4 animate-pulse">
          {/* avatar cell */}
          <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <div key={j} className={`h-3 bg-gray-100 rounded-full flex-1 ${j === 0 ? 'max-w-[160px]' : ''}`} />
          ))}
          {/* action cell */}
          <div className="flex gap-2 ml-auto shrink-0">
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            <div className="w-7 h-7 bg-gray-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardWidgetSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded-full w-1/2" />
            <div className="w-8 h-8 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-7 bg-gray-200 rounded-full w-3/4" />
          <div className="h-2 bg-gray-100 rounded-full w-1/3" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 bg-gray-200 rounded-full w-1/4" />
        <div className="h-7 bg-gray-100 rounded-xl w-28" />
      </div>
      <div className="flex items-end gap-3 h-40">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-2 bg-gray-100 rounded-full w-8" />
        ))}
      </div>
    </div>
  );
}
