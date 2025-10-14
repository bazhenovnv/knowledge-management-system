import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import DepartmentSettings from "./DepartmentSettings";
import { notificationsService } from "@/utils/notificationsService";
import { toast } from "sonner";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import ScheduledNotificationsPanel from "./ScheduledNotificationsPanel";
import DatabaseSettings from "./DatabaseSettings";
import AppSettings from "./AppSettings";
import ProfileSettings from "./ProfileSettings";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

interface UserSettingsProps {
  userId: number;
}

export default function UserSettings({ userId }: UserSettingsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    loadUserData();
    loadThemePreference();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const employees = database.getEmployees();
      const employee = employees.find(e => e.id === userId);
      if (employee) {
        const userData: User = {
          id: employee.id,
          fullName: employee.name,
          email: employee.email,
          role: employee.role
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  };

  const applyTheme = (newTheme: string) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast.success(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" size={24} className="animate-spin" />
        <span className="ml-2">Загрузка настроек...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <Icon name="AlertCircle" size={16} />
        <AlertDescription>
          Пользователь не найден
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Settings" size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold">Настройки профиля</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${user.role === 'admin' ? 'grid-cols-7' : 'grid-cols-4'}`}>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="scheduled">Планировщик</TabsTrigger>
          <TabsTrigger value="appearance">Тема</TabsTrigger>
          {user.role === 'admin' && (
            <>
              <TabsTrigger value="departments">Отделы</TabsTrigger>
              <TabsTrigger value="app">Приложение</TabsTrigger>
              <TabsTrigger value="database">База данных</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings userId={userId} />
        </TabsContent>



        <TabsContent value="notifications">
          <NotificationSettings employeeId={userId} />
        </TabsContent>

        <TabsContent value="scheduled">
          <ScheduledNotificationsPanel employeeId={userId} />
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Palette" size={20} className="mr-2" />
                Настройки внешнего вида
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Тема интерфейса</Label>
                <p className="text-sm text-gray-600 mb-3">Выберите светлую или тёмную тему</p>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Icon name="Sun" size={16} className="mr-2" />
                        Светлая тема
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Icon name="Moon" size={16} className="mr-2" />
                        Тёмная тема
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg border bg-gray-50">
                <h4 className="font-medium mb-2">Предварительный просмотр</h4>
                <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span>Пример интерфейса</span>
                    <Icon name="Star" size={16} className={theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'} />
                  </div>
                  <p className="text-sm mt-2 opacity-70">
                    Так будет выглядеть интерфейс с выбранной темой
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Тестирование уведомлений</Label>
                <p className="text-sm text-gray-600 mb-3">Создать тестовые уведомления для проверки системы</p>
                <Button 
                  onClick={async () => {
                    try {
                      await notificationsService.createTestNotifications(userId);
                      toast.success('Тестовые уведомления созданы!');
                    } catch (error) {
                      toast.error('Ошибка создания уведомлений');
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Icon name="Bell" size={16} className="mr-2" />
                  Создать тестовые уведомления
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === 'admin' && (
          <>
            <TabsContent value="departments">
              <DepartmentSettings userRole={user.role} />
            </TabsContent>
            
            <TabsContent value="app">
              <AppSettings />
            </TabsContent>
            
            <TabsContent value="database">
              <DatabaseSettings />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}