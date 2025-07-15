import { employees as initialEmployees } from "@/data/mockData";

// Интерфейсы для типизации данных
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: number;
  tests: number;
  avgScore: number;
  score: number;
  testResults: TestResult[];
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
  content: string;
  type: "article" | "video" | "document" | "link";
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  department?: string;
  priority: "low" | "medium" | "high";
}

// Централизованная база данных
class Database {
  private employees: Employee[] = [...initialEmployees];
  private tests: Test[] = [];
  private materials: Material[] = [];
  private testResults: TestResult[] = [];

  // Методы для работы с сотрудниками
  getEmployees(): Employee[] {
    return [...this.employees];
  }

  addEmployee(employee: Omit<Employee, 'id'>): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now(),
      tests: 0,
      avgScore: 0,
      score: 0,
      testResults: []
    };
    this.employees.push(newEmployee);
    return newEmployee;
  }

  updateEmployee(id: number, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...updates };
      return this.employees[index];
    }
    return null;
  }

  deleteEmployee(id: number): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees.splice(index, 1);
      // Также удаляем все результаты тестов этого сотрудника
      this.testResults = this.testResults.filter(result => result.employeeId !== id);
      return true;
    }
    return false;
  }

  getEmployeeById(id: number): Employee | null {
    return this.employees.find(emp => emp.id === id) || null;
  }

  // Методы для работы с тестами
  getTests(): Test[] {
    return [...this.tests];
  }

  addTest(test: Omit<Test, 'id'>): Test {
    const newTest: Test = {
      ...test,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalAttempts: 0,
      averageScore: 0
    };
    this.tests.push(newTest);
    return newTest;
  }

  updateTest(id: string, updates: Partial<Test>): Test | null {
    const index = this.tests.findIndex(test => test.id === id);
    if (index !== -1) {
      this.tests[index] = { ...this.tests[index], ...updates };
      return this.tests[index];
    }
    return null;
  }

  deleteTest(id: string): boolean {
    const index = this.tests.findIndex(test => test.id === id);
    if (index !== -1) {
      this.tests.splice(index, 1);
      // Также удаляем все результаты этого теста
      this.testResults = this.testResults.filter(result => result.testId !== id);
      return true;
    }
    return false;
  }

  getTestById(id: string): Test | null {
    return this.tests.find(test => test.id === id) || null;
  }

  // Методы для работы с результатами тестов
  addTestResult(result: Omit<TestResult, 'id'>): TestResult {
    const newResult: TestResult = {
      ...result,
      id: Date.now(),
      completedAt: new Date()
    };
    this.testResults.push(newResult);

    // Обновляем статистику теста
    const test = this.getTestById(result.testId);
    if (test) {
      const testResults = this.testResults.filter(r => r.testId === result.testId);
      const totalAttempts = testResults.length;
      const averageScore = Math.round(
        testResults.reduce((sum, r) => sum + r.score, 0) / totalAttempts
      );
      this.updateTest(result.testId, { totalAttempts, averageScore });
    }

    // Обновляем статистику сотрудника
    const employee = this.getEmployeeById(result.employeeId);
    if (employee) {
      const employeeResults = this.testResults.filter(r => r.employeeId === result.employeeId);
      const tests = employeeResults.length;
      const avgScore = Math.round(
        employeeResults.reduce((sum, r) => sum + r.score, 0) / tests
      );
      this.updateEmployee(result.employeeId, { tests, avgScore, score: avgScore });
    }

    return newResult;
  }

  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  getTestResultsByEmployee(employeeId: number): TestResult[] {
    return this.testResults.filter(result => result.employeeId === employeeId);
  }

  getTestResultsByTest(testId: string): TestResult[] {
    return this.testResults.filter(result => result.testId === testId);
  }

  // Методы для работы с материалами
  getMaterials(): Material[] {
    return [...this.materials];
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
    if (index !== -1) {
      this.materials[index] = { 
        ...this.materials[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      return this.materials[index];
    }
    return null;
  }

  deleteMaterial(id: string): boolean {
    const index = this.materials.findIndex(material => material.id === id);
    if (index !== -1) {
      this.materials.splice(index, 1);
      return true;
    }
    return false;
  }

  getMaterialById(id: string): Material | null {
    return this.materials.find(material => material.id === id) || null;
  }

  // Методы для статистики
  getStatistics() {
    const totalEmployees = this.employees.length;
    const totalTests = this.tests.length;
    const totalMaterials = this.materials.length;
    const totalTestResults = this.testResults.length;
    
    const employeesByDepartment = this.employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const testsByCategory = this.tests.reduce((acc, test) => {
      acc[test.category] = (acc[test.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageTestScore = this.testResults.length > 0 
      ? Math.round(this.testResults.reduce((sum, r) => sum + r.score, 0) / this.testResults.length)
      : 0;

    return {
      totalEmployees,
      totalTests,
      totalMaterials,
      totalTestResults,
      employeesByDepartment,
      testsByCategory,
      averageTestScore
    };
  }

  // Методы для поиска
  searchEmployees(query: string): Employee[] {
    const lowerQuery = query.toLowerCase();
    return this.employees.filter(emp => 
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.department.toLowerCase().includes(lowerQuery) ||
      emp.position.toLowerCase().includes(lowerQuery) ||
      emp.email.toLowerCase().includes(lowerQuery)
    );
  }

  searchTests(query: string): Test[] {
    const lowerQuery = query.toLowerCase();
    return this.tests.filter(test => 
      test.title.toLowerCase().includes(lowerQuery) ||
      test.description.toLowerCase().includes(lowerQuery) ||
      test.category.toLowerCase().includes(lowerQuery)
    );
  }

  searchMaterials(query: string): Material[] {
    const lowerQuery = query.toLowerCase();
    return this.materials.filter(material => 
      material.title.toLowerCase().includes(lowerQuery) ||
      material.content.toLowerCase().includes(lowerQuery) ||
      material.category.toLowerCase().includes(lowerQuery) ||
      material.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Методы для очистки данных
  clearAllData(): void {
    this.employees = [...initialEmployees];
    this.tests = [];
    this.materials = [];
    this.testResults = [];
  }

  // Методы для экспорта/импорта данных
  exportData() {
    return {
      employees: this.employees,
      tests: this.tests,
      materials: this.materials,
      testResults: this.testResults,
      exportedAt: new Date()
    };
  }

  importData(data: any): boolean {
    try {
      if (data.employees) this.employees = data.employees;
      if (data.tests) this.tests = data.tests;
      if (data.materials) this.materials = data.materials;
      if (data.testResults) this.testResults = data.testResults;
      return true;
    } catch (error) {
      console.error('Ошибка импорта данных:', error);
      return false;
    }
  }
}

// Создаем единственный экземпляр базы данных
export const database = new Database();

// Экспортируем типы для использования в других файлах
export type { Database };