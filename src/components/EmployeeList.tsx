import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';
import EditEmployeeForm from './EditEmployeeForm';
import AddEmployeeForm from './AddEmployeeForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<DatabaseEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<DatabaseEmployee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<DatabaseEmployee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await databaseService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Ошибка при загрузке списка сотрудников');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = employees.filter(emp => 
      emp.full_name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term) ||
      (emp.phone && emp.phone.includes(term))
    );
    
    setFilteredEmployees(filtered);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      const success = await databaseService.deleteEmployee(employeeToDelete.id);
      
      if (success) {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        toast.success(`Сотрудник ${employeeToDelete.full_name} деактивирован`);
      } else {
        toast.error('Не удалось деактивировать сотрудника');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Ошибка при деактивации сотрудника');
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleEmployeeUpdated = (updatedEmployee: DatabaseEmployee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
    setEditingEmployee(null);
    toast.success('Данные сотрудника обновлены');
  };

  const handleEmployeeAdded = (newEmployee: DatabaseEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    setIsAddingEmployee(false);
    toast.success('Новый сотрудник добавлен');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      default: return 'Сотрудник';
    }
  };

  if (isAddingEmployee) {
    return (
      <div>
        <Button 
          onClick={() => setIsAddingEmployee(false)}
          variant="outline"
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад к списку
        </Button>
        
        <AddEmployeeForm
          onEmployeeAdded={handleEmployeeAdded}
          onCancel={() => setIsAddingEmployee(false)}
        />
      </div>
    );
  }

  if (editingEmployee) {
    return (
      <div>
        <Button 
          onClick={() => setEditingEmployee(null)}
          variant="outline"
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад к списку
        </Button>
        
        <EditEmployeeForm
          employee={editingEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
          onCancel={() => setEditingEmployee(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={24} className="animate-spin mr-2" />
          Загрузка сотрудников...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Список сотрудников ({employees.length})
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddingEmployee(true)} size="sm">
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить
              </Button>
              <Button onClick={loadEmployees} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <Input
                type="text"
                placeholder="Поиск по имени, email, отделу, должности или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Найдено: {filteredEmployees.length} из {employees.length}
              </p>
            )}
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm ? 'Сотрудники не найдены по запросу' : 'Сотрудники не найдены'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
              <div 
                key={employee.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{employee.full_name}</h3>
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {getRoleText(employee.role)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Icon name="Mail" size={14} />
                        {employee.email}
                      </div>
                      
                      {employee.phone && (
                        <div className="flex items-center gap-1">
                          <Icon name="Phone" size={14} />
                          {employee.phone}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Icon name="Building2" size={14} />
                        {employee.department}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Icon name="Briefcase" size={14} />
                        {employee.position}
                      </div>
                    </div>
                    
                    {employee.hire_date && (
                      <div className="mt-2 text-xs text-gray-500">
                        Дата найма: {new Date(employee.hire_date).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingEmployee(employee)}
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Редактировать
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEmployeeToDelete(employee)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Подтверждение деактивации</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите деактивировать сотрудника{' '}
            <strong>{employeeToDelete?.full_name}</strong>?
            <br />
            <br />
            Сотрудник будет скрыт из списка, но данные останутся в базе данных.
            Это действие можно отменить через администраторскую панель.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteEmployee}
            className="bg-red-600 hover:bg-red-700"
          >
            Деактивировать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default EmployeeList;