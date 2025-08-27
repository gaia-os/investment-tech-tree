'use client';

import { LABEL_COLORS, UiNode } from '@/lib/types';
import { Manual } from './Manual';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type NodeDetailsProps = { selectedNode?: UiNode };

// Utility function to add line breaks after every 3-4 sentences
const formatTextWithBreaks = (text: string): string => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const formattedParagraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 3) {
    const paragraph = sentences.slice(i, i + 3).join(' ');
    formattedParagraphs.push(paragraph);
  }

  return formattedParagraphs.join('\n\n');
};

const NodeDetails = ({ selectedNode }: NodeDetailsProps) => {
  if (!selectedNode) return <Manual />;

  return (
    <div className="p-4 flex flex-col h-full">
      {!selectedNode && <Manual />}

      {selectedNode && (
        <Card className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-end justify-between space-y-0 pb-4 gap-4 border-b-2 mb-4">
            <CardTitle className="text-lg font-bold">
              {selectedNode.data.label}
            </CardTitle>
            <Badge
              variant="secondary"
              className={`bg-${LABEL_COLORS[selectedNode.data.nodeLabel]}`}
            >
              {selectedNode.data.nodeLabel}
            </Badge>
          </CardHeader>

          <CardContent className="overflow-auto flex-grow space-y-4">
            {typeof selectedNode.data.trl_current === 'string' && (
              <div className="space-y-2 pb-2 border-b-2">
                <h4 className="font-semibold text-sm text-gray-700">
                  TRL Current
                </h4>
                <p className="text-sm">{selectedNode.data.trl_current}</p>
              </div>
            )}

            {typeof selectedNode.data.subtype === 'string' && (
              <div className="space-y-2 pb-2 border-b-2">
                <h4 className="font-semibold text-sm text-gray-700">Subtype</h4>
                <p className="text-sm">{selectedNode.data.subtype}</p>
              </div>
            )}

            {typeof selectedNode.data.trl_projected_5_10_years === 'string' && (
              <div className="space-y-2 pb-2 border-b-2">
                <h4 className="font-semibold text-sm text-gray-700">
                  TRL Projected (5-10 years)
                </h4>
                <p className="text-sm">
                  {selectedNode.data.trl_projected_5_10_years}
                </p>
              </div>
            )}

            {typeof selectedNode.data.detailedDescription === 'string' && (
              <div className="space-y-2">
                <Accordion type="single" collapsible>
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-sm font-semibold text-gray-700">
                      Description
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {formatTextWithBreaks(
                          selectedNode.data.detailedDescription,
                        )}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NodeDetails;
