'use client';

import { getLayoutedElements } from '@/lib/elkjs';
import { HighlightedElements, UiNode, GroupingMode } from '@/lib/types';
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Legend } from './Legend';
import { LoadingSpinner } from './LoadingSpinner';
import { GroupSelector } from './GroupSelector';
import { CustomNode } from './CustomNode';
import TabPanel from './TabPanel';

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
  // Grouping state
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('Milestone');
  const [showingRelatedNodes, setShowingRelatedNodes] = useState<string | null>(
    null,
  );
  const [showOnlyConnected, setShowOnlyConnected] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
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
    setSearchTerm(searchInput);
  }, [searchInput, searchTerm]);

  useEffect(() => {
    const loadLayout = async () => {
      setIsLoading(true);
      const { layoutedNodes, layoutedEdges } = await getLayoutedElements(
        groupingMode,
        showingRelatedNodes,
        showOnlyConnected,
        searchTerm,
      );
      setNodes(() => layoutedNodes);
      setEdges(() => layoutedEdges);
      setIsLoading(false);
      fitView();
    };

    loadLayout();
  }, [
    fitView,
    groupingMode,
    showingRelatedNodes,
    showOnlyConnected,
    searchTerm,
  ]);

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

  // Handle showing node details
  const handleShowDetails = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(() => ({ ...node }));
        const connected = findConnectedElements(nodeId, edges);
        setHighlightedElements(connected);
      }
    },
    [nodes, edges, findConnectedElements],
  );

  // Handle showing connected nodes only
  const handleShowConnected = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(() => ({ ...node }));
        setShowingRelatedNodes(nodeId);
        setShowOnlyConnected(true); // Show only connected nodes
        // Clear search when showing connected nodes to avoid conflicts
        setSearchInput('');
        setSearchTerm('');
        // Find and set highlighted elements
        setHighlightedElements({ nodeIds: new Set(), edgeIds: new Set() }); // Clear highlights
      }
    },
    [nodes],
  );

  // Handle grouping mode changes
  const handleGroupingModeChange = useCallback((mode: GroupingMode) => {
    setGroupingMode(mode);
    setSelectedNode(undefined); // Clear selection
    setShowingRelatedNodes(null); // Clear related nodes
    setShowOnlyConnected(false); // Show all nodes
    setHighlightedElements({ nodeIds: new Set(), edgeIds: new Set() }); // Clear highlights
  }, []);

  // Handle reset to show all nodes
  const handleReset = useCallback(() => {
    setSelectedNode(undefined);
    setShowingRelatedNodes(null);
    setShowOnlyConnected(false);
    setSearchInput('');
    setSearchTerm('');
    setHighlightedElements({ nodeIds: new Set(), edgeIds: new Set() });
  }, []);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    // Clear selection when searching
    setSelectedNode(undefined);
    setShowingRelatedNodes(null);
    setShowOnlyConnected(false);
    setHighlightedElements({ nodeIds: new Set(), edgeIds: new Set() });
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <div className="w-2/4 relative">
        <GroupSelector
          currentMode={groupingMode}
          onModeChange={handleGroupingModeChange}
          selectedNode={selectedNode}
          showingConnectedNodes={showingRelatedNodes !== null}
          onReset={handleReset}
          searchInput={searchInput}
          onSearchChange={handleSearchChange}
        />
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={{
                default: (props) => (
                  <CustomNode
                    {...props}
                    onShowDetails={handleShowDetails}
                    onShowConnected={handleShowConnected}
                  />
                ),
              }}
              onNodesChange={undefined}
              onEdgesChange={undefined}
              onConnect={undefined}
              onEdgeClick={undefined}
              onNodeDragStop={undefined}
              draggable={false}
              nodesConnectable={false}
              colorMode={'light'}
              fitView
              fitViewOptions={{ padding: 0.5 }}
              minZoom={0.3}
            >
              <Background bgColor="white" variant={BackgroundVariant.Dots} />
              {/* <MiniMap /> */}
              <Controls showInteractive={false} />
            </ReactFlow>
            <Legend />
          </>
        )}
      </div>
      <div className="w-2/4 bg-white shadow-lg">
        <TabPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
};

export default TechTree;
