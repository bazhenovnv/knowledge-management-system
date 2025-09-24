import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { database, type Employee } from '@/utils/database';
import { EmployeeFormData, EmployeeStats, SortField, SortOrder, BulkAction } from './types';
import * as XLSX from 'xlsx';
import { getStatusText } from '@/utils/statusUtils';

interface UseEmployeeManagementProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

export const useEmployeeManagement = ({ employees, onUpdateEmployees }: UseEmployeeManagementProps) => {
  const { toast } = useToast();
  
  // Фильтры и состояние
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  // Диалоги
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  
  // Форма
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    department: '',
    position: '',
    role: 'employee',
    status: 3,
    password: '',
    phone: '',
    notes: ''
  });
  
  // Выбранные элементы
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<Employee | null>(null);
  
  // Массовые действия
  const [bulkAction, setBulkAction] = useState<BulkAction>('department');
  const [bulkValue, setBulkValue] = useState('');
  
  // Статистика
  const [stats, setStats] = useState<EmployeeStats>({
    total: 0,
    byDepartment: {},
    byRole: {},
    byStatus: {},
    avgScore: 0
  });

  // Обновление статистики
  useEffect(() => {
    const total = employees.length;
    const byDepartment: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    let totalScore = 0;
    
    employees.forEach(emp => {
      byDepartment[emp.department] = (byDepartment[emp.department] || 0) + 1;
      byRole[emp.role] = (byRole[emp.role] || 0) + 1;
      byStatus[emp.status.toString()] = (byStatus[emp.status.toString()] || 0) + 1;
      totalScore += emp.avgScore || 0;
    });
    
    setStats({
      total,
      byDepartment,
      byRole,
      byStatus,
      avgScore: total > 0 ? Math.round(totalScore / total) : 0
    });
  }, [employees]);

  // Фильтрация и сортировка
  const filteredAndSortedEmployees = employees
    .filter(emp => {
      const matchesSearch = !searchQuery || 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || emp.status.toString() === selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      role: 'employee',
      status: 3,
      password: '',
      phone: '',
      notes: ''
    });
  };

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      toast({ title: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    const existingEmployee = database.findEmployeeByEmail(formData.email);
    if (existingEmployee) {
      toast({ title: 'Сотрудник с таким email уже существует', variant: 'destructive' });
      return;
    }

    try {
      const newEmployee = database.saveEmployee({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        role: formData.role,
        status: formData.status,
        tests: 0,
        avgScore: 0,
        score: 0,
        testResults: [],
        password: formData.password || undefined,
        isActive: true
      });

      onUpdateEmployees([...employees, newEmployee]);
      toast({ title: `Сотрудник ${formData.name} добавлен` });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Ошибка при добавлении сотрудника', variant: 'destructive' });
      console.error(error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      role: employee.role,
      status: employee.status,
      password: '',
      phone: '',
      notes: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee || !formData.name || !formData.email) {
      toast({ title: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    try {
      const updatedEmployee = database.updateEmployee(editingEmployee.id, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        role: formData.role,
        status: formData.status
      });

      if (updatedEmployee) {
        const updatedEmployees = employees.map(emp => 
          emp.id === editingEmployee.id ? updatedEmployee : emp
        );
        onUpdateEmployees(updatedEmployees);
        toast({ title: `Данные сотрудника ${formData.name} обновлены` });
        setIsEditDialogOpen(false);
        setEditingEmployee(null);
        resetForm();
      }
    } catch (error) {
      toast({ title: 'Ошибка при обновлении данных', variant: 'destructive' });
      console.error(error);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const success = database.deleteEmployee(deletingEmployee.id);
      if (success) {
        const updatedEmployees = employees.filter(emp => emp.id !== deletingEmployee.id);
        onUpdateEmployees(updatedEmployees);
        toast({ title: `Сотрудник ${deletingEmployee.name} удален` });
      } else {
        toast({ title: 'Ошибка при удалении сотрудника', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка при удалении сотрудника', variant: 'destructive' });
      console.error(error);
    }

    setIsDeleteDialogOpen(false);
    setDeletingEmployee(null);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredAndSortedEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAndSortedEmployees.map(emp => emp.id));
    }
  };

  const handleBulkAction = async () => {
    if (selectedEmployees.length === 0) {
      toast({ title: 'Выберите сотрудников для действия', variant: 'destructive' });
      return;
    }

    try {
      let updatedEmployees = [...employees];

      switch (bulkAction) {
        case 'department':
          if (!bulkValue) {
            toast({ title: 'Выберите отдел', variant: 'destructive' });
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { department: bulkValue });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast({ title: `Отдел обновлен для ${selectedEmployees.length} сотрудников` });
          break;

        case 'role':
          if (!bulkValue) {
            toast({ title: 'Выберите роль', variant: 'destructive' });
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { role: bulkValue as 'admin' | 'teacher' | 'employee' });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast({ title: `Роль обновлена для ${selectedEmployees.length} сотрудников` });
          break;

        case 'status':
          if (!bulkValue) {
            toast({ title: 'Выберите статус', variant: 'destructive' });
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { status: parseInt(bulkValue) });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast({ title: `Статус обновлен для ${selectedEmployees.length} сотрудников` });
          break;

        case 'delete':
          if (window.confirm(`Удалить ${selectedEmployees.length} сотрудников?`)) {
            selectedEmployees.forEach(id => database.deleteEmployee(id));
            updatedEmployees = updatedEmployees.filter(emp => !selectedEmployees.includes(emp.id));
            toast({ title: `Удалено сотрудников: ${selectedEmployees.length}` });
          }
          break;

        case 'export':
          const selectedEmployeeData = employees.filter(emp => selectedEmployees.includes(emp.id));
          exportToExcel(selectedEmployeeData, 'selected_employees');
          toast({ title: `Экспортировано ${selectedEmployees.length} сотрудников` });
          break;
      }

      onUpdateEmployees(updatedEmployees);
      setSelectedEmployees([]);
      setIsBulkEditOpen(false);
    } catch (error) {
      toast({ title: 'Ошибка при выполнении массового действия', variant: 'destructive' });
      console.error(error);
    }
  };

  const exportToExcel = (data: Employee[], filename: string) => {
    const exportData = data.map(emp => ({
      'Имя': emp.name,
      'Email': emp.email,
      'Отдел': emp.department,
      'Должность': emp.position,
      'Роль': emp.role,
      'Статус': getStatusText(emp.status),
      'Средний балл': emp.avgScore || 0,
      'Количество тестов': emp.tests || 0,
      'Дата создания': new Date(emp.createdAt).toLocaleDateString('ru-RU')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return {
    // State
    searchQuery, setSearchQuery,
    selectedDepartment, setSelectedDepartment,
    selectedRole, setSelectedRole,
    selectedStatus, setSelectedStatus,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    formData, setFormData,
    selectedEmployees, setSelectedEmployees,
    editingEmployee, setEditingEmployee,
    deletingEmployee, setDeletingEmployee,
    selectedEmployeeForNotification, setSelectedEmployeeForNotification,
    bulkAction, setBulkAction,
    bulkValue, setBulkValue,
    stats,
    filteredAndSortedEmployees,

    // Dialogs
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isBulkEditOpen, setIsBulkEditOpen,
    isDeleteDialogOpen, setIsDeleteDialogOpen,
    isNotificationFormOpen, setIsNotificationFormOpen,

    // Actions
    resetForm,
    handleAddEmployee,
    handleEditEmployee,
    handleSaveEdit,
    handleDeleteEmployee,
    handleSelectAll,
    handleBulkAction,
    exportToExcel
  };
};