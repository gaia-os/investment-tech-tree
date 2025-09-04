'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeActions } from './NodeActions';
import { UiNode } from '@/lib/types';

interface CustomNodeProps extends NodeProps {
  data: UiNode['data'];
  onShowDetails: (nodeId: string) => void;
  onShowConnected: (nodeId: string) => void;
}

export const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  id,
  onShowDetails,
  onShowConnected,
}) => {
  return (
    <div className="group relative w-full h-full">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400"
      />
      <div className="w-full h-full flex items-center justify-center text-center p-2 text-sm font-medium">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400"
      />
      <NodeActions
        nodeId={id}
        onShowDetails={onShowDetails}
        onShowConnected={onShowConnected}
      />
    </div>
  );
};
