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

export interface KnowledgeMaterial {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: "Начинающий" | "Средний" | "Продвинутый";
  duration: string;
  rating: number;
  enrollments: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  department?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  EMPLOYEES: 'employees_db',
  TESTS: 'tests_db',
  TEST_RESULTS: 'test_results_db',
  MATERIALS: 'materials_db',
  KNOWLEDGE_BASE: 'knowledge_base_db'
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
  // МЕТОДЫ ДЛЯ БАЗЫ ЗНАНИЙ
  // ========================

  // Получить все материалы базы знаний
  getKnowledgeMaterials(): KnowledgeMaterial[] {
    return this.getData<KnowledgeMaterial>(STORAGE_KEYS.KNOWLEDGE_BASE);
  }

  // Сохранить материал базы знаний
  saveKnowledgeMaterial(material: Omit<KnowledgeMaterial, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeMaterial {
    const materials = this.getKnowledgeMaterials();
    const newMaterial: KnowledgeMaterial = {
      ...material,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    materials.push(newMaterial);
    this.setData(STORAGE_KEYS.KNOWLEDGE_BASE, materials);
    return newMaterial;
  }

  // Обновить материал базы знаний
  updateKnowledgeMaterial(id: string, updates: Partial<KnowledgeMaterial>): KnowledgeMaterial | null {
    const materials = this.getKnowledgeMaterials();
    const index = materials.findIndex(material => material.id === id);
    
    if (index === -1) return null;
    
    materials[index] = {
      ...materials[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(STORAGE_KEYS.KNOWLEDGE_BASE, materials);
    return materials[index];
  }

  // Удалить материал базы знаний
  deleteKnowledgeMaterial(id: string): boolean {
    const materials = this.getKnowledgeMaterials();
    const filteredMaterials = materials.filter(material => material.id !== id);
    
    if (filteredMaterials.length === materials.length) return false;
    
    this.setData(STORAGE_KEYS.KNOWLEDGE_BASE, filteredMaterials);
    return true;
  }

  // Найти материалы по категории
  getKnowledgeMaterialsByCategory(category: string): KnowledgeMaterial[] {
    const materials = this.getKnowledgeMaterials();
    if (category === 'all') return materials;
    return materials.filter(material => material.category === category);
  }

  // Поиск материалов по тексту
  searchKnowledgeMaterials(query: string): KnowledgeMaterial[] {
    const materials = this.getKnowledgeMaterials();
    if (!query) return materials;
    
    const lowerQuery = query.toLowerCase();
    return materials.filter(material => 
      material.title.toLowerCase().includes(lowerQuery) ||
      material.description.toLowerCase().includes(lowerQuery) ||
      material.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Увеличить количество записей на материал
  incrementEnrollments(materialId: string): boolean {
    const material = this.getKnowledgeMaterials().find(m => m.id === materialId);
    if (!material) return false;
    
    return !!this.updateKnowledgeMaterial(materialId, {
      enrollments: material.enrollments + 1
    });
  }

  // Обновить рейтинг материала
  updateMaterialRating(materialId: string, newRating: number): boolean {
    return !!this.updateKnowledgeMaterial(materialId, {
      rating: Math.max(0, Math.min(5, newRating)) // Ограничиваем рейтинг от 0 до 5
    });
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

    // Инициализируем базу знаний, если она пуста
    const materials = this.getKnowledgeMaterials();
    if (materials.length === 0) {
      const initialMaterials: Omit<KnowledgeMaterial, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          title: "Основы React и TypeScript",
          description: "Изучите современные подходы к разработке веб-приложений с React и TypeScript",
          content: "Подробное руководство по созданию компонентов, работе с состоянием, хуками и TypeScript типизацией.",
          category: "Программирование",
          difficulty: "Средний",
          duration: "3 часа",
          rating: 4.8,
          enrollments: 245,
          tags: ["React", "TypeScript", "Frontend", "JavaScript"],
          createdBy: "Администратор",
          isPublished: true,
          department: "1С"
        },
        {
          title: "Информационная безопасность в офисе",
          description: "Основы защиты корпоративной информации и персональных данных",
          content: "Правила работы с конфиденциальной информацией, защита от фишинга, безопасные пароли.",
          category: "Безопасность",
          difficulty: "Начинающий",
          duration: "1.5 часа",
          rating: 4.6,
          enrollments: 567,
          tags: ["Безопасность", "Пароли", "Фишинг", "Корпоративная политика"],
          createdBy: "Администратор",
          isPublished: true,
          department: "Все отделы"
        },
        {
          title: "Управление проектами Agile",
          description: "Современные методологии управления проектами и командной работы",
          content: "Принципы Agile, Scrum, Kanban. Планирование спринтов, проведение ретроспектив.",
          category: "Менеджмент",
          difficulty: "Продвинутый",
          duration: "4 часа",
          rating: 4.7,
          enrollments: 123,
          tags: ["Agile", "Scrum", "Kanban", "Управление проектами"],
          createdBy: "Администратор",
          isPublished: true,
          department: "Крупные клиенты"
        },
        {
          title: "Основы работы с CRM системами",
          description: "Эффективное использование CRM для работы с клиентами",
          content: "Ведение базы клиентов, создание воронки продаж, аналитика и отчетность.",
          category: "Продажи",
          difficulty: "Начинающий",
          duration: "2 часа",
          rating: 4.4,
          enrollments: 324,
          tags: ["CRM", "Продажи", "Клиенты", "Аналитика"],
          createdBy: "Администратор",
          isPublished: true,
          department: "Партнерка"
        },
        {
          title: "Корпоративная культура и этика",
          description: "Ценности компании, правила внутреннего взаимодействия",
          content: "Кодекс поведения сотрудников, корпоративные стандарты, командная работа.",
          category: "Мягкие навыки",
          difficulty: "Начинающий",
          duration: "1 час",
          rating: 4.3,
          enrollments: 456,
          tags: ["Корпоративная культура", "Этика", "Командная работа"],
          createdBy: "Администратор",
          isPublished: true,
          department: "Все отделы"
        },
        {
          title: "Техническая поддержка клиентов",
          description: "Принципы качественного обслуживания и решения технических вопросов",
          content: "Алгоритмы диагностики проблем, эскалация вопросов, работа с клиентами.",
          category: "Техническая поддержка",
          difficulty: "Средний",
          duration: "2.5 часа",
          rating: 4.5,
          enrollments: 189,
          tags: ["Техподдержка", "Клиенты", "Диагностика", "Сервис"],
          createdBy: "Администратор",
          isPublished: true,
          department: "Тех. поддержка"
        }
      ];

      // Сохраняем каждый материал
      initialMaterials.forEach(material => this.saveKnowledgeMaterial(material));
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