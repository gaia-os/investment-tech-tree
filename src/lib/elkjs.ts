import { DATA } from '@/DATA';
import { LABEL_COLORS_VARIABLES, UiNode } from '@/lib/types';
import { Edge, MarkerType, Position } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeWidth = 150;
const nodeHeight = 50;

export const getLayoutedElements: () => Promise<{
  layoutedNodes: UiNode[];
  layoutedEdges: Edge[];
}> = async () => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      // 'elk.spacing.nodeNode': '10',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    },
    children: DATA.nodes.map((node) => ({
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      targetPosition: 'left',
      sourcePosition: 'right',
    })),
    edges: DATA.edges.map((edge) => ({
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
        borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      },
    } as UiNode;

    return newNode;
  });

  const layoutedEdges = DATA.edges.map((edge) => {
    return {
      ...edge,
      sources: [edge.source],
      targets: [edge.target],
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
