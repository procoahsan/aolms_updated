import React from 'react';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { LayoutDashboard, FolderKanban, Settings, Presentation } from 'lucide-react';

const ControllerLayout: React.FC = () => {
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
    { label: 'Dashboard', path: '/controller/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, disabled: true },
    { label: 'Projects', path: '/controller/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { label: 'Operations Center', path: '/controller/legacy-operations', icon: <Presentation className="w-5 h-5" /> },
    { label: 'Settings', path: '/controller/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <Layout navItems={navItems} onLogout={handleLogout} />
  );
};

export default ControllerLayout;
