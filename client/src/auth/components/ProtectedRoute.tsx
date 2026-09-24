import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../main';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

type UserRole = 'admin' | 'controller' | 'technician' | null;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data?.role as UserRole;
    } catch (err) {
      console.error('Error fetching user role:', err);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        navigate('/login');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // Get user role from profiles table
      const userRole = await fetchUserRole(user.id);
      setIsLoading(false);

      if (!userRole) {
        // No role found - sign out and redirect to login
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      // Check if the user has the required role for the route
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') && userRole !== 'admin') {
        navigate('/login');
      } else if (currentPath.startsWith('/controller') && userRole !== 'controller') {
        navigate('/login');
      } else if (currentPath.startsWith('/technician') && userRole !== 'technician') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};