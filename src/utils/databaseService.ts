// Сервис для работы с реальной базой данных через backend API

export interface DatabaseEmployee {
  id: number;
  full_name: string;
  name?: string; // Алиас для full_name для совместимости
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'teacher' | 'employee';
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCourse {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
  instructor_name?: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  max_participants: number;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at: string;
}

interface DatabaseResponse<T> {
  data?: T;
  count?: number;
  stats?: any;
  error?: string;
  message?: string;
}

class DatabaseService {
  private baseUrl: string;

  constructor() {
    // В реальном проекте URL должен быть в переменных окружения
    this.baseUrl = 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
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
      console.error('Database request error:', error);
      return { error: `Ошибка запроса к базе данных: ${error}` };
    }
  }

  // ========================
  // МЕТОДЫ ДЛЯ СОТРУДНИКОВ
  // ========================

  async getEmployees(): Promise<DatabaseEmployee[]> {
    const response = await this.makeRequest<DatabaseEmployee[]>('?action=list&table=employees');
    
    if (response.error) {
      console.error('Error fetching employees:', response.error);
      return [];
    }

    // Добавляем поле name для совместимости со старой системой
    const employees = (response.data || []).map(emp => ({
      ...emp,
      name: emp.full_name
    }));

    return employees;
  }

  async getEmployeeById(id: number): Promise<DatabaseEmployee | null> {
    const response = await this.makeRequest<DatabaseEmployee>(`?action=get&table=employees&id=${id}`);
    
    if (response.error || !response.data) {
      return null;
    }

    return {
      ...response.data,
      name: response.data.full_name
    };
  }

  async createEmployee(employeeData: {
    email: string;
    full_name: string;
    phone?: string;
    department: string;
    position: string;
    role?: 'admin' | 'teacher' | 'employee';
    hire_date?: string;
    password?: string;
  }): Promise<DatabaseEmployee | null> {
    const response = await this.makeRequest<DatabaseEmployee>('?action=create&table=employees', {
      method: 'POST',
      body: JSON.stringify({
        ...employeeData,
        password: employeeData.password || 'temp123' // Временный пароль
      })
    });

    if (response.error || !response.data) {
      console.error('Error creating employee:', response.error);
      return null;
    }

    return {
      ...response.data,
      name: response.data.full_name
    };
  }

  async updateEmployee(id: number, updates: Partial<DatabaseEmployee>): Promise<DatabaseEmployee | null> {
    const response = await this.makeRequest<DatabaseEmployee>(`?action=update&table=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });

    if (response.error || !response.data) {
      console.error('Error updating employee:', response.error);
      return null;
    }

    return {
      ...response.data,
      name: response.data.full_name
    };
  }

  async deleteEmployee(id: number): Promise<boolean> {
    // Мягкое удаление - деактивация сотрудника
    try {
      const response = await this.makeRequest(`?action=update&table=employees&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: false })
      });

      console.log('Delete employee response:', response);
      
      // Проверяем успех операции (либо есть data, либо нет error)
      return !response.error || !!response.message;
    } catch (error) {
      console.error('Delete employee error:', error);
      return false;
    }
  }

  async restoreEmployee(id: number): Promise<boolean> {
    // Восстановление деактивированного сотрудника
    const response = await this.makeRequest(`?action=update&table=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: true })
    });

    return !response.error;
  }

  async permanentDeleteEmployee(id: number): Promise<boolean> {
    // Полное удаление сотрудника из базы данных
    try {
      const response = await this.makeRequest(`?table=employees&id=${id}&permanent=true`, {
        method: 'DELETE'
      });

      console.log('Permanent delete employee response:', response);
      
      return !response.error && !!response.message;
    } catch (error) {
      console.error('Permanent delete employee error:', error);
      return false;
    }
  }

  async getInactiveEmployees(): Promise<DatabaseEmployee[]> {
    const response = await this.makeRequest<DatabaseEmployee[]>('?action=list_inactive&table=employees');
    
    if (response.error) {
      console.error('Error fetching inactive employees:', response.error);
      return [];
    }

    const employees = (response.data || []).map(emp => ({
      ...emp,
      name: emp.full_name
    }));

    return employees;
  }

  async searchEmployees(searchTerm: string): Promise<DatabaseEmployee[]> {
    const response = await this.makeRequest<DatabaseEmployee[]>(
      `?action=search&table=employees&term=${encodeURIComponent(searchTerm)}`
    );
    
    if (response.error) {
      console.error('Error searching employees:', response.error);
      return [];
    }

    return (response.data || []).map(emp => ({
      ...emp,
      name: emp.full_name
    }));
  }

  async updateEmployeePassword(id: number, newPassword: string): Promise<boolean> {
    const response = await this.makeRequest(`?action=update_password&table=employees&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword })
    });

    return !response.error;
  }

  async addEmployee(employeeData: {
    full_name: string;
    email: string;
    phone?: string;
    position: string;
    department: string;
    role: 'admin' | 'teacher' | 'employee';
    password: string;
    is_active: boolean;
    created_at: string;
  }): Promise<DatabaseEmployee | null> {
    return this.createEmployee(employeeData);
  }

  // ========================
  // МЕТОДЫ ДЛЯ КУРСОВ
  // ========================

  async getCourses(): Promise<DatabaseCourse[]> {
    const response = await this.makeRequest<DatabaseCourse[]>('?action=list&table=courses');
    
    if (response.error) {
      console.error('Error fetching courses:', response.error);
      return [];
    }

    return response.data || [];
  }

  async getCourseById(id: number): Promise<DatabaseCourse | null> {
    const response = await this.makeRequest<DatabaseCourse>(`?action=get&table=courses&id=${id}`);
    
    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    instructor_id: number;
    start_date: string;
    end_date: string;
    duration_hours: number;
    max_participants: number;
  }): Promise<DatabaseCourse | null> {
    const response = await this.makeRequest<DatabaseCourse>('?action=create&table=courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });

    if (response.error || !response.data) {
      console.error('Error creating course:', response.error);
      return null;
    }

    return response.data;
  }

  // ========================
  // СТАТИСТИКА
  // ========================

  async getDatabaseStats(): Promise<{
    active_employees: number;
    inactive_employees: number;
    active_courses: number;
    total_enrollments: number;
    total_attendance: number;
  } | null> {
    const response = await this.makeRequest<any>('?action=stats');
    
    if (response.error || !response.stats) {
      console.error('Error fetching stats:', response.error);
      return null;
    }

    return response.stats;
  }

  // ========================
  // МЕТОДЫ ДЛЯ СОВМЕСТИМОСТИ
  // ========================

  // Преобразование для совместимости со старой системой Employee интерфейсом
  convertToOldEmployee(dbEmployee: DatabaseEmployee): any {
    return {
      id: dbEmployee.id,
      name: dbEmployee.full_name,
      email: dbEmployee.email,
      department: dbEmployee.department,
      position: dbEmployee.position,
      role: dbEmployee.role,
      status: 4, // Дефолтный статус для совместимости
      tests: 0,
      avgScore: 0,
      score: 4.0,
      testResults: [],
      isActive: dbEmployee.is_active,
      createdAt: new Date(dbEmployee.created_at),
      updatedAt: new Date(dbEmployee.updated_at)
    };
  }

  // Получить сотрудников в старом формате для совместимости
  async getEmployeesOldFormat(): Promise<any[]> {
    const employees = await this.getEmployees();
    return employees.map(emp => this.convertToOldEmployee(emp));
  }
}

// Создаем единственный экземпляр сервиса
export const databaseService = new DatabaseService();

// Экспортируем методы для удобства использования
export const getEmployeesFromDB = () => databaseService.getEmployees();
export const getCoursesFromDB = () => databaseService.getCourses();
export const getDatabaseStats = () => databaseService.getDatabaseStats();