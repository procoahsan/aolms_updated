import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navItems: Array<{ label: string; path: string; icon: React.ReactNode; disabled?: boolean }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, navItems }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile || isCollapsed) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggleCollapse();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isCollapsed, onToggleCollapse]);

  return (
    <>
    {isMobile && !isCollapsed && (
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        aria-label="Close sidebar"
        onClick={onToggleCollapse}
      />
    )}
    <aside
      id="main-sidebar"
      inert={isMobile && isCollapsed}
      className={cn(
        'fixed md:sticky top-0 left-0 h-screen z-50 md:z-20 shrink-0 transition-all duration-300 ease-in-out border-r border-neutral-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900',
        isCollapsed ? 'w-64 -translate-x-full md:translate-x-0 md:w-16' : 'w-64',
      )}
    >
      <div className="flex flex-col h-full">
        {/* Branding */}
        <div className={cn('flex h-16 items-center border-b border-neutral-200 dark:border-neutral-700', isCollapsed ? 'justify-center px-2' : 'justify-between px-4')}>
          {!isCollapsed && <Link to="/" onClick={() => { if (isMobile) onToggleCollapse(); }} className="flex items-center gap-2" aria-label="AOLMS Home">
            <span className="text-h5 font-semibold text-neutral-900 dark:text-neutral-50">
              AOLMS
            </span>
          </Link>}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            aria-controls="main-sidebar"
          >
            {isCollapsed ? (
              <ChevronRight className="w-6 h-6 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            ) : (
              <ChevronLeft className="w-6 h-6 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
          {navItems.map((item) => (
            item.disabled ? <div key={item.path} aria-disabled="true" title="Not available yet" className="flex cursor-not-allowed items-center gap-3 px-3 py-2.5 text-sm text-neutral-400 opacity-60"><span className="h-5 w-5 shrink-0">{item.icon}</span>{!isCollapsed && item.label}</div> :
            <Link
              key={item.path}
              to={item.path}
              onClick={() => { if (isMobile && !isCollapsed) onToggleCollapse(); }}
              aria-label={item.label}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
              )}
              aria-current={location.pathname === item.path ? 'page' : undefined}
            >
              <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">{item.icon}</span>
              {!isCollapsed && item.label}
            </Link>
          ))}
        </nav>

      </div>
    </aside>
    </>
  );
};
