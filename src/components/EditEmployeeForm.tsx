import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { DatabaseEmployee } from '@/utils/databaseService';
import { externalDb } from '@/services/externalDbService';
import { useDepartments, usePositions } from '@/hooks/useDepartments';

interface EditEmployeeFormProps {
  employee: DatabaseEmployee;
  onEmployeeUpdated: (employee: DatabaseEmployee) => void;
  onClose: () => void;
}



const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({ 
  employee, 
  onEmployeeUpdated, 
  onClose 
}) => {
  const departments = useDepartments();
  const positions = usePositions();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    email: employee.email,
    phone: employee.phone || '',
    department: employee.department,
    position: employee.position,
    role: employee.role as 'admin' | 'teacher' | 'employee',
    zoom_link: employee.zoom_link || '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Валидация
      if (!formData.full_name?.trim() || !formData.email?.trim() || !formData.department?.trim() || !formData.position?.trim()) {
        toast.error('Заполните все обязательные поля (имя, email, отдел, должность)');
        setIsLoading(false);
        return;
      }

      // Проверка минимальной длины имени
      if (formData.full_name.trim().length < 3) {
        toast.error('Имя должно содержать минимум 3 символа');
        setIsLoading(false);
        return;
      }

      // Проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Введите корректный email адрес');
        setIsLoading(false);
        return;
      }

      // Проверка URL конференции (если заполнен)
      if (formData.zoom_link && formData.zoom_link.trim()) {
        try {
          const url = new URL(formData.zoom_link.trim());
          if (!['http:', 'https:'].includes(url.protocol)) {
            toast.error('Ссылка на конференцию должна начинаться с http:// или https://');
            setIsLoading(false);
            return;
          }
        } catch {
          toast.error('Введите корректную ссылку на конференцию (например: https://zoom.us/j/123456789)');
          setIsLoading(false);
          return;
        }
      }

      const updateData = { ...formData };
      if (!formData.password || formData.password.trim() === '') {
        delete updateData.password;
      }
      
      const updatedEmployee = await externalDb.updateEmployee(employee.id, updateData);
      
      if (updatedEmployee) {
        toast.success(`Данные сотрудника ${formData.full_name} успешно обновлены!`);
        onEmployeeUpdated(updatedEmployee);
        onClose();
      } else {
        toast.error('Ошибка при обновлении данных сотрудника');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Произошла ошибка при обновлении данных');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="UserPen" size={24} />
            Редактирование сотрудника
          </DialogTitle>
          <DialogDescription>
            Обновите информацию о сотруднике {employee.full_name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Полное имя *</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isLoading}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Новый пароль (необязательно)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={isLoading}
                placeholder="Оставьте пустым, чтобы не менять"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zoom_link" className="flex items-center gap-2">
              <Icon name="Video" size={16} />
              Ссылка на конференцию
            </Label>
            <Input
              id="zoom_link"
              type="url"
              value={formData.zoom_link}
              onChange={(e) => handleInputChange('zoom_link', e.target.value)}
              disabled={isLoading}
              placeholder="https://zoom.us/j/..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Отдел - выпадающий список */}
            <div>
              <Label htmlFor="department">Отдел *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleInputChange('department', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="position">Должность *</Label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => handleInputChange('position', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите должность" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Роль *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Сотрудник</SelectItem>
                <SelectItem value="teacher">Преподаватель</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <Icon name="X" size={16} className="mr-2" />
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeForm;