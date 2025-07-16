import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

interface PasswordChangeProps {
  onPasswordChange?: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

export const PasswordChange = ({ onPasswordChange }: PasswordChangeProps) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Очень слабый';
    if (strength < 50) return 'Слабый';
    if (strength < 75) return 'Средний';
    if (strength < 90) return 'Сильный';
    return 'Очень сильный';
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    if (strength < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const validateForm = (): boolean => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Введите текущий пароль' });
      return false;
    }

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Введите новый пароль' });
      return false;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 8 символов' });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'Новый пароль должен отличаться от текущего' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      if (onPasswordChange) {
        const success = await onPasswordChange(formData.currentPassword, formData.newPassword);
        if (success) {
          setMessage({ type: 'success', text: 'Пароль успешно изменен' });
          setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setMessage({ type: 'error', text: 'Неверный текущий пароль' });
        }
      } else {
        // Симуляция изменения пароля
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMessage({ type: 'success', text: 'Пароль успешно изменен' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Произошла ошибка при изменении пароля' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Lock" size={20} />
          Смена пароля
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <Icon 
              name={message.type === 'error' ? 'AlertCircle' : 'CheckCircle'} 
              size={16} 
              className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}
            />
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Текущий пароль</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Введите текущий пароль"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('current')}
            >
              <Icon name={showPasswords.current ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Новый пароль</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Введите новый пароль"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('new')}
            >
              <Icon name={showPasswords.new ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
          
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Надежность пароля:</span>
                <span className={`font-medium ${
                  passwordStrength < 50 ? 'text-red-600' : 
                  passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <Progress 
                value={passwordStrength} 
                className="h-2"
                indicatorClassName={getPasswordStrengthColor(passwordStrength)}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Подтвердите новый пароль"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              <Icon name={showPasswords.confirm ? 'EyeOff' : 'Eye'} size={16} />
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Требования к паролю:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center gap-2">
              <Icon 
                name={formData.newPassword.length >= 8 ? 'Check' : 'X'} 
                size={14} 
                className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}
              />
              Минимум 8 символов
            </li>
            <li className="flex items-center gap-2">
              <Icon 
                name={/[A-Z]/.test(formData.newPassword) ? 'Check' : 'X'} 
                size={14} 
                className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}
              />
              Заглавные буквы
            </li>
            <li className="flex items-center gap-2">
              <Icon 
                name={/[a-z]/.test(formData.newPassword) ? 'Check' : 'X'} 
                size={14} 
                className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}
              />
              Строчные буквы
            </li>
            <li className="flex items-center gap-2">
              <Icon 
                name={/[0-9]/.test(formData.newPassword) ? 'Check' : 'X'} 
                size={14} 
                className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}
              />
              Цифры
            </li>
            <li className="flex items-center gap-2">
              <Icon 
                name={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'Check' : 'X'} 
                size={14} 
                className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-red-600'}
              />
              Специальные символы
            </li>
          </ul>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" />
              Изменение пароля...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Icon name="Save" size={16} />
              Изменить пароль
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};