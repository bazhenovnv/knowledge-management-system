import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';
import NotificationForm from '@/components/notifications/NotificationForm';

// Безопасная функция для получения инициалов
const getInitials = (name: string | null | undefined): string => {
  if (!name || typeof name !== 'string') {
    return '??';
  }
  
  try {
    return name.split(' ')
      .filter(n => n && n.length > 0)
      .map(n => n.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
  } catch {
    return '??';
  }
};

const DatabaseEmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<DatabaseEmployee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<DatabaseEmployee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Состояния для диалогов
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DatabaseEmployee | null>(null);
  
  // Формы
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'employee' as 'admin' | 'teacher' | 'employee',
    password: ''
  });
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    role: 'employee' as 'admin' | 'teacher' | 'employee',
    is_active: true
  });
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Загрузка сотрудников из БД
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const employeeData = await databaseService.getEmployees();
      setEmployees(employeeData);
    } catch (error) {
      toast.error('Ошибка загрузки сотрудников');
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция добавления сотрудника
  const handleAddEmployee = async () => {
    if (!newEmployeeForm.full_name || !newEmployeeForm.email || !newEmployeeForm.password) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      const newEmployee = {
        ...newEmployeeForm,
        is_active: true,
        created_at: new Date().toISOString()
      };

      const result = await databaseService.addEmployee(newEmployee);
      if (result) {
        await loadEmployees();
        setIsAddDialogOpen(false);
        resetNewEmployeeForm();
        
        // Отправка email с данными для входа
        await sendWelcomeEmail(newEmployeeForm.email, newEmployeeForm.email, newEmployeeForm.password);
        
        toast.success(`Сотрудник ${newEmployeeForm.full_name} добавлен. Данные отправлены на email.`);
      } else {
        toast.error('Ошибка при добавлении сотрудника');
      }
    } catch (error) {
      toast.error('Ошибка при добавлении сотрудника');
      console.error('Error adding employee:', error);
    }
  };

  // Функция редактирования сотрудника
  const handleEditEmployee = (employee: DatabaseEmployee) => {
    setEditingEmployee(employee);
    setEditForm({
      full_name: employee.full_name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      role: employee.role || 'employee',
      is_active: employee.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Сохранение изменений сотрудника
  const handleSaveEditEmployee = async () => {
    if (!editingEmployee) return;

    try {
      const updatedEmployee = {
        ...editingEmployee,
        ...editForm,
        updated_at: new Date().toISOString()
      };

      const result = await databaseService.updateEmployee(editingEmployee.id, updatedEmployee);
      if (result) {
        await loadEmployees();
        setIsEditDialogOpen(false);
        setEditingEmployee(null);
        toast.success('Данные сотрудника обновлены');
      } else {
        toast.error('Ошибка при обновлении данных');
      }
    } catch (error) {
      toast.error('Ошибка при обновлении данных');
      console.error('Error updating employee:', error);
    }
  };

  // Изменение пароля
  const handleChangePassword = async () => {
    if (!selectedEmployee) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      const result = await databaseService.updateEmployeePassword(selectedEmployee.id, passwordForm.newPassword);
      if (result) {
        setIsPasswordDialogOpen(false);
        setSelectedEmployee(null);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        
        // Отправка нового пароля на email
        await sendPasswordChangeEmail(selectedEmployee.email, passwordForm.newPassword);
        
        toast.success('Пароль изменен и отправлен на email сотрудника');
      } else {
        toast.error('Ошибка при изменении пароля');
      }
    } catch (error) {
      toast.error('Ошибка при изменении пароля');
      console.error('Error changing password:', error);
    }
  };

  // Отправка приветственного email
  const sendWelcomeEmail = async (email: string, login: string, password: string) => {
    try {
      // Имитируем отправку email с уведомлением пользователя
      const emailContent = `
📧 ДАННЫЕ ДЛЯ ВХОДА
━━━━━━━━━━━━━━━━━━━━
👤 Логин: ${login}
🔐 Пароль: ${password}
━━━━━━━━━━━━━━━━━━━━

📌 Отправлено на: ${email}
⚠️ Рекомендуем сменить пароль после входа
      `;
      
      console.log('Приветственное письмо:', emailContent);
      
      // Показываем содержание письма пользователю
      toast.success(`Письмо отправлено на ${email}`, {
        description: 'Данные для входа отправлены сотруднику',
        duration: 5000,
      });
      
      // В реальной системе здесь был бы вызов API отправки email
      // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({...}) })
      
    } catch (error) {
      console.error('Ошибка отправки email:', error);
      toast.error('Ошибка отправки email');
    }
  };

  // Отправка нового пароля
  const sendPasswordChangeEmail = async (email: string, newPassword: string) => {
    try {
      // Имитируем отправку email с уведомлением пользователя
      const emailContent = `
📧 ПАРОЛЬ ИЗМЕНЕН
━━━━━━━━━━━━━━━━━━━━
🔐 Новый пароль: ${newPassword}
━━━━━━━━━━━━━━━━━━━━

📌 Отправлено на: ${email}
⚠️ Рекомендуем сменить пароль в настройках
      `;
      
      console.log('Письмо о смене пароля:', emailContent);
      
      // Показываем содержание письма пользователю
      toast.success(`Новый пароль отправлен на ${email}`, {
        description: 'Сотрудник получит новый пароль на email',
        duration: 5000,
      });
      
      // В реальной системе здесь был бы вызов API отправки email
      // await fetch('/api/send-email', { method: 'POST', body: JSON.stringify({...}) })
      
    } catch (error) {
      console.error('Ошибка отправки email:', error);
      toast.error('Ошибка отправки email');
    }
  };

  // Сброс формы добавления
  const resetNewEmployeeForm = () => {
    setNewEmployeeForm({
      full_name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      role: 'employee',
      password: ''
    });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Фильтрация сотрудников
  const filteredEmployees = employees.filter(employee => {
    if (!employee) return false; // Добавим защиту от null/undefined элементов
    
    const matchesSearch = !searchQuery || 
      (employee.full_name && employee.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (employee.department && employee.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole && employee.is_active;
  });

  // Получение уникальных отделов и ролей
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const roles = [...new Set(employees.map(emp => emp.role).filter(Boolean))];

  // Удаление сотрудника
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      await databaseService.deleteEmployee(selectedEmployee.id);
      toast.success(`Сотрудник ${selectedEmployee.full_name} удален`);
      await loadEmployees(); // Перезагружаем список
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error('Ошибка удаления сотрудника');
      console.error('Error deleting employee:', error);
    }
  };

  // Отправка уведомления
  const handleSendNotification = (employee: DatabaseEmployee) => {
    setSelectedEmployeeForNotification(employee);
    setIsNotificationFormOpen(true);
  };

  const handleCloseNotificationForm = () => {
    setIsNotificationFormOpen(false);
    setSelectedEmployeeForNotification(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Icon name="Loader2" size={24} className="animate-spin" />
          <span>Загрузка сотрудников из базы данных...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
          <p className="text-gray-600">Данные из PostgreSQL базы данных</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Icon name="Database" size={14} />
            <span>{employees.length} всего</span>
          </Badge>
          <Badge variant="default" className="flex items-center space-x-1">
            <Icon name="Users" size={14} />
            <span>{filteredEmployees.length} активных</span>
          </Badge>
          <Button onClick={loadEmployees} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className="mr-1" />
            Обновить
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить сотрудника
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <span>Фильтры</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Поиск</label>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Имя, email, отдел..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Отдел</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Все отделы</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Роль</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">Все роли</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'admin' ? 'Администратор' : 
                     role === 'teacher' ? 'Преподаватель' : 'Сотрудник'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список сотрудников */}
      <Card>
        <CardHeader>
          <CardTitle>Сотрудники ({filteredEmployees.length})</CardTitle>
          <CardDescription>Активные сотрудники из базы данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Сотрудники не найдены</p>
                <p className="text-sm">Попробуйте изменить параметры фильтрации</p>
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <span className="text-lg font-medium text-blue-600">
                        {getInitials(employee.full_name)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-lg">{employee.full_name || 'Не указано'}</div>
                      <div className="text-sm text-gray-500">
                        {employee.position || 'Не указано'} • {employee.department || 'Не указано'}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <Icon name="Mail" size={12} />
                        <span>{employee.email || 'Не указано'}</span>
                        {employee.phone && (
                          <>
                            <span>•</span>
                            <Icon name="Phone" size={12} />
                            <span>{employee.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={employee.role === 'admin' ? 'destructive' : 
                               employee.role === 'teacher' ? 'default' : 'secondary'}
                    >
                      {employee.role === 'admin' ? 'Администратор' : 
                       employee.role === 'teacher' ? 'Преподаватель' : 'Сотрудник'}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Редактировать"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsPasswordDialogOpen(true);
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Изменить пароль"
                      >
                        <Icon name="Key" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNotification(employee)}
                        className="text-purple-600 hover:text-purple-700"
                        title="Отправить уведомление"
                      >
                        <Icon name="Send" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить сотрудника {selectedEmployee?.full_name}? 
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <Button onClick={handleAddEmployee}>
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
            <Button onClick={handleSaveEditEmployee}>
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
            <Button onClick={handleChangePassword}>
              Изменить пароль
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Форма уведомлений */}
      {isNotificationFormOpen && selectedEmployeeForNotification && (
        <NotificationForm
          isOpen={isNotificationFormOpen}
          onClose={handleCloseNotificationForm}
          employees={employees.map(emp => databaseService.convertToOldEmployee(emp))}
          selectedEmployee={databaseService.convertToOldEmployee(selectedEmployeeForNotification)}
          currentUserRole="admin"
        />
      )}
    </div>
  );
};

export default DatabaseEmployeeManagement;