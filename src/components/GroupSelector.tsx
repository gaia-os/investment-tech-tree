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
  searchInput: string;
  onSearchChange: (value: string) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  currentMode,
  onModeChange,
  selectedNode,
  showingConnectedNodes,
  onReset,
  searchInput,
  onSearchChange,
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
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm bg-opacity-80 space-y-3">
          {/* Search Input */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="search-input"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Search:
            </label>
            <div className="flex items-center">
              <input
                id="search-input"
                type="text"
                placeholder="Search nodes..."
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchInput &&  (
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Group By Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="group-selector"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
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
        </div>
      )}
    </div>
  );
};
