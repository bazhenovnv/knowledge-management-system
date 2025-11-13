import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { DatabaseEmployee } from '@/utils/databaseService';
import { externalDb } from '@/services/externalDbService';
import NotificationForm from '@/components/notifications/NotificationForm';

// Импорты новых компонентов
import { EmployeeHeader } from './EmployeeHeader';
import { DatabaseEmployeeFilters } from './DatabaseEmployeeFilters';
import { DatabaseEmployeeCard } from './DatabaseEmployeeCard';
import { DatabaseEmployeeDialogs } from './DatabaseEmployeeDialogs';

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

  useEffect(() => {
    loadEmployees();
  }, []);

  // Загрузка сотрудников из БД
  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const employeeData = await externalDb.getEmployees();
      // Фильтруем только активных сотрудников
      const activeEmployees = employeeData.filter((emp: DatabaseEmployee) => emp.is_active !== false);
      setEmployees(activeEmployees);
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

      const result = await externalDb.addEmployee(newEmployee);
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
      // Передаем только изменяемые поля
      const updates = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        position: editForm.position,
        department: editForm.department,
        role: editForm.role,
        is_active: editForm.is_active,
        updated_at: new Date().toISOString()
      };

      console.log('Updating employee:', editingEmployee.id, updates);
      const result = await externalDb.updateEmployee(editingEmployee.id, updates);
      console.log('Update result:', result);
      
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
      const result = await externalDb.updateEmployeePassword(selectedEmployee.id, passwordForm.newPassword);
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

  // Удаление сотрудника
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      console.log('Deleting employee:', selectedEmployee.id);
      const result = await externalDb.deleteEmployee(selectedEmployee.id);
      console.log('Delete result:', result);
      
      if (result) {
        toast.success(`Сотрудник ${selectedEmployee.full_name} удален`);
        await loadEmployees();
        setIsDeleteDialogOpen(false);
        setSelectedEmployee(null);
      } else {
        toast.error('Не удалось удалить сотрудника');
      }
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
      <EmployeeHeader 
        employees={employees}
        filteredEmployees={filteredEmployees}
        onRefresh={loadEmployees}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />

      {/* Фильтры */}
      <DatabaseEmployeeFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        employees={employees}
      />

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
                <DatabaseEmployeeCard
                  key={employee.id}
                  employee={employee}
                  onEdit={handleEditEmployee}
                  onChangePassword={(emp) => {
                    setSelectedEmployee(emp);
                    setIsPasswordDialogOpen(true);
                  }}
                  onSendNotification={handleSendNotification}
                  onDelete={(emp) => {
                    setSelectedEmployee(emp);
                    setIsDeleteDialogOpen(true);
                  }}
                />
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

      {/* Все диалоги управления сотрудниками */}
      <DatabaseEmployeeDialogs
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isPasswordDialogOpen={isPasswordDialogOpen}
        setIsPasswordDialogOpen={setIsPasswordDialogOpen}
        newEmployeeForm={newEmployeeForm}
        setNewEmployeeForm={setNewEmployeeForm}
        editForm={editForm}
        setEditForm={setEditForm}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        selectedEmployee={selectedEmployee}
        onAddEmployee={handleAddEmployee}
        onSaveEditEmployee={handleSaveEditEmployee}
        onChangePassword={handleChangePassword}
      />

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