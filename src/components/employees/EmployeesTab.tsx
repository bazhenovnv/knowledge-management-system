import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Icon from "@/components/ui/icon";
import { employees } from "@/data/mockData";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import { toast } from "sonner";

interface EmployeesTabProps {
  userRole: string;
}

export const EmployeesTab = ({ userRole }: EmployeesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    role: "employee",
    status: 3
  });
  const [editingEmployee, setEditingEmployee] = useState({
    id: null,
    name: "",
    email: "",
    department: "",
    position: "",
    role: "employee",
    status: 3
  });

  // Функция для подсчета общей оценки тестирования
  const getTestScore = (employee: any) => {
    if (!employee.testResults) return 0;
    const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
    return Math.round(totalScore / employee.testResults.length);
  };

  // Функция для подсчета пройденных тестов
  const getCompletedTests = (employee: any) => {
    return employee.testResults ? employee.testResults.length : 0;
  };

  // Функция для подсчета среднего времени выполнения
  const getAverageTime = (employee: any) => {
    if (!employee.testResults) return "—";
    const totalTime = employee.testResults.reduce((sum: number, test: any) => sum + test.timeSpent, 0);
    const avgMinutes = Math.round(totalTime / employee.testResults.length);
    return `${avgMinutes} мин`;
  };

  // Функция выгрузки в CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Имя', 'Отдел', 'Должность', 'Роль', 'Статус', 'Общая оценка', 'Пройдено тестов', 'Среднее время', 'Email'].join(','),
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.department,
        emp.position,
        getRoleText(emp.role),
        getStatusText(emp.status),
        getTestScore(emp),
        getCompletedTests(emp),
        getAverageTime(emp),
        emp.email
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `employees_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Функция выгрузки в Excel
  const exportToExcel = () => {
    const data = [
      ['Имя', 'Отдел', 'Должность', 'Роль', 'Статус', 'Общая оценка', 'Пройдено тестов', 'Среднее время', 'Email'],
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.department,
        emp.position,
        getRoleText(emp.role),
        getStatusText(emp.status),
        getTestScore(emp),
        getCompletedTests(emp),
        getAverageTime(emp),
        emp.email
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Сотрудники');
    
    // Установка ширины колонок
    const wscols = [
      { wch: 25 }, // Имя
      { wch: 20 }, // Отдел
      { wch: 25 }, // Должность
      { wch: 18 }, // Роль
      { wch: 15 }, // Статус
      { wch: 15 }, // Общая оценка
      { wch: 18 }, // Пройдено тестов
      { wch: 18 }, // Среднее время
      { wch: 30 }  // Email
    ];
    worksheet['!cols'] = wscols;
    
    XLSX.writeFile(workbook, `employees_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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

  // Получение уникальных отделов
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  // Функция для получения текста роли
  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "Администратор";
      case "teacher": return "Преподаватель";
      case "employee": return "Сотрудник";
      default: return "Сотрудник";
    }
  };

  // Функция для получения цвета роли
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800";
      case "teacher": return "bg-blue-100 text-blue-800";
      case "employee": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Функция добавления сотрудника
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.department || !newEmployee.position) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const employee = {
      id: Date.now(),
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      position: newEmployee.position,
      role: newEmployee.role,
      status: "active",
      tests: 0,
      avgScore: 0,
      score: 0,
      testResults: []
    };

    // В реальном приложении здесь был бы API вызов
    console.log("Добавление сотрудника:", employee);
    setIsAddDialogOpen(false);
    setNewEmployee({
      name: "",
      email: "",
      department: "",
      position: "",
      role: "employee"
    });
    toast.success("Сотрудник успешно добавлен");
  };

  // Функция редактирования сотрудника
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      position: employee.position,
      role: employee.role
    });
    setIsEditDialogOpen(true);
  };

  // Функция сохранения изменений
  const handleSaveEdit = () => {
    if (!editingEmployee.name || !editingEmployee.email || !editingEmployee.department || !editingEmployee.position) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // В реальном приложении здесь был бы API вызов
    console.log("Сохранение изменений:", editingEmployee);
    setIsEditDialogOpen(false);
    setEditingEmployee({
      id: null,
      name: "",
      email: "",
      department: "",
      position: "",
      role: "employee"
    });
    toast.success("Данные сотрудника обновлены");
  };

  // Функция удаления сотрудника
  const handleDeleteEmployee = (id: number) => {
    const employee = filteredEmployees.find(emp => emp.id === id);
    if (employee) {
      // В реальном приложении здесь был бы API вызов
      console.log("Удаление сотрудника:", id);
      setDeleteEmployeeId(null);
      toast.success(`Сотрудник ${employee.name} удален`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Зарегистрированные сотрудники</h2>
        <div className="flex items-center space-x-2">
          {userRole === "admin" && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить сотрудника
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить нового сотрудника</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Имя</Label>
                    <Input
                      id="name"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Введите имя"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="Введите email"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">Отдел</Label>
                    <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">Должность</Label>
                    <Input
                      id="position"
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      placeholder="Введите должность"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Роль</Label>
                    <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Сотрудник</SelectItem>
                        <SelectItem value="teacher">Преподаватель</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Статус</Label>
                    <Select value={newEmployee.status?.toString()} onValueChange={(value) => setNewEmployee({...newEmployee, status: parseInt(value)})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Критический</SelectItem>
                        <SelectItem value="2">2 - Низкий</SelectItem>
                        <SelectItem value="3">3 - Средний</SelectItem>
                        <SelectItem value="4">4 - Хороший</SelectItem>
                        <SelectItem value="5">5 - Отличный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddEmployee}>
                    Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {(userRole === "admin" || userRole === "teacher") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Icon name="Download" size={16} className="mr-2" />
                  Выгрузить отчет
                  <Icon name="ChevronDown" size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToExcel}>
                  <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                  Скачать Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <Icon name="FileText" size={16} className="mr-2" />
                  Скачать CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon
            name="Search"
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Поиск по имени, отделу, должности..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все отделы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все отделы</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="1">Статус 1 (Критический)</SelectItem>
            <SelectItem value="2">Статус 2 (Низкий)</SelectItem>
            <SelectItem value="3">Статус 3 (Средний)</SelectItem>
            <SelectItem value="4">Статус 4 (Хороший)</SelectItem>
            <SelectItem value="5">Статус 5 (Отличный)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Всего сотрудников</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Отличные (4-5)</p>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => emp.status >= 4).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Trophy" size={20} className="text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Средняя оценка</p>
                <p className="text-2xl font-bold">
                  {Math.round(employees.reduce((sum, emp) => sum + getTestScore(emp), 0) / employees.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={20} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Всего тестов</p>
                <p className="text-2xl font-bold">
                  {employees.reduce((sum, emp) => sum + getCompletedTests(emp), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица сотрудников */}
      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Должность</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Общая оценка</TableHead>
                <TableHead>Пройдено тестов</TableHead>
                <TableHead>Среднее время</TableHead>
                <TableHead>Прогресс</TableHead>
                {userRole === "admin" && <TableHead>Действия</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const testScore = getTestScore(employee);
                const completedTests = getCompletedTests(employee);
                const avgTime = getAverageTime(employee);
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(employee.role)}>
                        {getRoleText(employee.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {getStatusText(employee.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">{testScore}</span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </TableCell>
                    <TableCell>{completedTests}</TableCell>
                    <TableCell>{avgTime}</TableCell>
                    <TableCell>
                      <Progress value={testScore} className="w-20" />
                    </TableCell>
                    {userRole === "admin" && (
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteEmployeeId(employee.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Диалог редактирования сотрудника */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Имя</Label>
              <Input
                id="edit-name"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">Отдел</Label>
              <Select value={editingEmployee.department} onValueChange={(value) => setEditingEmployee({...editingEmployee, department: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-position" className="text-right">Должность</Label>
              <Input
                id="edit-position"
                value={editingEmployee.position}
                onChange={(e) => setEditingEmployee({...editingEmployee, position: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">Роль</Label>
              <Select value={editingEmployee.role} onValueChange={(value) => setEditingEmployee({...editingEmployee, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                  <SelectItem value="teacher">Преподаватель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit}>
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={() => handleDeleteEmployee(deleteEmployeeId)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};