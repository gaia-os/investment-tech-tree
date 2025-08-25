import { DATA } from '@/DATA';
import { LABEL_COLORS_VARIABLES, UiNode } from '@/lib/types';
import { MarkerType, Position } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeWidth = 172;
const nodeHeight = 60;

// Helper function to calculate the angle between two points
const calculateAngle = (
  source: { x: number; y: number },
  target: { x: number; y: number },
): number => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

// Helper function to determine the best handle position based on angle
const getOptimalHandlePosition = (
  angle: number,
): { sourcePosition: Position; targetPosition: Position } => {
  // Normalize angle to 0-360 degrees
  const normalizedAngle = (angle + 360) % 360;

  // Define quadrants for handle selection
  // Right: -45 to 45 degrees
  // Down: 45 to 135 degrees
  // Left: 135 to 225 degrees
  // Up: 225 to 315 degrees

  if (normalizedAngle >= 315 || normalizedAngle < 45) {
    // Edge goes right
    return { sourcePosition: Position.Right, targetPosition: Position.Left };
  } else if (normalizedAngle >= 45 && normalizedAngle < 135) {
    // Edge goes down
    return { sourcePosition: Position.Bottom, targetPosition: Position.Top };
  } else if (normalizedAngle >= 135 && normalizedAngle < 225) {
    // Edge goes left
    return { sourcePosition: Position.Left, targetPosition: Position.Right };
  } else {
    // Edge goes up
    return { sourcePosition: Position.Top, targetPosition: Position.Bottom };
  }
};

export const getLayoutedElements = async () => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '10',
      // 'elk.spacing.edgeNode': '10',
      // 'elk.spacing.edgeEdge': '100',
      'elk.force.iterations': '1000',
      'elk.force.repulsion': '50',
      'elk.force.gravity': '0.3',
      'elk.force.quality': 'draft',
    },
    children: DATA.nodes.map((node) => ({
      id: node.id,
      width: nodeWidth,
      height: nodeHeight,
    })),
    edges: DATA.edges.map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      sources: [edge.source],
      targets: [edge.target],
              strokeWidth: 1,
        stroke: '#374151',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#374151',
        },
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  // Create a map of node positions for handle calculation
  const nodePositions = new Map<string, { x: number; y: number }>();
  layoutedGraph.children?.forEach((layoutedNode) => {
    nodePositions.set(layoutedNode.id, {
      x: layoutedNode.x || 0,
      y: layoutedNode.y || 0,
    });
  });

  // Calculate optimal handle positions for each edge
  const edgeHandles = new Map<
    string,
    { sourcePosition: Position; targetPosition: Position }
  >();
  DATA.edges.forEach((edge) => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);

    if (sourcePos && targetPos) {
      const angle = calculateAngle(sourcePos, targetPos);
      const handles = getOptimalHandlePosition(angle);
      edgeHandles.set(`${edge.source}-${edge.target}`, handles);
    }
  });

  // Group handle positions by node to find the most common/optimal ones
  const nodeHandleUsage = new Map<
    string,
    {
      asSource: Map<Position, number>;
      asTarget: Map<Position, number>;
    }
  >();

  // Determine primary handle positions for each node
  const getPreferredHandle = (
    handleMap: Map<Position, number>,
    fallback: Position,
  ): Position => {
    if (handleMap.size === 0) return fallback;
    return [...handleMap.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const newNodes = DATA.nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    const usage = nodeHandleUsage.get(node.id);

    const newNode = {
      ...node,
      // targetPosition: getPreferredHandle(
      //   usage?.asTarget || new Map(),
      //   Position.Top,
      // ),
      // sourcePosition: getPreferredHandle(
      //   usage?.asSource || new Map(),
      //   Position.Bottom,
      // ),
      position: {
        x: (layoutedNode?.x || 0) - nodeWidth / 2,
        y: (layoutedNode?.y || 0) - nodeHeight / 2,
      },
      style: {
        borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
      },
    } as UiNode;

    return newNode;
  });

  return { layoutedNodes: newNodes, layoutedEdges: DATA.edges };
};
