import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { database } from "@/utils/database";

import { TopEmployees } from "@/components/employees/TopEmployees";
import MyAssignments from "@/components/assignments/MyAssignments";

interface EmployeeDashboardProps {
  onLogout: () => void;
}

export const EmployeeDashboard = ({ onLogout }: EmployeeDashboardProps) => {
  const [stats, setStats] = useState({
    completedTests: 0,
    averageScore: 0,
    totalTests: 0,
    currentUserData: null as any
  });

  // Загружаем статистику текущего пользователя
  useEffect(() => {
    const loadUserStats = () => {
      // Получаем данные текущего пользователя из localStorage
      const userName = localStorage.getItem('userName');
      const employees = database.getEmployees();
      const tests = database.getTests();
      
      // Ищем текущего пользователя в базе
      const currentUser = employees.find(emp => emp.name === userName);
      
      if (currentUser) {
        const completedTests = currentUser.testResults?.length || 0;
        const totalScore = currentUser.testResults?.reduce((sum, test) => sum + test.score, 0) || 0;
        const averageScore = completedTests > 0 ? Math.round(totalScore / completedTests) : 0;
        
        setStats({
          completedTests,
          averageScore,
          totalTests: tests.filter(test => test.status === 'published').length,
          currentUserData: currentUser
        });
      }
    };

    loadUserStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет сотрудника</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon name="TrendingUp" size={24} className="mr-2 text-blue-600" />
                Моя статистика
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.currentUserData?.name || 'Сотрудник'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <Icon name="CheckCircle" size={20} className="text-blue-600 mr-2" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.completedTests}</div>
                <div className="text-sm text-gray-600">Пройдено тестов</div>
                <div className="text-xs text-gray-500 mt-1">из {stats.totalTests} доступных</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <Icon name="Target" size={20} className="text-green-600 mr-2" />
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Средний балл</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.averageScore >= 80 ? 'Отлично!' : stats.averageScore >= 60 ? 'Хорошо' : 'Нужно улучшить'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center mb-2">
                  <Icon name="Award" size={20} className="text-purple-600 mr-2" />
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.completedTests > 0 ? Math.round((stats.completedTests / stats.totalTests) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Прогресс</div>
                <div className="text-xs text-gray-500 mt-1">общий прогресс обучения</div>
              </div>
            </div>
            
            {/* Прогресс-бар */}
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Общий прогресс обучения</span>
                <span className="text-sm text-gray-500">
                  {stats.completedTests}/{stats.totalTests}
                </span>
              </div>
              <Progress 
                value={stats.totalTests > 0 ? (stats.completedTests / stats.totalTests) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="BookOpen" size={24} className="mr-2 text-purple-600" />
              Детальная аналитика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Последние результаты */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3 text-gray-700">Последние результаты тестов</h4>
                <div className="space-y-2">
                  {stats.currentUserData?.testResults?.slice(-3).reverse().map((test: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Icon name="FileText" size={16} className="mr-2 text-gray-600" />
                        <span className="text-sm">{test.testName || `Тест ${test.testId}`}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={test.score >= 80 ? 'default' : test.score >= 60 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {test.score}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(test.completedAt).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      <Icon name="BookOpen" size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Тесты пока не пройдены</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Рекомендации */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium mb-3 text-gray-700">Рекомендации</h4>
                <div className="space-y-2">
                  {stats.averageScore < 60 && (
                    <div className="flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                      <Icon name="AlertTriangle" size={16} className="mt-0.5" />
                      <span>Рекомендуется повторить материал и пересдать тесты</span>
                    </div>
                  )}
                  {stats.averageScore >= 60 && stats.averageScore < 80 && (
                    <div className="flex items-start space-x-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      <Icon name="Info" size={16} className="mt-0.5" />
                      <span>Хороший результат! Можно улучшить показатели</span>
                    </div>
                  )}
                  {stats.averageScore >= 80 && (
                    <div className="flex items-start space-x-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <Icon name="CheckCircle" size={16} className="mt-0.5" />
                      <span>Отличные результаты! Продолжайте в том же духе</span>
                    </div>
                  )}
                  {stats.completedTests < stats.totalTests && (
                    <div className="flex items-start space-x-2 text-sm text-purple-700 bg-purple-50 p-2 rounded">
                      <Icon name="Target" size={16} className="mt-0.5" />
                      <span>Осталось пройти: {stats.totalTests - stats.completedTests} тестов</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Мои задания */}
      <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-lg">
        <CardContent className="p-6">
          <MyAssignments userId={stats.currentUserData?.id || 1} />
        </CardContent>
      </Card>
      
      {/* Рейтинг сотрудников */}
      <TopEmployees onEmployeeClick={(employeeId) => {
        window.dispatchEvent(new CustomEvent('navigateToEmployees', { 
          detail: { employeeId } 
        }));
      }} />


    </div>
  );
};