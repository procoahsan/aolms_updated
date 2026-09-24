import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value?: T;
  placeholder?: string;
  onChange?: (value: T) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  searchable?: boolean;
  multiple?: boolean;
}

export function Dropdown<T = string>({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  disabled = false,
  error = false,
  className = '',
  triggerClassName = '',
  menuClassName = '',
  searchable = false,
  multiple = false,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (optionValue: T) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: T) => {
    if (disabled) return;

    if (multiple && Array.isArray(value)) {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange?.(newValue as T);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const focusableElement = menuRef.current?.querySelector<HTMLElement>('[data-focusable]');
        focusableElement?.focus();
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const opt = options.find((o) => o.value === value[0]);
        return opt?.label || placeholder;
      }
      return `${value.length} selected`;
    }
    if (value) {
      const opt = options.find((o) => o.value === value);
      return opt?.label || placeholder;
    }
    return placeholder;
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-3 h-10 border rounded-md bg-white text-neutral-900',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent',
          'disabled:opacity-50 disabled:pointer-events-none disabled:bg-neutral-100',
          'dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-50 dark:disabled:bg-neutral-800',
          error && 'border-danger-500 focus-visible:ring-danger-500',
          triggerClassName
        )}
      >
        <span className={cn('truncate flex-1 text-left', !value && 'text-neutral-400 dark:text-neutral-500')}>
          {getDisplayValue()}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 flex-shrink-0 text-neutral-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-[100] mt-1.5 w-full max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white shadow-lg',
            'dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-xl',
            'animate-fade-in',
            menuClassName
          )}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-800">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-50"
                autoFocus
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No options found
            </div>
          ) : (
            <ul className="py-1" role="listbox">
              {filteredOptions.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <li
                    key={String(option.value)}
                    role="option"
                    aria-selected={selected}
                    data-focusable
                    tabIndex={-1}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
                        'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                        'focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700',
                        selected && 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300',
                        option.disabled && 'opacity-50 pointer-events-none text-neutral-400 dark:text-neutral-500'
                      )}
                    >
                      {option.icon && <span className="w-5 h-5 flex-shrink-0">{option.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <span className="truncate block">{option.label}</span>
                        {option.description && (
                          <span className="truncate block text-xs text-neutral-500 dark:text-neutral-400">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {selected && (
                        <Check className="w-4 h-4 flex-shrink-0 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Simple Dropdown Menu for actions (not selection)
export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
    divider?: boolean;
  }>;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={triggerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-[100] mt-1.5 min-w-[160px] rounded-md border border-neutral-200 bg-white py-1 shadow-lg',
            'dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-xl',
            'animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && index > 0 && (
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
              )}
              <button
                type="button"
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                role="menuitem"
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700',
                  item.disabled && 'opacity-50 pointer-events-none',
                  item.danger && 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/30'
                )}
              >
                {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};