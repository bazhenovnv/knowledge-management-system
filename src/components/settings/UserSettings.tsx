import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import AppearanceSettings from "./AppearanceSettings";

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
      console.log('Loading user data for userId:', userId);
      const employees = database.getEmployees();
      console.log('Total employees:', employees.length);
      console.log('All employees:', employees.map(e => ({ id: e.id, name: e.name, role: e.role })));
      const employee = employees.find(e => e.id === userId);
      console.log('Found employee:', employee);
      
      if (employee) {
        const userData: User = {
          id: employee.id,
          fullName: employee.name,
          email: employee.email,
          role: employee.role
        };
        setUser(userData);
        console.log('User set:', userData);
      } else {
        console.warn('Employee not found with userId:', userId);
        console.log('Trying to get employee from localStorage...');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        
        if (userRole && userName) {
          const userData: User = {
            id: userId,
            fullName: userName,
            email: '',
            role: userRole
          };
          setUser(userData);
          console.log('User set from localStorage:', userData);
        }
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

  console.log('Rendering UserSettings, user role:', user.role, 'user:', user);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Settings" size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold">Настройки профиля</h1>
        <span className="text-sm text-gray-500">(Роль: {user.role})</span>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${user.role === 'admin' ? 'grid-cols-7' : 'grid-cols-3'}`}>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="scheduled">Планировщик</TabsTrigger>
          {user.role === 'admin' && (
            <>
              <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
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

        {user.role === 'admin' && (
          <>
            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>
            
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