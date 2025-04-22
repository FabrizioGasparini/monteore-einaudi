import React from 'react';
import { useSession } from 'next-auth/react';
import Login from '../pages/login';

export const AuthGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

  const { status } = useSession();

  if (status === 'loading') return (<span>Caricamento...</span>)
  if (status === 'unauthenticated') return <Login />;
  
  return <>{children}</>;
};