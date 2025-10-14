import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { pushNotificationService } from '@/utils/pushNotifications';

interface NotificationSettingsProps {
  employeeId: number;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ employeeId }) => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    tests: true,
    courses: true,
    assignments: true,
    deadlines: true,
    announcements: true,
  });

  useEffect(() => {
    loadSettings();
    checkPushPermission();
  }, [employeeId]);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem(`notification-settings-${employeeId}`);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed.categories || settings);
      setEmailEnabled(parsed.emailEnabled ?? true);
    }
  };

  const saveSettings = (newSettings: any) => {
    localStorage.setItem(
      `notification-settings-${employeeId}`,
      JSON.stringify({
        ...newSettings,
        emailEnabled,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const checkPushPermission = () => {
    const currentPermission = pushNotificationService.getPermission();
    setPermission(currentPermission);
    setPushEnabled(currentPermission === 'granted');
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await pushNotificationService.requestPermission();
      if (result === 'granted') {
        setPushEnabled(true);
        setPermission('granted');
        toast.success('Push-уведомления включены');
      } else {
        toast.error('Доступ к уведомлениям запрещён');
        setPushEnabled(false);
      }
    } else {
      setPushEnabled(false);
      toast.info('Push-уведомления отключены в настройках браузера');
    }
  };

  const handleEmailToggle = (enabled: boolean) => {
    setEmailEnabled(enabled);
    saveSettings({ categories: settings, emailEnabled: enabled });
    toast.success(enabled ? 'Email уведомления включены' : 'Email уведомления отключены');
  };

  const handleCategoryToggle = (category: keyof typeof settings, enabled: boolean) => {
    const newSettings = { ...settings, [category]: enabled };
    setSettings(newSettings);
    saveSettings({ categories: newSettings, emailEnabled });
  };

  const testPushNotification = async () => {
    if (permission !== 'granted') {
      toast.error('Сначала включите push-уведомления');
      return;
    }

    try {
      await pushNotificationService.sendNotification({
        title: '🔔 Тестовое уведомление',
        body: 'Push-уведомления работают корректно!',
        icon: '/logo.png',
        tag: 'test',
        data: { link: '/settings' },
      });
      toast.success('Тестовое уведомление отправлено!');
    } catch (error) {
      toast.error('Ошибка отправки уведомления');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={20} />
          Настройки уведомлений
        </CardTitle>
        <CardDescription>
          Управление способами доставки и типами уведомлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push-уведомления */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Push-уведомления в браузере
              </Label>
              <p className="text-sm text-muted-foreground">
                Получайте уведомления прямо в браузере
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handlePushToggle}
            />
          </div>

          {permission === 'denied' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <div className="flex gap-2">
                <Icon name="AlertTriangle" size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  Уведомления заблокированы в настройках браузера. 
                  Разрешите уведомления для этого сайта в настройках браузера.
                </div>
              </div>
            </div>
          )}

          {pushEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={testPushNotification}
              className="w-full"
            >
              <Icon name="Send" size={14} className="mr-2" />
              Отправить тестовое уведомление
            </Button>
          )}
        </div>

        <Separator />

        {/* Email уведомления */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Email уведомления</Label>
            <p className="text-sm text-muted-foreground">
              Получайте важные уведомления на почту
            </p>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={handleEmailToggle}
          />
        </div>

        <Separator />

        {/* Категории уведомлений */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Типы уведомлений</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-blue-500" />
                <Label className="font-normal cursor-pointer" htmlFor="tests">
                  Тесты и проверки знаний
                </Label>
              </div>
              <Switch
                id="tests"
                checked={settings.tests}
                onCheckedChange={(checked) => handleCategoryToggle('tests', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="BookOpen" size={16} className="text-green-500" />
                <Label className="font-normal cursor-pointer" htmlFor="courses">
                  Курсы и обучение
                </Label>
              </div>
              <Switch
                id="courses"
                checked={settings.courses}
                onCheckedChange={(checked) => handleCategoryToggle('courses', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="ClipboardList" size={16} className="text-purple-500" />
                <Label className="font-normal cursor-pointer" htmlFor="assignments">
                  Задания и поручения
                </Label>
              </div>
              <Switch
                id="assignments"
                checked={settings.assignments}
                onCheckedChange={(checked) => handleCategoryToggle('assignments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-orange-500" />
                <Label className="font-normal cursor-pointer" htmlFor="deadlines">
                  Напоминания о дедлайнах
                </Label>
              </div>
              <Switch
                id="deadlines"
                checked={settings.deadlines}
                onCheckedChange={(checked) => handleCategoryToggle('deadlines', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="Megaphone" size={16} className="text-red-500" />
                <Label className="font-normal cursor-pointer" htmlFor="announcements">
                  Объявления и новости
                </Label>
              </div>
              <Switch
                id="announcements"
                checked={settings.announcements}
                onCheckedChange={(checked) => handleCategoryToggle('announcements', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Информация */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <div className="flex gap-2">
            <Icon name="Info" size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              Настройки сохраняются автоматически. Push-уведомления работают 
              только когда вкладка браузера открыта.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
