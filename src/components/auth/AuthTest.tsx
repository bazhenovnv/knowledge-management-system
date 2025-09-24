import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import authService from '@/utils/authService';

export default function AuthTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login({
        email: 'admin@company.com',
        password: 'admin123',
        remember_me: false
      });
      setAuthResult(result);
      toast.success('Тестовый вход выполнен успешно!');
    } catch (error) {
      console.error('Test login error:', error);
      toast.error(`Ошибка входа: ${error}`);
      setAuthResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const testRegister = async () => {
    setIsLoading(true);
    try {
      const result = await authService.register({
        email: 'test@newuser.com',
        password: 'testpass123',
        full_name: 'Тестовый Пользователь',
        department: 'Тестовый отдел',
        position: 'Тестировщик',
        role: 'employee'
      });
      setAuthResult(result);
      toast.success('Тестовая регистрация выполнена успешно!');
    } catch (error) {
      console.error('Test register error:', error);
      toast.error(`Ошибка регистрации: ${error}`);
      setAuthResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthCheck = async () => {
    setIsLoading(true);
    try {
      const isAuthenticated = await authService.checkAuth();
      const currentUser = authService.getCurrentEmployee();
      setAuthResult({ 
        authenticated: isAuthenticated, 
        user: currentUser,
        token: authService.getToken()
      });
      toast.success('Проверка авторизации выполнена!');
    } catch (error) {
      console.error('Test auth check error:', error);
      toast.error(`Ошибка проверки: ${error}`);
      setAuthResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setAuthResult(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="TestTube" size={24} />
          <span>Тестирование системы авторизации</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            onClick={testLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            ) : (
              <Icon name="LogIn" size={16} className="mr-2" />
            )}
            Тест входа
          </Button>
          
          <Button
            onClick={testRegister}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            ) : (
              <Icon name="UserPlus" size={16} className="mr-2" />
            )}
            Тест регистрации
          </Button>
          
          <Button
            onClick={testAuthCheck}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? (
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            ) : (
              <Icon name="Shield" size={16} className="mr-2" />
            )}
            Проверка авторизации
          </Button>
        </div>

        {authResult && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Результат теста:</h3>
              <Button
                onClick={clearResult}
                variant="ghost"
                size="sm"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            
            {authResult.error ? (
              <Badge variant="destructive" className="mb-2">
                <Icon name="AlertCircle" size={14} className="mr-1" />
                Ошибка
              </Badge>
            ) : (
              <Badge variant="default" className="mb-2">
                <Icon name="CheckCircle" size={14} className="mr-1" />
                Успех
              </Badge>
            )}
            
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(authResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Тестовые данные для входа:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>Email:</strong> admin@company.com</div>
            <div><strong>Пароль:</strong> admin123</div>
            <div><strong>Роль:</strong> Администратор</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}