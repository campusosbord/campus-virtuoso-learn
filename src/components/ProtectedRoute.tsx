
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute check:', { 
    userId: user?.id, 
    userRole, 
    loading, 
    requiredRole,
    currentPath: location.pathname 
  });

  if (loading) {
    console.log('⏳ ProtectedRoute: Auth is loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user found, redirecting to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log('❌ ProtectedRoute: Insufficient role, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
