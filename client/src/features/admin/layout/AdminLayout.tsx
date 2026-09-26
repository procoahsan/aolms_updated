import React from 'react';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { LayoutDashboard, Users, FolderKanban, Database, Presentation } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/login');
      return;
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/profiles', icon: <Users className="w-5 h-5" /> },
    { label: 'Projects', path: '/admin/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { label: 'Operations Data', path: '/admin/operations-data', icon: <Database className="w-5 h-5" /> },
    { label: 'Operations Center', path: '/admin/legacy-operations', icon: <Presentation className="w-5 h-5" /> },
  ];

  return (
    <Layout
      navItems={navItems}
      onLogout={handleLogout}
    />
  );
};

export default AdminLayout;
