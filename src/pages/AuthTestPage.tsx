import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TestLogin from '@/components/TestLogin';
import TestRegister from '@/components/TestRegister';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function AuthTestPage() {
  const [currentView, setCurrentView] = useState<'main' | 'login' | 'register' | 'test-login' | 'test-register'>('main');

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm 
            onSuccess={() => alert('Успешный вход!')} 
            onRegisterClick={() => setCurrentView('register')}
          />
        );
      case 'register':
        return (
          <RegisterForm 
            onSuccess={() => alert('Регистрация успешна!')} 
            onLoginClick={() => setCurrentView('login')}
          />
        );
      case 'test-login':
        return <TestLogin />;
      case 'test-register':
        return <TestRegister />;
      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Тестирование аутентификации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setCurrentView('login')} 
                className="w-full"
              >
                Основная форма входа
              </Button>
              
              <Button 
                onClick={() => setCurrentView('register')} 
                className="w-full"
                variant="outline"
              >
                Основная форма регистрации
              </Button>
              
              <hr className="my-4" />
              
              <Button 
                onClick={() => setCurrentView('test-login')} 
                className="w-full"
                variant="secondary"
              >
                Быстрый тест входа
              </Button>
              
              <Button 
                onClick={() => setCurrentView('test-register')} 
                className="w-full"
                variant="secondary"
              >
                Быстрый тест регистрации
              </Button>
              
              <hr className="my-4" />
              
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Тестовые данные:</strong></p>
                <p>📧 admin@company.com / admin123 (Администратор)</p>
                <p>📧 teacher@company.com / teacher123 (Преподаватель)</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {currentView !== 'main' && (
        <div className="max-w-md mx-auto mb-4">
          <Button 
            onClick={() => setCurrentView('main')} 
            variant="outline"
            size="sm"
          >
            ← Назад к меню
          </Button>
        </div>
      )}
      
      {renderView()}
    </div>
  );
}