import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

interface EmployeeChartsProps {
  employees: any[];
  tests: any[];
  testResults: any[];
  selectedDepartment: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const EmployeeCharts = ({ employees, tests, testResults, selectedDepartment }: EmployeeChartsProps) => {
  
  // 1. Распределение сотрудников по баллам
  const getTestScore = (employee: any) => {
    if (!employee.testResults || employee.testResults.length === 0) return 0;
    const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
    return Math.round(totalScore / employee.testResults.length);
  };

  const scoreDistribution = [
    { range: '0-39%', count: 0, fill: '#ef4444' },
    { range: '40-59%', count: 0, fill: '#f59e0b' },
    { range: '60-69%', count: 0, fill: '#eab308' },
    { range: '70-79%', count: 0, fill: '#3b82f6' },
    { range: '80-89%', count: 0, fill: '#22c55e' },
    { range: '90-100%', count: 0, fill: '#10b981' }
  ];

  employees.forEach(emp => {
    const score = getTestScore(emp);
    if (score < 40) scoreDistribution[0].count++;
    else if (score < 60) scoreDistribution[1].count++;
    else if (score < 70) scoreDistribution[2].count++;
    else if (score < 80) scoreDistribution[3].count++;
    else if (score < 90) scoreDistribution[4].count++;
    else scoreDistribution[5].count++;
  });

  // 2. Топ-10 популярных тестов
  const testPopularity = tests
    .filter(t => t.status === 'published')
    .map(test => {
      const attempts = testResults.filter(r => r.testId === test.id).length;
      return {
        name: test.title.length > 20 ? test.title.substring(0, 17) + '...' : test.title,
        fullName: test.title,
        count: attempts
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Средний балл по категориям
  const categories = new Set(tests.filter(t => t.status === 'published').map(t => t.category));
  const categoryScores = Array.from(categories).map((category, index) => {
    const categoryResults = testResults.filter(r => {
      const test = tests.find(t => t.id === r.testId);
      return test?.category === category;
    });
    
    const avgScore = categoryResults.length > 0
      ? Math.round(categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length)
      : 0;

    return {
      category: category as string,
      score: avgScore,
      fill: COLORS[index % COLORS.length]
    };
  }).sort((a, b) => b.score - a.score);

  // 4. Процент выполнения vs Средний балл
  const performanceData = tests
    .filter(t => t.status === 'published')
    .map(test => {
      const results = testResults.filter(r => r.testId === test.id);
      const assigned = employees.filter(e => 
        e.assignedTests?.some((a: any) => a.testId === test.id)
      ).length;
      
      const avgScore = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0;
      
      const completionRate = assigned > 0 ? Math.round((results.length / assigned) * 100) : 0;

      return {
        name: test.title.length > 15 ? test.title.substring(0, 12) + '...' : test.title,
        fullName: test.title,
        score: avgScore,
        completion: completionRate,
        attempts: results.length
      };
    })
    .filter(d => d.attempts > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.fullName || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="BarChart3" size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold">Аналитические графики</h2>
      </div>

      {/* Распределение по баллам */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="TrendingUp" size={20} className="mr-2 text-green-600" />
            Распределение сотрудников по баллам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Количество сотрудников">
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Популярность тестов */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="Target" size={20} className="mr-2 text-blue-600" />
              Топ-10 популярных тестов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testPopularity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3b82f6" name="Прохождений" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Баллы по категориям */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="PieChart" size={20} className="mr-2 text-purple-600" />
              Средний балл по категориям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryScores}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.category}: ${entry.score}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="score"
                >
                  {categoryScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Корреляция: Средний балл vs Процент выполнения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Activity" size={20} className="mr-2 text-orange-600" />
            Эффективность тестов: Балл vs Процент выполнения
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (размер точки = количество попыток)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="score" name="Средний балл" unit="%" />
              <YAxis type="number" dataKey="completion" name="Процент выполнения" unit="%" />
              <ZAxis type="number" dataKey="attempts" range={[50, 400]} name="Попыток" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Тесты" data={performanceData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Интерпретация:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Правый верхний угол: Высокий балл + Высокое выполнение = Эффективный тест</li>
              <li>Левый верхний угол: Низкий балл + Высокое выполнение = Сложный, но проходят</li>
              <li>Правый нижний угол: Высокий балл + Низкое выполнение = Лёгкий, но не популярный</li>
              <li>Левый нижний угол: Низкий балл + Низкое выполнение = Требует пересмотра</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCharts;
