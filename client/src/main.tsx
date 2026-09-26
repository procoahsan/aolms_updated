import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import App from './App';
import './index.css';

// Create a Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create a QueryClient instance
const queryClient = new QueryClient();
let cachedUserId: string | null | undefined;
supabase?.auth.onAuthStateChange((_event, session) => {
  const userId = session?.user.id ?? null;
  if (cachedUserId !== undefined && cachedUserId !== userId) queryClient.clear();
  cachedUserId = userId;
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
