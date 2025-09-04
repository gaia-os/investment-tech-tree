'use client';

import React from 'react';
import { NODE_LABELS, GroupingMode, UiNode } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface GroupSelectorProps {
  currentMode: GroupingMode;
  onModeChange: (mode: GroupingMode) => void;
  selectedNode?: UiNode;
  showingConnectedNodes: boolean;
  onReset: () => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  currentMode,
  onModeChange,
  selectedNode,
  showingConnectedNodes,
  onReset,
}) => {
  const groupingOptions: GroupingMode[] = ['None', ...NODE_LABELS];

  const formatOptionLabel = (option: GroupingMode): string => {
    if (option === 'None') return 'No Grouping';
    return `${option}`;
  };

  const shouldShowReset = selectedNode !== undefined && showingConnectedNodes;

  return (
    <div className="absolute top-4 right-4 z-10">
      {shouldShowReset ? (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm bg-opacity-80">
          <Button variant="outline" size="sm" onClick={onReset}>
            Reset to Show All Nodes
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm bg-opacity-80">
          <label
            htmlFor="group-selector"
            className="text-sm font-medium text-gray-700"
          >
            Group By:
          </label>
          <Select value={currentMode} onValueChange={onModeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select grouping mode" />
            </SelectTrigger>
            <SelectContent>
              {groupingOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
