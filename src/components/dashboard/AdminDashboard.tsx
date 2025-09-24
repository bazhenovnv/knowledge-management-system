import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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


      {/* Краткая информация о сотрудниках */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Краткая сводка по сотрудникам</h3>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('navigateToEmployees'))}
              variant="outline"
              size="sm"
            >
              <Icon name="Users" size={16} className="mr-2" />
              Управлять сотрудниками
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Всего активных сотрудников: <span className="font-medium">{stats.totalEmployees}</span>
            <br />
            Для полного управления перейдите в раздел "Сотрудники"
          </div>
        </CardContent>
      </Card>

      {/* Рейтинг сотрудников */}
      <TopEmployees />



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