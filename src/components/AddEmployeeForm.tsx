import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';

interface AddEmployeeFormProps {
  onEmployeeAdded: (employee: DatabaseEmployee) => void;
  onCancel: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onEmployeeAdded, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: 'employee' as 'admin' | 'teacher' | 'employee',
    hire_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Валидация
      if (!formData.full_name || !formData.email || !formData.department || !formData.position) {
        toast.error('Заполните все обязательные поля');
        return;
      }

      // Проверка email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Введите корректный email адрес');
        return;
      }

      const newEmployee = await databaseService.createEmployee(formData);
      
      if (newEmployee) {
        toast.success(`Сотрудник ${formData.full_name} успешно добавлен!`);
        onEmployeeAdded(newEmployee);
        // Сбрасываем форму
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          department: '',
          position: '',
          role: 'employee',
          hire_date: new Date().toISOString().split('T')[0]
        });
      } else {
        toast.error('Ошибка при добавлении сотрудника');
      }
    } catch (error) {
      toast.error('Произошла ошибка при добавлении сотрудника');
      console.error('Error adding employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const departments = [
    'IT',
    'Обучение',
    'Партнерка',
    'Отдел разработки',
    'Отдел продаж',
    'Техническая поддержка',
    'HR',
    'Маркетинг',
    'Финансы',
    'Управление',
    'Бухгалтерия',
    'Аналитика',
    'Дизайн',
    'QA/Тестирование',
    'DevOps',
    'Контент-менеджмент',
    'SEO/SMM',
    'Клиентский сервис',
    'Закупки',
    'Логистика',
    'Безопасность',
    'Юридический отдел',
    'Операционный отдел',
    'Планирование',
    'Исследования и разработки',
    'Другое'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="UserPlus" size={24} />
          <span>Добавить нового сотрудника</span>
        </CardTitle>
        <CardDescription>
          Заполните информацию о новом сотруднике системы управления обучением
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Полное имя *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ivanov@company.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            
            <div>
              <Label htmlFor="hire_date">Дата найма</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange('hire_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Отдел *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
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
              <Label htmlFor="role">Роль</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                  <SelectItem value="teacher">Преподаватель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="position">Должность *</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Senior разработчик"
              required
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex items-center space-x-2">
              {isLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="UserPlus" size={16} />
              )}
              <span>{isLoading ? 'Добавление...' : 'Добавить сотрудника'}</span>
            </Button>
            
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddEmployeeForm;