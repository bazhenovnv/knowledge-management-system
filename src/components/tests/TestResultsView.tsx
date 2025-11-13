import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { testsService, DatabaseTest, TestResult } from '@/utils/testsService';
import { DatabaseEmployee } from '@/utils/databaseService';
import { externalDb } from '@/services/externalDbService';

interface TestResultsViewProps {
  userId: number;
  userRole: 'admin' | 'teacher' | 'employee';
}

interface EmployeeStats {
  employee: DatabaseEmployee;
  totalTests: number;
  passedTests: number;
  averageScore: number;
  lastTestDate?: string;
  results: TestResult[];
}

const TestResultsView: React.FC<TestResultsViewProps> = ({ userId, userRole }) => {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [allResults, setAllResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<DatabaseEmployee | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (employees.length > 0 && allResults.length > 0) {
      calculateEmployeeStats();
    }
  }, [employees, allResults]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [testsData, employeesData, resultsData] = await Promise.all([
        testsService.getTests(),
        externalDb.getEmployees(),
        externalDb.getTestResults()
      ]);
      
      setTests(testsData);
      setEmployees(employeesData);
      setAllResults(resultsData);
      
      // Для обычных сотрудников сразу открываем их результаты
      if (userRole === 'employee') {
        const currentEmployee = employeesData.find(e => e.id === userId);
        if (currentEmployee) {
          setSelectedEmployee(currentEmployee);
        }
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEmployeeStats = () => {
    const stats: EmployeeStats[] = employees.map(employee => {
      const employeeResults = allResults.filter(r => r.employee_id === employee.id);
      const passedTests = employeeResults.filter(r => r.passed).length;
      const averageScore = employeeResults.length > 0
        ? Math.round(employeeResults.reduce((sum, r) => sum + r.percentage, 0) / employeeResults.length)
        : 0;
      
      const sortedResults = [...employeeResults].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return {
        employee,
        totalTests: employeeResults.length,
        passedTests,
        averageScore,
        lastTestDate: sortedResults[0]?.created_at,
        results: sortedResults
      };
    });

    // Сортируем по количеству пройденных тестов
    stats.sort((a, b) => b.totalTests - a.totalTests);
    setEmployeeStats(stats);
  };

  const filteredStats = employeeStats.filter(stat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      stat.employee.full_name.toLowerCase().includes(query) ||
      stat.employee.email?.toLowerCase().includes(query) ||
      stat.employee.department?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}м ${secs}с`;
  };

  const getEmployeeResultsWithTestTitles = (employeeResults: TestResult[]) => {
    return employeeResults.map(result => {
      const test = tests.find(t => t.id === result.test_id);
      return {
        ...result,
        test_title: test?.title || 'Неизвестный тест'
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Icon name="Loader2" size={24} className="animate-spin" />
          <span>Загрузка результатов...</span>
        </div>
      </div>
    );
  }

  // Просмотр результатов конкретного сотрудника
  if (selectedEmployee) {
    const stat = employeeStats.find(s => s.employee.id === selectedEmployee.id);
    if (!stat) return null;

    const enrichedResults = getEmployeeResultsWithTestTitles(stat.results);

    return (
      <div className="space-y-6">
        {/* Кнопка назад */}
        {userRole !== 'employee' && (
          <Button 
            variant="outline" 
            onClick={() => setSelectedEmployee(null)}
            className="mb-4"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад к списку сотрудников
          </Button>
        )}

        {/* Информация о сотруднике */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} />
                  {stat.employee.full_name}
                </CardTitle>
                <CardDescription>
                  {stat.employee.email} • {stat.employee.department} • {stat.employee.position}
                </CardDescription>
              </div>
              <Badge variant={stat.employee.is_active ? "default" : "secondary"}>
                {stat.employee.is_active ? 'Активен' : 'Неактивен'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="FileText" size={20} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Всего тестов</p>
                    <p className="text-2xl font-bold">{stat.totalTests}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Пройдено</p>
                    <p className="text-2xl font-bold">{stat.passedTests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="Target" size={20} className="text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
                    <p className="text-2xl font-bold">{stat.averageScore}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={20} className="text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Проходимость</p>
                    <p className="text-2xl font-bold">
                      {stat.totalTests > 0 ? Math.round((stat.passedTests / stat.totalTests) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Таблица результатов сотрудника */}
        <Card>
          <CardHeader>
            <CardTitle>История тестирования ({enrichedResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {enrichedResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Нет результатов тестирования</p>
                <p className="text-sm">Сотрудник еще не проходил тесты</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тест</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Баллы</TableHead>
                      <TableHead>Процент</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead>Попытка</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {result.test_title}
                        </TableCell>
                        <TableCell>
                          {formatDate(result.created_at)}
                        </TableCell>
                        <TableCell>
                          {result.score} / {result.max_score}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{result.percentage}%</span>
                            {result.percentage >= 90 && (
                              <Icon name="TrendingUp" size={14} className="text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDuration(result.time_spent)}
                        </TableCell>
                        <TableCell>
                          {result.attempt_number}
                        </TableCell>
                        <TableCell>
                          {result.passed ? (
                            <Badge variant="default" className="bg-green-500">
                              <Icon name="CheckCircle" size={12} className="mr-1" />
                              Пройден
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <Icon name="XCircle" size={12} className="mr-1" />
                              Не пройден
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Список сотрудников (для admin и teacher)
  return (
    <div className="space-y-6">
      {/* Заголовок и общая статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Результаты тестирования по сотрудникам</CardTitle>
          <CardDescription>
            Кликните на сотрудника для просмотра детальных результатов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего сотрудников</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего результатов</p>
                  <p className="text-2xl font-bold">{allResults.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Пройдено тестов</p>
                  <p className="text-2xl font-bold">
                    {allResults.filter(r => r.passed).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Target" size={20} className="text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
                  <p className="text-2xl font-bold">
                    {allResults.length > 0 
                      ? Math.round(allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Поиск */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск по ФИО, email или отделу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Список сотрудников */}
      <Card>
        <CardHeader>
          <CardTitle>Сотрудники ({filteredStats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Сотрудники не найдены</p>
              <p className="text-sm">Попробуйте изменить поисковый запрос</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Отдел</TableHead>
                    <TableHead>Должность</TableHead>
                    <TableHead className="text-center">Всего тестов</TableHead>
                    <TableHead className="text-center">Пройдено</TableHead>
                    <TableHead className="text-center">Средний балл</TableHead>
                    <TableHead>Последний тест</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.map((stat) => (
                    <TableRow 
                      key={stat.employee.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => setSelectedEmployee(stat.employee)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={16} className="text-gray-400" />
                          {stat.employee.full_name}
                        </div>
                      </TableCell>
                      <TableCell>{stat.employee.department || '-'}</TableCell>
                      <TableCell>{stat.employee.position || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stat.totalTests}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-500">
                          {stat.passedTests}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold">{stat.averageScore}%</span>
                          {stat.averageScore >= 90 && (
                            <Icon name="TrendingUp" size={14} className="text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {stat.lastTestDate ? formatDate(stat.lastTestDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(stat.employee);
                          }}
                        >
                          <Icon name="ChevronRight" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultsView;
