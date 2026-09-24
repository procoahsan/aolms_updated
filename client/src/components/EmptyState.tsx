import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './Button';
import type { ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-4', className)}>
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-6 text-neutral-400 dark:text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-h5 text-neutral-900 dark:text-neutral-50 mb-2">{title}</h3>
      {description && (
        <p className="text-body-md text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              className="w-full sm:w-auto"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common scenarios

export const EmptyStatePresets = {
  noTasks: () => (
    <EmptyState
      icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
      title="No tasks assigned"
      description="You're all caught up! New tasks will appear here when assigned."
    />
  ),

  noHistory: () => (
    <EmptyState
      icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      title="No completed tasks"
      description="Your completed tasks will appear here once you submit them."
    />
  ),

  noOrders: () => (
    <EmptyState
      icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
      title="No orders found"
      description="Try changing your filters or search criteria."
      action={{ label: 'Clear filters', onClick: () => {} }}
    />
  ),

  noUsers: () => (
    <EmptyState
      icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
      title="No users found"
      description="Get started by adding a new user to the system."
      action={{ label: 'Add user', onClick: () => {} }}
    />
  ),

  noResults: (searchTerm?: string) => (
    <EmptyState
      icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
      title="No results found"
      description={searchTerm ? `No matches for "${searchTerm}"` : 'No results match your current filters.'}
      action={{ label: 'Clear search', onClick: () => {} }}
    />
  ),
};