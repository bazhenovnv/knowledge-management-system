import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { database, type Employee } from "@/utils/database";
import { useDepartments } from "@/hooks/useDepartments";
import { toast } from "sonner";
import NotificationForm from "@/components/notifications/NotificationForm";

// Импорты компонентов
import EmployeeTabHeader from './EmployeeTabHeader';
import EmployeeTabFilters from './EmployeeTabFilters';
import EmployeeTabStats from './EmployeeTabStats';
import EmployeeTabTable from './EmployeeTabTable';
import AddEmployeeDialog from './AddEmployeeDialog';
import EditEmployeeDialog from './EditEmployeeDialog';
import { getTestScore } from './employeeUtils';

// Импорты типов
import { EmployeesTabProps, NewEmployeeFormData, EditingEmployeeData } from './employeeTabTypes';
import { useScrollPosition } from "@/hooks/useScrollPosition";

export const EmployeesTab = ({ userRole }: EmployeesTabProps) => {
  const customDepartments = useDepartments();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(() => {
    const saved = localStorage.getItem('employeesDepartmentFilter');
    return saved || "all";
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem('employeesStatusFilter');
    return saved || "all";
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<Employee | null>(null);

  // Загружаем сотрудников из базы данных при инициализации
  useEffect(() => {
    const loadEmployees = () => {
      const employeesFromDB = database.getEmployees();
      setEmployees(employeesFromDB);
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    localStorage.setItem('employeesDepartmentFilter', departmentFilter);
  }, [departmentFilter]);

  useEffect(() => {
    localStorage.setItem('employeesStatusFilter', statusFilter);
  }, [statusFilter]);

  const [newEmployee, setNewEmployee] = useState<NewEmployeeFormData>({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "employee",
    status: 3
  });

  const [editingEmployee, setEditingEmployee] = useState<EditingEmployeeData>({
    id: null,
    name: "",
    email: "",
    department: "",
    position: "",
    role: "employee",
    status: 3
  });

  const { scrollRef, showIndicator } = useScrollPosition('employeesTab', employees.length);

  // Фильтрация сотрудников
  const filteredEmployees = employees
    .filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(emp => departmentFilter === "all" || emp.department === departmentFilter)
    .filter(emp => statusFilter === "all" || emp.status === parseInt(statusFilter))
    .sort((a, b) => getTestScore(b) - getTestScore(a));

  // Получение уникальных отделов из существующих сотрудников + константы
  const existingDepartments = Array.from(new Set(employees.map(emp => emp.department)));
  const departments = Array.from(new Set([...customDepartments, ...existingDepartments]));

  // Функция добавления сотрудника
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // Проверяем, существует ли уже сотрудник с таким email
    const existingEmployee = database.findEmployeeByEmail(newEmployee.email);
    if (existingEmployee) {
      toast.error("Сотрудник с таким email уже существует");
      return;
    }

    try {
      // Сохраняем сотрудника в базе данных
      const savedEmployee = database.saveEmployee({
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        position: newEmployee.position,
        role: newEmployee.role as "admin" | "teacher" | "employee",
        status: newEmployee.status,
        tests: 0,
        avgScore: 0,
        score: 0,
        testResults: []
      });

      // Обновляем локальное состояние
      setEmployees(prev => [...prev, savedEmployee]);
      setIsAddDialogOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        department: "",
        position: "",
        role: "employee",
        status: 3
      });
      toast.success("Сотрудник успешно добавлен в базу данных");
    } catch (error) {
      toast.error("Ошибка при сохранении сотрудника");
      console.error("Ошибка сохранения:", error);
    }
  };

  // Функция редактирования сотрудника
  const handleEditEmployee = (employee: Employee) => {
    console.log("handleEditEmployee called with:", employee);
    setEditingEmployee({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      role: employee.role,
      status: employee.status
    });
    setIsEditDialogOpen(true);
  };

  // Функция сохранения изменений
  const handleSaveEdit = () => {
    console.log("handleSaveEdit called", editingEmployee);
    
    if (!editingEmployee.name || !editingEmployee.email || !editingEmployee.department || !editingEmployee.position) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    if (!editingEmployee.id) {
      toast.error("ID сотрудника не найден");
      console.error("Employee ID is null", editingEmployee);
      return;
    }

    try {
      console.log("Updating employee with ID:", editingEmployee.id);
      
      // Обновляем сотрудника в базе данных
      const updatedEmployee = database.updateEmployee(editingEmployee.id, {
        name: editingEmployee.name,
        email: editingEmployee.email,
        department: editingEmployee.department,
        position: editingEmployee.position,
        role: editingEmployee.role as "admin" | "teacher" | "employee",
        status: editingEmployee.status
      });

      console.log("Updated employee result:", updatedEmployee);

      if (updatedEmployee) {
        // Обновляем локальное состояние
        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployee.id 
            ? updatedEmployee
            : emp
        ));
        
        setIsEditDialogOpen(false);
        setEditingEmployee({
          id: null,
          name: "",
          email: "",
          department: "",
          position: "",
          role: "employee",
          status: 3
        });
        toast.success("Данные сотрудника обновлены в базе данных");
      } else {
        toast.error("Сотрудник не найден");
        console.error("Updated employee is null");
      }
    } catch (error) {
      toast.error("Ошибка при обновлении данных сотрудника");
      console.error("Ошибка обновления:", error);
    }
  };

  // Функция отправки уведомления конкретному сотруднику
  const handleSendNotification = (employee: Employee) => {
    setSelectedEmployeeForNotification(employee);
    setNotificationFormOpen(true);
  };

  // Функция массовой отправки уведомлений
  const handleBulkNotification = () => {
    setSelectedEmployeeForNotification(null);
    setNotificationFormOpen(true);
  };

  // Функция удаления сотрудника
  const handleDeleteEmployee = (id: number) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      try {
        // Удаляем сотрудника из базы данных
        const success = database.deleteEmployee(id);
        
        if (success) {
          // Удаляем из локального состояния
          setEmployees(prev => prev.filter(emp => emp.id !== id));
          setDeleteEmployeeId(null);
          toast.success(`Сотрудник ${employee.name} удален из базы данных`);
        } else {
          toast.error("Сотрудник не найден в базе данных");
        }
      } catch (error) {
        toast.error("Ошибка при удалении сотрудника");
        console.error("Ошибка удаления:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <EmployeeTabHeader
        userRole={userRole}
        employees={employees}
        onBulkNotification={handleBulkNotification}
        onAddEmployee={() => setIsAddDialogOpen(true)}
      />

      {/* Фильтры */}
      <EmployeeTabFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departments={departments}
      />

      {/* Статистика */}
      <EmployeeTabStats employees={employees} />

      {/* Таблица сотрудников */}
      <EmployeeTabTable
        employees={filteredEmployees}
        userRole={userRole}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={setDeleteEmployeeId}
        onSendNotification={handleSendNotification}
      />

      {/* Диалог добавления сотрудника */}
      <AddEmployeeDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        newEmployee={newEmployee}
        setNewEmployee={setNewEmployee}
        departments={departments}
        onAddEmployee={handleAddEmployee}
      />

      {/* Диалог редактирования сотрудника */}
      <EditEmployeeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        departments={departments}
        onSaveEdit={handleSaveEdit}
      />

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этого сотрудника? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteEmployeeId(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteEmployeeId && handleDeleteEmployee(deleteEmployeeId)} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Форма отправки уведомлений */}
      <NotificationForm
        isOpen={notificationFormOpen}
        onClose={() => {
          setNotificationFormOpen(false);
          setSelectedEmployeeForNotification(null);
        }}
        employees={employees}
        selectedEmployee={selectedEmployeeForNotification}
        currentUserRole={userRole as 'admin' | 'teacher'}
      />
    </div>
  );
};