import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
  loginPath: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
  loginPath,
}) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  const isAuthorized =
    role === allowedRole ||
    (role === 'admin' && allowedRole === 'staff') ||
    (role === 'guest' && allowedRole === 'customer');

  if (!isAuthorized) {
    return (
      <Navigate
        to={loginPath}
        state={{
          unauthorized: true,
          message: `You do not have permission to access the ${allowedRole.toUpperCase()} Portal.`,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};
