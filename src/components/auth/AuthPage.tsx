import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleLoginSuccess = () => {
    onAuthSuccess();
  };

  const handleRegisterSuccess = () => {
    // После успешной регистрации переключаемся на форму входа
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип и заголовок */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img 
              src="https://cdn.poehali.dev/files/559b1a38-bc91-4187-8a3f-b47c1947c45c.png" 
              alt="Логотип компании" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Корпоративное обучение
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Система управления знаниями сотрудников
          </p>
        </div>

        {isLoginMode ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => setIsLoginMode(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLoginClick={() => setIsLoginMode(true)}
          />
        )}
      </div>
    </div>
  );
}