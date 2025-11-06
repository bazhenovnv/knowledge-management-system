import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import { toast } from "sonner";
import { SoundType } from "@/utils/soundEffects";
import ProfileInfoCard from "./ProfileInfoCard";
import SecurityCard from "./SecurityCard";
import NotificationSettingsCard from "./NotificationSettingsCard";
import UserStatsCard from "./UserStatsCard";

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
  const [soundType, setSoundType] = useState<SoundType>('notification');

  useEffect(() => {
    const appSettings = localStorage.getItem('app_settings');
    if (appSettings) {
      const settings = JSON.parse(appSettings);
      setSoundEnabled(settings.enableSoundNotifications !== false);
      setSoundType(settings.soundNotificationType || 'notification');
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

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked);
    
    const appSettings = localStorage.getItem('app_settings');
    const settings = appSettings ? JSON.parse(appSettings) : {};
    settings.enableSoundNotifications = checked;
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    toast.success(checked ? 'Звуковые уведомления включены' : 'Звуковые уведомления выключены');
  };

  const handleSoundTypeChange = (type: SoundType) => {
    setSoundType(type);
    
    const appSettings = localStorage.getItem('app_settings');
    const settings = appSettings ? JSON.parse(appSettings) : {};
    settings.soundNotificationType = type;
    localStorage.setItem('app_settings', JSON.stringify(settings));
    
    toast.success(`Выбран звук`);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileForm(prev => ({ ...prev, avatar: base64String }));
        
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
      <ProfileInfoCard
        employee={employee}
        profileForm={profileForm}
        isUploadingPhoto={isUploadingPhoto}
        onProfileFormChange={(updates) => setProfileForm(prev => ({ ...prev, ...updates }))}
        onPhotoUpload={handlePhotoUpload}
        onSubmit={handleProfileUpdate}
      />

      <SecurityCard
        passwordForm={passwordForm}
        onPasswordFormChange={(updates) => setPasswordForm(prev => ({ ...prev, ...updates }))}
        onSubmit={handlePasswordChange}
      />

      <NotificationSettingsCard
        soundEnabled={soundEnabled}
        soundType={soundType}
        onSoundToggle={handleSoundToggle}
        onSoundTypeChange={handleSoundTypeChange}
      />

      <UserStatsCard employee={employee} />
    </div>
  );
}
