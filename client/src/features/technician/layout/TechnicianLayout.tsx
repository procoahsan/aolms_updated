import React from 'react';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { LayoutDashboard, ClipboardCheck, History, Settings } from 'lucide-react';

const TechnicianLayout: React.FC = () => {
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
    { label: 'Dashboard', path: '/technician/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'To-Do', path: '/technician/todo', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Audit', path: '/technician/audit', icon: <History className="w-5 h-5" /> },
    { label: 'Settings', path: '/technician/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <Layout navItems={navItems} onLogout={handleLogout} />
  );
};

export default TechnicianLayout;
