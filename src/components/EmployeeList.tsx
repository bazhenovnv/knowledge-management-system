import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';
import EditEmployeeForm from './EditEmployeeForm';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<DatabaseEmployee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

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

  const handleEmployeeUpdated = (updatedEmployee: DatabaseEmployee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
    setEditingEmployee(null);
    toast.success('Данные сотрудника обновлены');
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

  if (editingEmployee) {
    return (
      <div>
        <Button 
          onClick={() => setEditingEmployee(null)}
          variant="outline"
          className="mb-4"
        >
          ← Назад к списку
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={24} />
            Список сотрудников ({employees.length})
          </div>
          <Button onClick={loadEmployees} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Сотрудники не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {employees.map((employee) => (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;