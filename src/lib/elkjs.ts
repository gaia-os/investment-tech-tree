import { DATA } from '@/DATA';
import {
  LABEL_COLORS_VARIABLES,
  NodeLabel,
  UiNode,
  GroupingMode,
} from '@/lib/types';
import { Edge, MarkerType, Position } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeWidth = 150;
const nodeHeight = 80;

export const getLayoutedElements = async (
  groupingMode: GroupingMode = 'None',
  selectedNodeId: string | null = null,
  showOnlyConnected: boolean = false,
  searchTerm: string = '',
): Promise<{
  layoutedNodes: UiNode[];
  layoutedEdges: Edge[];
}> => {
  // Common step: Convert DATA nodes to UiNodes
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  // Route to appropriate layout method
  if (groupingMode === 'None') {
    return getUnGroupedLayout(selectedNodeId, searchTerm, allUiNodes);
  }

  if (selectedNodeId) {
    return getRelatedNodesLayoutWithGrouping(
      selectedNodeId,
      groupingMode,
      showOnlyConnected,
      searchTerm,
      allUiNodes,
    );
  }

  return await getGroupedLayout(groupingMode, searchTerm, allUiNodes);
};

const getUnGroupedLayout = async (
  showingRelatedNodes: string | null = null,
  searchTerm: string = '',
  allUiNodes: UiNode[],
) => {
  // Apply search filter first
  let visibleNodes = filterNodesBySearch(allUiNodes, searchTerm);

  // Filter edges to only include edges between visible nodes
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  let visibleEdges = filterEdgesByVisibleNodes(DATA.edges, visibleNodeIds);

  // If showing related nodes, filter to connected nodes only
  if (showingRelatedNodes) {
    const { connectedNodeIds, connectedEdgeIds } = findConnectedNodesAndEdges(
      showingRelatedNodes,
      visibleEdges,
    );

    // Filter to show only connected nodes
    visibleNodes = allUiNodes.filter((node) => connectedNodeIds.has(node.id));
    visibleEdges = visibleEdges.filter((edge) => connectedEdgeIds.has(edge.id));
  }

  // Prepare UI nodes and layout
  const preparedNodes = prepareUiNodes(visibleNodes);
  return await layoutGraph(
    preparedNodes,
    visibleEdges,
    showingRelatedNodes || undefined,
  );
};

const getRelatedNodesLayoutWithGrouping = async (
  selectedNodeId: string,
  groupingMode: GroupingMode,
  showOnlyConnected: boolean = false,
  searchTerm: string = '',
  allUiNodes: UiNode[],
) => {
  // Use shared function to find connected nodes and edges
  const { connectedNodeIds, connectedEdgeIds } = findConnectedNodesAndEdges(
    selectedNodeId,
    DATA.edges,
  );

  // Also include all other nodes of the same grouping category (only if not showing only connected)
  if (!showOnlyConnected) {
    const nodesOfGroupingType = allUiNodes.filter(
      (node) => node.data.nodeLabel === groupingMode,
    );
    nodesOfGroupingType.forEach((node) => {
      connectedNodeIds.add(node.id);
    });
  }

  // Filter to show connected nodes and nodes of the same category
  const connectedNodes = allUiNodes.filter((node) =>
    connectedNodeIds.has(node.id),
  );

  // Apply search filter and prepare UI nodes
  const filteredConnectedNodes = filterNodesBySearch(
    connectedNodes,
    searchTerm,
  );
  const visibleNodes = prepareUiNodes(filteredConnectedNodes);

  // Filter edges based on visibility rules
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = DATA.edges.filter((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);
    const isConnectedToSelected = connectedEdgeIds.has(edge.id);
    const isBetweenSameCategory = sourceVisible && targetVisible;

    // If showing only connected nodes, only show edges connected to the selected node
    if (showOnlyConnected) {
      return isConnectedToSelected;
    }

    return isConnectedToSelected || isBetweenSameCategory;
  });

  // Layout the visible nodes
  return await layoutGraph(visibleNodes, visibleEdges, selectedNodeId);
};

const getGroupedLayout = async (
  groupingMode: string,
  searchTerm: string,
  allUiNodes: UiNode[],
) => {
  // Filter nodes to only include the grouping type
  const nodesOfGroupingType = allUiNodes.filter(
    (node) => node.data.nodeLabel === groupingMode,
  );

  // Apply search filter and prepare UI nodes
  const filteredNodes = filterNodesBySearch(nodesOfGroupingType, searchTerm);
  const visibleNodes = prepareUiNodes(filteredNodes);

  // Show edges between nodes of the same type
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = filterEdgesByVisibleNodes(DATA.edges, visibleNodeIds);

  return await layoutGraph(visibleNodes, visibleEdges);
};

// Helper function to filter nodes based on search term using regex
const filterNodesBySearch = (nodes: UiNode[], searchTerm: string): UiNode[] => {
  if (!searchTerm.trim()) {
    return nodes;
  }

  try {
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
    return nodes.filter((node) => {
      const label = node.data?.label || '';
      return regex.test(label);
    });
  } catch {
    // If regex is invalid, fall back to simple string matching
    const searchLower = searchTerm.toLowerCase();
    return nodes.filter((node) => {
      const label = node.data?.label || '';
      return label.toLowerCase().includes(searchLower);
    });
  }
};

// Common function to prepare UI nodes with consistent properties
const prepareUiNodes = (nodes: UiNode[]): UiNode[] => {
  return nodes.map((node) => ({
    ...node,
    width: nodeWidth,
    height: nodeHeight,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }));
};

// Common function to filter edges based on visible nodes
const filterEdgesByVisibleNodes = (
  edges: Edge[],
  visibleNodeIds: Set<string>,
): Edge[] => {
  return edges.filter((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);
    return sourceVisible && targetVisible;
  });
};

// Common function to find connected nodes and edges for a given node
const findConnectedNodesAndEdges = (nodeId: string, edges: Edge[]) => {
  const connectedNodeIds = new Set<string>([nodeId]);
  const connectedEdgeIds = new Set<string>();

  edges.forEach((edge) => {
    if (edge.source === nodeId || edge.target === nodeId) {
      connectedEdgeIds.add(edge.id);
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }
  });

  return { connectedNodeIds, connectedEdgeIds };
};

const layoutGraph = async (
  visibleNodes: UiNode[],
  visibleEdges: Edge[],
  selectedNodeId?: string,
) => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: visibleNodes,
    edges: visibleEdges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  // Apply layout positions and styling using shared functions
  const layoutedNodes = visibleNodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);

    const positionedNode = {
      ...node,
      position: {
        x: (layoutedNode?.x || 0) - nodeWidth / 2,
        y: (layoutedNode?.y || 0) - nodeHeight / 2,
      },
    } as UiNode;

    return applyNodeStyling(positionedNode, selectedNodeId);
  });

  const layoutedEdges = visibleEdges.map(applyEdgeStyling);

  return {
    layoutedNodes,
    layoutedEdges,
  };
};

// Common function to apply node styling
const applyNodeStyling = (node: UiNode, selectedNodeId?: string): UiNode => {
  return {
    ...node,
    style: {
      borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel as NodeLabel]}`,
      borderStyle: 'solid',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      borderWidth: node.id === selectedNodeId ? '3px' : '1px',
      boxShadow: node.id === selectedNodeId ? '0 0 0 2px #f97316' : 'none',
      fontWeight: node.id === selectedNodeId ? 'bold' : 'normal',
    },
  } as UiNode;
};

// Common function to apply edge styling
const applyEdgeStyling = (edge: Edge): Edge => {
  return {
    ...edge,
    style: {
      strokeWidth: 1,
      stroke: '#374151',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#374151',
    },
  };
};
