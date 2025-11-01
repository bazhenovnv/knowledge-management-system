import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { databaseService, DatabaseEmployee } from "@/utils/databaseService";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { externalDb } from "@/services/externalDbService";

interface EmployeeWithStats extends DatabaseEmployee {
  avgScore: number;
  completedTests: number;
}

interface TopEmployeesProps {
  onEmployeeClick?: (employeeId: number) => void;
}

export const TopEmployees = ({ onEmployeeClick }: TopEmployeesProps = {}) => {
  const [topEmployees, setTopEmployees] = useState<EmployeeWithStats[]>([]);
  const [bottomEmployees, setBottomEmployees] = useState<EmployeeWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployeesData = async () => {
      try {
        setLoading(true);
        
        // Загружаем всех активных сотрудников
        const employees = await databaseService.getEmployees();
        const activeEmployees = employees.filter(emp => 
          emp.is_active && emp.role === 'employee'
        );
        
        // Загружаем результаты тестов из PostgreSQL
        const testResultsResponse = await fetch(
          `${BACKEND_URL}?action=list&table=test_results`
        );
        const testResultsData = await testResultsResponse.json();
        const allTestResults = testResultsData.data || [];
        
        // Рассчитываем статистику для каждого сотрудника
        const employeesWithStats: EmployeeWithStats[] = activeEmployees.map(emp => {
          const empResults = allTestResults.filter((r: any) => r.employee_id === emp.id);
          const avgScore = empResults.length > 0
            ? Math.round(empResults.reduce((sum: number, r: any) => sum + r.score, 0) / empResults.length)
            : 0;
          
          return {
            ...emp,
            avgScore,
            completedTests: empResults.length
          };
        });
        
        // Сортируем по среднему баллу
        const sorted = [...employeesWithStats].sort((a, b) => b.avgScore - a.avgScore);
        
        // Топ-3 лучших (с тестами)
        const withTests = sorted.filter(emp => emp.completedTests > 0);
        setTopEmployees(withTests.slice(0, 3));
        
        // Требуют внимания: 
        // 1. Без тестов
        // 2. С низким баллом (< 60%)
        const needAttention = employeesWithStats.filter(emp => 
          emp.completedTests === 0 || emp.avgScore < 60
        ).sort((a, b) => {
          // Сначала без тестов, потом с низким баллом
          if (a.completedTests === 0 && b.completedTests > 0) return -1;
          if (a.completedTests > 0 && b.completedTests === 0) return 1;
          return a.avgScore - b.avgScore;
        });
        
        setBottomEmployees(needAttention.slice(0, 3));
        
      } catch (error) {
        console.error('Error loading employees data:', error);
        toast.error('Ошибка загрузки данных сотрудников');
      } finally {
        setLoading(false);
      }
    };

    // Отключена автозагрузка - загрузка только по требованию
    if (funcUrls['database']) {
      loadEmployeesData();
    }
  }, []);

  const getAttentionReason = (employee: EmployeeWithStats) => {
    if (employee.completedTests === 0) {
      return { icon: 'XCircle', text: 'Не прошел тесты', color: 'text-red-600' };
    }
    if (employee.avgScore < 40) {
      return { icon: 'TrendingDown', text: 'Очень низкий балл', color: 'text-red-600' };
    }
    if (employee.avgScore < 60) {
      return { icon: 'AlertTriangle', text: 'Низкий балл', color: 'text-orange-600' };
    }
    return { icon: 'Info', text: 'Требует внимания', color: 'text-gray-600' };
  };

  const renderEmployeeItem = (employee: EmployeeWithStats, index: number, isTop: boolean) => {
    const attentionReason = !isTop ? getAttentionReason(employee) : null;
    
    const getMedalIcon = (position: number) => {
      switch (position) {
        case 0: return "🥇";
        case 1: return "🥈";
        case 2: return "🥉";
        default: return "";
      }
    };

    return (
      <div 
        key={employee.id} 
        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => onEmployeeClick?.(employee.id)}
      >
        <div className="flex items-center space-x-2">
          {isTop && (
            <span className="text-xl">{getMedalIcon(index)}</span>
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {employee.full_name.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-medium">{employee.full_name}</p>
          <p className="text-sm text-gray-500">{employee.department || 'Без отдела'}</p>
          {!isTop && attentionReason && (
            <div className={`flex items-center mt-1 text-xs ${attentionReason.color}`}>
              <Icon name={attentionReason.icon as any} size={12} className="mr-1" />
              {attentionReason.text}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <Badge variant={employee.avgScore >= 80 ? "default" : employee.avgScore >= 60 ? "secondary" : "destructive"}>
              {employee.avgScore}%
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Тестов: {employee.completedTests}
          </div>
          <Progress value={employee.avgScore} className="w-16 mt-1" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Icon name="Trophy" size={24} className="mr-2 text-green-600" />
              Лучшие сотрудники
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Icon name="Loader2" size={48} className="mx-auto mb-3 opacity-50 animate-spin" />
              <p className="text-sm">Загрузка данных...</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <Icon name="AlertTriangle" size={24} className="mr-2 text-red-600" />
              Требуют внимания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Icon name="Loader2" size={48} className="mx-auto mb-3 opacity-50 animate-spin" />
              <p className="text-sm">Загрузка данных...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Топ-3 лучших сотрудников */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <Icon name="Trophy" size={24} className="mr-2 text-green-600" />
            Лучшие сотрудники
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEmployees.length > 0 ? (
              topEmployees.map((employee, index) => 
                renderEmployeeItem(employee, index, true)
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Нет данных о сотрудниках</p>
                <p className="text-xs mt-1">Сотрудники появятся после прохождения тестов</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Требуют внимания */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <Icon name="AlertTriangle" size={24} className="mr-2 text-red-600" />
            Требуют внимания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottomEmployees.length > 0 ? (
              bottomEmployees.map((employee, index) => 
                renderEmployeeItem(employee, index, false)
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-3 opacity-50 text-green-500" />
                <p className="text-sm">Все сотрудники показывают отличные результаты!</p>
                <p className="text-xs mt-1">Нет сотрудников, требующих особого внимания</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};