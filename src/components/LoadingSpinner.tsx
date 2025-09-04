'use client';

import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-3 w-full h-full">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <span className="text-lg text-gray-600">Loading...</span>
    </div>
  );
};
