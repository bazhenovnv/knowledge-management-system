import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS } from '@/constants/departments';
import { getStatusText } from '@/utils/statusUtils';
import { EmployeeFormData } from './types';

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  onSave: () => void;
  isEditing?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  setFormData,
  onSave,
  isEditing = false
}) => {
  const idPrefix = isEditing ? 'edit-' : '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}name`}>Имя *</Label>
            <Input
              id={`${idPrefix}name`}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={isEditing ? '' : 'Иванов Иван Иванович'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}email`}>Email *</Label>
            <Input
              id={`${idPrefix}email`}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder={isEditing ? '' : 'ivanov@company.com'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}department`}>Отдел *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите отдел" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}position`}>Должность *</Label>
            <Input
              id={`${idPrefix}position`}
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder={isEditing ? '' : 'Разработчик'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}role`}>Роль</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'teacher' | 'employee') => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
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
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}status`}>Статус</Label>
            <Select
              value={formData.status.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(status => (
                  <SelectItem key={status} value={status.toString()}>
                    {getStatusText(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isEditing && (
            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">Пароль (необязательно)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Оставьте пустым для автогенерации"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            {isEditing ? 'Сохранить изменения' : 'Добавить сотрудника'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;