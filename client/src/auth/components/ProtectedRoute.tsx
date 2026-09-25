import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../main';

export const ProtectedRoute: React.FC<{children:React.ReactNode}> = ({children}) => {
 const location=useLocation();
 const access=useQuery({queryKey:['route-access',location.pathname],staleTime:0,queryFn:async()=>{
  const {data}=await supabase!.auth.getUser();if(!data.user)return null;
  const {data:profile,error}=await supabase!.from('profiles').select('role,is_active').eq('id',data.user.id).single();
  if(error||!profile?.is_active)return null;
  return profile.role as string;
 }});
 if(access.isPending)return <div className="p-8">Checking access...</div>;
 if(!access.data || access.error || location.pathname.split('/')[1]!==access.data)return <Navigate to="/login" replace/>;
 return <>{children}</>;
};
