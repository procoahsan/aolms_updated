import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'modal' | 'page';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  code,
  onRetry,
  onDismiss,
  variant = 'inline',
  className = '',
}) => {
  const variantStyles = {
    inline: 'p-4 bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 rounded-lg',
    modal: 'p-6',
    page: 'flex flex-col items-center justify-center min-h-[60vh] px-4 text-center',
  };

  return (
    <div className={cn(variantStyles[variant], className)} role="alert">
      {variant !== 'inline' && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-100 dark:bg-danger-950 mb-4 text-danger-600 dark:text-danger-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}

      <div className={variant === 'inline' ? 'flex items-start gap-3' : 'space-y-3'}>
        {variant === 'inline' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-danger-100 dark:bg-danger-950 flex items-center justify-center text-danger-600 dark:text-danger-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}

        <div className={variant === 'inline' ? 'flex-1' : ''}>
          <h3 className={cn('font-medium', variant === 'inline' ? 'text-neutral-900 dark:text-neutral-50' : 'text-h5 text-neutral-900 dark:text-neutral-50')}>
            {title}
          </h3>
          <p className={cn('mt-1', variant === 'inline' ? 'text-sm text-neutral-600 dark:text-neutral-400' : 'text-body-md text-neutral-600 dark:text-neutral-400')}>
            {message}
          </p>
          {code && (
            <p className={cn('mt-2 text-xs font-mono', variant === 'inline' ? 'text-neutral-500 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-500')}>
              Error code: {code}
            </p>
          )}
        </div>

        {variant === 'inline' && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {(onRetry || onDismiss) && variant !== 'inline' && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      )}

      {onRetry && variant === 'inline' && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Try Again
        </Button>
      )}
    </div>
  );
};

// Pre-configured error states

export const ErrorStatePresets = {
  networkError: (onRetry?: () => void) => (
    <ErrorState
      title="Connection lost"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  ),

  serverError: (onRetry?: () => void) => (
    <ErrorState
      title="Server error"
      message="Something went wrong on our end. Our team has been notified. Please try again in a moment."
      onRetry={onRetry}
    />
  ),

  notFound: (resource = 'The requested resource') => (
    <ErrorState
      title="Not found"
      message={`${resource} could not be found.`}
      variant="page"
    />
  ),

  unauthorized: () => (
    <ErrorState
      title="Access denied"
      message="You don't have permission to access this resource. Please contact your administrator if you believe this is an error."
      variant="page"
    />
  ),

  validationError: (message: string) => (
    <ErrorState
      title="Invalid input"
      message={message}
    />
  ),

  saveFailed: (onRetry?: () => void) => (
    <ErrorState
      title="Save failed"
      message="Unable to save your changes. Please try again."
      onRetry={onRetry}
    />
  ),

  submitFailed: (onRetry?: () => void) => (
    <ErrorState
      title="Submission failed"
      message="Unable to submit the form. Please check your entries and try again."
      onRetry={onRetry}
    />
  ),
};