import { supabase } from '@/lib/supabase-browser';

export async function authenticatedFetch(input, init = {}) {
  const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
  const token = data.session?.access_token;

  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
