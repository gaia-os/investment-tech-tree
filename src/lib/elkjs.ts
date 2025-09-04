import { DATA } from '@/DATA';
import {
  LABEL_COLORS_VARIABLES,
  NodeLabel,
  UiNode,
  GroupingMode,
  GroupNode,
} from '@/lib/types';
import { Edge, MarkerType } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeWidth = 150;
const nodeHeight = 50;
const groupNodeWidth = 200;
const groupNodeHeight = 60;

export const getLayoutedElements = async (
  groupingMode: GroupingMode = 'None',
  expandedGroups: Set<string> = new Set(),
  showingRelatedNodes: string | null = null,
  showOnlyConnected: boolean = false,
): Promise<{
  layoutedNodes: UiNode[];
  layoutedEdges: Edge[];
}> => {
  // If no grouping, use original logic
  if (groupingMode === 'None') {
    return getUnGroupedLayout(showingRelatedNodes, showOnlyConnected);
  }

  // Convert DATA nodes to UiNodes first
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  // If showing related nodes for a specific node, show that node and all its connections
  // BUT also include other nodes of the selected grouping category
  if (showingRelatedNodes) {
    return getRelatedNodesLayoutWithGrouping(
      showingRelatedNodes,
      groupingMode,
      showOnlyConnected,
    );
  }

  // Filter nodes to only include the grouping type
  const nodesOfGroupingType = allUiNodes.filter(
    (node) => node.data.nodeLabel === groupingMode,
  );

  // Always show all nodes of the selected type directly (Issue 1 fix)
  const visibleNodes: UiNode[] = [];
  const visibleEdges: Edge[] = [];

  // Add all nodes of the grouping type directly
  nodesOfGroupingType.forEach((node) => {
    visibleNodes.push({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: 'left',
      sourcePosition: 'right',
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

  // Layout the visible nodes
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: visibleNodes.map((node) => ({
      ...node,
    })),
    edges: visibleEdges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const layoutedNodes = visibleNodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    const isGroupNode = node.data.isGroup;

    const newNode = {
      ...node,
      position: {
        x:
          (layoutedNode?.x || 0) -
          (isGroupNode ? groupNodeWidth : nodeWidth) / 2,
        y:
          (layoutedNode?.y || 0) -
          (isGroupNode ? groupNodeHeight : nodeHeight) / 2,
      },
      style: {
        borderColor: isGroupNode
          ? '#6366f1'
          : `${LABEL_COLORS_VARIABLES[node.data.nodeLabel as NodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontWeight: isGroupNode ? 'bold' : 'normal',
        backgroundColor: isGroupNode ? '#f8fafc' : 'white',
        borderWidth: isGroupNode ? '2px' : '1px',
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

// Helper function for showing related nodes layout with grouping preservation (Issue 2 fix)
const getRelatedNodesLayoutWithGrouping = async (
  selectedNodeId: string,
  groupingMode: GroupingMode,
  showOnlyConnected: boolean = false,
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
  if (!showOnlyConnected) {
    const nodesOfGroupingType = allUiNodes.filter(
      (node) => node.data.nodeLabel === groupingMode,
    );
    nodesOfGroupingType.forEach((node) => {
      connectedNodeIds.add(node.id);
    });
  }

  // Filter to show connected nodes and nodes of the same category
  const visibleNodes = allUiNodes
    .filter((node) => connectedNodeIds.has(node.id))
    .map((node) => ({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: 'left',
      sourcePosition: 'right',
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
};

// Helper function for showing related nodes layout (original function kept for reference)
const getRelatedNodesLayout = async (selectedNodeId: string) => {
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

  // Filter to show only connected nodes
  const visibleNodes = allUiNodes
    .filter((node) => connectedNodeIds.has(node.id))
    .map((node) => ({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: 'left',
      sourcePosition: 'right',
    }));

  // Filter to show only connected edges
  const visibleEdges = DATA.edges.filter((edge) =>
    connectedEdgeIds.has(edge.id),
  );

  // Layout the visible nodes
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
};

// Helper function for ungrouped layout
const getUnGroupedLayout = async (
  showingRelatedNodes: string | null = null,
  showOnlyConnected: boolean = false,
) => {
  // Convert DATA nodes to UiNodes first
  const allUiNodes = DATA.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
    },
  })) as UiNode[];

  let visibleNodes = allUiNodes;
  let visibleEdges = DATA.edges;

  // If showing related nodes, filter to connected nodes only
  if (showingRelatedNodes) {
    const connectedNodeIds = new Set<string>();
    const connectedEdgeIds = new Set<string>();

    // Add the selected node itself
    connectedNodeIds.add(showingRelatedNodes);

    // Find all edges connected to this node
    DATA.edges.forEach((edge) => {
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
    visibleEdges = DATA.edges.filter((edge) => connectedEdgeIds.has(edge.id));
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
      targetPosition: 'left',
      sourcePosition: 'right',
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
