import React from 'react';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4 w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded mb-2 w-full"></div>
      ))}
    </div>
  );
}

export function DashboardWidgetSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full animate-pulse mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl h-32 flex flex-col justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}
