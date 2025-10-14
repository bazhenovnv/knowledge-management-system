import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { databaseService, DatabaseEmployee } from "@/utils/databaseService";
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
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalTests: 0,
    totalTestResults: 0,
    averageScore: 0,
    activeCourses: 0,
    newRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Рассчитываем средний балл из test_results
        const testResultsResponse = await fetch(
          `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=test_results`
        );
        const testResultsData = await testResultsResponse.json();
        const testResults = testResultsData.data || [];
        
        const averageScore = testResults.length > 0
          ? Math.round(testResults.reduce((sum: number, result: any) => sum + result.score, 0) / testResults.length)
          : 0;
        
        // Подсчитываем новые регистрации за последние 24 часа
        const employeesResponse = await fetch(
          `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=employees`
        );
        const employeesData = await employeesResponse.json();
        const allEmployees = employeesData.data || [];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newRegistrations = allEmployees.filter((emp: DatabaseEmployee) => 
          new Date(emp.created_at) > yesterday
        ).length;
        
        const activeEmployees = allEmployees.filter((emp: DatabaseEmployee) => emp.is_active).length;
        const inactiveEmployees = allEmployees.length - activeEmployees;
        
        // Подсчитываем тесты
        const testsResponse = await fetch(
          `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=tests`
        );
        const testsData = await testsResponse.json();
        const totalTests = testsData.data?.length || 0;
        
        // Подсчитываем курсы
        const coursesResponse = await fetch(
          `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=courses`
        );
        const coursesData = await coursesResponse.json();
        const activeCourses = coursesData.data?.filter((c: any) => c.status === 'active').length || 0;

        setStats({
          totalEmployees: allEmployees.length,
          activeEmployees,
          inactiveEmployees,
          totalTests,
          totalTestResults: testResults.length,
          averageScore,
          activeCourses,
          newRegistrations
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    const interval = setInterval(loadStats, 30000);
    
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
                <div className="text-3xl font-bold text-blue-600">{loading ? '...' : stats.activeEmployees}</div>
                <div className="text-sm text-gray-600">Активных сотрудников</div>
                {!loading && stats.inactiveEmployees > 0 && (
                  <div className="text-xs text-gray-500 mt-1">+{stats.inactiveEmployees} неактивных</div>
                )}
              </div>
              <Icon name="Users" size={32} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{loading ? '...' : stats.totalTestResults}</div>
                <div className="text-sm text-gray-600">Пройдено тестов</div>
              </div>
              <Icon name="BookOpen" size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{loading ? '...' : stats.averageScore}%</div>
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
                <div className="text-3xl font-bold text-orange-600">{loading ? '...' : stats.activeCourses}</div>
                <div className="text-sm text-gray-600">Активных курсов</div>
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
            Всего активных сотрудников: <span className="font-medium">{loading ? '...' : stats.activeEmployees}</span>
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