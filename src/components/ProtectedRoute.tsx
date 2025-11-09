import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Loader2 } from 'lucide-react';
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isAuthLoading = useAuthStore(state => state.isAuthLoading);
  const checkSession = useAuthStore(state => state.checkSession);
  useEffect(() => {
    // This effect is mainly for cases where the user lands directly on a protected route
    // after a page refresh, ensuring the session is checked.
    checkSession();
  }, [checkSession]);
  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}