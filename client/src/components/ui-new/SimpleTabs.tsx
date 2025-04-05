import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Tab Item interface
export interface TabItemProps {
  id: string;
  label: string;
  content: React.ReactNode;
}

// Tabs Component
export interface SimpleTabsProps {
  tabs: TabItemProps[];
  defaultTabId?: string;
  variant?: 'boxed' | 'lifted' | 'bordered';
  className?: string;
  contentClassName?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  defaultTabId,
  variant = 'boxed',
  className,
  contentClassName,
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || (tabs.length > 0 ? tabs[0].id : ''));

  // Map variant to daisyUI classes
  const variantClass = {
    boxed: 'daisy-tabs-boxed',
    lifted: 'daisy-tabs-lifted',
    bordered: 'daisy-tabs-bordered',
  }[variant];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className={className}>
      <div className={cn('daisy-tabs', variantClass)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'daisy-tab',
              activeTab === tab.id && 'daisy-tab-active'
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={cn('mt-4', contentClassName)}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};