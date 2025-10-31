import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProfileSettingsProps {
  userId: number;
}

export default function ProfileSettings({ userId }: ProfileSettingsProps) {
  const employee = database.getEmployees().find(e => e.id === userId);
  
  const [profileForm, setProfileForm] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    position: employee?.position || '',
    phone: '',
    avatar: employee?.avatar || ''
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      setSoundEnabled(settings.enableSoundNotifications !== false);
    }
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;

    try {
      database.updateEmployee(userId, {
        name: profileForm.name,
        department: profileForm.department,
        position: profileForm.position
      });

      toast.success('Профиль успешно обновлён!');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Новые пароли не совпадают');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Новый пароль должен содержать не менее 6 символов');
      return;
    }

    const currentPasswordCheck = employee?.password || employee?.email.split('@')[0];
    
    if (passwordForm.currentPassword !== currentPasswordCheck) {
      toast.error('Неверный текущий пароль');
      return;
    }

    try {
      database.updateEmployee(userId, {
        password: passwordForm.newPassword
      });
      
      toast.success('Пароль успешно изменён!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      toast.error('Ошибка при смене пароля');
    }
  };

  const handleEmailChange = () => {
    toast.info('Функция смены email будет доступна в следующей версии');
  };

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    
    const appSettings = localStorage.getItem('app_settings');
    const settings = appSettings ? JSON.parse(appSettings) : {};
    settings.enableSoundNotifications = checked;
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    toast.success(checked ? 'Звуковые уведомления включены' : 'Звуковые уведомления выключены');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 2MB');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Конвертируем в base64 для предпросмотра
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileForm(prev => ({ ...prev, avatar: base64String }));
        
        // Обновляем в базе данных
        database.updateEmployee(userId, {
          avatar: base64String
        });
        
        toast.success('Фото профиля успешно загружено!');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      toast.error('Ошибка при загрузке фото');
      setIsUploadingPhoto(false);
    }
  };

  if (!employee) {
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
    <div className="space-y-6">
      {/* Информация о профиле */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="User" size={20} className="mr-2 text-blue-600" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              {profileForm.avatar ? (
                <img 
                  src={profileForm.avatar} 
                  alt="Фото профиля" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={isUploadingPhoto}
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Icon name={isUploadingPhoto ? "Loader2" : "Upload"} size={14} className={`mr-2 ${isUploadingPhoto ? 'animate-spin' : ''}`} />
                  {isUploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG или GIF. Макс 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Полное имя *</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Для смены email обратитесь к администратору
                </p>
              </div>

              <div>
                <Label htmlFor="department">Отдел</Label>
                <Select 
                  value={profileForm.department}
                  onValueChange={(value) => setProfileForm(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Отдел IT">Отдел IT</SelectItem>
                    <SelectItem value="Сервис">Сервис</SelectItem>
                    <SelectItem value="ЦТО">ЦТО</SelectItem>
                    <SelectItem value="Продажи">Продажи</SelectItem>
                    <SelectItem value="Маркетинг">Маркетинг</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Администрация">Администрация</SelectItem>
                    <SelectItem value="Учебный отдел">Учебный отдел</SelectItem>
                    <SelectItem value="Общий отдел">Общий отдел</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={profileForm.position}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <Label>Роль</Label>
                <Input value={employee.role} disabled />
              </div>
            </div>

            <Separator />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Icon name="Info" size={16} className="mr-2 text-blue-600" />
                Дополнительная информация
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">ID пользователя:</span>
                  <p className="font-medium">{employee.id}</p>
                </div>
                <div>
                  <span className="text-gray-600">Статус:</span>
                  <p className="font-medium">{employee.isActive ? '🟢 Активен' : '🔴 Неактивен'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Дата регистрации:</span>
                  <p className="font-medium">{new Date(employee.createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Последний вход:</span>
                  <p className="font-medium">
                    {employee.lastLoginAt 
                      ? new Date(employee.lastLoginAt).toLocaleDateString('ru-RU')
                      : 'Не входил'
                    }
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения профиля
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Смена пароля */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Lock" size={20} className="mr-2 text-green-600" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
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
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
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
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
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

      {/* Настройки уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Bell" size={20} className="mr-2 text-orange-600" />
            Настройки уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label>Звуковые уведомления</Label>
                {soundEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const oscillator = audioContext.createOscillator();
                      const gainNode = audioContext.createGain();
                      
                      oscillator.connect(gainNode);
                      gainNode.connect(audioContext.destination);
                      
                      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                      
                      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                      
                      oscillator.start(audioContext.currentTime);
                      oscillator.stop(audioContext.currentTime + 0.2);
                      
                      toast.success('Тестовый звук воспроизведен');
                    }}
                    className="h-6 text-xs"
                  >
                    <Icon name="Volume2" size={12} className="mr-1" />
                    Тест
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">Воспроизводить звук при восстановлении соединения с сервером</p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Статистика пользователя */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2 text-purple-600" />
            Моя статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Icon name="FileText" size={24} className="mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{employee.tests}</p>
              <p className="text-sm text-gray-600">Пройдено тестов</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon name="Award" size={24} className="mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{employee.avgScore}%</p>
              <p className="text-sm text-gray-600">Средний балл</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Icon name="Star" size={24} className="mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">{employee.score}</p>
              <p className="text-sm text-gray-600">Рейтинг</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Icon name="TrendingUp" size={24} className="mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{employee.status}/5</p>
              <p className="text-sm text-gray-600">Статус</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center">
              <Icon name="Activity" size={16} className="mr-2" />
              Последние результаты
            </h4>
            {employee.testResults && employee.testResults.length > 0 ? (
              <div className="space-y-2">
                {employee.testResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center">
                      <Icon name="CheckCircle" size={16} className="mr-2 text-green-600" />
                      <span className="text-sm">Тест #{result.id}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-medium text-green-600">{result.score}%</span>
                      <span className="text-gray-500">{result.timeSpent} мин</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Результаты тестов пока отсутствуют
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}