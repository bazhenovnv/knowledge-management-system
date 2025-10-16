import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { databaseService, DatabaseEmployee } from "@/utils/databaseService";
import { TopEmployees } from "@/components/employees/TopEmployees";
import { toast } from "sonner";
import NotificationForm from "@/components/notifications/NotificationForm";
import DbRequestCounter from "@/components/database/DbRequestCounter";
import AIKnowledgeSearch from "@/components/ai/AIKnowledgeSearch";

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

  useEffect(() => {
    loadStats();
    
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Функция для массовой отправки уведомлений
  const handleBulkNotification = () => {
    setSelectedEmployeeForNotification(null);
    setNotificationFormOpen(true);
  };

  // Экспорт результатов тестов
  const handleExportTestResults = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=test_results`
      );
      const data = await response.json();
      const testResults = data.data || [];
      
      // Получаем информацию о тестах и сотрудниках для более подробного экспорта
      const testsResponse = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=tests`
      );
      const testsData = await testsResponse.json();
      const tests = testsData.data || [];
      
      const employeesResponse = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=employees`
      );
      const employeesData = await employeesResponse.json();
      const allEmployees = employeesData.data || [];
      
      // Обогащаем данные результатов
      const enrichedResults = testResults.map((result: any) => {
        const test = tests.find((t: any) => t.id === result.test_id);
        const employee = allEmployees.find((e: any) => e.id === result.employee_id);
        return {
          id: result.id,
          employee_name: employee?.name || 'Неизвестный',
          employee_email: employee?.email || '',
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

  // Экспорт сотрудников
  const handleExportEmployees = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=employees`
      );
      const data = await response.json();
      const allEmployees = data.data || [];
      
      const jsonStr = JSON.stringify(allEmployees, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Список сотрудников экспортирован');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка экспорта сотрудников');
    }
  };

  // Импорт сотрудников
  const handleImportEmployees = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedEmployees = JSON.parse(text);
        
        if (!Array.isArray(importedEmployees)) {
          toast.error('Неверный формат файла');
          return;
        }
        
        // Импортируем каждого сотрудника
        let successCount = 0;
        let errorCount = 0;
        
        for (const emp of importedEmployees) {
          try {
            // Проверяем, есть ли уже такой email
            const checkResponse = await fetch(
              `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=employees`
            );
            const checkData = await checkResponse.json();
            const existingEmployees = checkData.data || [];
            const exists = existingEmployees.some((e: any) => e.email === emp.email);
            
            if (exists) {
              console.log(`Пропускаем ${emp.email} - уже существует`);
              continue;
            }
            
            // Создаем нового сотрудника
            const response = await fetch(
              `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'create',
                  table: 'employees',
                  data: {
                    name: emp.name,
                    email: emp.email,
                    password_hash: emp.password_hash || 'temp123',
                    role: emp.role || 'employee',
                    department_id: emp.department_id || null,
                    position: emp.position || '',
                    is_active: emp.is_active !== false
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
            console.error(`Ошибка импорта ${emp.email}:`, error);
            errorCount++;
          }
        }
        
        toast.success(`Импортировано: ${successCount}, Ошибок: ${errorCount}`);
        
        // Перезагружаем статистику
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

      {/* Счётчик обращений к БД */}
      <DbRequestCounter isAdmin={true} />

      {/* AI Поиск материалов */}
      <AIKnowledgeSearch onMaterialAdd={loadStats} />

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
              <p className="text-sm font-medium text-gray-700">Список сотрудников</p>
              <Button
                onClick={handleExportEmployees}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт сотрудников
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Импорт сотрудников</p>
              <Button
                onClick={handleImportEmployees}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Icon name="Upload" size={16} className="mr-2" />
                Импорт сотрудников
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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