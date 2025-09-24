import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatabaseEmployee } from '@/utils/databaseService';

interface NewEmployeeForm {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  role: 'admin' | 'teacher' | 'employee';
  password: string;
}

interface EditForm {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  role: 'admin' | 'teacher' | 'employee';
  is_active: boolean;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface DatabaseEmployeeDialogsProps {
  // Add dialog states
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isPasswordDialogOpen: boolean;
  setIsPasswordDialogOpen: (open: boolean) => void;
  
  // Forms
  newEmployeeForm: NewEmployeeForm;
  setNewEmployeeForm: React.Dispatch<React.SetStateAction<NewEmployeeForm>>;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  
  // Selected employee for password change
  selectedEmployee: DatabaseEmployee | null;
  
  // Actions
  onAddEmployee: () => void;
  onSaveEditEmployee: () => void;
  onChangePassword: () => void;
}

export const DatabaseEmployeeDialogs: React.FC<DatabaseEmployeeDialogsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isPasswordDialogOpen,
  setIsPasswordDialogOpen,
  newEmployeeForm,
  setNewEmployeeForm,
  editForm,
  setEditForm,
  passwordForm,
  setPasswordForm,
  selectedEmployee,
  onAddEmployee,
  onSaveEditEmployee,
  onChangePassword
}) => {
  return (
    <>
      {/* Диалог добавления сотрудника */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить нового сотрудника</DialogTitle>
            <DialogDescription>
              Заполните данные сотрудника. Логин и пароль будут отправлены на указанный email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Полное имя *</Label>
              <Input
                id="full_name"
                value={newEmployeeForm.full_name}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, full_name: e.target.value}))}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newEmployeeForm.email}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, email: e.target.value}))}
                placeholder="ivan@company.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={newEmployeeForm.phone}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, phone: e.target.value}))}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div>
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                value={newEmployeeForm.position}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, position: e.target.value}))}
                placeholder="Менеджер"
              />
            </div>
            <div>
              <Label htmlFor="department">Отдел</Label>
              <Input
                id="department"
                value={newEmployeeForm.department}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, department: e.target.value}))}
                placeholder="IT отдел"
              />
            </div>
            <div>
              <Label htmlFor="role">Роль</Label>
              <Select value={newEmployeeForm.role} onValueChange={(value: 'admin' | 'teacher' | 'employee') => setNewEmployeeForm(prev => ({...prev, role: value}))}>
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
            <div>
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                value={newEmployeeForm.password}
                onChange={(e) => setNewEmployeeForm(prev => ({...prev, password: e.target.value}))}
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={onAddEmployee}>
              Добавить и отправить данные
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования сотрудника */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
            <DialogDescription>
              Измените данные сотрудника.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_full_name">Полное имя</Label>
              <Input
                id="edit_full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({...prev, full_name: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({...prev, email: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Телефон</Label>
              <Input
                id="edit_phone"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({...prev, phone: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="edit_position">Должность</Label>
              <Input
                id="edit_position"
                value={editForm.position}
                onChange={(e) => setEditForm(prev => ({...prev, position: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="edit_department">Отдел</Label>
              <Input
                id="edit_department"
                value={editForm.department}
                onChange={(e) => setEditForm(prev => ({...prev, department: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="edit_role">Роль</Label>
              <Select value={editForm.role} onValueChange={(value: 'admin' | 'teacher' | 'employee') => setEditForm(prev => ({...prev, role: value}))}>
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm(prev => ({...prev, is_active: e.target.checked}))}
                className="w-4 h-4"
              />
              <Label htmlFor="is_active">Активный сотрудник</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={onSaveEditEmployee}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог изменения пароля */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription>
              Новый пароль будет отправлен сотруднику на email: {selectedEmployee?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_password">Новый пароль</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                placeholder="Минимум 6 символов"
              />
            </div>
            <div>
              <Label htmlFor="confirm_password">Подтвердите пароль</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                placeholder="Повторите пароль"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={onChangePassword}>
              Изменить пароль
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};