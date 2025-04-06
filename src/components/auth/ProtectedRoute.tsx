import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Role } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = []
}) => {
  const { isAuthenticated, loading, user, hasAnyRole } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper loading component
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
