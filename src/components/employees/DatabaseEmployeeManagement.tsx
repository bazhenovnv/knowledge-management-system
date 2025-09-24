import React, { useState, useEffect, ErrorBoundary } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
                        onClick={() => handleSendNotification(employee)}
                        className="text-blue-600 hover:text-blue-700"
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