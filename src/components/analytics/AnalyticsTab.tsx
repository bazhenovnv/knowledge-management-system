import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { database } from '@/utils/database';
import { Employee, Test, TestResult } from '@/types/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  departmentStats: Array<{
    department: string;
    employees: number;
    avgScore: number;
    completedTests: number;
  }>;
  testStats: Array<{
    title: string;
    attempts: number;
    avgScore: number;
    category: string;
  }>;
  monthlyStats: Array<{
    month: string;
    completedTests: number;
    newEmployees: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  topPerformers: Array<{
    name: string;
    avgScore: number;
    completedTests: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function AnalyticsTab() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    departmentStats: [],
    testStats: [],
    monthlyStats: [],
    scoreDistribution: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = () => {
    try {
      const employees = database.getEmployees();
      const tests = database.getTests();
      const testResults = database.getTestResults();

      // Статистика по отделам
      const departmentStats = generateDepartmentStats(employees, testResults);
      
      // Статистика по тестам
      const testStats = generateTestStats(tests, testResults);
      
      // Месячная статистика
      const monthlyStats = generateMonthlyStats(testResults, employees);
      
      // Распределение баллов
      const scoreDistribution = generateScoreDistribution(testResults);
      
      // Топ исполнители
      const topPerformers = generateTopPerformers(employees, testResults);

      setAnalyticsData({
        departmentStats,
        testStats,
        monthlyStats,
        scoreDistribution,
        topPerformers
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
      setLoading(false);
    }
  };

  const generateDepartmentStats = (employees: Employee[], testResults: TestResult[]) => {
    const departments = [...new Set(employees.map(emp => emp.department))];
    
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptResults = testResults.filter(result => 
        deptEmployees.some(emp => emp.name === result.userName)
      );
      
      const avgScore = deptResults.length > 0 
        ? Math.round(deptResults.reduce((sum, result) => sum + result.score, 0) / deptResults.length)
        : 0;
      
      return {
        department: dept,
        employees: deptEmployees.length,
        avgScore,
        completedTests: deptResults.length
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  };

  const generateTestStats = (tests: Test[], testResults: TestResult[]) => {
    return tests.map(test => {
      const testResults_filtered = testResults.filter(result => result.testId === test.id);
      const avgScore = testResults_filtered.length > 0 
        ? Math.round(testResults_filtered.reduce((sum, result) => sum + result.score, 0) / testResults_filtered.length)
        : 0;
      
      return {
        title: test.title.substring(0, 30) + (test.title.length > 30 ? '...' : ''),
        attempts: testResults_filtered.length,
        avgScore,
        category: test.category
      };
    }).sort((a, b) => b.attempts - a.attempts);
  };

  const generateMonthlyStats = (testResults: TestResult[], employees: Employee[]) => {
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      const monthName = monthNames[monthIndex];
      
      // Симуляция данных на основе текущих показателей
      const completedTests = Math.floor(testResults.length * (0.8 + Math.random() * 0.4) / 6);
      const newEmployees = Math.floor(employees.length * (0.1 + Math.random() * 0.2) / 6);
      
      return {
        month: monthName,
        completedTests,
        newEmployees
      };
    });
  };

  const generateScoreDistribution = (testResults: TestResult[]) => {
    const ranges = [
      { range: '0-20%', min: 0, max: 20 },
      { range: '21-40%', min: 21, max: 40 },
      { range: '41-60%', min: 41, max: 60 },
      { range: '61-80%', min: 61, max: 80 },
      { range: '81-100%', min: 81, max: 100 }
    ];
    
    return ranges.map(range => ({
      range: range.range,
      count: testResults.filter(result => 
        result.score >= range.min && result.score <= range.max
      ).length
    }));
  };

  const generateTopPerformers = (employees: Employee[], testResults: TestResult[]) => {
    const employeeStats = employees.map(emp => {
      const empResults = testResults.filter(result => result.userName === emp.name);
      const avgScore = empResults.length > 0 
        ? Math.round(empResults.reduce((sum, result) => sum + result.score, 0) / empResults.length)
        : 0;
      
      return {
        name: emp.name,
        avgScore,
        completedTests: empResults.length
      };
    }).filter(emp => emp.completedTests > 0)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
    
    return employeeStats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка аналитики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Аналитика и отчеты</h2>
        <Button onClick={loadAnalyticsData} variant="outline">
          <Icon name="RefreshCw" className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="departments">Отделы</TabsTrigger>
          <TabsTrigger value="tests">Тесты</TabsTrigger>
          <TabsTrigger value="performance">Производительность</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Месячная статистика */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" className="h-5 w-5" />
                Динамика за последние 6 месяцев
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completedTests" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    name="Пройденные тесты"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newEmployees" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    name="Новые сотрудники"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Распределение баллов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="PieChart" className="h-5 w-5" />
                Распределение результатов тестов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.scoreDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Building2" className="h-5 w-5" />
                Статистика по отделам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="department" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employees" fill="#3B82F6" name="Сотрудники" />
                  <Bar dataKey="avgScore" fill="#10B981" name="Средний балл" />
                  <Bar dataKey="completedTests" fill="#8B5CF6" name="Пройденные тесты" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Таблица отделов */}
          <Card>
            <CardHeader>
              <CardTitle>Детальная статистика отделов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Отдел</th>
                      <th className="text-center p-2">Сотрудники</th>
                      <th className="text-center p-2">Средний балл</th>
                      <th className="text-center p-2">Тесты пройдены</th>
                      <th className="text-center p-2">Рейтинг</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.departmentStats.map((dept, index) => (
                      <tr key={dept.department} className="border-b">
                        <td className="p-2 font-medium">{dept.department}</td>
                        <td className="text-center p-2">{dept.employees}</td>
                        <td className="text-center p-2">
                          <Badge variant={dept.avgScore >= 80 ? "default" : dept.avgScore >= 60 ? "secondary" : "destructive"}>
                            {dept.avgScore}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">{dept.completedTests}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" className="h-5 w-5" />
                Популярность тестов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.testStats.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attempts" fill="#3B82F6" name="Попытки" />
                  <Bar dataKey="avgScore" fill="#10B981" name="Средний балл" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trophy" className="h-5 w-5" />
                Топ исполнители
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPerformers.map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <Icon 
                            name="Medal" 
                            className={`h-6 w-6 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-amber-600'
                            }`} 
                          />
                        )}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{performer.name}</p>
                        <p className="text-sm text-gray-600">
                          Пройдено тестов: {performer.completedTests}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={performer.avgScore >= 90 ? "default" : performer.avgScore >= 75 ? "secondary" : "outline"}
                        className="text-lg px-3 py-1"
                      >
                        {performer.avgScore}%
                      </Badge>
                      <Progress value={performer.avgScore} className="w-24 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}