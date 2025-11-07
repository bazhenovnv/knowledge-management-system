import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EXTERNAL_DB_URL = 'https://functions.poehali.dev/72034790-df65-4fb9-885e-c40a2ee29179';

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast.error('Введите email');
      return;
    }

    if (!newPassword.trim()) {
      toast.error('Введите новый пароль');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const passwordHash = await hashPassword(newPassword);

      const checkUserQuery = `SELECT id, email FROM "t_p47619579_knowledge_management"."employees" WHERE email = '${email.toLowerCase()}' AND is_active = true`;

      const checkResponse = await fetch(`${EXTERNAL_DB_URL}?action=query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'query',
          query: checkUserQuery
        })
      });

      if (!checkResponse.ok) {
        throw new Error('Ошибка проверки пользователя');
      }

      const checkData = await checkResponse.json();

      if (!checkData.rows || checkData.rows.length === 0) {
        toast.error('Пользователь с таким email не найден');
        return;
      }

      const updateQuery = `UPDATE "t_p47619579_knowledge_management"."employees" SET password_hash = '${passwordHash}', last_password_reset = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = '${email.toLowerCase()}'`;

      const updateResponse = await fetch(`${EXTERNAL_DB_URL}?action=query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'query',
          query: updateQuery
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Ошибка обновления пароля');
      }

      const updateData = await updateResponse.json();

      if (updateData.affected > 0) {
        toast.success('Пароль успешно обновлён!', {
          description: 'Теперь можете войти с новым паролем'
        });
        
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Не удалось обновить пароль');
      }

    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="KeyRound" size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl">Сброс пароля</CardTitle>
          <CardDescription>
            Установите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Новый пароль</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Минимум 6 символов"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите пароль</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                Обновление...
              </>
            ) : (
              <>
                <Icon name="KeyRound" size={20} className="mr-2" />
                Установить новый пароль
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isLoading}
            className="w-full"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться ко входу
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="mt-0.5 text-blue-600" />
              <div className="space-y-1 text-sm text-blue-900">
                <p className="font-medium">Доступные аккаунты для теста:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>admin@company.com - Администратор</li>
                  <li>teacher@company.com - Преподаватель</li>
                  <li>newemployee@company.com - Сотрудник</li>
                  <li>testuser2025@company.com - Тестовый</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}