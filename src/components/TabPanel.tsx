'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import NodeDetails from './NodeDetails';
import Chat from './Chat';
import { UiNode, ChatContext } from '@/lib/types';

interface TabPanelProps {
  selectedNode?: UiNode;
  chatContext: ChatContext;
}

type TabType = 'details' | 'chat';

const TabPanel = ({ selectedNode, chatContext }: TabPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const previousNodeIdRef = useRef<string | undefined>(undefined);

  // Switch to details tab when a new node is selected while chat is active
  useEffect(() => {
    if (
      selectedNode &&
      activeTab === 'chat' &&
      previousNodeIdRef.current !== selectedNode.id
    ) {
      setActiveTab('details');
    }
    previousNodeIdRef.current = selectedNode?.id;
  }, [selectedNode, activeTab]);

  const tabs = [
    { id: 'details' as const, label: 'Node Details', icon: Info },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'details' ? (
          <NodeDetails selectedNode={selectedNode} />
        ) : (
          <Chat context={chatContext} />
        )}
      </div>
    </div>
  );
};

export default TabPanel;
