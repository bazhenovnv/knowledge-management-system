import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import { database } from "@/utils/database";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import EmployeeCharts from './EmployeeCharts';

export const TopEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [bottomEmployees, setBottomEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departments, setDepartments] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);

  // Загружаем сотрудников из базы данных
  useEffect(() => {
    const loadEmployees = () => {
      const employeesData = database.getEmployees();
      const testsData = database.getTests();
      const totalAvailableTests = testsData.filter(t => t.status === 'published').length;
      
      setEmployees(employeesData);
      setAvailableTests(testsData.filter(t => t.status === 'published'));

      // Получаем уникальные отделы
      const uniqueDepartments = Array.from(
        new Set(employeesData
          .filter(emp => emp.role === 'employee' && emp.department)
          .map(emp => emp.department))
      ).sort();
      setDepartments(uniqueDepartments);

      // Фильтруем только сотрудников (не админов и преподавателей)
      let onlyEmployees = employeesData.filter(emp => emp.role === 'employee');
      
      // Применяем фильтр по отделу
      if (selectedDepartment !== "all") {
        onlyEmployees = onlyEmployees.filter(emp => emp.department === selectedDepartment);
      }
      
      // Сотрудники с результатами тестов
      const employeesWithTests = onlyEmployees.filter(emp => 
        emp.testResults && emp.testResults.length > 0
      );

      // Сортировка по общей оценке (от лучших к худшим)
      const sortedByScore = [...employeesWithTests].sort((a, b) => 
        getTestScore(b) - getTestScore(a)
      );
      
      // Топ-3 лучших сотрудников (с лучшими баллами)
      setTopEmployees(sortedByScore.slice(0, 3));
      
      // Сотрудники, требующие внимания:
      // 1. С низкими баллами (< 60%)
      // 2. Не прошедшие ни одного теста
      // 3. Прошедшие мало тестов при наличии доступных
      const needAttention = onlyEmployees.filter(emp => {
        const testScore = getTestScore(emp);
        const completedTests = getCompletedTests(emp);
        
        // Критерии для внимания:
        return (
          completedTests === 0 || // Не прошел ни одного теста
          testScore < 60 || // Низкий балл
          (totalAvailableTests > 0 && completedTests < totalAvailableTests / 2) // Прошел меньше половины
        );
      }).sort((a, b) => {
        // Сортируем по приоритету: сначала с низкими баллами, потом без тестов
        const scoreA = getTestScore(a);
        const scoreB = getTestScore(b);
        const testsA = getCompletedTests(a);
        const testsB = getCompletedTests(b);
        
        // Если оба без тестов - сортируем по имени
        if (testsA === 0 && testsB === 0) return a.name.localeCompare(b.name);
        // Если один без тестов - он важнее
        if (testsA === 0) return -1;
        if (testsB === 0) return 1;
        // Оба с тестами - сортируем по баллу (худшие первыми)
        return scoreA - scoreB;
      });
      
      setBottomEmployees(needAttention.slice(0, 3));
    };

    loadEmployees();
    
    // Обновляем данные каждые 10 секунд
    const interval = setInterval(loadEmployees, 10000);
    
    return () => clearInterval(interval);
  }, [selectedDepartment]);

  // Функция для подсчета общей оценки тестирования
  const getTestScore = (employee: any) => {
    if (!employee.testResults || employee.testResults.length === 0) return 0;
    const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
    return Math.round(totalScore / employee.testResults.length);
  };

  // Функция для подсчета пройденных тестов
  const getCompletedTests = (employee: any) => {
    return employee.testResults ? employee.testResults.length : 0;
  };

  // Функция назначения теста сотруднику
  const assignTest = () => {
    if (!selectedTestId || !selectedEmployee) return;

    const test = availableTests.find(t => t.id === selectedTestId);
    if (!test) return;

    // Получаем текущего пользователя для assignedBy
    const currentUser = database.getCurrentUser();
    
    // Создаем запись о назначении
    const assignment = {
      testId: test.id,
      testTitle: test.title,
      assignedBy: currentUser?.name || 'Администратор',
      assignedAt: new Date(),
      status: 'pending' as const,
    };

    // Обновляем сотрудника
    const currentAssignedTests = selectedEmployee.assignedTests || [];
    database.updateEmployee(selectedEmployee.id, {
      assignedTests: [...currentAssignedTests, assignment]
    });

    alert(`Тест "${test.title}" успешно назначен сотруднику ${selectedEmployee.name}!`);
    setSelectedTestId("");
    setIsDialogOpen(false);
    
    // Перезагружаем данные
    const updatedEmployees = database.getEmployees();
    setEmployees(updatedEmployees);
  };

  // Функция отправки напоминания о непройденном тесте
  const sendReminder = (assignment: any) => {
    if (!selectedEmployee) return;

    const currentUser = database.getCurrentUser();
    
    // Создаем уведомление используя метод из database
    database.createNotification({
      title: `Напоминание: Пройдите тест "${assignment.testTitle}"`,
      message: `Напоминаем, что вам назначен тест "${assignment.testTitle}". Пожалуйста, пройдите его в ближайшее время.`,
      priority: 'medium',
      type: 'reminder',
      recipients: [selectedEmployee.id],
      createdBy: currentUser?.name || 'Администратор',
      createdByRole: (currentUser?.role || 'admin') as 'admin' | 'teacher',
      status: 'sent',
    });

    alert(`Напоминание отправлено сотруднику ${selectedEmployee.name}!`);
  };

  // Определение причины, почему сотрудник требует внимания
  const getAttentionReason = (employee: any) => {
    const testScore = getTestScore(employee);
    const completedTests = getCompletedTests(employee);
    const testsData = database.getTests();
    const totalAvailableTests = testsData.filter(t => t.status === 'published').length;
    
    if (completedTests === 0) {
      return { icon: 'XCircle', text: 'Не прошел тесты', color: 'text-red-600' };
    }
    if (testScore < 40) {
      return { icon: 'TrendingDown', text: 'Очень низкий балл', color: 'text-red-600' };
    }
    if (testScore < 60) {
      return { icon: 'AlertTriangle', text: 'Низкий балл', color: 'text-orange-600' };
    }
    if (totalAvailableTests > 0 && completedTests < totalAvailableTests / 2) {
      return { icon: 'Clock', text: 'Мало пройдено', color: 'text-yellow-600' };
    }
    return { icon: 'Info', text: 'Требует внимания', color: 'text-gray-600' };
  };

  // Функция экспорта в Excel
  const exportToExcel = () => {
    try {
      const employeesData = database.getEmployees();
      const testsData = database.getTests();
      const totalAvailableTests = testsData.filter(t => t.status === 'published').length;
      
      // Фильтруем сотрудников по выбранному отделу
      let filteredEmployees = employeesData.filter(emp => emp.role === 'employee');
      if (selectedDepartment !== "all") {
        filteredEmployees = filteredEmployees.filter(emp => emp.department === selectedDepartment);
      }

      // Формируем данные для экспорта
      const exportData = filteredEmployees.map(emp => {
        const testScore = getTestScore(emp);
        const completedTests = getCompletedTests(emp);
        const totalTime = emp.testResults?.reduce((sum: number, test: any) => sum + test.timeSpent, 0) || 0;
        
        return {
          'ФИО': emp.name,
          'Email': emp.email,
          'Отдел': emp.department || 'Не указан',
          'Должность': emp.position,
          'Статус': getStatusText(emp.status),
          'Средний балл (%)': testScore,
          'Пройдено тестов': completedTests,
          'Всего тестов': totalAvailableTests,
          'Процент выполнения (%)': totalAvailableTests > 0 ? Math.round((completedTests / totalAvailableTests) * 100) : 0,
          'Время на тесты (мин)': totalTime,
          'Назначено тестов': emp.assignedTests?.length || 0,
          'Непройденных тестов': emp.assignedTests?.filter((a: any) => 
            !emp.testResults?.some((r: any) => r.id.toString() === a.testId)
          ).length || 0
        };
      });

      // Сортируем по среднему баллу (от лучших к худшим)
      exportData.sort((a, b) => b['Средний балл (%)'] - a['Средний балл (%)']);

      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();
      
      // Добавляем основной лист со всеми сотрудниками
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Настраиваем ширину колонок
      const colWidths = [
        { wch: 25 }, // ФИО
        { wch: 25 }, // Email
        { wch: 20 }, // Отдел
        { wch: 25 }, // Должность
        { wch: 15 }, // Статус
        { wch: 15 }, // Средний балл
        { wch: 15 }, // Пройдено тестов
        { wch: 15 }, // Всего тестов
        { wch: 20 }, // Процент выполнения
        { wch: 18 }, // Время на тесты
        { wch: 18 }, // Назначено тестов
        { wch: 20 }  // Непройденных тестов
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');

      // Создаем лист с топ-3 лучшими
      if (topEmployees.length > 0) {
        const topData = topEmployees.map((emp, index) => ({
          'Место': index + 1,
          'ФИО': emp.name,
          'Отдел': emp.department || 'Не указан',
          'Средний балл (%)': getTestScore(emp),
          'Пройдено тестов': getCompletedTests(emp)
        }));
        const wsTop = XLSX.utils.json_to_sheet(topData);
        wsTop['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsTop, 'Лучшие сотрудники');
      }

      // Создаем лист с требующими внимания
      if (bottomEmployees.length > 0) {
        const bottomData = bottomEmployees.map(emp => {
          const reason = getAttentionReason(emp);
          return {
            'ФИО': emp.name,
            'Отдел': emp.department || 'Не указан',
            'Причина': reason.text,
            'Средний балл (%)': getTestScore(emp),
            'Пройдено тестов': getCompletedTests(emp)
          };
        });
        const wsBottom = XLSX.utils.json_to_sheet(bottomData);
        wsBottom['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, wsBottom, 'Требуют внимания');
      }

      // Создаем лист со сводкой по отделам
      if (selectedDepartment === "all") {
        const deptStats = departments.map(dept => {
          const deptEmployees = employeesData.filter(e => e.role === 'employee' && e.department === dept);
          const avgScore = deptEmployees.length > 0 
            ? Math.round(deptEmployees.reduce((sum, emp) => sum + getTestScore(emp), 0) / deptEmployees.length)
            : 0;
          const totalCompleted = deptEmployees.reduce((sum, emp) => sum + getCompletedTests(emp), 0);
          
          return {
            'Отдел': dept,
            'Количество сотрудников': deptEmployees.length,
            'Средний балл (%)': avgScore,
            'Всего пройдено тестов': totalCompleted,
            'Среднее тестов на человека': deptEmployees.length > 0 ? Math.round(totalCompleted / deptEmployees.length * 10) / 10 : 0
          };
        }).sort((a, b) => b['Средний балл (%)'] - a['Средний балл (%)']);
        
        const wsDepts = XLSX.utils.json_to_sheet(deptStats);
        wsDepts['!cols'] = [{ wch: 25 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, wsDepts, 'Статистика по отделам');
      }

      // Создаем лист со статистикой по тестам
      const testResults = database.getTestResults();
      const testStats = testsData
        .filter(t => t.status === 'published')
        .map(test => {
          // Находим все результаты для этого теста
          const testResultsForTest = testResults.filter(r => r.testId === test.id);
          
          // Фильтруем результаты по выбранному отделу
          let relevantResults = testResultsForTest;
          if (selectedDepartment !== "all") {
            relevantResults = testResultsForTest.filter(r => {
              const emp = employeesData.find(e => e.id.toString() === r.userId);
              return emp && emp.department === selectedDepartment;
            });
          }
          
          const attemptCount = relevantResults.length;
          const avgScore = attemptCount > 0
            ? Math.round(relevantResults.reduce((sum, r) => sum + r.score, 0) / attemptCount)
            : 0;
          const avgTime = attemptCount > 0
            ? Math.round(relevantResults.reduce((sum, r) => sum + r.timeSpent, 0) / attemptCount)
            : 0;
          const passRate = attemptCount > 0
            ? Math.round((relevantResults.filter(r => r.score >= 70).length / attemptCount) * 100)
            : 0;
          
          // Считаем сколько сотрудников назначен этот тест
          let assignedCount = 0;
          if (selectedDepartment === "all") {
            assignedCount = employeesData.filter(e => 
              e.role === 'employee' && 
              e.assignedTests?.some((a: any) => a.testId === test.id)
            ).length;
          } else {
            assignedCount = employeesData.filter(e => 
              e.role === 'employee' && 
              e.department === selectedDepartment &&
              e.assignedTests?.some((a: any) => a.testId === test.id)
            ).length;
          }
          
          return {
            'Название теста': test.title,
            'Категория': test.category,
            'Сложность': test.difficulty === 'easy' ? 'Легкий' : test.difficulty === 'medium' ? 'Средний' : 'Сложный',
            'Вопросов': test.questions?.length || 0,
            'Лимит времени (мин)': test.timeLimit,
            'Прошли тест': attemptCount,
            'Назначено': assignedCount,
            'Процент выполнения (%)': assignedCount > 0 ? Math.round((attemptCount / assignedCount) * 100) : 0,
            'Средний балл (%)': avgScore,
            'Среднее время (мин)': avgTime,
            'Процент сдачи (≥70%)': passRate,
            'Создал': test.createdBy,
            'Дата создания': new Date(test.createdAt).toLocaleDateString('ru-RU')
          };
        })
        .sort((a, b) => b['Прошли тест'] - a['Прошли тест']); // Сортируем по популярности
      
      const wsTests = XLSX.utils.json_to_sheet(testStats);
      wsTests['!cols'] = [
        { wch: 35 }, // Название теста
        { wch: 20 }, // Категория
        { wch: 12 }, // Сложность
        { wch: 10 }, // Вопросов
        { wch: 18 }, // Лимит времени
        { wch: 15 }, // Прошли тест
        { wch: 12 }, // Назначено
        { wch: 20 }, // Процент выполнения
        { wch: 18 }, // Средний балл
        { wch: 18 }, // Среднее время
        { wch: 18 }, // Процент сдачи
        { wch: 20 }, // Создал
        { wch: 15 }  // Дата создания
      ];
      XLSX.utils.book_append_sheet(wb, wsTests, 'Статистика по тестам');

      // Создаем лист с детальными результатами прохождения тестов
      const detailedResults: any[] = [];
      filteredEmployees.forEach(emp => {
        if (emp.testResults && emp.testResults.length > 0) {
          emp.testResults.forEach((result: any) => {
            const test = testsData.find(t => t.id === result.id.toString());
            
            detailedResults.push({
              'ФИО сотрудника': emp.name,
              'Отдел': emp.department || 'Не указан',
              'Должность': emp.position,
              'Название теста': test?.title || `Тест #${result.id}`,
              'Категория': test?.category || 'Не указана',
              'Сложность': test?.difficulty === 'easy' ? 'Легкий' : test?.difficulty === 'medium' ? 'Средний' : 'Сложный',
              'Балл (%)': result.score,
              'Результат': result.score >= 80 ? 'Отлично' : result.score >= 70 ? 'Хорошо' : result.score >= 60 ? 'Удовлетворительно' : 'Неудовлетворительно',
              'Время (мин)': result.timeSpent,
              'Правильных ответов': result.correctAnswers || 'N/A',
              'Всего вопросов': result.totalQuestions || test?.questions?.length || 'N/A',
              'Процент правильных': result.correctAnswers && result.totalQuestions 
                ? Math.round((result.correctAnswers / result.totalQuestions) * 100) 
                : 'N/A',
              'Дата прохождения': result.completedAt 
                ? new Date(result.completedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Не указана'
            });
          });
        }
      });

      // Сортируем по дате (новые сначала)
      detailedResults.sort((a, b) => {
        const dateA = a['Дата прохождения'] !== 'Не указана' ? new Date(a['Дата прохождения']) : new Date(0);
        const dateB = b['Дата прохождения'] !== 'Не указана' ? new Date(b['Дата прохождения']) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      if (detailedResults.length > 0) {
        const wsDetailed = XLSX.utils.json_to_sheet(detailedResults);
        wsDetailed['!cols'] = [
          { wch: 25 }, // ФИО сотрудника
          { wch: 20 }, // Отдел
          { wch: 25 }, // Должность
          { wch: 35 }, // Название теста
          { wch: 20 }, // Категория
          { wch: 12 }, // Сложность
          { wch: 10 }, // Балл
          { wch: 20 }, // Результат
          { wch: 12 }, // Время
          { wch: 18 }, // Правильных ответов
          { wch: 15 }, // Всего вопросов
          { wch: 18 }, // Процент правильных
          { wch: 18 }  // Дата прохождения
        ];
        XLSX.utils.book_append_sheet(wb, wsDetailed, 'Детальные результаты');
      }

      // Создаем лист с данными для графиков
      const chartData: any[] = [];
      
      // 1. График: Распределение сотрудников по баллам
      const scoreRanges = [
        { range: '0-39%', min: 0, max: 39, count: 0 },
        { range: '40-59%', min: 40, max: 59, count: 0 },
        { range: '60-69%', min: 60, max: 69, count: 0 },
        { range: '70-79%', min: 70, max: 79, count: 0 },
        { range: '80-89%', min: 80, max: 89, count: 0 },
        { range: '90-100%', min: 90, max: 100, count: 0 }
      ];
      
      filteredEmployees.forEach(emp => {
        const score = getTestScore(emp);
        const range = scoreRanges.find(r => score >= r.min && score <= r.max);
        if (range) range.count++;
      });
      
      chartData.push({ 'Тип графика': 'Распределение по баллам', 'Описание': 'Гистограмма - Диапазон баллов на оси X, Количество сотрудников на оси Y' });
      chartData.push({});
      scoreRanges.forEach(r => {
        chartData.push({ 'Диапазон баллов': r.range, 'Количество сотрудников': r.count });
      });
      
      chartData.push({});
      chartData.push({});
      
      // 2. График: Топ-10 самых популярных тестов
      chartData.push({ 'Тип графика': 'Популярность тестов', 'Описание': 'Столбчатая диаграмма - Название теста на оси X, Количество прохождений на оси Y' });
      chartData.push({});
      
      const topTests = [...testStats]
        .sort((a, b) => b['Прошли тест'] - a['Прошли тест'])
        .slice(0, 10);
      
      topTests.forEach(test => {
        chartData.push({
          'Название теста': test['Название теста'].length > 30 ? test['Название теста'].substring(0, 27) + '...' : test['Название теста'],
          'Прохождений': test['Прошли тест']
        });
      });
      
      chartData.push({});
      chartData.push({});
      
      // 3. График: Средний балл по категориям тестов
      chartData.push({ 'Тип графика': 'Баллы по категориям', 'Описание': 'Столбчатая диаграмма - Категория на оси X, Средний балл на оси Y' });
      chartData.push({});
      
      const categories = new Set(testsData.filter(t => t.status === 'published').map(t => t.category));
      const categoryStats = Array.from(categories).map(category => {
        const categoryTests = testStats.filter(t => t['Категория'] === category);
        const avgScore = categoryTests.length > 0
          ? Math.round(categoryTests.reduce((sum, t) => sum + t['Средний балл (%)'], 0) / categoryTests.length)
          : 0;
        
        return {
          'Категория': category,
          'Средний балл (%)': avgScore
        };
      }).sort((a, b) => b['Средний балл (%)'] - a['Средний балл (%)']);
      
      categoryStats.forEach(cat => {
        chartData.push(cat);
      });
      
      chartData.push({});
      chartData.push({});
      
      // 4. График: Сравнение отделов (только для "Все отделы")
      if (selectedDepartment === "all" && departments.length > 0) {
        chartData.push({ 'Тип графика': 'Сравнение отделов', 'Описание': 'Столбчатая диаграмма - Отдел на оси X, Средний балл на оси Y' });
        chartData.push({});
        
        const deptComparison = departments.map(dept => {
          const deptEmployees = employeesData.filter(e => e.role === 'employee' && e.department === dept);
          const avgScore = deptEmployees.length > 0 
            ? Math.round(deptEmployees.reduce((sum, emp) => sum + getTestScore(emp), 0) / deptEmployees.length)
            : 0;
          
          return {
            'Отдел': dept,
            'Средний балл (%)': avgScore,
            'Сотрудников': deptEmployees.length
          };
        }).sort((a, b) => b['Средний балл (%)'] - a['Средний балл (%)']);
        
        deptComparison.forEach(dept => {
          chartData.push(dept);
        });
        
        chartData.push({});
        chartData.push({});
      }
      
      // 5. График: Процент выполнения vs Сложность теста
      chartData.push({ 'Тип графика': 'Выполнение по сложности', 'Описание': 'Точечная диаграмма - Средний балл на оси X, Процент выполнения на оси Y, Размер точки = количество попыток' });
      chartData.push({});
      
      const difficultyData = testStats.map(test => ({
        'Название теста': test['Название теста'].length > 25 ? test['Название теста'].substring(0, 22) + '...' : test['Название теста'],
        'Сложность': test['Сложность'],
        'Средний балл (%)': test['Средний балл (%)'],
        'Процент выполнения (%)': test['Процент выполнения (%)'],
        'Попыток': test['Прошли тест']
      })).sort((a, b) => b['Средний балл (%)'] - a['Средний балл (%)']);
      
      difficultyData.forEach(d => {
        chartData.push(d);
      });
      
      // Добавляем инструкцию в начало
      const instructionData = [
        { 'ИНСТРУКЦИЯ': 'Как построить графики из этих данных:' },
        {},
        { 'Шаг 1': 'Выделите данные конкретного графика (смотрите "Тип графика" и "Описание")' },
        { 'Шаг 2': 'Вкладка "Вставка" → выберите тип диаграммы (Гистограмма, Столбчатая, Точечная)' },
        { 'Шаг 3': 'Excel автоматически построит график по выделенным данным' },
        { 'Шаг 4': 'Настройте оси и заголовок согласно описанию графика' },
        {},
        { 'СОВЕТ': 'Каждый блок данных разделен пустыми строками для удобства выделения' },
        {},
        { '───────────────────────────────────────────────────────────────': '' },
        {}
      ];
      
      const wsChart = XLSX.utils.json_to_sheet([...instructionData, ...chartData]);
      wsChart['!cols'] = [{ wch: 40 }, { wch: 25 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsChart, 'Данные для графиков');

      // Генерируем имя файла
      const fileName = selectedDepartment === "all" 
        ? `Статистика_сотрудников_${new Date().toLocaleDateString('ru-RU')}.xlsx`
        : `Статистика_${selectedDepartment}_${new Date().toLocaleDateString('ru-RU')}.xlsx`;
      
      // Сохраняем файл
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Экспорт выполнен успешно! Файл: ${fileName}`);
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      toast.error('Ошибка при экспорте данных');
    }
  };

  const renderEmployeeItem = (employee: any, index: number, isTop: boolean) => {
    const testScore = getTestScore(employee);
    const completedTests = getCompletedTests(employee);
    const attentionReason = !isTop ? getAttentionReason(employee) : null;
    
    // Определение иконки медали для топ-3
    const getMedalIcon = (position: number) => {
      switch (position) {
        case 0: return "🥇";
        case 1: return "🥈";
        case 2: return "🥉";
        default: return "";
      }
    };

    return (
      <div 
        key={employee.id} 
        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => {
          setSelectedEmployee(employee);
          setIsDialogOpen(true);
        }}
      >
        <div className="flex items-center space-x-2">
          {isTop && (
            <span className="text-xl">{getMedalIcon(index)}</span>
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {employee.name.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-medium">{employee.name}</p>
          <p className="text-sm text-gray-500">{employee.department || 'Без отдела'}</p>
          {!isTop && attentionReason && (
            <div className={`flex items-center mt-1 text-xs ${attentionReason.color}`}>
              <Icon name={attentionReason.icon as any} size={12} className="mr-1" />
              {attentionReason.text}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <Badge variant={testScore >= 80 ? "default" : testScore >= 60 ? "secondary" : "destructive"}>
              {testScore}%
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Тестов: {completedTests}
          </div>
          <Progress value={testScore} className="w-16 mt-1" />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Фильтр по отделам */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Icon name="Filter" size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Отдел:</span>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Все отделы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Icon name="Users" size={14} className="mr-2" />
                      Все отделы
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {employees.filter(e => e.role === 'employee').length}
                    </Badge>
                  </div>
                </SelectItem>
                {departments.map((dept) => {
                  const deptCount = employees.filter(e => e.role === 'employee' && e.department === dept).length;
                  return (
                    <SelectItem key={dept} value={dept}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Icon name="Building2" size={14} className="mr-2" />
                          {dept}
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {deptCount}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedDepartment !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDepartment("all")}
                className="text-xs"
              >
                <Icon name="X" size={14} className="mr-1" />
                Сбросить
              </Button>
            )}
          </div>
          
          {/* Статистика по текущему фильтру */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Icon name="Users" size={16} />
              <span>
                Показано: <strong className="text-gray-900">
                  {topEmployees.length + bottomEmployees.length}
                </strong> сотрудников
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showCharts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="text-xs"
              >
                <Icon name={showCharts ? "EyeOff" : "BarChart3"} size={14} className="mr-1.5" />
                {showCharts ? "Скрыть графики" : "Показать графики"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="text-xs"
              >
                <Icon name="Download" size={14} className="mr-1.5" />
                Экспорт в Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Графики */}
      {showCharts && (
        <EmployeeCharts
          employees={employees.filter(e => 
            e.role === 'employee' && 
            (selectedDepartment === 'all' || e.department === selectedDepartment)
          )}
          tests={availableTests}
          testResults={database.getTestResults()}
          selectedDepartment={selectedDepartment}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ-3 лучших сотрудников */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-green-700">
              <div className="flex items-center">
                <Icon name="Trophy" size={24} className="mr-2 text-green-600" />
                Лучшие сотрудники
              </div>
              {selectedDepartment !== "all" && (
                <Badge variant="outline" className="text-xs">
                  {selectedDepartment}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEmployees.length > 0 ? (
                topEmployees.map((employee, index) => 
                  renderEmployeeItem(employee, index, true)
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Нет данных о сотрудниках</p>
                  <p className="text-xs mt-1">Сотрудники появятся после прохождения тестов</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Топ-3 худших сотрудников */}
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-red-700">
              <div className="flex items-center">
                <Icon name="AlertTriangle" size={24} className="mr-2 text-red-600" />
                Требуют внимания
              </div>
              {selectedDepartment !== "all" && (
                <Badge variant="outline" className="text-xs">
                  {selectedDepartment}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottomEmployees.length > 0 ? (
                bottomEmployees.map((employee, index) => 
                  renderEmployeeItem(employee, index, false)
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="CheckCircle" size={48} className="mx-auto mb-3 opacity-50 text-green-500" />
                  <p className="text-sm">Все сотрудники показывают отличные результаты!</p>
                  <p className="text-xs mt-1">Нет сотрудников, требующих особого внимания</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно с детальной статистикой */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedEmployee.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedEmployee.position} • {selectedEmployee.department || 'Без отдела'}
                    </DialogDescription>
                  </div>
                  <Badge variant={getTestScore(selectedEmployee) >= 80 ? "default" : getTestScore(selectedEmployee) >= 60 ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                    {getTestScore(selectedEmployee)}%
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Общая статистика */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Icon name="BarChart3" size={20} className="mr-2" />
                    Общая статистика
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{getCompletedTests(selectedEmployee)}</div>
                          <div className="text-sm text-gray-500 mt-1">Пройдено тестов</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{getTestScore(selectedEmployee)}%</div>
                          <div className="text-sm text-gray-500 mt-1">Средний балл</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Badge className={`${getStatusColor(selectedEmployee.status)} text-white`}>
                            {getStatusText(selectedEmployee.status)}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-2">Статус</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {selectedEmployee.testResults?.reduce((sum: number, test: any) => sum + test.timeSpent, 0) || 0}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Минут на тесты</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Результаты по тестам */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Icon name="FileText" size={20} className="mr-2" />
                    Результаты по тестам
                  </h3>
                  {selectedEmployee.testResults && selectedEmployee.testResults.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEmployee.testResults.map((result: any, index: number) => {
                        const tests = database.getTests();
                        const test = tests.find(t => t.id === result.id.toString());
                        return (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Icon name="FileCheck" size={16} className="text-blue-500" />
                                    <p className="font-medium">{test?.title || `Тест #${result.id}`}</p>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Icon name="Clock" size={14} className="mr-1" />
                                      {result.timeSpent} мин
                                    </span>
                                    {test?.category && (
                                      <Badge variant="outline" className="text-xs">{test.category}</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="flex items-center space-x-2">
                                    <Progress value={result.score} className="w-24" />
                                    <Badge variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}>
                                      {result.score}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-gray-500">
                        <Icon name="FileX" size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Сотрудник еще не прошел ни одного теста</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* История назначенных тестов */}
                {selectedEmployee.assignedTests && selectedEmployee.assignedTests.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center text-purple-600">
                        <Icon name="History" size={20} className="mr-2" />
                        История назначений
                      </h3>
                      {selectedEmployee.assignedTests.some((a: any) => 
                        !selectedEmployee.testResults?.some((r: any) => r.id.toString() === a.testId)
                      ) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const pendingTests = selectedEmployee.assignedTests.filter((a: any) => 
                              !selectedEmployee.testResults?.some((r: any) => r.id.toString() === a.testId)
                            );
                            pendingTests.forEach((assignment: any) => sendReminder(assignment));
                            alert(`Отправлено ${pendingTests.length} напоминаний сотруднику ${selectedEmployee.name}!`);
                          }}
                          className="text-xs"
                        >
                          <Icon name="BellRing" size={14} className="mr-1" />
                          Напомнить обо всех
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectedEmployee.assignedTests
                        .sort((a: any, b: any) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
                        .map((assignment: any, index: number) => {
                          const isCompleted = selectedEmployee.testResults?.some((r: any) => r.id.toString() === assignment.testId);
                          const actualStatus = isCompleted ? 'completed' : assignment.status;
                          
                          return (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <Icon 
                                        name={actualStatus === 'completed' ? 'CheckCircle2' : actualStatus === 'overdue' ? 'AlertCircle' : 'Clock'} 
                                        size={16} 
                                        className={
                                          actualStatus === 'completed' ? 'text-green-500' : 
                                          actualStatus === 'overdue' ? 'text-red-500' : 
                                          'text-yellow-500'
                                        } 
                                      />
                                      <p className="font-medium">{assignment.testTitle}</p>
                                    </div>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <Icon name="User" size={12} className="mr-1.5" />
                                        Назначил: {assignment.assignedBy}
                                      </div>
                                      <div className="flex items-center">
                                        <Icon name="Calendar" size={12} className="mr-1.5" />
                                        {new Date(assignment.assignedAt).toLocaleDateString('ru-RU', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      {assignment.completedAt && (
                                        <div className="flex items-center text-green-600">
                                          <Icon name="CheckCircle" size={12} className="mr-1.5" />
                                          Выполнен: {new Date(assignment.completedAt).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-2">
                                    <Badge 
                                      variant={
                                        actualStatus === 'completed' ? 'default' : 
                                        actualStatus === 'overdue' ? 'destructive' : 
                                        'secondary'
                                      }
                                    >
                                      {actualStatus === 'completed' ? 'Выполнен' : 
                                       actualStatus === 'overdue' ? 'Просрочен' : 
                                       'Ожидает'}
                                    </Badge>
                                    {actualStatus !== 'completed' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          sendReminder(assignment);
                                        }}
                                        className="text-xs"
                                      >
                                        <Icon name="Bell" size={12} className="mr-1" />
                                        Напомнить
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Рекомендации */}
                {getTestScore(selectedEmployee) < 70 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-orange-600">
                      <Icon name="Lightbulb" size={20} className="mr-2" />
                      Рекомендации
                    </h3>
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <ul className="space-y-2 text-sm">
                          {getCompletedTests(selectedEmployee) === 0 && (
                            <li className="flex items-start">
                              <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                              <span>Необходимо пройти первоначальное тестирование для оценки уровня знаний</span>
                            </li>
                          )}
                          {getTestScore(selectedEmployee) < 60 && getCompletedTests(selectedEmployee) > 0 && (
                            <>
                              <li className="flex items-start">
                                <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                                <span>Рекомендуется дополнительное обучение по слабым темам</span>
                              </li>
                              <li className="flex items-start">
                                <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                                <span>Назначить индивидуальную встречу с наставником</span>
                              </li>
                            </>
                          )}
                          {getTestScore(selectedEmployee) >= 60 && getTestScore(selectedEmployee) < 70 && (
                            <li className="flex items-start">
                              <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                              <span>Прогресс есть, но требуется больше практики для улучшения результатов</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Назначить тест */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-600">
                    <Icon name="ClipboardList" size={20} className="mr-2" />
                    Назначить тест
                  </h3>
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Выберите тест для назначения
                          </label>
                          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                            <SelectTrigger className="w-full bg-white">
                              <SelectValue placeholder="Выберите тест из списка" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTests.length > 0 ? (
                                availableTests.map((test) => (
                                  <SelectItem key={test.id} value={test.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium">{test.title}</span>
                                      <Badge 
                                        variant="outline" 
                                        className="ml-2 text-xs"
                                      >
                                        {test.difficulty === 'easy' ? 'Легкий' : test.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-tests" disabled>
                                  Нет доступных тестов
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {selectedTestId && (
                          <div className="p-3 bg-white rounded-lg border border-blue-200">
                            {(() => {
                              const test = availableTests.find(t => t.id === selectedTestId);
                              if (!test) return null;
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900">{test.title}</p>
                                      <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3">
                                    <span className="flex items-center">
                                      <Icon name="FileText" size={14} className="mr-1" />
                                      {test.questions?.length || 0} вопросов
                                    </span>
                                    <span className="flex items-center">
                                      <Icon name="Clock" size={14} className="mr-1" />
                                      {test.timeLimit} мин
                                    </span>
                                    <Badge variant="outline">{test.category}</Badge>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        <Button 
                          onClick={assignTest} 
                          disabled={!selectedTestId || selectedTestId === 'no-tests'}
                          className="w-full"
                        >
                          <Icon name="Send" size={16} className="mr-2" />
                          Назначить выбранный тест
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};