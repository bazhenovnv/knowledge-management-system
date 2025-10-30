import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const demoUsers = [
    { email: 'admin@company.com', department: 'IT' },
    { email: 'teacher@company.com', department: 'Обучение' },
    { email: 'manager@company.com', department: 'Менеджмент' }
  ];

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Проверяем, есть ли email в демо-пользователях
      const demoUser = demoUsers.find(user => user.email === email);
      
      if (demoUser) {
        toast.success(`Код отправлен на ${email}! Используйте код: 123456`, {
          description: `Пользователь: ${demoUser.department}`,
        });
        setStep('code');
      } else {
        toast.error('Пользователь не найден');
      }
    } catch (error) {
      toast.error('Ошибка отправки кода');
    }

    setIsLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (code === '123456' || code === '000000') {
        toast.success('Код подтвержден!');
        setStep('newPassword');
      } else {
        setAttempts(prev => prev + 1);
        if (attempts >= 2) {
          toast.error('Превышено количество попыток');
          setStep('email');
          setAttempts(0);
        } else {
          toast.error(`Неверный код. Осталось попыток: ${3 - attempts - 1}`);
        }
      }
    } catch (error) {
      toast.error('Ошибка проверки кода');
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);

    try {
      toast.success('Пароль успешно изменен!');
      setTimeout(() => {
        onBackToLogin();
      }, 1500);
    } catch (error) {
      toast.error('Ошибка смены пароля');
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="mr-2"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <div>
            <CardTitle>Восстановление пароля</CardTitle>
            <CardDescription>
              {step === 'email' && 'Укажите email для получения кода'}
              {step === 'code' && 'Введите код из сообщения'}
              {step === 'newPassword' && 'Создайте новый пароль'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Отправить код'
              )}
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Icon name="Info" size={16} className="mr-2" />
                Тестовые аккаунты:
              </h4>
              <div className="space-y-1 text-sm text-blue-800">
                {demoUsers.map(user => (
                  <div key={user.email} className="flex justify-between">
                    <span className="font-mono">{user.email}</span>
                    <span className="text-blue-600">{user.department}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-blue-700">
                Код для всех: <strong>123456</strong>
              </div>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код подтверждения</Label>
              <Input
                id="code"
                type="text"
                placeholder="Введите 6-значный код"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                'Подтвердить код'
              )}
            </Button>

            <div className="text-sm text-gray-600 text-center">
              Попыток осталось: <strong>{3 - attempts}</strong>
            </div>
          </form>
        )}

        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Минимум 6 символов"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить пароль'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}