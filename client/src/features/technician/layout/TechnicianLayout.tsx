import React from 'react';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { ClipboardCheck, History } from 'lucide-react';

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
    { label: 'To-Do', path: '/technician/todo', icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Submitted Orders', path: '/technician/submitted', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <Layout navItems={navItems} onLogout={handleLogout} />
  );
};

export default TechnicianLayout;
