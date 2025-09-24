import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useToast } from '@/components/ui/use-toast';
import { Employee } from '@/utils/database';
import { getStatusColor, getStatusText } from '@/utils/statusUtils';

interface EmployeeTableProps {
  employees: Employee[];
  selectedEmployees: number[];
  onSelectEmployee: (employeeId: number, checked: boolean) => void;
  onSelectAll: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onNotifyEmployee: (employee: Employee) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onEditEmployee,
  onDeleteEmployee,
  onNotifyEmployee
}) => {
  const { toast } = useToast();

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      case 'employee': return 'Сотрудник';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Сотрудники ({employees.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
          >
            {selectedEmployees.length === employees.length ? 'Снять выбор' : 'Выбрать все'}
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
                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                    onCheckedChange={onSelectAll}
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
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => onSelectEmployee(employee.id, !!checked)}
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
                        <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
                          <Icon name="Edit" size={16} className="mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNotifyEmployee(employee)}>
                          <Icon name="Bell" size={16} className="mr-2" />
                          Отправить уведомление
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(employee.email);
                          toast({ title: 'Email скопирован в буфер обмена' });
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
                          onClick={() => onDeleteEmployee(employee)}
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
  );
};

export default EmployeeTable;