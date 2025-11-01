import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const TestResultsView: React.FC<TestResultsViewProps> = ({ userId, userRole }) => {
  const [tests, setTests] = useState<DatabaseTest[]>([]);
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tests.length > 0) {
      loadResults();
    }
  }, [selectedTestId, selectedEmployeeId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [testsData, employeesData] = await Promise.all([
        testsService.getTests(),
        externalDb.getEmployees()
      ]);
      
      setTests(testsData);
      setEmployees(employeesData);
      
      // Для обычных сотрудников показываем только их результаты
      if (userRole === 'employee') {
        setSelectedEmployeeId(userId.toString());
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      let allResults: TestResult[] = [];

      if (selectedTestId === 'all' && selectedEmployeeId === 'all') {
        // Загружаем результаты всех тестов
        const resultsPromises = tests.map(test => 
          testsService.getTestResults(test.id)
        );
        const resultsArrays = await Promise.all(resultsPromises);
        allResults = resultsArrays.flat();
      } else if (selectedTestId !== 'all' && selectedEmployeeId === 'all') {
        // Результаты конкретного теста для всех сотрудников
        allResults = await testsService.getTestResults(parseInt(selectedTestId));
      } else if (selectedTestId === 'all' && selectedEmployeeId !== 'all') {
        // Все результаты конкретного сотрудника
        const resultsPromises = tests.map(test => 
          testsService.getTestResults(test.id, parseInt(selectedEmployeeId))
        );
        const resultsArrays = await Promise.all(resultsPromises);
        allResults = resultsArrays.flat();
      } else {
        // Результаты конкретного теста конкретного сотрудника
        allResults = await testsService.getTestResults(
          parseInt(selectedTestId),
          parseInt(selectedEmployeeId)
        );
      }

      setResults(allResults);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const filteredResults = results.filter(result => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      result.employee_name?.toLowerCase().includes(query) ||
      result.test_title?.toLowerCase().includes(query)
    );
  });

  const calculateStatistics = () => {
    const totalResults = filteredResults.length;
    const passedResults = filteredResults.filter(r => r.passed).length;
    const averageScore = totalResults > 0
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.percentage, 0) / totalResults)
      : 0;
    const passRate = totalResults > 0
      ? Math.round((passedResults / totalResults) * 100)
      : 0;

    return {
      totalResults,
      passedResults,
      averageScore,
      passRate
    };
  };

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

  const stats = calculateStatistics();

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

  return (
    <div className="space-y-6">
      {/* Заголовок и статистика */}
      <Card>
        <CardHeader>
          <CardTitle>Результаты тестирования</CardTitle>
          <CardDescription>
            Статистика прохождения тестов сотрудниками
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего результатов</p>
                  <p className="text-2xl font-bold">{stats.totalResults}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Пройдено</p>
                  <p className="text-2xl font-bold">{stats.passedResults}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="Target" size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={20} className="text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Проходимость</p>
                  <p className="text-2xl font-bold">{stats.passRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Поиск */}
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Поиск по сотруднику или тесту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-24"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 bg-white px-2">
                  {filteredResults.length} результатов
                </div>
              )}
            </div>

            {/* Фильтр по тесту */}
            {(userRole === 'admin' || userRole === 'teacher') && (
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger>
                  <SelectValue placeholder="Все тесты" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все тесты</SelectItem>
                  {tests.map(test => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Фильтр по сотруднику */}
            {(userRole === 'admin' || userRole === 'teacher') && (
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Все сотрудники" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все сотрудники</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Таблица результатов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Результаты ({filteredResults.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Результаты не найдены</p>
              <p className="text-sm">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
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
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.employee_name || 'Неизвестно'}
                      </TableCell>
                      <TableCell>
                        {result.test_title || 'Неизвестно'}
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
};

export default TestResultsView;