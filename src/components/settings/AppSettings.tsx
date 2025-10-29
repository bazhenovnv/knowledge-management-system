import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppSettingsData {
  companyName: string;
  companyEmail: string;
  testTimeLimit: number;
  autoLogoutTime: number;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  darkModeDefault: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  minPasswordLength: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  defaultLanguage: string;
}

export default function AppSettings() {
  const [settings, setSettings] = useState<AppSettingsData>({
    companyName: "Система обучения",
    companyEmail: "support@company.com",
    testTimeLimit: 60,
    autoLogoutTime: 30,
    enableNotifications: true,
    enableEmailAlerts: false,
    darkModeDefault: false,
    allowRegistration: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
    sessionTimeout: 120,
    maxLoginAttempts: 5,
    defaultLanguage: "ru"
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const handleChange = (key: keyof AppSettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      setHasChanges(false);
      toast.success('Настройки приложения сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении настроек');
    }
  };

  const handleReset = () => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      const defaultSettings: AppSettingsData = {
        companyName: "Система обучения",
        companyEmail: "support@company.com",
        testTimeLimit: 60,
        autoLogoutTime: 30,
        enableNotifications: true,
        enableEmailAlerts: false,
        darkModeDefault: false,
        allowRegistration: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
        sessionTimeout: 120,
        maxLoginAttempts: 5,
        defaultLanguage: "ru"
      };
      setSettings(defaultSettings);
      localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
      setHasChanges(false);
      toast.success('Настройки сброшены к значениям по умолчанию');
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Icon name="Info" size={16} />
        <AlertDescription>
          Настройки приложения применяются ко всей системе и влияют на всех пользователей.
        </AlertDescription>
      </Alert>

      {/* Общие настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Building2" size={20} className="mr-2 text-blue-600" />
            Общие настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Название организации</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Введите название"
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email поддержки</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                placeholder="support@company.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="defaultLanguage">Язык по умолчанию</Label>
            <Select 
              value={settings.defaultLanguage} 
              onValueChange={(value) => handleChange('defaultLanguage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="kk">Қазақша</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Настройки тестирования */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="FileText" size={20} className="mr-2 text-green-600" />
            Настройки тестирования
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testTimeLimit">Стандартное время теста (минуты)</Label>
              <Input
                id="testTimeLimit"
                type="number"
                value={settings.testTimeLimit}
                onChange={(e) => handleChange('testTimeLimit', parseInt(e.target.value))}
                min={5}
                max={180}
              />
              <p className="text-xs text-gray-500 mt-1">От 5 до 180 минут</p>
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Тайм-аут сессии теста (минуты)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                min={30}
                max={240}
              />
              <p className="text-xs text-gray-500 mt-1">Автоматическое завершение при неактивности</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Безопасность */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Shield" size={20} className="mr-2 text-red-600" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPasswordLength">Минимальная длина пароля</Label>
              <Input
                id="minPasswordLength"
                type="number"
                value={settings.minPasswordLength}
                onChange={(e) => handleChange('minPasswordLength', parseInt(e.target.value))}
                min={6}
                max={32}
              />
              <p className="text-xs text-gray-500 mt-1">От 6 до 32 символов</p>
            </div>

            <div>
              <Label htmlFor="maxLoginAttempts">Максимум попыток входа</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                min={3}
                max={10}
              />
              <p className="text-xs text-gray-500 mt-1">После блокировка на 15 минут</p>
            </div>

            <div>
              <Label htmlFor="autoLogoutTime">Автовыход при неактивности (минуты)</Label>
              <Input
                id="autoLogoutTime"
                type="number"
                value={settings.autoLogoutTime}
                onChange={(e) => handleChange('autoLogoutTime', parseInt(e.target.value))}
                min={5}
                max={120}
              />
              <p className="text-xs text-gray-500 mt-1">0 - отключить автовыход</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Разрешить регистрацию</Label>
                <p className="text-sm text-gray-600">Пользователи могут самостоятельно регистрироваться</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => handleChange('allowRegistration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Требовать подтверждение email</Label>
                <p className="text-sm text-gray-600">Отправлять письмо с подтверждением при регистрации</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleChange('requireEmailVerification', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Уведомления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Bell" size={20} className="mr-2 text-purple-600" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Включить push-уведомления</Label>
              <p className="text-sm text-gray-600">Показывать уведомления в браузере</p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email-уведомления</Label>
              <p className="text-sm text-gray-600">Отправлять уведомления на почту</p>
            </div>
            <Switch
              checked={settings.enableEmailAlerts}
              onCheckedChange={(checked) => handleChange('enableEmailAlerts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="flex-1"
        >
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить изменения
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline"
          className="flex-1"
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сбросить к умолчанию
        </Button>
      </div>

      {hasChanges && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Icon name="AlertTriangle" size={16} className="text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            У вас есть несохранённые изменения. Не забудьте сохранить настройки.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}