import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export interface LayoutProps {
  navItems: Array<{ label: string; path: string; icon: React.ReactNode }>;
  onLogout: () => Promise<void>;
  currentUser?: {
    name: string;
    avatar?: string;
  } | null;
}

export const Layout: React.FC<LayoutProps> = ({ navItems, onLogout, currentUser }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine page title based on current route
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      profiles: 'Users',
      projects: 'Projects',
      'operations-data': 'Operations Data',
      'legacy-operations': 'Operations Center',
      me: 'My Profile',
    };
    return path ? (titles[path] || 'Dashboard') : 'Dashboard';
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        navItems={navItems}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={toggleSidebar}
          title={getPageTitle()}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
