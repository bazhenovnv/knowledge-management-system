import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";

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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Форма смены пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Форма смены почты
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  useEffect(() => {
    loadUserData();
    loadThemePreference();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userData = database.getUsers().find(u => u.id === userId);
      if (userData) {
        setUser(userData);
        setEmailForm(prev => ({ ...prev, newEmail: userData.email }));
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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Новые пароли не совпадают');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Новый пароль должен содержать не менее 6 символов');
      return;
    }

    try {
      // В реальной системе здесь бы был запрос к API
      // database.updateUserPassword(userId, passwordForm.currentPassword, passwordForm.newPassword);
      
      showMessage('success', 'Пароль успешно изменён');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showMessage('error', 'Ошибка при смене пароля. Проверьте текущий пароль.');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.newEmail.includes('@')) {
      showMessage('error', 'Введите корректный email адрес');
      return;
    }

    try {
      // В реальной системе здесь бы был запрос к API
      // database.updateUserEmail(userId, emailForm.newEmail, emailForm.password);
      
      if (user) {
        setUser({ ...user, email: emailForm.newEmail });
      }
      
      showMessage('success', 'Email успешно изменён');
      setEmailForm(prev => ({ ...prev, password: '' }));
    } catch (error) {
      showMessage('error', 'Ошибка при смене email. Проверьте пароль.');
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    showMessage('success', `Тема изменена на ${newTheme === 'light' ? 'светлую' : 'тёмную'}`);
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

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <Icon name={message.type === 'success' ? 'CheckCircle' : 'AlertCircle'} size={16} />
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="password">Пароль</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="appearance">Тема</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="User" size={20} className="mr-2" />
                Информация о профиле
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Полное имя</Label>
                  <Input value={user.fullName} disabled />
                </div>
                <div>
                  <Label>Роль</Label>
                  <Input value={user.role} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <Label>ID пользователя</Label>
                  <Input value={user.id} disabled />
                </div>
              </div>
              <Alert>
                <Icon name="Info" size={16} />
                <AlertDescription>
                  Для изменения основной информации профиля обратитесь к администратору системы.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Lock" size={20} className="mr-2" />
                Изменение пароля
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Icon name="Save" size={16} className="mr-2" />
                  Изменить пароль
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Icon name="Mail" size={20} className="mr-2" />
                Изменение Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <Label htmlFor="newEmail">Новый Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="passwordEmail">Подтвердите паролем</Label>
                  <Input
                    id="passwordEmail"
                    type="password"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    placeholder="Введите текущий пароль для подтверждения"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Icon name="Save" size={16} className="mr-2" />
                  Изменить Email
                </Button>
              </form>
            </CardContent>
          </Card>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}