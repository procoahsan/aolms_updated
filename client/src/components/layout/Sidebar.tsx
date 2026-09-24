import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navItems: Array<{ label: string; path: string; icon: React.ReactNode }>;
  onLogout: () => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, navItems, onLogout }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      onToggleCollapse();
    }
  }, [location.pathname, isMobile, isCollapsed, onToggleCollapse]);

  return (
    <aside
      className={cn(
        'fixed md:sticky top-0 left-0 h-screen z-20 transition-all duration-300 ease-in-out border-r border-neutral-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-900',
        isCollapsed ? 'w-16 -translate-x-full md:-translate-x-0 md:w-16' : 'w-64',
        isMobile && isCollapsed && 'translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Branding */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <Link to="/" className="flex items-center gap-2" aria-label="AOLMS Home">
            <span className="text-h5 font-semibold text-neutral-900 dark:text-neutral-50">
              AOLMS
            </span>
          </Link>
          <button
            onClick={onToggleCollapse}
            className={cn(
              'md:hidden p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
              isCollapsed ? 'rotate-180' : ''
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
            <Link
              key={item.path}
              to={item.path}
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

        {/* User/Profile area */}
        <div className="border-t mt-auto p-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <User className="w-8 h-8 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
            {!isCollapsed && <span className="text-sm font-medium">Profile</span>}
          </div>
          <button
            onClick={onLogout}
            className={cn(
              'mt-2 flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            {!isCollapsed && 'Sign out'}
          </button>
        </div>
      </div>
    </aside>
  );
};