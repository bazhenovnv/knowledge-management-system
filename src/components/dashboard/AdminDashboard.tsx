import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { database } from "@/utils/database";
import { TopEmployees } from "@/components/employees/TopEmployees";
import { toast } from "sonner";
import NotificationForm from "@/components/notifications/NotificationForm";

interface AdminDashboardProps {
  onLogout: () => void;
  employees: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const AdminDashboard = ({
  onLogout,
  employees,
  getStatusColor,
  getStatusText,
}: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTests: 0,
    totalTestResults: 0,
    averageScore: 0,
    activeCourses: 0,
    newRegistrations: 0 // Новые регистрации за последний день
  });
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<any>(null);

  // Загружаем статистику из базы данных
  useEffect(() => {
    const loadStats = () => {
      const employeesData = database.getEmployees();
      const testsData = database.getTests();
      const testResultsData = database.getTestResults();
      
      // Рассчитываем средний балл
      const totalScore = employeesData.reduce((sum, emp) => {
        const avgScore = emp.testResults?.length > 0 
          ? emp.testResults.reduce((s, t) => s + t.score, 0) / emp.testResults.length 
          : 0;
        return sum + avgScore;
      }, 0);
      const averageScore = employeesData.length > 0 ? Math.round(totalScore / employeesData.length) : 0;
      
      // Подсчитываем активные курсы (опубликованные тесты)
      const activeCourses = testsData.filter(test => test.status === 'published').length;
      
      // Подсчитываем новые регистрации за последние 24 часа
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newRegistrations = employeesData.filter(emp => 
        new Date(emp.createdAt) > yesterday
      ).length;

      setStats({
        totalEmployees: employeesData.length,
        totalTests: testsData.length,
        totalTestResults: testResultsData.length,
        averageScore,
        activeCourses,
        newRegistrations
      });
    };

    loadStats();
    
    // Обновляем статистику каждые 10 секунд
    const interval = setInterval(loadStats, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Функция для удаления сотрудника
  const handleDeleteEmployee = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      try {
        const success = database.deleteEmployee(employeeId);
        
        if (success) {
          setDeleteEmployeeId(null);
          toast.success(`Сотрудник ${employee.name} удален из базы данных`);
          // Обновляем статистику
          window.location.reload();
        } else {
          toast.error("Сотрудник не найден в базе данных");
        }
      } catch (error) {
        toast.error("Ошибка при удалении сотрудника");
        console.error("Ошибка удаления:", error);
      }
    }
  };

  // Функция для редактирования сотрудника
  const handleEditEmployee = (employee: any) => {
    toast.info("Для редактирования перейдите в раздел 'Сотрудники'");
  };

  // Функция для отправки уведомления
  const handleSendNotification = (employee: any) => {
    setSelectedEmployeeForNotification(employee);
    setNotificationFormOpen(true);
  };

  // Функция для массовой отправки уведомлений
  const handleBulkNotification = () => {
    setSelectedEmployeeForNotification(null);
    setNotificationFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Панель администратора</h2>
        <Button 
          onClick={handleBulkNotification}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Icon name="Bell" size={16} />
          <span>Отправить уведомление</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalEmployees}</div>
                <div className="text-sm text-gray-600">Сотрудников</div>
              </div>
              <Icon name="Users" size={32} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.totalTestResults}</div>
                <div className="text-sm text-gray-600">Результатов тестов</div>
              </div>
              <Icon name="BookOpen" size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Средний балл</div>
              </div>
              <Icon name="TrendingUp" size={32} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.newRegistrations}</div>
                <div className="text-sm text-gray-600">Новых регистраций</div>
                <div className="text-xs text-gray-500">за последние 24 часа</div>
              </div>
              <Icon name="UserPlus" size={32} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Управление сотрудниками</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Добавить сотрудника
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Добавить нового сотрудника</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Имя
                    </Label>
                    <Input
                      id="name"
                      placeholder="Введите имя"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">
                      Отдел
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cto">ЦТО</SelectItem>
                        <SelectItem value="service">Сервис</SelectItem>
                        <SelectItem value="large-clients">
                          Крупные клиенты
                        </SelectItem>
                        <SelectItem value="partnership">Партнерка</SelectItem>
                        <SelectItem value="requests">Отдел заявок</SelectItem>
                        <SelectItem value="support">
                          Отдел сопровождения
                        </SelectItem>
                        <SelectItem value="horeca">HoReCa</SelectItem>
                        <SelectItem value="tinkoff">Отдел Тинькофф</SelectItem>
                        <SelectItem value="fn">Отдел ФН</SelectItem>
                        <SelectItem value="logistics">Логистика</SelectItem>
                        <SelectItem value="tech-support">
                          Тех. поддержка
                        </SelectItem>
                        <SelectItem value="marketing">
                          Отдел маркетинга
                        </SelectItem>
                        <SelectItem value="marketplaces">
                          Отдел маркетплейсы
                        </SelectItem>
                        <SelectItem value="it">Отдел IT</SelectItem>
                        <SelectItem value="1c">1С</SelectItem>
                        <SelectItem value="cm">Отдел ЦМ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">
                      Должность
                    </Label>
                    <Input
                      id="position"
                      placeholder="Введите должность"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Введите email"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {employees.map((employee, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}
                  ></div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-600">
                      {employee.department} • {employee.position}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">Активность</div>
                    <div className="text-sm text-gray-600">
                      Последняя активность: Сегодня
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(employee.status)} text-white`}
                  >
                    {getStatusText(employee.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icon name="MoreHorizontal" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleEditEmployee(employee)} className="cursor-pointer">
                        <Icon name="Edit" size={16} className="mr-2" />
                        Редактировать
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
                          const text = `${employee.name} - ${employee.position}, ${employee.department}`;
                          navigator.clipboard.writeText(text);
                          toast.success("Информация скопирована");
                        }}
                        className="cursor-pointer"
                      >
                        <Icon name="User" size={16} className="mr-2" />
                        Копировать инфо
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleSendNotification(employee)}
                        className="cursor-pointer"
                      >
                        <Icon name="Bell" size={16} className="mr-2" />
                        Отправить уведомление
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const mailtoLink = `mailto:${employee.email}?subject=Уведомление от администратора`;
                          window.open(mailtoLink);
                        }}
                        className="cursor-pointer"
                      >
                        <Icon name="Mail" size={16} className="mr-2" />
                        Написать письмо
                      </DropdownMenuItem>
                      <div className="border-t my-1"></div>
                      <DropdownMenuItem 
                        onClick={() => setDeleteEmployeeId(employee.id)}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить сотрудника
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Рейтинг сотрудников */}
      <TopEmployees />

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
            <AlertDialogAction onClick={() => handleDeleteEmployee(deleteEmployeeId!)}>
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
        currentUserRole="admin"
      />

    </div>
  );
};