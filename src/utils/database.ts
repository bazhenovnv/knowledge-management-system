// Система имитации базы данных через localStorage

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: "admin" | "teacher" | "employee";
  status: number; // 1-5 балльная система
  tests: number;
  avgScore: number;
  score: number;
  testResults: Array<{
    id: number;
    score: number;
    timeSpent: number;
  }>;
  password?: string; // Пароль пользователя (опциональный для обратной совместимости)
  lastLoginAt?: Date; // Время последнего входа
  isActive?: boolean; // Активный статус
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    timeLimit?: number;
  }>;
  department?: string;
  createdBy: string;
  createdAt: Date;
  status: "draft" | "published" | "archived";
  totalAttempts: number;
  averageScore: number;
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    correct: boolean;
  }>;
  completedAt: Date;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  EMPLOYEES: 'employees_db',
  TESTS: 'tests_db',
  TEST_RESULTS: 'test_results_db',
  MATERIALS: 'materials_db'
};

// Базовый класс для работы с базой данных
class DatabaseService {
  // Получение данных из localStorage
  private getData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Ошибка получения данных из ${key}:`, error);
      return [];
    }
  }

  // Сохранение данных в localStorage
  private setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка сохранения данных в ${key}:`, error);
    }
  }

  // ========================
  // МЕТОДЫ ДЛЯ СОТРУДНИКОВ
  // ========================

  // Получить всех сотрудников
  getEmployees(): Employee[] {
    return this.getData<Employee>(STORAGE_KEYS.EMPLOYEES);
  }

  // Сохранить сотрудника
  saveEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const employees = this.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    employees.push(newEmployee);
    this.setData(STORAGE_KEYS.EMPLOYEES, employees);
    return newEmployee;
  }

  // Обновить сотрудника
  updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    
    if (index === -1) return null;
    
    employees[index] = {
      ...employees[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(STORAGE_KEYS.EMPLOYEES, employees);
    return employees[index];
  }

  // Удалить сотрудника
  deleteEmployee(id: number): boolean {
    const employees = this.getEmployees();
    const filteredEmployees = employees.filter(emp => emp.id !== id);
    
    if (filteredEmployees.length === employees.length) return false;
    
    this.setData(STORAGE_KEYS.EMPLOYEES, filteredEmployees);
    return true;
  }

  // Найти сотрудника по email
  findEmployeeByEmail(email: string): Employee | null {
    const employees = this.getEmployees();
    return employees.find(emp => emp.email === email) || null;
  }

  // ========================
  // МЕТОДЫ ДЛЯ ТЕСТОВ
  // ========================

  // Получить все тесты
  getTests(): Test[] {
    return this.getData<Test>(STORAGE_KEYS.TESTS);
  }

  // Сохранить тест
  saveTest(test: Omit<Test, 'createdAt'>): Test {
    const tests = this.getTests();
    const newTest: Test = {
      ...test,
      createdAt: new Date(),
    };
    
    tests.push(newTest);
    this.setData(STORAGE_KEYS.TESTS, tests);
    return newTest;
  }

  // Обновить тест
  updateTest(id: string, updates: Partial<Test>): Test | null {
    const tests = this.getTests();
    const index = tests.findIndex(test => test.id === id);
    
    if (index === -1) return null;
    
    tests[index] = {
      ...tests[index],
      ...updates,
    };
    
    this.setData(STORAGE_KEYS.TESTS, tests);
    return tests[index];
  }

  // Удалить тест
  deleteTest(id: string): boolean {
    const tests = this.getTests();
    const filteredTests = tests.filter(test => test.id !== id);
    
    if (filteredTests.length === tests.length) return false;
    
    this.setData(STORAGE_KEYS.TESTS, filteredTests);
    return true;
  }

  // ========================
  // МЕТОДЫ ДЛЯ РЕЗУЛЬТАТОВ ТЕСТОВ
  // ========================

  // Получить все результаты тестов
  getTestResults(): TestResult[] {
    return this.getData<TestResult>(STORAGE_KEYS.TEST_RESULTS);
  }

  // Сохранить результат теста
  saveTestResult(result: Omit<TestResult, 'id'>): TestResult {
    const results = this.getTestResults();
    const newResult: TestResult = {
      ...result,
      id: Date.now().toString(),
    };
    
    results.push(newResult);
    this.setData(STORAGE_KEYS.TEST_RESULTS, results);
    return newResult;
  }

  // Получить результаты тестов для конкретного пользователя
  getTestResultsByUser(userId: string): TestResult[] {
    const results = this.getTestResults();
    return results.filter(result => result.userId === userId);
  }

  // Получить результаты конкретного теста
  getTestResultsByTestId(testId: string): TestResult[] {
    const results = this.getTestResults();
    return results.filter(result => result.testId === testId);
  }

  // ========================
  // ИНИЦИАЛИЗАЦИЯ ДАННЫХ
  // ========================

  // Инициализировать базу данных с начальными данными
  initializeDatabase(): void {
    // Проверяем, есть ли уже данные
    const employees = this.getEmployees();
    
    if (employees.length === 0) {
      // Инициализируем с базовыми данными из mockData
      const initialEmployees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: "Иванов И.И.",
          email: "ivanov@company.com",
          department: "Отдел IT",
          position: "Разработчик",
          role: "employee",
          status: 4,
          tests: 15,
          avgScore: 85,
          score: 4.2,
          testResults: [
            { id: 1, score: 85, timeSpent: 25 },
            { id: 2, score: 88, timeSpent: 30 },
          ]
        },
        {
          name: "Петрова А.С.",
          email: "petrova@company.com",
          department: "Сервис",
          position: "Консультант",
          role: "employee",
          status: 5,
          tests: 12,
          avgScore: 92,
          score: 4.6,
          testResults: [
            { id: 1, score: 92, timeSpent: 20 },
            { id: 2, score: 95, timeSpent: 18 },
          ]
        },
        {
          name: "Сидоров В.П.",
          email: "sidorov@company.com",
          department: "ЦТО",
          position: "Инженер",
          role: "employee",
          status: 3,
          tests: 8,
          avgScore: 78,
          score: 3.9,
          testResults: [
            { id: 1, score: 78, timeSpent: 35 },
            { id: 2, score: 82, timeSpent: 28 },
          ]
        }
      ];

      // Сохраняем каждого сотрудника
      initialEmployees.forEach(emp => this.saveEmployee(emp));
    }
  }

  // Очистить всю базу данных
  clearDatabase(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Экспорт данных
  exportData(): {
    employees: Employee[];
    tests: Test[];
    testResults: TestResult[];
  } {
    return {
      employees: this.getEmployees(),
      tests: this.getTests(),
      testResults: this.getTestResults(),
    };
  }

  // Импорт данных
  importData(data: {
    employees?: Employee[];
    tests?: Test[];
    testResults?: TestResult[];
  }): void {
    if (data.employees) {
      this.setData(STORAGE_KEYS.EMPLOYEES, data.employees);
    }
    if (data.tests) {
      this.setData(STORAGE_KEYS.TESTS, data.tests);
    }
    if (data.testResults) {
      this.setData(STORAGE_KEYS.TEST_RESULTS, data.testResults);
    }
  }
}

// Создаем единственный экземпляр службы базы данных
export const database = new DatabaseService();

// Инициализируем базу данных при первом импорте
database.initializeDatabase();