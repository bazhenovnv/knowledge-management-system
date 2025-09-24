import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, EmailTemplateParams } from '@/utils/emailConfig';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Функция генерации случайного 6-значного кода
  const generateCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Функция отправки email через EmailJS
  const sendResetEmail = async (email: string, code: string): Promise<boolean> => {
    try {
      // Проверяем, настроен ли EmailJS
      if (EMAIL_CONFIG.DEMO_MODE || !EMAIL_CONFIG.PUBLIC_KEY || EMAIL_CONFIG.PUBLIC_KEY === 'your_public_key') {
        console.log('Demo mode: Email sending skipped');
        return false; // В демо-режиме не отправляем email
      }

      const templateParams: EmailTemplateParams = {
        to_email: email,
        reset_code: code,
        company_name: 'Корпоративное обучение'
      };

      const response = await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAIL_CONFIG.PUBLIC_KEY
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('EmailJS error:', error);
      return false;
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Пожалуйста, введите email');
      return;
    }

    setIsLoading(true);
    
    try {
      // Генерируем код
      const code = generateCode();
      setGeneratedCode(code);
      
      // Пытаемся отправить email
      const emailSent = await sendResetEmail(formData.email, code);
      
      if (emailSent) {
        toast.success('Код восстановления отправлен на вашу почту');
      } else {
        // Если email не отправлен, показываем код для демонстрации
        toast.success(`Демо-режим: ваш код ${code}`);
      }
      
      setStep('code');
    } catch (error) {
      toast.error('Ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      toast.error('Пожалуйста, введите код подтверждения');
      return;
    }

    setIsLoading(true);
    
    try {
      // Проверяем введенный код с сгенерированным
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (formData.code === generatedCode || formData.code === '123456') {
        toast.success('Код подтвержден');
        setStep('reset');
      } else {
        toast.error('Неверный код подтверждения');
      }
    } catch (error) {
      toast.error('Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    
    try {
      // Симуляция сброса пароля
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Пароль успешно изменен!');
      onBackToLogin();
    } catch (error) {
      toast.error('Ошибка при изменении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendCode}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Восстановление пароля</CardTitle>
        <CardDescription>
          Введите ваш email для получения кода восстановления
        </CardDescription>
      </CardHeader>
      
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
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Mail" size={16} className="mr-2" />
              Отправить код
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Вернуться к входу
        </Button>
      </CardFooter>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleVerifyCode}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Введите код</CardTitle>
        <CardDescription>
          Код отправлен на {formData.email}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Код подтверждения</Label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            required
            disabled={isLoading}
            maxLength={6}
          />
          <p className="text-sm text-gray-600">
            Для демонстрации используйте код: 123456
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Проверка...
            </>
          ) : (
            <>
              <Icon name="Check" size={16} className="mr-2" />
              Подтвердить код
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setStep('email')}
          disabled={isLoading}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Изменить email
        </Button>
      </CardFooter>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Новый пароль</CardTitle>
        <CardDescription>
          Введите новый пароль для вашего аккаунта
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Новый пароль</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите новый пароль"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
              minLength={6}
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
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Повторите новый пароль"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
              minLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <Icon 
                name={showConfirmPassword ? 'EyeOff' : 'Eye'} 
                size={16}
                className="text-gray-500"
              />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Изменение...
            </>
          ) : (
            <>
              <Icon name="Key" size={16} className="mr-2" />
              Изменить пароль
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
          disabled={isLoading}
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Вернуться к входу
        </Button>
      </CardFooter>
    </form>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      {step === 'email' && renderEmailStep()}
      {step === 'code' && renderCodeStep()}
      {step === 'reset' && renderResetStep()}
    </Card>
  );
}