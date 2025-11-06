import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";

interface SecurityCardProps {
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  onPasswordFormChange: (updates: Partial<SecurityCardProps['passwordForm']>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SecurityCard({
  passwordForm,
  onPasswordFormChange,
  onSubmit
}: SecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="Lock" size={20} className="mr-2 text-green-600" />
          Безопасность
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Alert>
            <Icon name="Shield" size={16} />
            <AlertDescription>
              Используйте надёжный пароль длиной не менее 8 символов с буквами, цифрами и специальными символами.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="currentPassword">Текущий пароль *</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => onPasswordFormChange({ currentPassword: e.target.value })}
              required
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="newPassword">Новый пароль *</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onPasswordFormChange({ newPassword: e.target.value })}
              required
              minLength={6}
            />
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs">
                <Icon 
                  name={passwordForm.newPassword.length >= 6 ? "CheckCircle" : "Circle"} 
                  size={12} 
                  className={`mr-1 ${passwordForm.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className={passwordForm.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                  Минимум 6 символов
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={/[A-Z]/.test(passwordForm.newPassword) ? "CheckCircle" : "Circle"} 
                  size={12} 
                  className={`mr-1 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                  Заглавная буква
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Icon 
                  name={/[0-9]/.test(passwordForm.newPassword) ? "CheckCircle" : "Circle"} 
                  size={12} 
                  className={`mr-1 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className={/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}>
                  Цифра
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Подтвердите новый пароль *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onPasswordFormChange({ confirmPassword: e.target.value })}
              required
              minLength={6}
            />
            {passwordForm.confirmPassword && (
              <p className={`text-xs mt-1 ${
                passwordForm.newPassword === passwordForm.confirmPassword 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {passwordForm.newPassword === passwordForm.confirmPassword 
                  ? '✓ Пароли совпадают' 
                  : '✗ Пароли не совпадают'
                }
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Icon name="Lock" size={16} className="mr-2" />
            Изменить пароль
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
