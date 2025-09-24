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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-white text-2xl font-bold">👥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление Сотрудниками
          </h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Войдите в систему для продолжения' : 'Создайте новый аккаунт'}
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