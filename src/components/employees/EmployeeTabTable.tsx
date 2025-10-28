import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { Employee } from '@/utils/database';
import { getStatusColor, getStatusText } from '@/utils/statusUtils';
import { getTestScore, getCompletedTests, getAverageTime, getRoleText, getRoleColor } from './employeeUtils';
import { toast } from "sonner";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface EmployeeTabTableProps {
  employees: Employee[];
  userRole: string;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
  onSendNotification: (employee: Employee) => void;
}

const EmployeeTabTable: React.FC<EmployeeTabTableProps> = ({
  employees,
  userRole,
  onEditEmployee,
  onDeleteEmployee,
  onSendNotification
}) => {
  const scrollRef = useScrollPosition('employeesTable', employees.length);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Email скопирован в буфер обмена");
  };

  const handleCopyInfo = (employee: Employee) => {
    const text = `${employee.name} - ${employee.position}, ${employee.department}`;
    navigator.clipboard.writeText(text);
    toast.success("Информация скопирована");
  };

  const handleSendEmail = (email: string) => {
    const mailtoLink = `mailto:${email}?subject=Уведомление от системы управления персоналом`;
    window.open(mailtoLink);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Список сотрудников</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="max-h-[600px] overflow-y-auto">
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
            {employees.map((employee) => {
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => onEditEmployee(employee)} 
                            className="cursor-pointer"
                          >
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onSendNotification(employee)}
                            className="cursor-pointer"
                          >
                            <Icon name="Bell" size={16} className="mr-2" />
                            Отправить уведомление
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCopyEmail(employee.email)}
                            className="cursor-pointer"
                          >
                            <Icon name="Copy" size={16} className="mr-2" />
                            Копировать email
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCopyInfo(employee)}
                            className="cursor-pointer"
                          >
                            <Icon name="User" size={16} className="mr-2" />
                            Копировать инфо
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleSendEmail(employee.email)}
                            className="cursor-pointer"
                          >
                            <Icon name="Mail" size={16} className="mr-2" />
                            Написать письмо
                          </DropdownMenuItem>
                          <div className="border-t my-1"></div>
                          <DropdownMenuItem 
                            onClick={() => onDeleteEmployee(employee.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить сотрудника
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeTabTable;