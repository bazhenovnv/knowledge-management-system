import { useState, useEffect } from "react";
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
  LineChart,
  Line,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import Icon from "@/components/ui/icon";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userRole, setUserRole] = useState("employee"); // employee, teacher, admin
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    department: "",
    position: "",
    email: "",
    password: "",
  });
  const [showRegister, setShowRegister] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    // Симуляция проверки авторизации
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Симуляция входа
    localStorage.setItem("authToken", "demo-token");
    setIsLoggedIn(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Симуляция регистрации
    localStorage.setItem("authToken", "demo-token");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUserRole("employee");
    setActiveTab("home");
  };

  const handleStartTest = (testName: string) => {
    alert(
      `Запуск теста: ${testName}\nЭто демо-версия. Функционал будет доступен в полной версии.`,
    );
  };

  const handleReadArticle = (articleName: string) => {
    alert(
      `Открытие статьи: ${articleName}\nЭто демо-версия. Функционал будет доступен в полной версии.`,
    );
  };

  const handleAssignTest = (employeeName: string) => {
    alert(
      `Назначение теста сотруднику: ${employeeName}\nЭто демо-версия. Функционал будет доступен в полной версии.`,
    );
  };

  const handleExportData = (format: string) => {
    alert(
      `Экспорт данных в формате: ${format}\nЭто демо-версия. Функционал будет доступен в полной версии.`,
    );
  };

  const handleAIQuery = () => {
    if (!aiQuery.trim()) {
      alert("Введите запрос для ИИ помощника");
      return;
    }
    alert(
      `ИИ Помощник обрабатывает запрос: "${aiQuery}"\nЭто демо-версия. Функционал будет доступен в полной версии.`,
    );
    setAiQuery("");
  };

  const handleNavigateToSection = (section: string) => {
    setActiveTab(section);
  };

  // Если пользователь не авторизован, показываем форму входа
  if (!isLoggedIn) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card
            className={`w-full max-w-md ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm border-white/20"} shadow-2xl`}
          >
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="GraduationCap" size={32} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Система развития сотрудников
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Платформа для обучения и тестирования
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-2">
                <Button
                  variant={!showRegister ? "default" : "outline"}
                  onClick={() => setShowRegister(false)}
                  className="flex-1"
                >
                  Вход
                </Button>
                <Button
                  variant={showRegister ? "default" : "outline"}
                  onClick={() => setShowRegister(true)}
                  className="flex-1"
                >
                  Регистрация
                </Button>
              </div>

              {!showRegister ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Войти в систему
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ФИО</Label>
                    <Input
                      id="name"
                      placeholder="Иванов Иван Иванович"
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          name: e.target.value,
                        })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="department">Отдел</Label>
                      <Select
                        value={registerForm.department}
                        onValueChange={(value) =>
                          setRegisterForm({
                            ...registerForm,
                            department: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">ИТ</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="sales">Продажи</SelectItem>
                          <SelectItem value="finance">Финансы</SelectItem>
                          <SelectItem value="marketing">Маркетинг</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Должность</Label>
                      <Input
                        id="position"
                        placeholder="Специалист"
                        value={registerForm.position}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            position: e.target.value,
                          })
                        }
                        className="h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="your@company.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Пароль</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                      className="h-12"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Зарегистрироваться
                  </Button>
                </form>
              )}

              <div className="text-center text-sm text-gray-500">
                <p>Демо-версия: используйте любые данные для входа</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}
    >
      {/* Header */}
      <header
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm"} shadow-lg border-b transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Icon name="Menu" size={20} />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="GraduationCap" size={24} className="text-white" />
              </div>
              <div className="hidden md:block">
                <h1
                  className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Система развития сотрудников
                </h1>
                <p
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  Платформа обучения и тестирования
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon
                  name="Sun"
                  size={16}
                  className={darkMode ? "text-gray-400" : "text-yellow-500"}
                />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Icon
                  name="Moon"
                  size={16}
                  className={darkMode ? "text-blue-400" : "text-gray-400"}
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Icon name="Bell" size={20} />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 animate-pulse">
                    {notifications}
                  </Badge>
                )}
              </Button>
              <Select value={userRole} onValueChange={setUserRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">👨‍💼 Сотрудник</SelectItem>
                  <SelectItem value="teacher">👨‍🏫 Преподаватель</SelectItem>
                  <SelectItem value="admin">👑 Администратор</SelectItem>
                </SelectContent>
              </Select>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        ИИ
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Профиль пользователя</SheetTitle>
                    <SheetDescription>
                      Управление аккаунтом и настройки
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          ИИ
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Иванов Иван Иванович</div>
                        <div className="text-sm text-gray-600">
                          ivanov@company.com
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start">
                        <Icon name="Settings" size={16} className="mr-2" />
                        Настройки
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Icon name="HelpCircle" size={16} className="mr-2" />
                        Помощь
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleLogout}
                      >
                        <Icon name="LogOut" size={16} className="mr-2" />
                        Выйти
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Навигация</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full">
            <div className="space-y-4 mt-6">
              <Button
                variant={activeTab === "home" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("home");
                  setSidebarOpen(false);
                }}
              >
                <Icon name="Home" size={16} className="mr-2" />
                Главная
              </Button>
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("dashboard");
                  setSidebarOpen(false);
                }}
              >
                <Icon name="LayoutDashboard" size={16} className="mr-2" />
                Личный кабинет
              </Button>
              <Button
                variant={activeTab === "knowledge" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("knowledge");
                  setSidebarOpen(false);
                }}
              >
                <Icon name="BookOpen" size={16} className="mr-2" />
                База знаний
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("analytics");
                  setSidebarOpen(false);
                }}
              >
                <Icon name="BarChart3" size={16} className="mr-2" />
                Аналитика
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger
              value="home"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Icon name="Home" size={16} className="mr-2" />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Icon name="LayoutDashboard" size={16} className="mr-2" />
              <span className="hidden sm:inline">Кабинет</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Icon name="BookOpen" size={16} className="mr-2" />
              <span className="hidden sm:inline">База знаний</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Icon name="BarChart3" size={16} className="mr-2" />
              <span className="hidden sm:inline">Аналитика</span>
            </TabsTrigger>
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
                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon name="BookOpen" size={32} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">Обучение</CardTitle>
                    <CardDescription>
                      Доступ к базе знаний и учебным материалам
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={() => handleNavigateToSection("knowledge")}
                    >
                      Начать изучение
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon
                        name="CheckCircle"
                        size={32}
                        className="text-white"
                      />
                    </div>
                    <CardTitle className="text-xl">Тестирование</CardTitle>
                    <CardDescription>
                      Проверьте свои знания и получите оценку
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={() => handleStartTest("Общий тест знаний")}
                    >
                      Пройти тест
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon
                        name="TrendingUp"
                        size={32}
                        className="text-white"
                      />
                    </div>
                    <CardTitle className="text-xl">Аналитика</CardTitle>
                    <CardDescription>
                      Отслеживайте прогресс и результаты
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                      onClick={() => handleNavigateToSection("analytics")}
                    >
                      Посмотреть статистику
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {userRole === "employee" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Личный кабинет сотрудника</h2>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выход
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon
                          name="User"
                          size={24}
                          className="mr-2 text-blue-600"
                        />
                        Моя статистика
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-blue-600">
                            15
                          </div>
                          <div className="text-sm text-gray-600">
                            Пройдено тестов
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-green-600">
                            85%
                          </div>
                          <div className="text-sm text-gray-600">
                            Средний балл
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-purple-600">
                            42
                          </div>
                          <div className="text-sm text-gray-600">
                            Статей прочитано
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="flex items-center justify-center">
                            <Badge className="bg-green-500 text-white px-3 py-1">
                              Отлично
                            </Badge>
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
                      <CardTitle className="flex items-center">
                        <Icon
                          name="FileText"
                          size={24}
                          className="mr-2 text-green-600"
                        />
                        Доступные тесты
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            onClick={() => handleStartTest('Корпоративная этика')}
                          >
                            Начать тест
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
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
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            onClick={() => handleStartTest('Техника безопасности')}
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

            {userRole === "teacher" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Личный кабинет преподавателя</h2>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выход
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon name="GraduationCap" size={24} className="mr-2 text-green-600" />
                        Статистика обучения
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-green-600">24</div>
                          <div className="text-sm text-gray-600">Студентов</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-blue-600">156</div>
                          <div className="text-sm text-gray-600">Проведено тестов</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Мои студенты</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {employees.slice(0, 3).map((employee, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}></div>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-600">{employee.department}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className={`${getStatusColor(employee.status)} text-white`}>
                              {getStatusText(employee.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {userRole === "admin" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Панель администратора</h2>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выход
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-blue-600">
                            95
                          </div>
                          <div className="text-sm text-gray-600">
                            Сотрудников
                          </div>
                        </div>
                        <Icon
                          name="Users"
                          size={32}
                          className="text-blue-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-green-600">
                            1,234
                          </div>
                          <div className="text-sm text-gray-600">
                            Тестов пройдено
                          </div>
                        </div>
                        <Icon
                          name="CheckCircle"
                          size={32}
                          className="text-green-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-purple-600">
                            82%
                          </div>
                          <div className="text-sm text-gray-600">
                            Средний балл
                          </div>
                        </div>
                        <Icon
                          name="TrendingUp"
                          size={32}
                          className="text-purple-600"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-orange-600">
                            78
                          </div>
                          <div className="text-sm text-gray-600">Активных</div>
                        </div>
                        <Icon
                          name="Activity"
                          size={32}
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
                          employees: { label: "Сотрудники", color: "#2563eb" },
                          tests: { label: "Тесты", color: "#16a34a" },
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
                      <CardTitle>Распределение оценок</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          value: { label: "Процент", color: "#8b5cf6" },
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
                              className={`w-4 h-4 rounded-full ${getStatusColor(employee.status)}`}
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAssignTest(employee.name)}
                            >
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
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={handleAIQuery}
                      >
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
                  className="hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>
                      {item.views} просмотров • Обновлено {item.lastUpdate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReadArticle(item.title)}
                      >
                        <Icon name="Eye" size={16} className="mr-2" />
                        Читать
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 animate-pulse"
                        onClick={() => handleStartTest(`Тест по теме: ${item.title}`)}
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
                      employees: { label: "Сотрудники", color: "#2563eb" },
                      tests: { label: "Тесты", color: "#16a34a" },
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
                      value: { label: "Процент", color: "#8b5cf6" },
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
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 animate-pulse"
                    onClick={() => handleExportData('CSV')}
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт CSV
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 animate-pulse"
                    onClick={() => handleExportData('Excel')}
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