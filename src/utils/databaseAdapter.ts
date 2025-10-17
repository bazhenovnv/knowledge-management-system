// Адаптер для работы с PostgreSQL через API, сохраняя интерфейс localStorage
import { databaseService } from './databaseService';

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  role: "admin" | "teacher" | "employee";
  status: number;
  tests: number;
  avgScore: number;
  score: number;
  testResults: Array<{
    id: number;
    score: number;
    timeSpent: number;
  }>;
  assignedTests?: Array<{
    testId: string;
    testTitle: string;
    assignedBy: string;
    assignedAt: Date;
    dueDate?: Date;
    status: 'pending' | 'completed' | 'overdue';
    completedAt?: Date;
  }>;
  password?: string;
  lastLoginAt?: Date;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseAdapter {
  private employeesCache: Employee[] | null = null;
  private cacheTimeout: number = 5000; // 5 секунд
  private lastCacheTime: number = 0;

  async getEmployees(): Promise<Employee[]> {
    // Используем кеш, если он свежий
    const now = Date.now();
    if (this.employeesCache && (now - this.lastCacheTime) < this.cacheTimeout) {
      return this.employeesCache;
    }

    try {
      const dbEmployees = await databaseService.getEmployees();
      
      // Преобразуем формат БД в формат приложения
      this.employeesCache = dbEmployees.map(emp => ({
        id: emp.id,
        name: emp.full_name,
        email: emp.email,
        department: emp.department || '',
        position: emp.position || '',
        role: emp.role,
        status: 5, // По умолчанию максимальный статус
        tests: 0, // Будет загружено отдельно
        avgScore: 0, // Будет загружено отдельно
        score: 0,
        testResults: [],
        isActive: emp.is_active,
        createdAt: new Date(emp.created_at),
        updatedAt: new Date(emp.updated_at)
      }));

      this.lastCacheTime = now;
      return this.employeesCache;
    } catch (error) {
      console.error('Error loading employees from PostgreSQL:', error);
      
      // Fallback к localStorage если API недоступен
      const localData = localStorage.getItem('employees');
      if (localData) {
        return JSON.parse(localData);
      }
      
      return [];
    }
  }

  async getEmployeeById(id: number): Promise<Employee | undefined> {
    const employees = await this.getEmployees();
    return employees.find(emp => emp.id === id);
  }

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee | null> {
    try {
      const newEmployee = await databaseService.createEmployee({
        email: employeeData.email!,
        full_name: employeeData.name!,
        phone: '',
        department: employeeData.department!,
        position: employeeData.position!,
        role: employeeData.role || 'employee',
        password: employeeData.password || 'password123'
      });

      if (newEmployee) {
        // Сбрасываем кеш
        this.employeesCache = null;
        
        return {
          id: newEmployee.id,
          name: newEmployee.full_name,
          email: newEmployee.email,
          department: newEmployee.department || '',
          position: newEmployee.position || '',
          role: newEmployee.role,
          status: 5,
          tests: 0,
          avgScore: 0,
          score: 0,
          testResults: [],
          isActive: newEmployee.is_active,
          createdAt: new Date(newEmployee.created_at),
          updatedAt: new Date(newEmployee.updated_at)
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating employee:', error);
      return null;
    }
  }

  async updateEmployee(id: number, updates: Partial<Employee>): Promise<boolean> {
    try {
      const result = await databaseService.updateEmployee(id, {
        full_name: updates.name,
        email: updates.email,
        department: updates.department,
        position: updates.position,
        role: updates.role
      });

      if (result) {
        // Сбрасываем кеш
        this.employeesCache = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  }

  async deleteEmployee(id: number): Promise<boolean> {
    try {
      const result = await databaseService.deleteEmployee(id);
      
      if (result) {
        // Сбрасываем кеш
        this.employeesCache = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }

  clearCache(): void {
    this.employeesCache = null;
    this.lastCacheTime = 0;
  }
}

export const databaseAdapter = new DatabaseAdapter();
