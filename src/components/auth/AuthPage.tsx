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