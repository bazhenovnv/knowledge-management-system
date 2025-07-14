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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from "sonner";
import Icon from "@/components/ui/icon";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number; // время на вопрос в секундах
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
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [takingTest, setTakingTest] = useState<Test | null>(null);
  
  // Состояние для формы создания теста
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "" as "easy" | "medium" | "hard" | "",
    timeLimit: 30,
    department: "",
    questions: [] as Question[]
  });
  
  // Состояние для текущего вопроса
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    timeLimit: 60
  });
  
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Функция редактирования теста
  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setIsEditDialogOpen(true);
    toast.info(`Редактирование теста: ${test.title}`);
  };

  // Функция удаления теста
  const handleDeleteTest = (testId: string) => {
    const testToDelete = tests.find(t => t.id === testId);
    if (testToDelete) {
      setTests(tests.filter(t => t.id !== testId));
      setDeletingTestId(null);
      toast.success(`Тест "${testToDelete.title}" удален`);
    }
  };

  // Функция прохождения теста
  const handleTakeTest = (test: Test) => {
    setTakingTest(test);
    if (userRole === "student") {
      toast.info(`Начинаем тест: ${test.title}`);
    } else {
      toast.info(`Просмотр теста: ${test.title}`);
    }
  };

  // Функция создания теста
  const handleCreateTest = () => {
    if (!newTest.title || !newTest.description || !newTest.category || !newTest.difficulty) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      description: newTest.description,
      category: newTest.category,
      difficulty: newTest.difficulty,
      timeLimit: newTest.timeLimit,
      questions: newTest.questions,
      department: newTest.department,
      createdBy: userRole === "admin" ? "Администратор" : "Преподаватель",
      createdAt: new Date(),
      status: "draft",
      totalAttempts: 0,
      averageScore: 0,
    };

    setTests([...tests, test]);
    setNewTest({
      title: "",
      description: "",
      category: "",
      difficulty: "",
      timeLimit: 30,
      department: "",
      questions: []
    });
    setIsCreating(false);
    toast.success("Тест создан успешно!");
  };

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
  
  // Функции для управления вопросами
  const addQuestion = () => {
    if (currentQuestion.question.trim() === "") return;
    
    const newQuestion: Question = {
      ...currentQuestion,
      id: Date.now().toString(),
      options: currentQuestion.options.filter(opt => opt.trim() !== "")
    };
    
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...newTest.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setNewTest({ ...newTest, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      setNewTest({ ...newTest, questions: [...newTest.questions, newQuestion] });
    }
    
    // Очистить форму
    setCurrentQuestion({
      id: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      timeLimit: 60
    });
    setIsAddingQuestion(false);
  };
  
  const editQuestion = (index: number) => {
    setCurrentQuestion(newTest.questions[index]);
    setEditingQuestionIndex(index);
    setIsAddingQuestion(true);
  };
  
  const deleteQuestion = (index: number) => {
    const updatedQuestions = newTest.questions.filter((_, i) => i !== index);
    setNewTest({ ...newTest, questions: updatedQuestions });
  };
  
  const resetForm = () => {
    setNewTest({
      title: "",
      description: "",
      category: "",
      difficulty: "" as "easy" | "medium" | "hard" | "",
      timeLimit: 30,
      department: "",
      questions: []
    });
    setCurrentQuestion({
      id: "",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      timeLimit: 60
    });
    setIsAddingQuestion(false);
    setEditingQuestionIndex(null);
  };
  
  const createTest = () => {
    if (newTest.title.trim() === "" || newTest.questions.length === 0) return;
    
    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      description: newTest.description,
      category: newTest.category,
      difficulty: newTest.difficulty as "easy" | "medium" | "hard",
      timeLimit: newTest.timeLimit,
      questions: newTest.questions,
      department: newTest.department,
      createdBy: userId || "Преподаватель",
      createdAt: new Date(),
      status: "draft",
      totalAttempts: 0,
      averageScore: 0
    };
    
    setTests([...tests, test]);
    resetForm();
    setIsCreating(false);
  };

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Создать новый тест</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Основная информация */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Основная информация</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Название теста</Label>
                      <Input 
                        id="title" 
                        placeholder="Введите название теста" 
                        value={newTest.title}
                        onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Категория</Label>
                      <Select value={newTest.category} onValueChange={(value) => setNewTest({...newTest, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Безопасность">Безопасность</SelectItem>
                          <SelectItem value="Клиентский сервис">Клиентский сервис</SelectItem>
                          <SelectItem value="Технические знания">Технические знания</SelectItem>
                          <SelectItem value="Соответствие">Соответствие</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Описание теста" 
                      value={newTest.description}
                      onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Сложность</Label>
                      <Select value={newTest.difficulty} onValueChange={(value) => setNewTest({...newTest, difficulty: value as "easy" | "medium" | "hard"})}>
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
                      <Label htmlFor="timeLimit">Общее время (мин)</Label>
                      <Input 
                        id="timeLimit" 
                        type="number" 
                        placeholder="30" 
                        value={newTest.timeLimit}
                        onChange={(e) => setNewTest({...newTest, timeLimit: parseInt(e.target.value) || 30})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Отдел</Label>
                      <Select value={newTest.department} onValueChange={(value) => setNewTest({...newTest, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите отдел" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Все отделы">Все отделы</SelectItem>
                          <SelectItem value="ЦТО">ЦТО</SelectItem>
                          <SelectItem value="Сервис">Сервис</SelectItem>
                          <SelectItem value="Отдел IT">Отдел IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Список вопросов */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Вопросы ({newTest.questions.length})</h3>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingQuestion(true)}
                      disabled={isAddingQuestion}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить вопрос
                    </Button>
                  </div>
                  
                  {/* Список существующих вопросов */}
                  {newTest.questions.map((question, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{index + 1}. {question.question}</h4>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`p-2 rounded text-sm ${
                                optIndex === question.correctAnswer 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100'
                              }`}>
                                {optIndex === question.correctAnswer && '✓ '}{option}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Время: {question.timeLimit || 60}с</span>
                            {question.explanation && <span>Пояснение: да</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => editQuestion(index)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteQuestion(index)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {/* Форма добавления/редактирования вопроса */}
                  {isAddingQuestion && (
                    <Card className="p-4 border-dashed">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="question">Текст вопроса</Label>
                          <Textarea 
                            id="question" 
                            placeholder="Введите текст вопроса" 
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label>Варианты ответов</Label>
                          <div className="grid grid-cols-2 gap-4">
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={currentQuestion.correctAnswer === index}
                                  onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                                  className="text-green-500"
                                />
                                <Input
                                  placeholder={`Вариант ${index + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...currentQuestion.options];
                                    newOptions[index] = e.target.value;
                                    setCurrentQuestion({...currentQuestion, options: newOptions});
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">Отметьте правильный ответ</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="questionTimeLimit">Время на вопрос (сек)</Label>
                            <Input 
                              id="questionTimeLimit" 
                              type="number" 
                              placeholder="60" 
                              value={currentQuestion.timeLimit}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, timeLimit: parseInt(e.target.value) || 60})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="explanation">Пояснение (опционально)</Label>
                            <Input 
                              id="explanation" 
                              placeholder="Пояснение к ответу" 
                              value={currentQuestion.explanation}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddingQuestion(false);
                              setEditingQuestionIndex(null);
                              setCurrentQuestion({
                                id: "",
                                question: "",
                                options: ["", "", "", ""],
                                correctAnswer: 0,
                                explanation: "",
                                timeLimit: 60
                              });
                            }}
                          >
                            Отмена
                          </Button>
                          <Button onClick={addQuestion}>
                            {editingQuestionIndex !== null ? 'Сохранить' : 'Добавить'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  {newTest.questions.length === 0 && !isAddingQuestion && (
                    <div className="text-center py-8 text-gray-500">
                      <Icon name="AlertCircle" size={48} className="mx-auto mb-4" />
                      <p>Добавьте вопросы для создания теста</p>
                    </div>
                  )}
                </div>
                
                {/* Кнопки действий */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsCreating(false);
                    }}
                  >
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleCreateTest}
                    disabled={newTest.title.trim() === "" || newTest.questions.length === 0}
                  >
                    Создать тест
                  </Button>
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditTest(test)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeletingTestId(test.id)}
                    >
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
                    <Button 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => handleTakeTest(test)}
                    >
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

      {/* Диалог подтверждения удаления теста */}
      <AlertDialog open={!!deletingTestId} onOpenChange={() => setDeletingTestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот тест? Все результаты прохождения также будут удалены. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTestId(null)}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteTest(deletingTestId!)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestManagement;