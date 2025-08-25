'use client';

import { getLayoutedElements } from '@/lib/elkjs';
import { HighlightedElements, UiNode } from '@/lib/types';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useReactFlow,
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
  const [highlightedElements, setHighlightedElements] =
    useState<HighlightedElements>({
      nodeIds: new Set(),
      edgeIds: new Set(),
    });
  const { fitView } = useReactFlow();

  // Function to find connected nodes and edges
  const findConnectedElements = useCallback(
    (nodeId: string, allEdges: Edge[]) => {
      const connectedNodeIds = new Set<string>();
      const connectedEdgeIds = new Set<string>();

      // Add the selected node itself
      connectedNodeIds.add(nodeId);

      // Find all edges connected to this node
      allEdges.forEach((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          connectedEdgeIds.add(edge.id);
          // Add connected nodes
          if (edge.source === nodeId) {
            connectedNodeIds.add(edge.target);
          }
          if (edge.target === nodeId) {
            connectedNodeIds.add(edge.source);
          }
        }
      });

      return { nodeIds: connectedNodeIds, edgeIds: connectedEdgeIds };
    },
    [],
  );

  useEffect(() => {
    const loadLayout = async () => {
      const { layoutedNodes, layoutedEdges } = await getLayoutedElements();
      setNodes(() => layoutedNodes);
      setEdges(() => layoutedEdges);
      setIsLoading(false);
      fitView();
    };

    loadLayout();
  }, []);

  // Update node and edge styles based on highlighted elements
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          borderWidth: highlightedElements.nodeIds.has(node.id) ? '3px' : '1px',
          boxShadow: highlightedElements.nodeIds.has(node.id)
            ? '0 0 0 2px #f97316'
            : 'none',
          fontWeight: highlightedElements.nodeIds.has(node.id)
            ? 'bold'
            : 'normal',
        },
      })),
    );

    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: highlightedElements.edgeIds.has(edge.id) ? 3 : 1,
          stroke: highlightedElements.edgeIds.has(edge.id)
            ? '#f97316'
            : '#374151',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: highlightedElements.edgeIds.has(edge.id)
            ? '#f97316'
            : '#374151',
        },
      })),
    );
  }, [highlightedElements]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, newSelectedNode: UiNode) => {
      if (!selectedNode || selectedNode.id != newSelectedNode.id) {
        setSelectedNode(() => ({ ...newSelectedNode }));
        // Find and set highlighted elements
        const connected = findConnectedElements(newSelectedNode.id, edges);
        setHighlightedElements(connected);
      }
    },
    [selectedNode, setSelectedNode, findConnectedElements, edges],
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
