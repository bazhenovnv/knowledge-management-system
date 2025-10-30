import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import authService, { LoginData } from '@/utils/authService';

interface LoginFormProps {
  onSuccess: () => void;
  onRegisterClick: () => void;
  onForgotPasswordClick?: () => void;
}

export default function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    remember_me: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.login(formData);
      toast.success('Вход выполнен успешно!');
      onSuccess();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при входе в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
        <CardDescription>
          Введите свои данные для входа
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Icon 
                  name={showPassword ? 'EyeOff' : 'Eye'} 
                  size={16}
                  className="text-gray-500"
                />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember_me"
              checked={formData.remember_me}
              onCheckedChange={(checked) => handleInputChange('remember_me', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="remember_me" className="text-sm font-normal">
              Запомнить меня
            </Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </>
            )}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm text-gray-600 hover:text-gray-800"
              onClick={() => onForgotPasswordClick ? onForgotPasswordClick() : toast.info('Функция восстановления пароля будет добавлена')}
              disabled={isLoading}
            >
              Забыли пароль?
            </Button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Нет аккаунта? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={onRegisterClick}
              disabled={isLoading}
            >
              Зарегистрироваться
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}