import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { databaseService, DatabaseEmployee } from "@/utils/databaseService";
import { TopEmployees } from "@/components/employees/TopEmployees";
import { toast } from "sonner";
import funcUrls from '../../../backend/func2url.json';
import NotificationForm from "@/components/notifications/NotificationForm";
import DbRequestCounter from "@/components/database/DbRequestCounter";
import FunctionCallCounter from "@/components/database/FunctionCallCounter";
import AIKnowledgeSearch from "@/components/ai/AIKnowledgeSearch";
import FunctionAnalytics from "@/components/analytics/FunctionAnalytics";
import TopFunctionsWidget from "@/components/analytics/TopFunctionsWidget";
import { useData } from "@/contexts/DataContext";
import MigrationButton from "@/components/admin/MigrationButton";

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
  const navigate = useNavigate();
  const { stats: contextStats, isLoading, refreshData } = useData();
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [selectedEmployeeForNotification, setSelectedEmployeeForNotification] = useState<any>(null);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = contextStats || {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    totalTests: 0,
    totalTestResults: 0,
    averageScore: 0,
    activeCourses: 0,
    newRegistrations: 0
  };

  useEffect(() => {
    if (!contextStats) {
      refreshData();
    }
  }, []);

  // Функция для массовой отправки уведомлений
  const handleBulkNotification = () => {
    setSelectedEmployeeForNotification(null);
    setNotificationFormOpen(true);
  };

  // Экспорт результатов тестов
  const handleExportTestResults = async () => {
    try {
      const BACKEND_URL = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
      const response = await fetch(
        `${BACKEND_URL}?action=list&table=test_results`
      );
      const data = await response.json();
      const testResults = data.data || [];
      
      // Получаем информацию о тестах и сотрудниках для более подробного экспорта
      const testsResponse = await fetch(
        `${BACKEND_URL}?action=list&table=tests`
      );
      const testsData = await testsResponse.json();
      const tests = testsData.data || [];
      
      const employeesResponse = await fetch(
        `${BACKEND_URL}?action=list&table=employees`
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
      const BACKEND_URL = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
      const response = await fetch(
        `${BACKEND_URL}?action=list&table=employees`
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
            const BACKEND_URL = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
            const checkResponse = await fetch(
              `${BACKEND_URL}?action=list&table=employees`
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
              BACKEND_URL,
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
        
        // Обновляем данные
        refreshData();
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
                <div className="text-3xl font-bold text-blue-600">{isLoading ? '...' : stats.activeEmployees}</div>
                <div className="text-sm text-gray-600">Активных сотрудников</div>
                {!isLoading && stats.inactiveEmployees > 0 && (
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
                <div className="text-3xl font-bold text-green-600">{isLoading ? '...' : stats.totalTestResults}</div>
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
                <div className="text-3xl font-bold text-purple-600">{isLoading ? '...' : stats.averageScore}%</div>
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
                <div className="text-3xl font-bold text-orange-600">{isLoading ? '...' : stats.activeCourses}</div>
                <div className="text-sm text-gray-600">Активных курсов</div>
              </div>
              <Icon name="UserPlus" size={32} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Панель администратора */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Аналитика платформы</h2>
        <Button
          onClick={() => {
            setIsRefreshing(true);
            setAnalyticsRefresh(prev => prev + 1);
            setTimeout(() => setIsRefreshing(false), 1000);
          }}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isRefreshing}
        >
          <Icon name="RefreshCw" size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Обновление...' : 'Обновить данные'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DbRequestCounter isAdmin={true} refreshTrigger={analyticsRefresh} />
          <FunctionCallCounter isAdmin={true} refreshTrigger={analyticsRefresh} />
          
          <Card className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/admin-settings')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Icon name="Settings" size={18} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Настройки</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">Настройки приложения</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/admin-console')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon name="Terminal" size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Отладка</p>
                <p className="text-sm font-semibold text-red-900 mt-0.5">Консоль логов</p>
              </div>
            </div>
          </Card>
        </div>
        
        <TopFunctionsWidget refreshTrigger={analyticsRefresh} />
      </div>

      {/* Миграция в PostgreSQL */}
      <MigrationButton />

      {/* AI Поиск материалов */}
      <AIKnowledgeSearch onMaterialAdd={refreshData} />

      {/* Экспорт/Импорт данных */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Экспорт и импорт данных</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Результаты тестов</p>
              <Button
                onClick={handleExportTestResults}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт результатов
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Список сотрудников</p>
              <Button
                onClick={handleExportEmployees}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт сотрудников
              </Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Импорт сотрудников</p>
              <Button
                onClick={handleImportEmployees}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Icon name="Users" size={16} className="mr-2" />
              Управлять сотрудниками
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Всего активных сотрудников: <span className="font-medium">{isLoading ? '...' : stats.activeEmployees}</span>
            <br />
            Для полного управления перейдите в раздел "Сотрудники"
          </div>
        </CardContent>
      </Card>

      {/* Аналитика функций */}
      <FunctionAnalytics refreshTrigger={analyticsRefresh} />

      {/* Рейтинг сотрудников */}
      <TopEmployees onEmployeeClick={(employeeId) => {
        window.dispatchEvent(new CustomEvent('navigateToEmployees', { 
          detail: { employeeId } 
        }));
      }} />



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