import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Chart,
  ChartConfig,
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
} from "recharts";
import Icon from "@/components/ui/icon";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userRole, setUserRole] = useState("employee"); // employee, teacher, admin
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");

  // Mock data
  const employees = [
    {
      name: "Иванов И.И.",
      department: "ИТ",
      position: "Разработчик",
      score: 4.2,
      status: "green",
      tests: 15,
      avgScore: 85,
    },
    {
      name: "Петрова А.С.",
      department: "Бухгалтерия",
      position: "Бухгалтер",
      score: 3.8,
      status: "yellow",
      tests: 12,
      avgScore: 78,
    },
    {
      name: "Сидоров В.М.",
      department: "Продажи",
      position: "Менеджер",
      score: 2.1,
      status: "red",
      tests: 8,
      avgScore: 42,
    },
    {
      name: "Козлова Е.А.",
      department: "HR",
      position: "Специалист",
      score: 4.8,
      status: "green",
      tests: 20,
      avgScore: 92,
    },
  ];

  const knowledgeBase = [
    { title: "Корпоративная этика", views: 245, lastUpdate: "2024-01-15" },
    { title: "Техника безопасности", views: 189, lastUpdate: "2024-01-10" },
    { title: "Документооборот", views: 167, lastUpdate: "2024-01-08" },
    { title: "Клиентский сервис", views: 134, lastUpdate: "2024-01-05" },
  ];

  const chartData = [
    { month: "Янв", employees: 65, tests: 120 },
    { month: "Фев", employees: 78, tests: 145 },
    { month: "Мар", employees: 82, tests: 167 },
    { month: "Апр", employees: 89, tests: 189 },
    { month: "Май", employees: 95, tests: 210 },
  ];

  const pieData = [
    { name: "Отлично", value: 35, color: "#10B981" },
    { name: "Хорошо", value: 30, color: "#F59E0B" },
    { name: "Удовлетворительно", value: 25, color: "#EF4444" },
    { name: "Неудовлетворительно", value: 10, color: "#6B7280" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "green":
        return "Отлично";
      case "yellow":
        return "Хорошо";
      case "red":
        return "Требует внимания";
      default:
        return "Не определен";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Система развития сотрудников АБ
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Сотрудник</SelectItem>
                  <SelectItem value="teacher">Преподаватель</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>ИИ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home">Главная</TabsTrigger>
            <TabsTrigger value="dashboard">Личный кабинет</TabsTrigger>
            <TabsTrigger value="knowledge">База знаний</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Добро пожаловать в систему развития сотрудников
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Современный инструмент для обучения, тестирования и управления
                знаниями
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        name="BookOpen"
                        size={32}
                        className="text-blue-600"
                      />
                    </div>
                    <CardTitle>Обучение</CardTitle>
                    <CardDescription>
                      Доступ к базе знаний и учебным материалам
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        name="CheckCircle"
                        size={32}
                        className="text-green-600"
                      />
                    </div>
                    <CardTitle>Тестирование</CardTitle>
                    <CardDescription>
                      Проверьте свои знания и получите оценку
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon
                        name="TrendingUp"
                        size={32}
                        className="text-purple-600"
                      />
                    </div>
                    <CardTitle>Аналитика</CardTitle>
                    <CardDescription>
                      Отслеживайте прогресс и результаты
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {userRole === "employee" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Моя статистика</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            15
                          </div>
                          <div className="text-sm text-gray-600">
                            Пройдено тестов
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            85%
                          </div>
                          <div className="text-sm text-gray-600">
                            Средний балл
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            42
                          </div>
                          <div className="text-sm text-gray-600">
                            Статей прочитано
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Badge className="bg-green-500">Отлично</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Общая оценка
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Доступные тесты</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="font-medium">
                              Корпоративная этика
                            </div>
                            <div className="text-sm text-gray-600">
                              20 вопросов • 30 минут
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Начать тест
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="font-medium">
                              Техника безопасности
                            </div>
                            <div className="text-sm text-gray-600">
                              15 вопросов • 25 минут
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Начать тест
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Профиль</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            ФИО
                          </div>
                          <div>Иванов Иван Иванович</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Отдел
                          </div>
                          <div>ИТ отдел</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Должность
                          </div>
                          <div>Разработчик</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-600">
                            Email
                          </div>
                          <div>ivanov@company.com</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Прогресс обучения</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Корпоративная этика</span>
                            <span>100%</span>
                          </div>
                          <Progress value={100} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Техника безопасности</span>
                            <span>75%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Документооборот</span>
                            <span>30%</span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {userRole === "admin" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            95
                          </div>
                          <div className="text-sm text-gray-600">
                            Сотрудников
                          </div>
                        </div>
                        <Icon
                          name="Users"
                          size={24}
                          className="text-blue-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            1,234
                          </div>
                          <div className="text-sm text-gray-600">
                            Тестов пройдено
                          </div>
                        </div>
                        <Icon
                          name="CheckCircle"
                          size={24}
                          className="text-green-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            82%
                          </div>
                          <div className="text-sm text-gray-600">
                            Средний балл
                          </div>
                        </div>
                        <Icon
                          name="TrendingUp"
                          size={24}
                          className="text-purple-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            78
                          </div>
                          <div className="text-sm text-gray-600">Активных</div>
                        </div>
                        <Icon
                          name="Activity"
                          size={24}
                          className="text-orange-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Активность по месяцам</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          employees: {
                            label: "Сотрудники",
                            color: "#2563eb",
                          },
                          tests: {
                            label: "Тесты",
                            color: "#16a34a",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="employees" fill="#2563eb" />
                            <Bar dataKey="tests" fill="#16a34a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Распределение оценок</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Процент",
                            color: "#8b5cf6",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
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
                    <CardTitle>Управление сотрудниками</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees.map((employee, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}
                            ></div>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-gray-600">
                                {employee.department} • {employee.position}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {employee.tests} тестов
                              </div>
                              <div className="text-sm text-gray-600">
                                {employee.avgScore}% средний балл
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(employee.status)} text-white`}
                            >
                              {getStatusText(employee.status)}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Назначить тест
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">База знаний</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Icon
                    name="Search"
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Поиск по базе знаний..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 animate-pulse">
                      <Icon name="Bot" size={20} className="mr-2" />
                      ИИ Помощник
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>ИИ Помощник</DialogTitle>
                      <DialogDescription>
                        Задайте вопрос по базе знаний или попросите проверить
                        актуальность информации
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Например: Проверь актуальность статьи о корпоративной этике..."
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Отправить запрос
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {knowledgeBase.map((item, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      {item.views} просмотров • Обновлено {item.lastUpdate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm">
                        <Icon name="Eye" size={16} className="mr-2" />
                        Читать
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 animate-pulse"
                      >
                        <Icon name="FileText" size={16} className="mr-2" />
                        Тест
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Динамика обучения</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      employees: {
                        label: "Сотрудники",
                        color: "#2563eb",
                      },
                      tests: {
                        label: "Тесты",
                        color: "#16a34a",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="employees"
                          fill="#2563eb"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="tests"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Эффективность обучения</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Процент",
                        color: "#8b5cf6",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
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
                <CardTitle>Отчеты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700 animate-pulse"
                    onClick={() => console.log("Экспорт в CSV")}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт CSV
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 animate-pulse"
                    onClick={() => console.log("Экспорт в Excel")}
                  >
                    <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                    Экспорт Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
