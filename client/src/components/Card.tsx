import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm',
    elevated: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md',
    outlined: 'bg-transparent border-2 border-neutral-200 dark:border-neutral-700',
    filled: 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-shadow duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-h5 text-neutral-900 dark:text-neutral-50">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-body-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};