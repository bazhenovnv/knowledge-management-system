import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

import { toast } from "sonner";
import Icon from "@/components/ui/icon";
import { useViewedTests } from "@/hooks/useViewedTests";
import { database } from "@/utils/database";
import TestTaking from "./TestTaking";
import { TestFilters } from "./TestFilters";
import { TestGrid } from "./TestGrid";
import { TestDialog } from "./TestDialog";
import { Test, TestResult, TestFormData, Question, TestManagementProps } from "./types";

const TestManagement: React.FC<TestManagementProps> = ({
  userRole,
  userId,
}) => {

  const { markTestAsViewed } = useViewedTests();
  const [tests, setTests] = useState<Test[]>([]);

  // Загружаем тесты из базы данных при инициализации
  useEffect(() => {
    const loadTests = () => {
      const testsFromDB = database.getTests();
      setTests(testsFromDB);
    };
    loadTests();
  }, []);

  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [takingTest, setTakingTest] = useState<Test | null>(null);
  
  // Состояние для формы создания теста
  const [newTest, setNewTest] = useState<TestFormData>({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    timeLimit: 30,
    department: "",
    questions: []
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
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Функция редактирования теста
  const handleEditTest = (test: Test) => {
    setEditingTest(test);
    setNewTest({
      title: test.title,
      description: test.description,
      category: test.category,
      difficulty: test.difficulty,
      timeLimit: test.timeLimit,
      department: test.department || "",
      questions: [...test.questions]
    });
    setIsEditDialogOpen(true);
  };

  // Функция сохранения изменений теста
  const handleSaveEditTest = () => {
    if (!editingTest) return;
    
    const updatedTest: Test = {
      ...editingTest,
      title: newTest.title,
      description: newTest.description,
      category: newTest.category,
      difficulty: newTest.difficulty as "easy" | "medium" | "hard",
      timeLimit: newTest.timeLimit,
      department: newTest.department,
      questions: newTest.questions
    };

    const savedTest = database.updateTest(editingTest.id, updatedTest);
    if (savedTest) {
      setTests(tests.map(t => t.id === editingTest.id ? savedTest : t));
      setEditingTest(null);
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Тест обновлен в базе данных!");
    } else {
      toast.error("Ошибка при обновлении теста в базе данных");
    }
  };

  // Функция удаления теста
  const handleDeleteTest = (testId: string) => {
    const testToDelete = tests.find(t => t.id === testId);
    if (testToDelete) {
      const success = database.deleteTest(testId);
      if (success) {
        setTests(tests.filter(t => t.id !== testId));
        setDeletingTestId(null);
        toast.success(`Тест "${testToDelete.title}" удален из базы данных`);
      } else {
        toast.error("Ошибка при удалении теста из базы данных");
      }
    }
  };

  // Функция прохождения теста
  const handleTakeTest = (test: Test) => {
    setTakingTest(test);
    markTestAsViewed(test.id);
    if (userRole === "student") {
      toast(`Начинаем тест: ${test.title}`);
    } else {
      toast(`Просмотр теста: ${test.title}`);
    }
  };

  // Функция завершения теста
  const handleTestComplete = (result: TestResult) => {
    const savedResult = database.saveTestResult(result);
    setTestResults(prev => [...prev, savedResult]);
    
    setTests(prev => prev.map(test => {
      if (test.id === result.testId) {
        const newTotalAttempts = test.totalAttempts + 1;
        const newAverageScore = Math.round(
          ((test.averageScore * test.totalAttempts) + result.score) / newTotalAttempts
        );
        const updatedTest = {
          ...test,
          totalAttempts: newTotalAttempts,
          averageScore: newAverageScore
        };
        
        database.updateTest(test.id, updatedTest);
        return updatedTest;
      }
      return test;
    }));
    
    toast.success(`Результат сохранен в базе данных: ${result.score}%`);
  };

  // Функция закрытия теста
  const handleCloseTakingTest = () => {
    setTakingTest(null);
  };

  // Функция создания теста
  const handleCreateTest = () => {
    if (!newTest.title || !newTest.description || !newTest.category || !newTest.difficulty) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    if (newTest.questions.length === 0) {
      toast.error("Добавьте хотя бы один вопрос");
      return;
    }

    const test: Test = {
      id: Date.now().toString(),
      title: newTest.title,
      description: newTest.description,
      category: newTest.category,
      difficulty: newTest.difficulty as "easy" | "medium" | "hard",
      timeLimit: newTest.timeLimit,
      questions: newTest.questions,
      department: newTest.department,
      createdBy: userRole === "admin" ? "Администратор" : "Преподаватель",
      createdAt: new Date(),
      status: "draft",
      totalAttempts: 0,
      averageScore: 0,
    };

    const savedTest = database.saveTest(test);
    setTests([...tests, savedTest]);
    resetForm();
    setIsCreating(false);
    toast.success("Тест создан и сохранен в базе данных!");
  };

  const filteredTests = tests.filter((test) => {
    if (filter !== "all" && test.status !== filter) return false;
    if (departmentFilter !== "all" && test.department !== departmentFilter) return false;
    if (
      searchTerm &&
      !test.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

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
    
    resetQuestionForm();
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

  const resetQuestionForm = () => {
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
  
  const resetForm = () => {
    setNewTest({
      title: "",
      description: "",
      category: "",
      difficulty: "",
      timeLimit: 30,
      department: "",
      questions: []
    });
    resetQuestionForm();
    setEditingQuestionIndex(null);
  };

  const handleCreateDialogChange = (open: boolean) => {
    if (!open) {
      setIsCreating(false);
      resetForm();
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setIsEditDialogOpen(false);
      setEditingTest(null);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Тесты</h2>
        {canManageTests && (
          <Button 
            onClick={() => {
              setIsCreating(true);
              setEditingTest(null);
              resetForm();
            }} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Создать тест
          </Button>
        )}
      </div>

      <TestFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filter={filter}
        setFilter={setFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
      />

      <TestGrid
        filteredTests={filteredTests}
        userRole={userRole}
        canManageTests={canManageTests}
        onEditTest={handleEditTest}
        onDeleteTest={setDeletingTestId}
        onTakeTest={handleTakeTest}
        searchTerm={searchTerm}
      />

      {/* Диалоги создания и редактирования тестов */}
      <TestDialog
        isOpen={isCreating}
        onOpenChange={handleCreateDialogChange}
        title="Создать новый тест"
        newTest={newTest}
        setNewTest={setNewTest}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        isAddingQuestion={isAddingQuestion}
        setIsAddingQuestion={setIsAddingQuestion}
        editingQuestionIndex={editingQuestionIndex}
        onEditQuestion={editQuestion}
        onDeleteQuestion={deleteQuestion}
        onAddQuestion={addQuestion}
        onSave={handleCreateTest}
        onCancel={() => setIsCreating(false)}
      />

      <TestDialog
        isOpen={isEditDialogOpen}
        onOpenChange={handleEditDialogChange}
        title="Редактировать тест"
        newTest={newTest}
        setNewTest={setNewTest}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        isAddingQuestion={isAddingQuestion}
        setIsAddingQuestion={setIsAddingQuestion}
        editingQuestionIndex={editingQuestionIndex}
        onEditQuestion={editQuestion}
        onDeleteQuestion={deleteQuestion}
        onAddQuestion={addQuestion}
        onSave={handleSaveEditTest}
        onCancel={() => setIsEditDialogOpen(false)}
        isEditing={true}
      />

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

      {/* Компонент прохождения теста */}
      <TestTaking
        test={takingTest}
        onClose={handleCloseTakingTest}
        onComplete={handleTestComplete}
        userId={userId || "anonymous"}
      />
    </div>
  );
};

export default TestManagement;