import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSession } from '../contexts/SessionContext';

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, role } = useSession();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role !== 'admin') return <Navigate to="/scanner" replace />;
  return <>{children}</>;
};

export const UserRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSession();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};
