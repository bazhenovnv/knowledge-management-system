import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';

interface EditEmployeeFormProps {
  employee: DatabaseEmployee;
  onEmployeeUpdated: (employee: DatabaseEmployee) => void;
  onCancel: () => void;
}

const departments = [
  'IT', 'Обучение', 'Партнерка', 'Отдел разработки', 'QA/Тестирование', 'DevOps',
  'Отдел продаж', 'Маркетинг', 'SEO/SMM', 'HR', 'Управление', 'Бухгалтерия',
  'Финансы', 'Дизайн', 'Аналитика', 'Безопасность', 'Поддержка клиентов',
  'Логистика', 'Закупки', 'Юридический', 'Производство', 'Качество',
  'Исследования', 'Техническая документация', 'Проектное управление', 'Консалтинг'
];

const positions = [
  'Junior разработчик', 'Middle разработчик', 'Senior разработчик', 'Team Lead',
  'Менеджер проекта', 'Product Manager', 'Системный аналитик', 'Дизайнер',
  'QA инженер', 'DevOps инженер', 'Специалист', 'Старший специалист',
  'Эксперт', 'Консультант', 'Координатор', 'Ассистент', 'Стажер',
  'Руководитель отдела', 'Заместитель директора', 'Директор',
  'Бухгалтер', 'Экономист', 'HR-менеджер', 'Маркетолог', 'SMM-менеджер'
];

const EditEmployeeForm: React.FC<EditEmployeeFormProps> = ({ 
  employee, 
  onEmployeeUpdated, 
  onCancel 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    email: employee.email,
    phone: employee.phone || '',
    department: employee.department,
    position: employee.position,
    role: employee.role as 'admin' | 'teacher' | 'employee',
    hire_date: employee.hire_date || new Date().toISOString().split('T')[0]
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

      const updatedEmployee = await databaseService.updateEmployee(employee.id, formData);
      
      if (updatedEmployee) {
        toast.success(`Данные сотрудника ${formData.full_name} успешно обновлены!`);
        onEmployeeUpdated(updatedEmployee);
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UserPen" size={24} />
          Редактирование сотрудника
        </CardTitle>
        <CardDescription>
          Обновите информацию о сотруднике {employee.full_name}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
              <Label htmlFor="hire_date">Дата найма</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange('hire_date', e.target.value)}
                disabled={isLoading}
              />
            </div>
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
        </CardContent>
        
        <div className="flex gap-4 p-6 pt-0">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1"
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
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            <Icon name="X" size={16} className="mr-2" />
            Отменить
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditEmployeeForm;