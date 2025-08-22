import { Edge, Node } from '@xyflow/react';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = Node<Record<string, unknown> & NodeProperties>;

export type DataNode = Pick<UiNode, 'id' | 'data'>;

export interface NodesAndEdges {
  nodes: DataNode[];
  edges: Edge[];
}

export const NODE_LABELS = [
  'ReactorConcept',
  'Milestone',
  'EnablingTechnology',
] as const;

export type NodeLabel = (typeof NODE_LABELS)[number];

export const LABEL_COLORS: Record<NodeLabel, string> = {
  ['ReactorConcept']: 'blue-500',
  ['Milestone']: 'green-500',
  ['EnablingTechnology']: 'red-500',
};

export const LABEL_COLORS_VARIABLES: Record<NodeLabel, string> = {
  ['ReactorConcept']: 'oklch(62.3% 0.214 259.815)',
  ['Milestone']: 'oklch(72.3% 0.219 149.579)',
  ['EnablingTechnology']: 'oklch(0.637 0.237 25.331)',
};
