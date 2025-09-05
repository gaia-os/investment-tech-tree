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
  } catch (error) {
    // If regex is invalid, fall back to simple string matching
    const searchLower = searchTerm.toLowerCase();
    return nodes.filter((node) => {
      const label = node.data?.label || '';
      return label.toLowerCase().includes(searchLower);
    });
  }
};

export const getLayoutedElements = async (
  groupingMode: GroupingMode = 'None',
  showingRelatedNodes: string | null = null,
  showOnlyConnected: boolean = false,
  searchTerm: string = '',
): Promise<{
  layoutedNodes: UiNode[];
  layoutedEdges: Edge[];
}> => {
  // If no grouping, use original logic
  if (groupingMode === 'None') {
    return getUnGroupedLayout(showingRelatedNodes, searchTerm);
  }
  // If showing related nodes for a specific node, show that node and all its connections
  if (showingRelatedNodes) {
    return getRelatedNodesLayoutWithGrouping(
      showingRelatedNodes,
      groupingMode,
      showOnlyConnected,
      searchTerm,
    );
  }

  // Convert DATA nodes to UiNodes first
  return await getGroupedLayout(groupingMode, searchTerm);
};

const getRelatedNodesLayoutWithGrouping = async (
  selectedNodeId: string,
  groupingMode: GroupingMode,
  showOnlyConnected: boolean = false,
  searchTerm: string = '',
) => {
  // Convert DATA nodes to UiNodes first
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  // Find all connected nodes and edges
  const connectedNodeIds = new Set<string>();
  const connectedEdgeIds = new Set<string>();

  // Add the selected node itself
  connectedNodeIds.add(selectedNodeId);

  // Find all edges connected to this node
  DATA.edges.forEach((edge) => {
    if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
      connectedEdgeIds.add(edge.id);
      // Add connected nodes
      if (edge.source === selectedNodeId) {
        connectedNodeIds.add(edge.target);
      }
      if (edge.target === selectedNodeId) {
        connectedNodeIds.add(edge.source);
      }
    }
  });

  // Also include all other nodes of the same grouping category (only if not showing only connected)
  // Currently showOnlyConnected is always true
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

  // Apply search filter to connected nodes
  const filteredConnectedNodes = filterNodesBySearch(
    connectedNodes,
    searchTerm,
  );

  const visibleNodes: UiNode[] = filteredConnectedNodes.map((node) => ({
    ...node,
    width: nodeWidth,
    height: nodeHeight,
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  }));

  // Filter to show connected edges and edges between nodes of the same category
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = DATA.edges.filter((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);

    // Show edge if it's connected to the selected node OR if it's between nodes of the same category
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

// Helper function for ungrouped layout
const getUnGroupedLayout = async (
  showingRelatedNodes: string | null = null,
  searchTerm: string = '',
) => {
  // Convert DATA nodes to UiNodes first
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  // Apply search filter first
  let visibleNodes = filterNodesBySearch(allUiNodes, searchTerm);

  // Filter edges to only include edges between visible nodes
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  let visibleEdges = DATA.edges.filter((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);
    return sourceVisible && targetVisible;
  });

  // If showing related nodes, filter to connected nodes only
  if (showingRelatedNodes) {
    const connectedNodeIds = new Set<string>();
    const connectedEdgeIds = new Set<string>();

    // Add the selected node itself
    connectedNodeIds.add(showingRelatedNodes);

    // Find all edges connected to this node (from the already filtered edges)
    visibleEdges.forEach((edge) => {
      if (
        edge.source === showingRelatedNodes ||
        edge.target === showingRelatedNodes
      ) {
        connectedEdgeIds.add(edge.id);
        // Add connected nodes
        if (edge.source === showingRelatedNodes) {
          connectedNodeIds.add(edge.target);
        }
        if (edge.target === showingRelatedNodes) {
          connectedNodeIds.add(edge.source);
        }
      }
    });

    // Filter to show only connected nodes
    visibleNodes = allUiNodes.filter((node) => connectedNodeIds.has(node.id));
    visibleEdges = visibleEdges.filter((edge) => connectedEdgeIds.has(edge.id));
  }

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: visibleNodes.map((node) => ({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    })),
    edges: visibleEdges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = graph.children.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);

    const newNode = {
      ...node,
      position: {
        x: (layoutedNode?.x || 0) - nodeWidth / 2,
        y: (layoutedNode?.y || 0) - nodeHeight / 2,
      },
      style: {
        borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel as NodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // Highlight the selected node
        borderWidth: node.id === showingRelatedNodes ? '3px' : '1px',
        boxShadow:
          node.id === showingRelatedNodes ? '0 0 0 2px #f97316' : 'none',
        fontWeight: node.id === showingRelatedNodes ? 'bold' : 'normal',
      },
    } as UiNode;

    return newNode;
  });

  const layoutedEdges = visibleEdges.map((edge) => {
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
  }) as Edge[];

  return {
    layoutedNodes,
    layoutedEdges,
  };
};
const getGroupedLayout = async (groupingMode: string, searchTerm: string) => {
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  // Filter nodes to only include the grouping type
  const nodesOfGroupingType = allUiNodes.filter(
    (node) => node.data.nodeLabel === groupingMode,
  );

  // Apply search filter to the grouped nodes
  const filteredNodes = filterNodesBySearch(nodesOfGroupingType, searchTerm);

  // Always show all nodes of the selected type directly
  const visibleNodes: UiNode[] = [];
  const visibleEdges: Edge[] = [];

  // Add all filtered nodes of the grouping type directly
  filteredNodes.forEach((node) => {
    visibleNodes.push({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    });
  });

  // Show edges between nodes of the same type
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  DATA.edges.forEach((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source);
    const targetVisible = visibleNodeIds.has(edge.target);

    // Show edges between visible nodes of the same type
    if (sourceVisible && targetVisible) {
      visibleEdges.push(edge);
    }
  });

  return await layoutGraph(visibleNodes, visibleEdges);
};

async function layoutGraph(
  visibleNodes: UiNode[],
  visibleEdges: Edge[],
  selectedNodeId?: string,
) {
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

  const layoutedNodes = visibleNodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);

    const newNode = {
      ...node,
      position: {
        x: (layoutedNode?.x || 0) - nodeWidth / 2,
        y: (layoutedNode?.y || 0) - nodeHeight / 2,
      },
      style: {
        borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel as NodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        // Highlight the selected node
        borderWidth: node.id === selectedNodeId ? '3px' : '1px',
        boxShadow: node.id === selectedNodeId ? '0 0 0 2px #f97316' : 'none',
        fontWeight: node.id === selectedNodeId ? 'bold' : 'normal',
      },
    } as UiNode;

    return newNode;
  });

  const layoutedEdges = visibleEdges.map((edge) => {
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
  }) as Edge[];

  return {
    layoutedNodes,
    layoutedEdges,
  };
}
