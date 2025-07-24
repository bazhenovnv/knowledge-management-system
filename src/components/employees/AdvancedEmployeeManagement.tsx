import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { database, type Employee } from '@/utils/database';
import { getStatusColor, getStatusText } from '@/utils/statusUtils';
import { DEPARTMENTS } from '@/constants/departments';
import NotificationForm from '@/components/notifications/NotificationForm';
import * as XLSX from 'xlsx';

interface AdvancedEmployeeManagementProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'teacher' | 'employee';
  status: number;
  password?: string;
  phone?: string;
  notes?: string;
}

const AdvancedEmployeeManagement: React.FC<AdvancedEmployeeManagementProps> = ({
  employees,
  onUpdateEmployees
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'role' | 'status' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Диалоги и модальные окна
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNotificationFormOpen, setIsNotificationFormOpen] = useState(false);
  
  // Данные форм
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
  
  // Выбранные сотрудники
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<Employee | null>(null);

  // Массовые действия
  const [bulkAction, setBulkAction] = useState<'department' | 'role' | 'status' | 'delete' | 'export'>('department');
  const [bulkValue, setBulkValue] = useState('');

  // Статистика
  const [stats, setStats] = useState({
    total: 0,
    byDepartment: {} as Record<string, number>,
    byRole: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
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

  // Фильтрация и сортировка сотрудников
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

  // Сброс формы
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

  // Добавление сотрудника
  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    // Проверка на дублирование email
    const existingEmployee = database.findEmployeeByEmail(formData.email);
    if (existingEmployee) {
      toast.error('Сотрудник с таким email уже существует');
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
      toast.success(`Сотрудник ${formData.name} добавлен`);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Ошибка при добавлении сотрудника');
      console.error(error);
    }
  };

  // Редактирование сотрудника
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

  // Сохранение изменений
  const handleSaveEdit = async () => {
    if (!editingEmployee || !formData.name || !formData.email) {
      toast.error('Заполните все обязательные поля');
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
        toast.success(`Данные сотрудника ${formData.name} обновлены`);
        setIsEditDialogOpen(false);
        setEditingEmployee(null);
        resetForm();
      }
    } catch (error) {
      toast.error('Ошибка при обновлении данных');
      console.error(error);
    }
  };

  // Удаление сотрудника
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const success = database.deleteEmployee(deletingEmployee.id);
      if (success) {
        const updatedEmployees = employees.filter(emp => emp.id !== deletingEmployee.id);
        onUpdateEmployees(updatedEmployees);
        toast.success(`Сотрудник ${deletingEmployee.name} удален`);
      } else {
        toast.error('Ошибка при удалении сотрудника');
      }
    } catch (error) {
      toast.error('Ошибка при удалении сотрудника');
      console.error(error);
    }

    setIsDeleteDialogOpen(false);
    setDeletingEmployee(null);
  };

  // Выбор всех сотрудников
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredAndSortedEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredAndSortedEmployees.map(emp => emp.id));
    }
  };

  // Массовые действия
  const handleBulkAction = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Выберите сотрудников для действия');
      return;
    }

    try {
      let updatedEmployees = [...employees];

      switch (bulkAction) {
        case 'department':
          if (!bulkValue) {
            toast.error('Выберите отдел');
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { department: bulkValue });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast.success(`Отдел обновлен для ${selectedEmployees.length} сотрудников`);
          break;

        case 'role':
          if (!bulkValue) {
            toast.error('Выберите роль');
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { role: bulkValue as 'admin' | 'teacher' | 'employee' });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast.success(`Роль обновлена для ${selectedEmployees.length} сотрудников`);
          break;

        case 'status':
          if (!bulkValue) {
            toast.error('Выберите статус');
            return;
          }
          selectedEmployees.forEach(id => {
            const employee = database.updateEmployee(id, { status: parseInt(bulkValue) });
            if (employee) {
              const index = updatedEmployees.findIndex(emp => emp.id === id);
              if (index !== -1) updatedEmployees[index] = employee;
            }
          });
          toast.success(`Статус обновлен для ${selectedEmployees.length} сотрудников`);
          break;

        case 'delete':
          if (window.confirm(`Удалить ${selectedEmployees.length} сотрудников?`)) {
            selectedEmployees.forEach(id => database.deleteEmployee(id));
            updatedEmployees = updatedEmployees.filter(emp => !selectedEmployees.includes(emp.id));
            toast.success(`Удалено сотрудников: ${selectedEmployees.length}`);
          }
          break;

        case 'export':
          const selectedEmployeeData = employees.filter(emp => selectedEmployees.includes(emp.id));
          exportToExcel(selectedEmployeeData, 'selected_employees');
          toast.success(`Экспортировано ${selectedEmployees.length} сотрудников`);
          break;
      }

      onUpdateEmployees(updatedEmployees);
      setSelectedEmployees([]);
      setIsBulkEditOpen(false);
    } catch (error) {
      toast.error('Ошибка при выполнении массового действия');
      console.error(error);
    }
  };

  // Экспорт в Excel
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

  // Получение роли на русском
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      case 'employee': return 'Сотрудник';
      default: return role;
    }
  };

  // Получение цвета роли
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и основные действия */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Управление сотрудниками</h2>
          <p className="text-gray-600">Всего сотрудников: {stats.total}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Icon name="UserPlus" size={16} />
            <span>Добавить сотрудника</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNotificationFormOpen(true)}
            className="flex items-center space-x-2"
          >
            <Icon name="Bell" size={16} />
            <span>Уведомить всех</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToExcel(employees, 'all_employees')}
            className="flex items-center space-x-2"
          >
            <Icon name="Download" size={16} />
            <span>Экспорт</span>
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Средний балл</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <Icon name="TrendingUp" size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Отделов</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byDepartment).length}</p>
              </div>
              <Icon name="Building2" size={24} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выбрано</p>
                <p className="text-2xl font-bold">{selectedEmployees.length}</p>
              </div>
              <Icon name="CheckSquare" size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Поиск</Label>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск сотрудников..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Отдел</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все отделы</SelectItem>
                  {Object.keys(stats.byDepartment).map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept} ({stats.byDepartment[dept]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администратор ({stats.byRole.admin || 0})</SelectItem>
                  <SelectItem value="teacher">Преподаватель ({stats.byRole.teacher || 0})</SelectItem>
                  <SelectItem value="employee">Сотрудник ({stats.byRole.employee || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {[1, 2, 3, 4, 5].map(status => (
                    <SelectItem key={status} value={status.toString()}>
                      {getStatusText(status)} ({stats.byStatus[status.toString()] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Сортировка</Label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as any);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Имя (А-Я)</SelectItem>
                  <SelectItem value="name-desc">Имя (Я-А)</SelectItem>
                  <SelectItem value="department-asc">Отдел (А-Я)</SelectItem>
                  <SelectItem value="createdAt-desc">Дата создания (новые)</SelectItem>
                  <SelectItem value="createdAt-asc">Дата создания (старые)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Массовые действия */}
      {selectedEmployees.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="CheckSquare" size={16} className="text-orange-600" />
                <span className="font-medium">Выбрано сотрудников: {selectedEmployees.length}</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditOpen(true)}
                >
                  Массовые действия
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEmployees([])}
                >
                  Отменить выбор
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица сотрудников */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Сотрудники ({filteredAndSortedEmployees.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedEmployees.length === filteredAndSortedEmployees.length ? 'Снять выбор' : 'Выбрать все'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmployees.length === filteredAndSortedEmployees.length && filteredAndSortedEmployees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Отдел</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Прогресс</TableHead>
                  <TableHead>Тесты</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEmployees([...selectedEmployees, employee.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        <div className="text-xs text-gray-400">{employee.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(employee.role)}>
                        {getRoleText(employee.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(employee.status)} text-white`}>
                        {getStatusText(employee.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Средний балл</span>
                          <span>{employee.avgScore || 0}%</span>
                        </div>
                        <Progress value={employee.avgScore || 0} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{employee.tests || 0}</div>
                        <div className="text-xs text-gray-500">пройдено</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedEmployeeForNotification(employee);
                            setIsNotificationFormOpen(true);
                          }}>
                            <Icon name="Bell" size={16} className="mr-2" />
                            Отправить уведомление
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(employee.email);
                            toast.success('Email скопирован в буфер обмена');
                          }}>
                            <Icon name="Copy" size={16} className="mr-2" />
                            Копировать email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const mailtoLink = `mailto:${employee.email}?subject=Сообщение от администратора`;
                            window.open(mailtoLink);
                          }}>
                            <Icon name="Mail" size={16} className="mr-2" />
                            Написать письмо
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setDeletingEmployee(employee);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Форма добавления сотрудника */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить нового сотрудника</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="ivanov@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Отдел *</Label>
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
              <Label htmlFor="position">Должность *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Разработчик"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
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
              <Label htmlFor="status">Статус</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddEmployee}>
              Добавить сотрудника
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Форма редактирования сотрудника */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Отдел *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-position">Должность *</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
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
              <Label htmlFor="edit-status">Статус</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить изменения
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог массовых действий */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Массовые действия</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Действие</Label>
              <Select
                value={bulkAction}
                onValueChange={(value: 'department' | 'role' | 'status' | 'delete' | 'export') => 
                  setBulkAction(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Изменить отдел</SelectItem>
                  <SelectItem value="role">Изменить роль</SelectItem>
                  <SelectItem value="status">Изменить статус</SelectItem>
                  <SelectItem value="export">Экспортировать</SelectItem>
                  <SelectItem value="delete">Удалить</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkAction === 'department' && (
              <div className="space-y-2">
                <Label>Новый отдел</Label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
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
            )}

            {bulkAction === 'role' && (
              <div className="space-y-2">
                <Label>Новая роль</Label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Сотрудник</SelectItem>
                    <SelectItem value="teacher">Преподаватель</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'status' && (
              <div className="space-y-2">
                <Label>Новый статус</Label>
                <Select value={bulkValue} onValueChange={setBulkValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
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
            )}

            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Выбрано сотрудников: <strong>{selectedEmployees.length}</strong>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleBulkAction}>
              Применить действие
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить сотрудника <strong>{deletingEmployee?.name}</strong>? 
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
      <NotificationForm
        isOpen={isNotificationFormOpen}
        onClose={() => {
          setIsNotificationFormOpen(false);
          setSelectedEmployeeForNotification(null);
        }}
        employees={employees}
        selectedEmployee={selectedEmployeeForNotification}
        currentUserRole="admin"
      />
    </div>
  );
};

export default AdvancedEmployeeManagement;