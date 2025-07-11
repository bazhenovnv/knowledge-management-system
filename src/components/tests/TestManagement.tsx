import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Play,
  Users,
  CheckCircle,
} from "lucide-react";
import Icon from "@/components/ui/icon";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // в минутах
  questions: Question[];
  department?: string;
  createdBy: string;
  createdAt: Date;
  status: "draft" | "published" | "archived";
  totalAttempts: number;
  averageScore: number;
}

interface TestManagementProps {
  userRole: "admin" | "teacher" | "student";
  userId?: string;
}

const TestManagement: React.FC<TestManagementProps> = ({
  userRole,
  userId,
}) => {
  const [tests, setTests] = useState<Test[]>([
    {
      id: "1",
      title: "Основы информационной безопасности",
      description: "Тест на знание основных принципов ИБ",
      category: "Безопасность",
      difficulty: "medium",
      timeLimit: 30,
      questions: [
        {
          id: "1",
          question: "Что такое фишинг?",
          options: [
            "Вид рыбалки",
            "Мошенничество через поддельные сайты",
            "Антивирусная программа",
            "Тип шифрования",
          ],
          correctAnswer: 1,
          explanation:
            "Фишинг - это вид интернет-мошенничества, при котором злоумышленники используют поддельные сайты для кражи личных данных.",
        },
      ],
      department: "Все отделы",
      createdBy: "Администратор",
      createdAt: new Date("2024-01-15"),
      status: "published",
      totalAttempts: 45,
      averageScore: 78,
    },
    {
      id: "2",
      title: "Работа с клиентами",
      description: "Тест на знание принципов работы с клиентами",
      category: "Клиентский сервис",
      difficulty: "easy",
      timeLimit: 20,
      questions: [
        {
          id: "1",
          question: "Как правильно приветствовать клиента?",
          options: [
            "Привет",
            "Добро пожаловать! Как дела?",
            "Здравствуйте! Чем могу помочь?",
            "Что нужно?",
          ],
          correctAnswer: 2,
          explanation:
            "Профессиональное приветствие должно быть вежливым и предлагать помощь.",
        },
      ],
      department: "Сервис",
      createdBy: "Преподаватель",
      createdAt: new Date("2024-01-10"),
      status: "published",
      totalAttempts: 23,
      averageScore: 85,
    },
  ]);

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTests = tests.filter((test) => {
    if (filter !== "all" && test.status !== filter) return false;
    if (
      searchTerm &&
      !test.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Опубликован";
      case "draft":
        return "Черновик";
      case "archived":
        return "Архивирован";
      default:
        return status;
    }
  };

  const canManageTests = userRole === "admin" || userRole === "teacher";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Тесты</h2>
        {canManageTests && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать тест
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Создать новый тест</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Название теста</Label>
                    <Input id="title" placeholder="Введите название теста" />
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Безопасность</SelectItem>
                        <SelectItem value="service">
                          Клиентский сервис
                        </SelectItem>
                        <SelectItem value="technical">
                          Технические знания
                        </SelectItem>
                        <SelectItem value="compliance">Соответствие</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea id="description" placeholder="Описание теста" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Сложность</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Сложность" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Легкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="hard">Сложный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Время (мин)</Label>
                    <Input id="timeLimit" type="number" placeholder="30" />
                  </div>
                  <div>
                    <Label htmlFor="department">Отдел</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все отделы</SelectItem>
                        <SelectItem value="cto">ЦТО</SelectItem>
                        <SelectItem value="service">Сервис</SelectItem>
                        <SelectItem value="it">Отдел IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Отмена
                  </Button>
                  <Button>Создать</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4 items-center">
        <Input
          placeholder="Поиск тестов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все тесты</SelectItem>
            <SelectItem value="published">Опубликованные</SelectItem>
            <SelectItem value="draft">Черновики</SelectItem>
            <SelectItem value="archived">Архивированные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {test.description}
                  </p>
                </div>
                {canManageTests && (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty === "easy"
                      ? "Легкий"
                      : test.difficulty === "medium"
                        ? "Средний"
                        : "Сложный"}
                  </Badge>
                  <Badge className={getStatusColor(test.status)}>
                    {getStatusText(test.status)}
                  </Badge>
                  <Badge variant="outline">{test.category}</Badge>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Вопросов: {test.questions.length}</span>
                  <span>Время: {test.timeLimit} мин</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <Icon name="Users" size={14} className="mr-1" />
                    {test.totalAttempts} попыток
                  </span>
                  <span className="flex items-center">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    {test.averageScore}% средний балл
                  </span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {test.department}
                    </span>
                    <Button size="sm" className="flex items-center">
                      <Icon name="Play" size={14} className="mr-1" />
                      {userRole === "student" ? "Пройти" : "Просмотр"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <Icon
            name="AlertCircle"
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Тесты не найдены
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Попробуйте изменить поисковый запрос"
              : "Нет доступных тестов"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestManagement;
