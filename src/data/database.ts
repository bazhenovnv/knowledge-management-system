// Централизованная база данных для системы управления обучением

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: "admin" | "teacher" | "employee";
  status: number; // 1-5 баллов
  score: number;
  tests: number;
  avgScore: number;
  testResults: TestResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  id: number;
  testId: string;
  employeeId: number;
  score: number;
  timeSpent: number;
  completedAt: Date;
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  questions: Question[];
  department?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published" | "archived";
  totalAttempts: number;
  averageScore: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  timeLimit?: number;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: "video" | "document" | "link" | "presentation";
  url: string;
  category: string;
  department?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "published" | "archived";
  viewCount: number;
}

// Централизованная база данных
class Database {
  private employees: Employee[] = [];
  private tests: Test[] = [];
  private materials: Material[] = [];
  private testResults: TestResult[] = [];

  // Методы для работы с сотрудниками
  getEmployees(): Employee[] {
    return [...this.employees];
  }

  getEmployeeById(id: number): Employee | undefined {
    return this.employees.find(emp => emp.id === id);
  }

  addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return null;
    
    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.employees[index];
  }

  deleteEmployee(id: number): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) return false;
    
    this.employees.splice(index, 1);
    // Удаляем связанные результаты тестов
    this.testResults = this.testResults.filter(result => result.employeeId !== id);
    return true;
  }

  // Методы для работы с тестами
  getTests(): Test[] {
    return [...this.tests];
  }

  getTestById(id: string): Test | undefined {
    return this.tests.find(test => test.id === id);
  }

  addTest(test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>): Test {
    const newTest: Test = {
      ...test,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tests.push(newTest);
    return newTest;
  }

  updateTest(id: string, updates: Partial<Test>): Test | null {
    const index = this.tests.findIndex(test => test.id === id);
    if (index === -1) return null;
    
    this.tests[index] = {
      ...this.tests[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.tests[index];
  }

  deleteTest(id: string): boolean {
    const index = this.tests.findIndex(test => test.id === id);
    if (index === -1) return false;
    
    this.tests.splice(index, 1);
    // Удаляем связанные результаты тестов
    this.testResults = this.testResults.filter(result => result.testId !== id);
    return true;
  }

  // Методы для работы с материалами
  getMaterials(): Material[] {
    return [...this.materials];
  }

  getMaterialById(id: string): Material | undefined {
    return this.materials.find(material => material.id === id);
  }

  addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
    const newMaterial: Material = {
      ...material,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.materials.push(newMaterial);
    return newMaterial;
  }

  updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const index = this.materials.findIndex(material => material.id === id);
    if (index === -1) return null;
    
    this.materials[index] = {
      ...this.materials[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.materials[index];
  }

  deleteMaterial(id: string): boolean {
    const index = this.materials.findIndex(material => material.id === id);
    if (index === -1) return false;
    
    this.materials.splice(index, 1);
    return true;
  }

  // Методы для работы с результатами тестов
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  getTestResultsByEmployee(employeeId: number): TestResult[] {
    return this.testResults.filter(result => result.employeeId === employeeId);
  }

  getTestResultsByTest(testId: string): TestResult[] {
    return this.testResults.filter(result => result.testId === testId);
  }

  addTestResult(result: Omit<TestResult, 'id'>): TestResult {
    const newResult: TestResult = {
      ...result,
      id: Date.now()
    };
    this.testResults.push(newResult);
    
    // Обновляем статистику сотрудника
    this.updateEmployeeStats(result.employeeId);
    
    // Обновляем статистику теста
    this.updateTestStats(result.testId);
    
    return newResult;
  }

  private updateEmployeeStats(employeeId: number): void {
    const employee = this.getEmployeeById(employeeId);
    if (!employee) return;

    const results = this.getTestResultsByEmployee(employeeId);
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : 0;

    this.updateEmployee(employeeId, {
      tests: results.length,
      avgScore,
      testResults: results
    });
  }

  private updateTestStats(testId: string): void {
    const test = this.getTestById(testId);
    if (!test) return;

    const results = this.getTestResultsByTest(testId);
    const averageScore = results.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : 0;

    this.updateTest(testId, {
      totalAttempts: results.length,
      averageScore
    });
  }

  // Инициализация с тестовыми данными
  initialize(): void {
    // Добавляем тестовых сотрудников
    const initialEmployees = [
      {
        name: "Иванов И.И.",
        email: "ivanov@company.com",
        department: "Отдел IT",
        position: "Разработчик",
        role: "employee" as const,
        status: 4,
        score: 4.2,
        tests: 15,
        avgScore: 85,
        testResults: []
      },
      {
        name: "Петрова А.С.",
        email: "petrova@company.com",
        department: "Отдел ФН",
        position: "Бухгалтер",
        role: "employee" as const,
        status: 4,
        score: 3.8,
        tests: 12,
        avgScore: 78,
        testResults: []
      },
      {
        name: "Сидоров П.И.",
        email: "sidorov@company.com",
        department: "Отдел кадров",
        position: "Специалист",
        role: "employee" as const,
        status: 3,
        score: 3.5,
        tests: 8,
        avgScore: 72,
        testResults: []
      },
      {
        name: "Козлова М.В.",
        email: "kozlova@company.com",
        department: "Отдел маркетинга",
        position: "Менеджер",
        role: "employee" as const,
        status: 5,
        score: 4.8,
        tests: 20,
        avgScore: 92,
        testResults: []
      },
      {
        name: "Новиков А.А.",
        email: "novikov@company.com",
        department: "Отдел IT",
        position: "Администратор",
        role: "admin" as const,
        status: 5,
        score: 4.9,
        tests: 25,
        avgScore: 95,
        testResults: []
      }
    ];

    initialEmployees.forEach(emp => this.addEmployee(emp));

    // Добавляем тестовые тесты
    const initialTests = [
      {
        title: "Основы информационной безопасности",
        description: "Тест на знание основных принципов ИБ",
        category: "Безопасность",
        difficulty: "medium" as const,
        timeLimit: 30,
        questions: [
          {
            id: "1",
            question: "Что такое фишинг?",
            options: [
              "Вид рыбалки",
              "Мошенничество через поддельные сайты",
              "Антивирусная программа",
              "Тип шифрования"
            ],
            correctAnswer: 1,
            explanation: "Фишинг - это вид интернет-мошенничества, при котором злоумышленники используют поддельные сайты для кражи личных данных."
          }
        ],
        department: "Все отделы",
        createdBy: "Администратор",
        status: "published" as const,
        totalAttempts: 45,
        averageScore: 78
      },
      {
        title: "Работа с клиентами",
        description: "Тест на знание принципов работы с клиентами",
        category: "Клиентский сервис",
        difficulty: "easy" as const,
        timeLimit: 20,
        questions: [
          {
            id: "1",
            question: "Как правильно приветствовать клиента?",
            options: [
              "Привет",
              "Добро пожаловать! Как дела?",
              "Здравствуйте! Чем могу помочь?",
              "Что нужно?"
            ],
            correctAnswer: 2,
            explanation: "Профессиональное приветствие должно быть вежливым и предлагать помощь."
          }
        ],
        department: "Сервис",
        createdBy: "Преподаватель",
        status: "published" as const,
        totalAttempts: 23,
        averageScore: 85
      }
    ];

    initialTests.forEach(test => this.addTest(test));

    // Добавляем тестовые материалы
    const initialMaterials = [
      {
        title: "Руководство по безопасности",
        description: "Полное руководство по информационной безопасности",
        type: "document" as const,
        url: "/materials/security-guide.pdf",
        category: "Безопасность",
        department: "Все отделы",
        createdBy: "Администратор",
        status: "published" as const,
        viewCount: 156
      },
      {
        title: "Обучающее видео: Работа с клиентами",
        description: "Основы эффективного общения с клиентами",
        type: "video" as const,
        url: "/materials/client-service-training.mp4",
        category: "Клиентский сервис",
        department: "Сервис",
        createdBy: "Преподаватель",
        status: "published" as const,
        viewCount: 89
      }
    ];

    initialMaterials.forEach(material => this.addMaterial(material));
  }
}

// Экспортируем единственный экземпляр базы данных
export const database = new Database();

// Инициализируем базу данных при первом импорте
database.initialize();