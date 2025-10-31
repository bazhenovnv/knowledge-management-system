import React, { useState, useEffect } from 'react';
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
import { EmployeeCard } from './employee/EmployeeCard';
import { EmployeeToolbar } from './employee/EmployeeToolbar';
import { EmployeeImport } from './employee/EmployeeImport';
import { EmployeeExport } from './employee/EmployeeExport';
import Icon from '@/components/ui/icon';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<DatabaseEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<DatabaseEmployee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<DatabaseEmployee | null>(null);
  const importRef = React.useRef<{ handleImportClick: () => void }>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    console.log('🔄 Loading employees from database...');
    setIsLoading(true);
    try {
      const data = await databaseService.getEmployees();
      console.log('✅ Employees loaded:', data.length, 'records');
      console.log('📋 First employee:', data[0]);
      setEmployees(data);
    } catch (error) {
      console.error('❌ Error loading employees:', error);
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
      const success = employeeToDelete.is_active 
        ? await databaseService.deleteEmployee(employeeToDelete.id)
        : await databaseService.permanentDeleteEmployee(employeeToDelete.id);
      
      if (success) {
        await loadEmployees();
        const message = employeeToDelete.is_active
          ? `Сотрудник ${employeeToDelete.full_name} деактивирован`
          : `Сотрудник ${employeeToDelete.full_name} полностью удалён из базы данных`;
        toast.success(message);
      } else {
        toast.error('Не удалось удалить сотрудника');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Ошибка при удалении сотрудника');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Загрузка списка сотрудников...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeeImport 
        onImportComplete={loadEmployees}
      />

      <EmployeeToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddEmployee={() => setIsAddingEmployee(true)}
        onImport={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          fileInput?.click();
        }}
        onExportExcel={() => EmployeeExport.exportToExcel(employees)}
        onExportCSV={() => EmployeeExport.exportToCSV(employees)}
        employeeCount={employees.length}
      />

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Users" size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-muted-foreground text-lg mb-2">
            {searchTerm ? 'Сотрудники не найдены' : 'Список сотрудников пуст'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchTerm 
              ? 'Попробуйте изменить параметры поиска' 
              : 'Добавьте первого сотрудника, нажав кнопку "Добавить"'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={setEditingEmployee}
              onDelete={setEmployeeToDelete}
            />
          ))}
        </div>
      )}

      {editingEmployee && (
        <EditEmployeeForm
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onEmployeeUpdated={handleEmployeeUpdated}
        />
      )}

      {isAddingEmployee && (
        <AddEmployeeForm
          onClose={() => setIsAddingEmployee(false)}
          onEmployeeAdded={handleEmployeeAdded}
        />
      )}

      <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {employeeToDelete?.is_active ? 'Деактивировать сотрудника?' : 'Удалить сотрудника?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {employeeToDelete?.is_active ? (
                <>
                  Сотрудник <strong>{employeeToDelete?.full_name}</strong> будет деактивирован, но останется в базе данных.
                  Вы сможете восстановить его позже.
                </>
              ) : (
                <>
                  Сотрудник <strong>{employeeToDelete?.full_name}</strong> будет полностью удалён из базы данных.
                  Это действие нельзя отменить.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">
              {employeeToDelete?.is_active ? 'Деактивировать' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeList;
