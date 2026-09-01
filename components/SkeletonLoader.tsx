'use client';

import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden p-4 flex flex-col justify-between h-[300px]">
          <div className="w-full aspect-square bg-gray-200 rounded-xl mb-4"></div>
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
