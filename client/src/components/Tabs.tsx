import React from 'react';
import { cn } from '../lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = '',
  fullWidth = false,
}) => {
  const variantStyles = {
    default: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: 'relative px-4 py-3 text-sm font-medium transition-colors',
      active: 'text-primary-600 dark:text-primary-400',
      inactive: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400',
    },
    pills: {
      container: 'gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg',
      tab: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
      active: 'bg-white dark:bg-neutral-900 text-primary-700 dark:text-primary-300 shadow-sm',
      inactive: 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100',
      indicator: '',
    },
    underline: {
      container: 'border-b border-neutral-200 dark:border-neutral-700',
      tab: 'relative px-4 py-3 text-sm font-medium transition-colors',
      active: 'text-primary-600 dark:text-primary-400',
      inactive: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
      indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn(styles.container, className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          id={`${tab.id}-trigger`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            'flex items-center justify-center gap-2',
            styles.tab,
            activeTab === tab.id ? styles.active : styles.inactive,
            tab.disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            fullWidth && 'flex-1'
          )}
        >
          {tab.icon && <span className="w-4 h-4" aria-hidden="true">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded-full',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}

      {variant !== 'pills' && (
        <div
          className={cn(
            styles.indicator,
            'transition-transform duration-200 ease-out'
          )}
          style={{
            transform: `translateX(${tabs.findIndex((t) => t.id === activeTab) * 100}%)`,
            width: `${100 / tabs.length}%`,
          }}
        />
      )}
    </div>
  );
};

// Tab Panel component
export interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, activeTab, children, className = '' }) => {
  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${id}-trigger`}
      className={cn('animate-fade-in', className)}
    >
      {children}
    </div>
  );
};