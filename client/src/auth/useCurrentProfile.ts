import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../main';

export function useCurrentProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase?.auth.getSession().then(({ data }) => {
      if (mounted) setUserId(data.session?.user.id ?? null);
    });
    const listener = supabase?.auth.onAuthStateChange((_event, session) => setUserId(session?.user.id ?? null));
    return () => { mounted = false; listener?.data.subscription.unsubscribe(); };
  }, []);
  const profile = useQuery({
    queryKey: ['signed-in-profile', userId], enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase!.from('profiles').select('full_name,email').eq('id', userId!).single();
      if (error) throw error;
      return data;
    },
  });
  return profile.data ? { name: profile.data.full_name || profile.data.email, avatar: (profile.data.full_name || profile.data.email || 'U').charAt(0).toUpperCase() } : null;
}
