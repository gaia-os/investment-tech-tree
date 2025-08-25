'use client';

import { LABEL_COLORS, UiNode } from '@/lib/types';
import { Manual } from './Manual';

type NodeDetailsProps = { selectedNode?: UiNode };

const NodeDetails = ({ selectedNode }: NodeDetailsProps) => {
  if (!selectedNode) return <Manual />;

  return (
    <div className="p-4 mb flex flex-col h-full shadow-md">
      {!selectedNode && <Manual />}

      {selectedNode && (
        <>
          <div className="flex justify-between items-end border-b border-gray-300 pb-2 gap-4">
            <h3 className="text-lg font-bold">{selectedNode.data.label}</h3>

            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded bg-${LABEL_COLORS[selectedNode.data.nodeLabel]}`}
            >
              {selectedNode.data.nodeLabel}
            </span>
          </div>
          <div className="overflow-auto flex-grow">
            {typeof selectedNode.data.trl_current === 'string' && (
              <div className="p-2 border-b border-gray-200 mt-2">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">
                  TRL Current
                </h4>
                <p className="text-sm">{selectedNode.data.trl_current}</p>
              </div>
            )}

            {typeof selectedNode.data.subtype === 'string' && (
              <div className="p-2 border-b border-gray-200 mt-2">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">
                  Subtype
                </h4>
                <p className="text-sm">{selectedNode.data.subtype}</p>
              </div>
            )}

            {typeof selectedNode.data.trl_projected_5_10_years === 'string' && (
              <div className="p-2 border-b border-gray-200 mt-2">
                <h4 className="font-semibold text-sm text-gray-700 mb-1">
                  TRL Projected (5-10 years)
                </h4>
                <p className="text-sm">
                  {selectedNode.data.trl_projected_5_10_years}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NodeDetails;
