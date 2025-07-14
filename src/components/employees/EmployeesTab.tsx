import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface EmployeesTabProps {
  userRole: string;
}

export const EmployeesTab = ({ userRole }: EmployeesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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

  // Функция выгрузки в файл
  const exportToFile = () => {
    const csvContent = [
      ['Имя', 'Отдел', 'Должность', 'Статус', 'Общая оценка', 'Пройдено тестов', 'Среднее время', 'Email'].join(','),
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.department,
        emp.position,
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

  // Фильтрация сотрудников
  const filteredEmployees = employees
    .filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(emp => departmentFilter === "all" || emp.department === departmentFilter)
    .filter(emp => statusFilter === "all" || emp.status === statusFilter)
    .sort((a, b) => getTestScore(b) - getTestScore(a));

  // Получение уникальных отделов
  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Зарегистрированные сотрудники</h2>
        {(userRole === "admin" || userRole === "teacher") && (
          <Button
            onClick={exportToFile}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Icon name="Download" size={16} className="mr-2" />
            Выгрузить отчет
          </Button>
        )}
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
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
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
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => emp.status === "active").length}
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
                <TableHead>Статус</TableHead>
                <TableHead>Общая оценка</TableHead>
                <TableHead>Пройдено тестов</TableHead>
                <TableHead>Среднее время</TableHead>
                <TableHead>Прогресс</TableHead>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};