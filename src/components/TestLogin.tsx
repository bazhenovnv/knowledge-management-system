import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import authService from '@/utils/authService';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authService.login({
        email,
        password,
        remember_me: false
      });
      toast.success('Вход выполнен успешно!');
      console.log('Login result:', result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка входа');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    try {
      const isAuth = await authService.checkAuth();
      toast.success(`Проверка аутентификации: ${isAuth ? 'Авторизован' : 'Не авторизован'}`);
      console.log('Auth check:', isAuth, authService.getCurrentEmployee());
    } catch (error) {
      toast.error('Ошибка проверки');
      console.error('Check error:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Тест входа</h2>
      
      <div className="space-y-4">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <Button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
        
        <Button 
          onClick={handleCheck} 
          variant="outline"
          className="w-full"
        >
          Проверить авторизацию
        </Button>
      </div>
    </div>
  );
}