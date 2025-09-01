'use client';

import React from 'react';
import { NODE_LABELS, GroupingMode } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GroupSelectorProps {
  currentMode: GroupingMode;
  onModeChange: (mode: GroupingMode) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  const groupingOptions: GroupingMode[] = ['None', ...NODE_LABELS];

  const formatOptionLabel = (option: GroupingMode): string => {
    if (option === 'None') return 'No Grouping';
    return `${option}`;
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm bg-opacity-80">
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
  );
};
