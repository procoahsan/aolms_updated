import React from 'react';
import { cn } from '../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-400',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-400',
  info: 'bg-info-50 text-info-700 dark:bg-info-950 dark:text-info-400',
  neutral: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

const dotColors = {
  default: 'bg-neutral-400',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-neutral-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
};

// Status badge variants for common application statuses
export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' | 'lg' }> = ({
  status,
  size = 'md',
}) => {
  const statusMap: Record<string, { label: string; variant: BadgeProps['variant']; dot: boolean }> = {
    draft: { label: 'Draft', variant: 'neutral', dot: true },
    pending: { label: 'Pending', variant: 'warning', dot: true },
    assigned: { label: 'Assigned', variant: 'info', dot: true },
    delivered: { label: 'Delivered', variant: 'default', dot: true },
    submitted: { label: 'Submitted', variant: 'default', dot: true },
    completed: { label: 'Completed', variant: 'success', dot: true },
    locked: { label: 'Locked', variant: 'neutral', dot: false },
    cancelled: { label: 'Cancelled', variant: 'danger', dot: false },
    active: { label: 'Active', variant: 'success', dot: true },
    inactive: { label: 'Inactive', variant: 'neutral', dot: false },
    in_progress: { label: 'In Progress', variant: 'warning', dot: true },
    resolved: { label: 'Resolved', variant: 'success', dot: true },
    open: { label: 'Open', variant: 'info', dot: true },
    closed: { label: 'Closed', variant: 'neutral', dot: false },
  };

  const config = statusMap[status] || { label: status, variant: 'default', dot: false };

  return (
    <Badge variant={config.variant} size={size} dot={config.dot}>
      {config.label}
    </Badge>
  );
};