// Система имитации базы данных через localStorage

export interface Employee {
  id: number;
  full_name: string;
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
  sourceMaterialId?: string;
  isGeneratedFromMaterial?: boolean;
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
  difficulty: "Начальный" | "Средний" | "Продвинутый";
  duration: string;
  rating: number;
  enrollments: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  isPublished: boolean;
  updatedAt?: string;
  mediaFiles?: Array<{
    id: string;
    name: string;
    type: "image" | "video";
    url: string;
    size: number;
  }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  type: 'info' | 'warning' | 'urgent' | 'reminder';
  recipients: number[];
  recipientNames?: string[];
  createdBy: string;
  createdByRole: 'admin' | 'teacher';
  createdAt: Date;
  scheduledFor?: Date;
  status: 'draft' | 'sent' | 'scheduled';
  readBy: number[];
  deliveredTo: number[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'test' | 'material' | 'mixed';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  assignedBy: string;
  assignedByRole: 'admin' | 'teacher';
  assignees: number[];
  testIds?: string[];
  materialIds?: string[];
  dueDate?: Date;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentProgress {
  id: string;
  assignmentId: string;
  userId: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  testResults?: Array<{
    testId: string;
    resultId: string;
    score: number;
    completed: boolean;
  }>;
  materialProgress?: Array<{
    materialId: string;
    viewed: boolean;
    timeSpent: number;
    lastViewedAt?: Date;
  }>;
  notes?: string;
}

// Ключи для localStorage
const STORAGE_KEYS = {
  EMPLOYEES: 'employees_db',
  TESTS: 'tests_db',
  TEST_RESULTS: 'test_results_db',
  MATERIALS: 'materials_db',
  KNOWLEDGE_BASE: 'knowledge_base_db',
  NOTIFICATIONS: 'notifications_db',
  ASSIGNMENTS: 'assignments_db',
  ASSIGNMENT_PROGRESS: 'assignment_progress_db'
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

  // Получить пользователей (алиас для getEmployees для совместимости)
  getUsers(): Employee[] {
    return this.getEmployees();
  }

  // Получить текущего пользователя (первый пользователь из списка для демонстрации)
  getCurrentUser(): Employee | null {
    const employees = this.getEmployees();
    return employees.length > 0 ? employees[0] : null;
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

  // Добавить материал базы знаний (альтернативное название для удобства)
  addKnowledgeMaterial(material: KnowledgeMaterial): KnowledgeMaterial {
    const materials = this.getKnowledgeMaterials();
    materials.push(material);
    this.setData(STORAGE_KEYS.KNOWLEDGE_BASE, materials);
    return material;
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
          difficulty: "Начальный",
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
          difficulty: "Начальный",
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
          difficulty: "Начальный",
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



  // ========================
  // МЕТОДЫ ДЛЯ УВЕДОМЛЕНИЙ
  // ========================

  // Получить все уведомления
  getNotifications(): Notification[] {
    return this.getData<Notification>(STORAGE_KEYS.NOTIFICATIONS);
  }

  // Создать уведомление
  createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'readBy' | 'deliveredTo'>): Notification {
    const notifications = this.getNotifications();
    const employees = this.getEmployees();
    
    // Получаем имена получателей для удобства
    const recipientNames = employees
      .filter(emp => notificationData.recipients.includes(emp.id))
      .map(emp => emp.name);

    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipientNames,
      createdAt: new Date(),
      readBy: [],
      deliveredTo: []
    };
    
    notifications.push(newNotification);
    this.setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  // Получить уведомления для конкретного пользователя
  getNotificationsForUser(userId: number): Notification[] {
    const notifications = this.getNotifications();
    return notifications.filter(notification => 
      notification.recipients.includes(userId) && 
      notification.status === 'sent'
    );
  }

  // Получить непрочитанные уведомления для пользователя
  getUnreadNotificationsForUser(userId: number): Notification[] {
    const notifications = this.getNotificationsForUser(userId);
    return notifications.filter(notification => 
      !notification.readBy.includes(userId)
    );
  }

  // Отметить уведомление как прочитанное
  markNotificationAsRead(notificationId: string, userId: number): boolean {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification || !notification.recipients.includes(userId)) return false;
    
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      this.setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    
    return true;
  }

  // Отметить уведомление как доставленное
  markNotificationAsDelivered(notificationId: string, userId: number): boolean {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification || !notification.recipients.includes(userId)) return false;
    
    if (!notification.deliveredTo.includes(userId)) {
      notification.deliveredTo.push(userId);
      this.setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
    
    return true;
  }

  // Получить уведомления, созданные конкретным пользователем
  getNotificationsByCreator(createdBy: string): Notification[] {
    const notifications = this.getNotifications();
    return notifications.filter(notification => notification.createdBy === createdBy);
  }

  // Удалить уведомление
  deleteNotification(notificationId: string): boolean {
    const notifications = this.getNotifications();
    const filteredNotifications = notifications.filter(n => n.id !== notificationId);
    
    if (filteredNotifications.length === notifications.length) return false;
    
    this.setData(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
    return true;
  }

  // Получить статистику уведомлений
  getNotificationStats(): {
    totalNotifications: number;
    sentNotifications: number;
    scheduledNotifications: number;
    totalRecipients: number;
    totalReadNotifications: number;
    readRate: number;
  } {
    const notifications = this.getNotifications();
    const sent = notifications.filter(n => n.status === 'sent');
    const scheduled = notifications.filter(n => n.status === 'scheduled');
    
    const totalRecipients = sent.reduce((sum, n) => sum + n.recipients.length, 0);
    const totalReadNotifications = sent.reduce((sum, n) => sum + n.readBy.length, 0);
    const readRate = totalRecipients > 0 ? Math.round((totalReadNotifications / totalRecipients) * 100) : 0;

    return {
      totalNotifications: notifications.length,
      sentNotifications: sent.length,
      scheduledNotifications: scheduled.length,
      totalRecipients,
      totalReadNotifications,
      readRate
    };
  }

  // ========================
  // МЕТОДЫ ДЛЯ ЗАДАНИЙ
  // ========================

  // Получить все задания
  getAssignments(): Assignment[] {
    return this.getData<Assignment>(STORAGE_KEYS.ASSIGNMENTS);
  }

  // Создать задание
  createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'completionRate'>): Assignment {
    const assignments = this.getAssignments();
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assignment_${Date.now()}`,
      completionRate: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    assignments.push(newAssignment);
    this.setData(STORAGE_KEYS.ASSIGNMENTS, assignments);

    // Создаем прогресс для каждого назначенного пользователя
    assignmentData.assignees.forEach(userId => {
      this.createAssignmentProgress(newAssignment.id, userId);
    });
    
    return newAssignment;
  }

  // Обновить задание
  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const assignments = this.getAssignments();
    const index = assignments.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    assignments[index] = {
      ...assignments[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    this.setData(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return assignments[index];
  }

  // Удалить задание
  deleteAssignment(id: string): boolean {
    const assignments = this.getAssignments();
    const filteredAssignments = assignments.filter(a => a.id !== id);
    
    if (filteredAssignments.length === assignments.length) return false;
    
    // Также удаляем связанный прогресс
    const progress = this.getAssignmentProgress();
    const filteredProgress = progress.filter(p => p.assignmentId !== id);
    this.setData(STORAGE_KEYS.ASSIGNMENT_PROGRESS, filteredProgress);
    
    this.setData(STORAGE_KEYS.ASSIGNMENTS, filteredAssignments);
    return true;
  }

  // Получить задания для конкретного пользователя
  getAssignmentsForUser(userId: number): Assignment[] {
    const assignments = this.getAssignments();
    return assignments.filter(a => a.assignees.includes(userId));
  }

  // Получить задания, созданные конкретным пользователем
  getAssignmentsByCreator(createdBy: string): Assignment[] {
    const assignments = this.getAssignments();
    return assignments.filter(a => a.assignedBy === createdBy);
  }

  // ========================
  // МЕТОДЫ ДЛЯ ПРОГРЕССА ЗАДАНИЙ
  // ========================

  // Получить весь прогресс заданий
  getAssignmentProgress(): AssignmentProgress[] {
    return this.getData<AssignmentProgress>(STORAGE_KEYS.ASSIGNMENT_PROGRESS);
  }

  // Создать прогресс для задания
  createAssignmentProgress(assignmentId: string, userId: number): AssignmentProgress {
    const progress = this.getAssignmentProgress();
    const newProgress: AssignmentProgress = {
      id: `progress_${assignmentId}_${userId}`,
      assignmentId,
      userId,
      status: 'pending',
      progress: 0,
    };
    
    progress.push(newProgress);
    this.setData(STORAGE_KEYS.ASSIGNMENT_PROGRESS, progress);
    return newProgress;
  }

  // Обновить прогресс задания
  updateAssignmentProgress(assignmentId: string, userId: number, updates: Partial<AssignmentProgress>): AssignmentProgress | null {
    const progress = this.getAssignmentProgress();
    const index = progress.findIndex(p => p.assignmentId === assignmentId && p.userId === userId);
    
    if (index === -1) return null;
    
    progress[index] = {
      ...progress[index],
      ...updates,
    };
    
    this.setData(STORAGE_KEYS.ASSIGNMENT_PROGRESS, progress);
    
    // Обновляем общий процент выполнения задания
    this.updateAssignmentCompletionRate(assignmentId);
    
    return progress[index];
  }

  // Получить прогресс конкретного пользователя по заданию
  getUserAssignmentProgress(assignmentId: string, userId: number): AssignmentProgress | null {
    const progress = this.getAssignmentProgress();
    return progress.find(p => p.assignmentId === assignmentId && p.userId === userId) || null;
  }

  // Получить весь прогресс пользователя
  getUserProgress(userId: number): AssignmentProgress[] {
    const progress = this.getAssignmentProgress();
    return progress.filter(p => p.userId === userId);
  }

  // Обновить общий процент выполнения задания
  private updateAssignmentCompletionRate(assignmentId: string): void {
    const assignment = this.getAssignments().find(a => a.id === assignmentId);
    if (!assignment) return;

    const progress = this.getAssignmentProgress().filter(p => p.assignmentId === assignmentId);
    if (progress.length === 0) return;

    const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0);
    const completionRate = Math.round(totalProgress / progress.length);

    this.updateAssignment(assignmentId, { completionRate });
  }

  // Отметить тест как завершенный в задании
  markTestCompleted(assignmentId: string, userId: number, testId: string, resultId: string, score: number): void {
    const progress = this.getUserAssignmentProgress(assignmentId, userId);
    if (!progress) return;

    const testResults = progress.testResults || [];
    const existingResult = testResults.find(tr => tr.testId === testId);

    if (existingResult) {
      existingResult.resultId = resultId;
      existingResult.score = score;
      existingResult.completed = true;
    } else {
      testResults.push({
        testId,
        resultId,
        score,
        completed: true,
      });
    }

    // Рассчитываем общий прогресс
    const assignment = this.getAssignments().find(a => a.id === assignmentId);
    if (!assignment) return;

    const totalTasks = (assignment.testIds?.length || 0) + (assignment.materialIds?.length || 0);
    const completedTasks = testResults.filter(tr => tr.completed).length + 
                          (progress.materialProgress?.filter(mp => mp.viewed).length || 0);

    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending';

    this.updateAssignmentProgress(assignmentId, userId, {
      testResults,
      progress: newProgress,
      status: newStatus,
      ...(newProgress === 100 && { completedAt: new Date() })
    });
  }

  // Отметить материал как просмотренный
  markMaterialViewed(assignmentId: string, userId: number, materialId: string, timeSpent: number = 0): void {
    const progress = this.getUserAssignmentProgress(assignmentId, userId);
    if (!progress) return;

    const materialProgress = progress.materialProgress || [];
    const existingProgress = materialProgress.find(mp => mp.materialId === materialId);

    if (existingProgress) {
      existingProgress.viewed = true;
      existingProgress.timeSpent += timeSpent;
      existingProgress.lastViewedAt = new Date();
    } else {
      materialProgress.push({
        materialId,
        viewed: true,
        timeSpent,
        lastViewedAt: new Date(),
      });
    }

    // Рассчитываем общий прогресс
    const assignment = this.getAssignments().find(a => a.id === assignmentId);
    if (!assignment) return;

    const totalTasks = (assignment.testIds?.length || 0) + (assignment.materialIds?.length || 0);
    const completedTasks = (progress.testResults?.filter(tr => tr.completed).length || 0) + 
                          materialProgress.filter(mp => mp.viewed).length;

    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const newStatus = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'pending';

    this.updateAssignmentProgress(assignmentId, userId, {
      materialProgress,
      progress: newProgress,
      status: newStatus,
      ...(newProgress === 100 && { completedAt: new Date() })
    });
  }
}

// Создаем единственный экземпляр службы базы данных
export const database = new DatabaseService();

// Вспомогательные функции для удобства использования
export const getTests = () => database.getTests();
export const getEmployees = () => database.getEmployees();
export const getKnowledgeMaterials = () => database.getKnowledgeMaterials();
export const getTestResults = () => database.getTestResults();
export const updateKnowledgeMaterial = (material: KnowledgeMaterial) => database.updateKnowledgeMaterial(material);

// Инициализируем базу данных при первом импорте
database.initializeDatabase();