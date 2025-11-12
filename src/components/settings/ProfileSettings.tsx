import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { externalDb } from "@/services/externalDbService";
import { toast } from "sonner";
import ProfileInfoCard from "./ProfileInfoCard";
import SecurityCard from "./SecurityCard";

interface ProfileSettingsProps {
  userId: number;
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  position: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

export default function ProfileSettings({ userId }: ProfileSettingsProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadEmployeeData();
  }, [userId]);

  const loadEmployeeData = async () => {
    try {
      const employeeData = localStorage.getItem('employee_data');
      if (employeeData) {
        const parsedData = JSON.parse(employeeData);
        setEmployee(parsedData);
      } else {
        const data = await externalDb.getEmployee(userId);
        if (data) {
          setEmployee(data);
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error('Ошибка загрузки данных профиля');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    avatar: ''
  });

  useEffect(() => {
    if (employee) {
      setProfileForm({
        name: employee.full_name || '',
        email: employee.email || '',
        department: employee.department || '',
        position: employee.position || '',
        phone: employee.phone || '',
        avatar: employee.avatar_url || ''
      });
    }
  }, [employee]);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;

    try {
      await externalDb.updateEmployee(userId, {
        full_name: profileForm.name,
        department: profileForm.department,
        position: profileForm.position,
        phone: profileForm.phone
      });

      const updatedEmployee = { ...employee, full_name: profileForm.name, department: profileForm.department, position: profileForm.position, phone: profileForm.phone };
      localStorage.setItem('employee_data', JSON.stringify(updatedEmployee));
      setEmployee(updatedEmployee);

      toast.success('Профиль успешно обновлён!');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      toast.error('Ошибка при обновлении профиля');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Новые пароли не совпадают');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Новый пароль должен содержать не менее 8 символов');
      return;
    }

    try {
      await externalDb.updateEmployee(userId, {
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
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfileForm(prev => ({ ...prev, avatar: base64String }));
        
        await externalDb.updateEmployee(userId, {
          avatar_url: base64String
        });
        
        if (employee) {
          const updatedEmployee = { ...employee, avatar_url: base64String };
          localStorage.setItem('employee_data', JSON.stringify(updatedEmployee));
          setEmployee(updatedEmployee);
        }
        
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" size={24} className="animate-spin mr-2" />
        <span>Загрузка данных профиля...</span>
      </div>
    );
  }

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
    </div>
  );
}