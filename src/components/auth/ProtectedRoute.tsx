import React, { useEffect, useState } from 'react';
import authService from '@/utils/authService';
import AuthPage from './AuthPage';
import Icon from '@/components/ui/icon';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthentication = async () => {
    try {
      const isAuth = await authService.checkAuth();
      setIsAuthenticated(isAuth);
      
      // Check role requirements if specified
      if (isAuth && requiredRole) {
        const hasRequiredRole = authService.hasRole(requiredRole);
        if (!hasRequiredRole) {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 text-lg">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show insufficient permissions if role check failed
  const currentEmployee = authService.getCurrentEmployee();
  if (requiredRole && currentEmployee && !authService.hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Icon name="ShieldX" size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Недостаточно прав</h2>
          <p className="text-gray-600 mb-4">
            У вас недостаточно прав для доступа к этой странице.
          </p>
          <p className="text-sm text-gray-500">
            Текущая роль: <span className="font-semibold">{currentEmployee.role}</span>
            <br />
            Требуется: <span className="font-semibold">{Array.isArray(requiredRole) ? requiredRole.join(' или ') : requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}