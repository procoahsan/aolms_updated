import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />,
  error: <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />,
  info: <Info className="w-5 h-5 text-info-600 dark:text-info-400" />,
  default: <Info className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'bg-success-50 dark:bg-success-950/30 border-success-200 dark:border-success-800',
  error: 'bg-danger-50 dark:bg-danger-950/30 border-danger-200 dark:border-danger-800',
  warning: 'bg-warning-50 dark:bg-warning-950/30 border-warning-200 dark:border-warning-800',
  info: 'bg-info-50 dark:bg-info-950/30 border-info-200 dark:border-info-800',
  default: 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 200);
      }, toast.duration ?? 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in',
        'min-w-[300px] max-w-md',
        toastStyles[toast.type],
        isExiting && 'animate-fade-out animate-scale-out pointer-events-none'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">{toastIcons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-50">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onClose(toast.id);
            }}
            className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) =>
    ({ type: 'success' as ToastType, title, message, ...options }),
  error: (title: string, message?: string, options?: Partial<Toast>) =>
    ({ type: 'error' as ToastType, title, message, ...options }),
  warning: (title: string, message?: string, options?: Partial<Toast>) =>
    ({ type: 'warning' as ToastType, title, message, ...options }),
  info: (title: string, message?: string, options?: Partial<Toast>) =>
    ({ type: 'info' as ToastType, title, message, ...options }),
};