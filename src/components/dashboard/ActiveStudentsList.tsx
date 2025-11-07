import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: number;
}

interface ActiveStudentsListProps {
  students: Student[];
  isLoading: boolean;
  getStatusColor: (status: string | number) => string;
  getStatusText: (status: string | number) => string;
  onViewProfile: (student: Student) => void;
  onViewResults: (student: Student) => void;
  onAssignTask: (student: Student) => void;
  onSendNotification: (student: Student) => void;
  onDeleteStudent: (studentId: number) => void;
}

export const ActiveStudentsList = ({
  students,
  isLoading,
  getStatusColor,
  getStatusText,
  onViewProfile,
  onViewResults,
  onAssignTask,
  onSendNotification,
  onDeleteStudent,
}: ActiveStudentsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Активные студенты</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin mr-2" />
            <span>Загрузка студентов...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Users" size={32} className="mx-auto mb-2 opacity-50" />
            <p>Нет активных студентов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.slice(0, 3).map((employee, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}
                  ></div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-600">
                      {employee.department}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(employee.status)} text-white`}
                  >
                    {getStatusText(employee.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onViewProfile(employee)} className="cursor-pointer">
                        <Icon name="User" size={16} className="mr-2" />
                        Посмотреть профиль
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewResults(employee)} className="cursor-pointer">
                        <Icon name="BarChart3" size={16} className="mr-2" />
                        Результаты тестов
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignTask(employee)} className="cursor-pointer">
                        <Icon name="FileText" size={16} className="mr-2" />
                        Назначить тест
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          navigator.clipboard.writeText(employee.email);
                          toast.success("Email скопирован в буфер обмена");
                        }}
                        className="cursor-pointer"
                      >
                        <Icon name="Copy" size={16} className="mr-2" />
                        Копировать email
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const mailtoLink = `mailto:${employee.email}?subject=Сообщение от преподавателя`;
                          window.open(mailtoLink);
                        }}
                        className="cursor-pointer"
                      >
                        <Icon name="Mail" size={16} className="mr-2" />
                        Написать письмо
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onSendNotification(employee)}
                        className="cursor-pointer"
                      >
                        <Icon name="Bell" size={16} className="mr-2" />
                        Отправить уведомление
                      </DropdownMenuItem>
                      <div className="border-t my-1"></div>
                      <DropdownMenuItem 
                        onClick={() => onDeleteStudent(employee.id)}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Icon name="UserX" size={16} className="mr-2" />
                        Удалить студента
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
