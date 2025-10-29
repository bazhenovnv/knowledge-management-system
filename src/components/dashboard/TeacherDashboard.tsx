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
import { useData } from "@/contexts/DataContext";

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
  const { stats: contextStats, isLoading, refreshData } = useData();
  const [deleteStudentId, setDeleteStudentId] = useState<number | null>(null);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedStudentForNotification, setSelectedStudentForNotification] = useState<any>(null);

  const students = contextStats?.employees
    ?.filter((emp: any) => emp.role === 'employee' && emp.is_active)
    .map((emp: any) => ({
      id: emp.id,
      name: emp.full_name,
      email: emp.email,
      department: emp.department,
      position: emp.position,
      role: emp.role,
      status: 4
    })) || [];

  const stats = {
    totalStudents: students.length,
    createdTests: 0,
    averageScore: contextStats?.averageScore || 0,
    activeStudents: students.length
  };

  useEffect(() => {
    if (!contextStats) {
      refreshData();
    }
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

  // Экспорт результатов тестов
  const handleExportTestResults = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957?action=list&table=test_results`
      );
      const data = await response.json();
      const testResults = data.data || [];
      
      // Получаем информацию о тестах и студентах
      const testsResponse = await fetch(
        `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957?action=list&table=tests`
      );
      const testsData = await testsResponse.json();
      const tests = testsData.data || [];
      
      const employeesResponse = await fetch(
        `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957?action=list&table=employees`
      );
      const employeesData = await employeesResponse.json();
      const allEmployees = employeesData.data || [];
      
      // Обогащаем данные результатов
      const enrichedResults = testResults.map((result: any) => {
        const test = tests.find((t: any) => t.id === result.test_id);
        const employee = allEmployees.find((e: any) => e.id === result.employee_id);
        return {
          id: result.id,
          student_name: employee?.name || 'Неизвестный',
          student_email: employee?.email || '',
          test_title: test?.title || 'Неизвестный тест',
          score: result.score,
          completed_at: result.completed_at,
          time_spent: result.time_spent || 0
        };
      });
      
      const jsonStr = JSON.stringify(enrichedResults, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Результаты тестов экспортированы');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта результатов тестов');
    }
  };

  // Экспорт студентов
  const handleExportStudents = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957?action=list&table=employees`
      );
      const data = await response.json();
      const allEmployees = data.data || [];
      
      // Фильтруем только студентов (role === 'employee')
      const students = allEmployees.filter((emp: any) => emp.role === 'employee');
      
      const jsonStr = JSON.stringify(students, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Список студентов экспортирован');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта студентов');
    }
  };

  // Импорт студентов
  const handleImportStudents = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedStudents = JSON.parse(text);
        
        if (!Array.isArray(importedStudents)) {
          toast.error('Неверный формат файла');
          return;
        }
        
        // Импортируем каждого студента
        let successCount = 0;
        let errorCount = 0;
        
        for (const student of importedStudents) {
          try {
            // Проверяем, есть ли уже такой email
            const checkResponse = await fetch(
              `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957?action=list&table=employees`
            );
            const checkData = await checkResponse.json();
            const existingEmployees = checkData.data || [];
            const exists = existingEmployees.some((e: any) => e.email === student.email);
            
            if (exists) {
              console.log(`Пропускаем ${student.email} - уже существует`);
              continue;
            }
            
            // Создаем нового студента
            const response = await fetch(
              `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create',
                  table: 'employees',
                  data: {
                    name: student.name,
                    email: student.email,
                    password_hash: student.password_hash || 'temp123',
                    role: 'employee',
                    department_id: student.department_id || null,
                    position: student.position || '',
                    is_active: student.is_active !== false
                  }
                })
              }
            );
            
            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            console.error(`Ошибка импорта ${student.email}:`, error);
            errorCount++;
          }
        }
        
        toast.success(`Импортировано: ${successCount}, Ошибок: ${errorCount}`);
        
        // Перезагружаем страницу
        window.location.reload();
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Ошибка импорта файла');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет преподавателя</h2>
        <Button 
          onClick={handleBulkNotification}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Экспорт/Импорт данных */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Экспорт и импорт данных</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Результаты тестов</p>
              <Button
                onClick={handleExportTestResults}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт результатов
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Список студентов</p>
              <Button
                onClick={handleExportStudents}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт студентов
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Импорт студентов</p>
              <Button
                onClick={handleImportStudents}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Импорт студентов
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Рейтинг сотрудников */}
      <TopEmployees onEmployeeClick={(employeeId) => {
        window.dispatchEvent(new CustomEvent('navigateToEmployees', { 
          detail: { employeeId } 
        }));
      }} />

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