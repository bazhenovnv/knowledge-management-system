import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { database } from "@/utils/database";
import { toast } from "sonner";

import { TopEmployees } from "@/components/employees/TopEmployees";
import NotificationForm from "@/components/notifications/NotificationForm";

interface TeacherDashboardProps {
  onLogout: () => void;
  employees: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const TeacherDashboard = ({
  onLogout,
  employees,
  getStatusColor,
  getStatusText,
}: TeacherDashboardProps) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    createdTests: 0,
    averageScore: 0,
    activeStudents: 0
  });
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedStudentForNotification, setSelectedStudentForNotification] = useState<any>(null);

  // Загружаем статистику из базы данных
  useEffect(() => {
    const loadStats = () => {
      const employeesData = database.getEmployees();
      const testsData = database.getTests();
      const testResultsData = database.getTestResults();
      
      // Подсчитываем студентов (роль "employee")
      const students = employeesData.filter(emp => emp.role === 'employee');
      
      // Подсчитываем тесты, созданные преподавателем
      const createdTests = testsData.filter(test => test.createdBy === 'Преподаватель').length;
      
      // Рассчитываем средний балл студентов
      const totalScore = students.reduce((sum, emp) => {
        const avgScore = emp.testResults?.length > 0 
          ? emp.testResults.reduce((s, t) => s + t.score, 0) / emp.testResults.length 
          : 0;
        return sum + avgScore;
      }, 0);
      const averageScore = students.length > 0 ? Math.round(totalScore / students.length) : 0;
      
      // Активные студенты (те, кто проходил тесты)
      const activeStudents = students.filter(emp => emp.testResults && emp.testResults.length > 0).length;

      setStats({
        totalStudents: students.length,
        createdTests,
        averageScore,
        activeStudents
      });
    };

    loadStats();
    
    // Обновляем статистику каждые 10 секунд
    const interval = setInterval(loadStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Функция для удаления студента (только для преподавателей с правами администратора)
  const handleDeleteStudent = (studentId: number) => {
    const student = employees.find(emp => emp.id === studentId);
    if (student) {
      try {
        const success = database.deleteEmployee(studentId);
        
        if (success) {
          setDeleteStudentId(null);
          toast.success(`Студент ${student.name} удален из системы`);
          // Обновляем статистику
          window.location.reload();
        } else {
          toast.error("Студент не найден в базе данных");
        }
      } catch (error) {
        toast.error("Ошибка при удалении студента");
        console.error("Ошибка удаления:", error);
      }
    }
  };

  // Функция для просмотра профиля студента
  const handleViewProfile = (student: any) => {
    toast.info(`Просмотр профиля: ${student.name}`);
  };

  // Функция для отправки задания
  const handleAssignTask = (student: any) => {
    toast.success(`Задание отправлено студенту ${student.name}`);
  };

  // Функция для отправки уведомления студенту
  const handleSendNotification = (student: any) => {
    setSelectedStudentForNotification(student);
    setNotificationFormOpen(true);
  };

  // Функция для массовой отправки уведомлений студентам
  const handleBulkNotification = () => {
    setSelectedStudentForNotification(null);
    setNotificationFormOpen(true);
  };

  // Функция для просмотра результатов
  const handleViewResults = (student: any) => {
    const testResults = student.testResults || [];
    if (testResults.length > 0) {
      toast.info(`У ${student.name} пройдено тестов: ${testResults.length}`);
    } else {
      toast.info(`${student.name} еще не проходил тесты`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет преподавателя</h2>
        <Button 
          onClick={handleBulkNotification}
          className="flex items-center space-x-2"
        >
          <Icon name="Bell" size={16} />
          <span>Уведомить студентов</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon
                name="GraduationCap"
                size={24}
                className="mr-2 text-green-600"
              />
              Статистика обучения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Студентов</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600">{stats.createdTests}</div>
                <div className="text-sm text-gray-600">Тестов создано</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Активные студенты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.slice(0, 3).map((employee, index) => (
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
                        <DropdownMenuItem onClick={() => handleViewProfile(employee)} className="cursor-pointer">
                          <Icon name="User" size={16} className="mr-2" />
                          Посмотреть профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewResults(employee)} className="cursor-pointer">
                          <Icon name="BarChart3" size={16} className="mr-2" />
                          Результаты тестов
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignTask(employee)} className="cursor-pointer">
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
                          onClick={() => handleSendNotification(employee)}
                          className="cursor-pointer"
                        >
                          <Icon name="Bell" size={16} className="mr-2" />
                          Отправить уведомление
                        </DropdownMenuItem>
                        <div className="border-t my-1"></div>
                        <DropdownMenuItem 
                          onClick={() => setDeleteStudentId(employee.id)}
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
          </CardContent>
        </Card>
      </div>

      {/* Рейтинг сотрудников */}
      <TopEmployees />

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteStudentId} onOpenChange={() => setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этого студента из системы? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteStudentId(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteStudent(deleteStudentId!)}>
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
          setSelectedStudentForNotification(null);
        }}
        employees={employees}
        selectedEmployee={selectedStudentForNotification}
        currentUserRole="teacher"
      />

      {/* Тесты */}

    </div>
  );
};