import { DATA } from '@/DATA';
import { LABEL_COLORS_VARIABLES, UiNode } from '@/lib/types';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const nodeWidth = 172;
const nodeHeight = 60;

export const getLayoutedElements = async () => {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'force',
      'elk.spacing.nodeNode': '5',
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
    })),
  };

  const layoutedGraph = await elk.layout(graph);

  const newNodes = DATA.nodes.map((node) => {
    const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
    const newNode = {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
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
