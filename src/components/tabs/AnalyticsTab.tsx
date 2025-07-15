import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import Icon from "@/components/ui/icon";
import { database } from '@/utils/database';
import { chartConfig } from "@/data/mockData";

export const AnalyticsTab = () => {
  const [analyticsStats, setAnalyticsStats] = useState({
    totalTests: 0,
    averageScore: 0,
    activeTests: 0,
    totalHours: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  
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

      // Основная статистика
      const totalTests = testResults.length;
      const averageScore = testResults.length > 0 
        ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length)
        : 0;
      const activeTests = tests.filter(test => test.status === 'published').length;
      const totalHours = Math.floor(totalTests * 0.5); // Примерно 30 минут на тест

      setAnalyticsStats({
        totalTests,
        averageScore,
        activeTests,
        totalHours
      });

      // Данные для графиков - последние 6 месяцев
      const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      const currentMonth = new Date().getMonth();
      
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - 5 + i + 12) % 12;
        const monthName = monthNames[monthIndex];
        
        // Имитация данных на основе реальных показателей
        const testsForMonth = Math.floor(totalTests * (0.8 + Math.random() * 0.4) / 6);
        const employeesForMonth = Math.floor(employees.length * (0.8 + Math.random() * 0.4) / 6);
        
        return {
          month: monthName,
          tests: testsForMonth,
          employees: employeesForMonth
        };
      });
      
      setChartData(monthlyData);

      // Данные для круговой диаграммы - категории тестов
      const categories = {};
      tests.forEach(test => {
        categories[test.category] = (categories[test.category] || 0) + 1;
      });
      
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
      const pieChartData = Object.entries(categories).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
      
      setPieData(pieChartData);
      
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Аналитика</h2>
        <Select defaultValue="6months">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Последний месяц</SelectItem>
            <SelectItem value="3months">Последние 3 месяца</SelectItem>
            <SelectItem value="6months">Последние 6 месяцев</SelectItem>
            <SelectItem value="1year">Последний год</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{analyticsStats.totalTests.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Тестов пройдено</div>
              </div>
              <Icon name="FileText" size={32} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{analyticsStats.averageScore}%</div>
                <div className="text-sm text-gray-600">Средний балл</div>
              </div>
              <Icon name="TrendingUp" size={32} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{analyticsStats.activeTests}</div>
                <div className="text-sm text-gray-600">Активных тестов</div>
              </div>
              <Icon name="BookOpen" size={32} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{analyticsStats.totalHours.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Часов обучения</div>
              </div>
              <Icon name="Clock" size={32} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Динамика активности</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="tests" fill="#3B82F6" />
                  <Bar dataKey="employees" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Распределение по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Тренд успеваемости</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tests"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="employees"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};