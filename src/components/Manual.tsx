'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Manual = () => {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          Manual
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Select a node</h3>
          <p className="text-gray-600">
            Explore the selected node&apos;s properties and relationships.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700">Navigation</h3>
          <ul className="list-disc text-gray-600 space-y-1">
            <li>
              <strong>Zoom:</strong> Use the mouse wheel or +/- at the bottom
              left corner.
            </li>
            <li>
              <strong>Pan:</strong> Click and drag to move the view.
            </li>
            <li>
              <strong>Fit View:</strong> Use the control panel button at the
              bottom left corner to center all nodes.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
