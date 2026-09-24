import React, { useState } from 'react';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { LayoutDashboard, Users, FolderKanban, Database, Presentation } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | null>(null);

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/login');
      return;
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Fetch current user
  const { data: userProfile } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!supabase) return null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (error) return null;
      return data;
    },
  });

  React.useEffect(() => {
    if (userProfile) {
      setCurrentUser({
        name: userProfile.full_name,
        avatar: userProfile.email?.charAt(0).toUpperCase(),
      });
    }
  }, [userProfile]);

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
      currentUser={currentUser}
    />
  );
};

export default AdminLayout;
