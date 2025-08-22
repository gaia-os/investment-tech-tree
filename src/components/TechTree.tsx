'use client';

import { getLayoutedElements } from '@/lib/elkjs';
import { UiNode } from '@/lib/types';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  ReactFlow,
} from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Legend } from './Legend';
import { LoadingSpinner } from './LoadingSpinner';
import NodeDetails from './NodeDetails';

const TechTree: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<UiNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<UiNode | undefined>(
    undefined,
  );

  useEffect(() => {
    const loadLayout = async () => {
      const { layoutedNodes, layoutedEdges } = await getLayoutedElements();
      setNodes(() => layoutedNodes);
      setEdges(() => layoutedEdges);
      setIsLoading(false);
    };

    loadLayout();
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, newSelectedNode: UiNode) => {
      if (!selectedNode || selectedNode.id != newSelectedNode.id) {
        setSelectedNode(() => ({ ...newSelectedNode }));
      }
    },
    [selectedNode, setSelectedNode],
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <div className="w-3/4 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={undefined}
          onEdgesChange={undefined}
          onConnect={undefined}
          onNodeClick={onNodeClick}
          onEdgeClick={undefined}
          onNodeDragStop={undefined}
          draggable={false}
          nodesConnectable={false}
          colorMode={'light'}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.3}
        >
          <Background bgColor="white" variant={BackgroundVariant.Dots} />
          <MiniMap />
          <Controls showInteractive={false} />
        </ReactFlow>
        <Legend />
      </div>
      {
        <div className="w-1/4 p-4 bg-white shadow-lg">
          <NodeDetails selectedNode={selectedNode} />
        </div>
      }
    </div>
  );
};

export default TechTree;
