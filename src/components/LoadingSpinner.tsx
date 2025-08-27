'use client';

import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <Card className="p-8">
        <CardContent className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading...</span>
        </CardContent>
      </Card>
    </div>
  );
};
