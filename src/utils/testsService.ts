// Сервис для работы с тестами через backend API

export interface DatabaseTest {
  id: number;
  title: string;
  description: string;
  course_id?: number;
  course_title?: string;
  creator_id: number;
  creator_name?: string;
  time_limit?: number;
  passing_score: number;
  max_attempts: number;
  is_active: boolean;
  questions_count?: number;
  results_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  points: number;
  order_num: number;
  answers: TestAnswer[];
  created_at: string;
}

export interface TestAnswer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order_num: number;
  created_at: string;
}

export interface TestWithQuestions extends DatabaseTest {
  questions: TestQuestion[];
}

export interface TestResult {
  id: number;
  test_id: number;
  test_title?: string;
  employee_id: number;
  employee_name?: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  attempt_number: number;
  started_at: string;
  completed_at?: string;
  time_spent?: number;
  created_at: string;
}

export interface UserAnswer {
  question_id: number;
  answer_id?: number;
  answer_text?: string;
  is_correct: boolean;
  points_earned: number;
}

interface DatabaseResponse<T> {
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

class TestsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<DatabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Tests API request error:', error);
      return { error: `Ошибка запроса к API тестов: ${error}` };
    }
  }

  // Получить список всех тестов
  async getTests(): Promise<DatabaseTest[]> {
    const response = await this.makeRequest<DatabaseTest[]>('?action=list&table=tests');
    
    if (response.error) {
      console.error('Error fetching tests:', response.error);
      return [];
    }

    return response.data || [];
  }

  // Получить тест по ID с вопросами
  async getTestWithQuestions(testId: number): Promise<TestWithQuestions | null> {
    const response = await this.makeRequest<TestWithQuestions>(`?action=get_test_full&id=${testId}`);
    
    if (response.error || !response.data) {
      console.error('Error fetching test:', response.error);
      return null;
    }

    return response.data;
  }

  // Создать тест с вопросами
  async createTest(testData: {
    title: string;
    description?: string;
    course_id?: number;
    creator_id: number;
    time_limit?: number;
    passing_score?: number;
    max_attempts?: number;
    questions: Array<{
      question_text: string;
      question_type?: 'single_choice' | 'multiple_choice' | 'text';
      points?: number;
      answers: Array<{
        answer_text: string;
        is_correct: boolean;
      }>;
    }>;
    assignedEmployees?: number[];
  }): Promise<DatabaseTest | null> {
    console.log('testsService.createTest called with:', testData);
    
    const response = await this.makeRequest<DatabaseTest>('?action=create_test_full', {
      method: 'POST',
      body: JSON.stringify(testData)
    });

    console.log('testsService.createTest response:', response);

    if (response.error || !response.data) {
      console.error('Error creating test:', response.error || response);
      return null;
    }

    const createdTest = response.data;

    // Автоматически создаем уведомления для назначенных сотрудников
    if (testData.assignedEmployees && testData.assignedEmployees.length > 0) {
      await this.notifyEmployeesAboutNewTest(
        createdTest,
        testData.assignedEmployees
      );
    }

    return createdTest;
  }

  // Отправить уведомления о новом тесте
  private async notifyEmployeesAboutNewTest(
    test: DatabaseTest,
    employeeIds: number[]
  ): Promise<void> {
    try {
      const { notificationsService } = await import('./notificationsService');
      
      for (const employeeId of employeeIds) {
        await notificationsService.createNotification({
          employee_id: employeeId,
          title: 'Новый тест',
          message: `Вам назначен тест "${test.title}". ${test.description || 'Пройдите его при первой возможности.'}`,
          type: 'assignment',
          priority: 'high',
          link: '/tests',
          metadata: {
            test_id: test.id,
            test_title: test.title,
          },
        });
      }
    } catch (error) {
      console.error('Error sending test notifications:', error);
    }
  }

  // Получить результаты теста
  async getTestResults(testId: number, employeeId?: number): Promise<TestResult[]> {
    const endpoint = employeeId 
      ? `?action=get_test_results&test_id=${testId}&employee_id=${employeeId}`
      : `?action=get_test_results&test_id=${testId}`;
    
    const response = await this.makeRequest<TestResult[]>(endpoint);
    
    if (response.error) {
      console.error('Error fetching test results:', response.error);
      return [];
    }

    return response.data || [];
  }

  // Отправить результаты прохождения теста
  async submitTestResults(data: {
    test_id: number;
    employee_id: number;
    score: number;
    max_score: number;
    attempt_number?: number;
    time_spent?: number;
    user_answers: UserAnswer[];
    test_title?: string;
  }): Promise<TestResult | null> {
    const response = await this.makeRequest<TestResult>('?action=submit_test', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response.error || !response.data) {
      console.error('Error submitting test results:', response.error);
      return null;
    }

    const result = response.data;

    // Автоматически создаем уведомление о результате
    await this.notifyEmployeeAboutTestResult(
      data.employee_id,
      data.test_title || `Тест #${data.test_id}`,
      result
    );

    return result;
  }

  // Уведомить сотрудника о результате теста
  private async notifyEmployeeAboutTestResult(
    employeeId: number,
    testTitle: string,
    result: TestResult
  ): Promise<void> {
    try {
      const { notificationsService } = await import('./notificationsService');
      
      const passed = result.passed;
      const percentage = result.percentage;

      await notificationsService.createNotification({
        employee_id: employeeId,
        title: passed ? 'Тест сдан успешно!' : 'Тест не пройден',
        message: passed 
          ? `Вы успешно прошли тест "${testTitle}" с результатом ${percentage}%. Поздравляем!`
          : `Тест "${testTitle}" не пройден. Набрано ${percentage}%. Попробуйте ещё раз.`,
        type: passed ? 'success' : 'warning',
        priority: passed ? 'normal' : 'high',
        link: '/tests',
        metadata: {
          test_id: result.test_id,
          result_id: result.id,
          percentage,
          passed,
        },
      });
    } catch (error) {
      console.error('Error sending test result notification:', error);
    }
  }

  // Обновить тест
  async updateTest(testId: number, updates: Partial<DatabaseTest>): Promise<DatabaseTest | null> {
    const response = await this.makeRequest<DatabaseTest>(`?action=update&table=tests&id=${testId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (response.error || !response.data) {
      console.error('Error updating test:', response.error);
      return null;
    }

    return response.data;
  }

  // Деактивировать тест (мягкое удаление)
  async deleteTest(testId: number): Promise<boolean> {
    const response = await this.makeRequest(`?action=update&table=tests&id=${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: false })
    });

    return !response.error;
  }

  // Восстановить деактивированный тест
  async restoreTest(testId: number): Promise<boolean> {
    const response = await this.makeRequest(`?action=update&table=tests&id=${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: true })
    });

    return !response.error;
  }

  // Получить статистику по тестам
  async getTestsStatistics(): Promise<{
    total_tests: number;
    active_tests: number;
    total_questions: number;
    total_results: number;
    average_score: number;
  } | null> {
    // Пока что простая статистика через запросы
    const tests = await this.getTests();
    
    const totalTests = tests.length;
    const activeTests = tests.filter(t => t.is_active).length;
    const totalQuestions = tests.reduce((sum, t) => sum + (t.questions_count || 0), 0);
    const totalResults = tests.reduce((sum, t) => sum + (t.results_count || 0), 0);

    return {
      total_tests: totalTests,
      active_tests: activeTests,
      total_questions: totalQuestions,
      total_results: totalResults,
      average_score: 0 // Нужен дополнительный запрос для расчета среднего балла
    };
  }
}

// Создаем единственный экземпляр сервиса
export const testsService = new TestsService();

// Экспортируем методы для удобства использования
export const getTestsFromDB = () => testsService.getTests();
export const getTestWithQuestions = (testId: number) => testsService.getTestWithQuestions(testId);
export const createTestInDB = (testData: any) => testsService.createTest(testData);
export const submitTestResultsToDB = (data: any) => testsService.submitTestResults(data);