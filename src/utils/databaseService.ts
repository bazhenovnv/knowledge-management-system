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

export interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface DatabaseKnowledgeMaterial {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  tags: string[];
  rating: number;
  enrollments: number;
  is_published: boolean;
  created_by: string;
  cover_image?: string;
  attachments: FileAttachment[];
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
    // URL бэкенд функции для работы с PostgreSQL базой данных
    this.baseUrl = import.meta.env.VITE_DATABASE_API_URL || 'https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957';
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<DatabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Database API error (${response.status}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database request failed:', error);
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
      
      return !response.error;
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
    
    if (response.error) {
      console.error('Error fetching stats:', response.error);
      return null;
    }

    return response.stats || response.data || null;
  }

  // Быстрая проверка наличия обновлений (легковесный запрос)
  async checkUpdates(employeeId: number, isAdmin: boolean = false): Promise<{
    has_updates: boolean;
    unread_notifications: number;
    unread_support: number;
    timestamp: string;
  } | null> {
    const response = await this.makeRequest<any>(
      `?action=check_updates&employee_id=${employeeId}&is_admin=${isAdmin}`
    );
    
    if (response.error) {
      console.error('Error checking updates:', response.error);
      return null;
    }

    return response;
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

  // ========================
  // МЕТОДЫ ДЛЯ МАТЕРИАЛОВ БАЗЫ ЗНАНИЙ
  // ========================

  async getKnowledgeMaterials(): Promise<DatabaseKnowledgeMaterial[]> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      
      const response = await fetch(knowledgeApiUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Error fetching knowledge materials:', await response.text());
        return [];
      }
      
      const data = await response.json();
      return (data || []).map((material: any) => ({
        ...material,
        rating: Number(material.rating) || 0,
        enrollments: Number(material.enrollments) || 0,
        attachments: material.attachments || [],
        cover_image: material.cover_image || '',
      }));
    } catch (error) {
      console.error('Error fetching knowledge materials:', error);
      return [];
    }
  }

  async getKnowledgeMaterialById(id: number): Promise<DatabaseKnowledgeMaterial | null> {
    const response = await this.makeRequest<DatabaseKnowledgeMaterial>(`?action=get&table=knowledge_materials&id=${id}`);
    
    if (response.error || !response.data) {
      return null;
    }

    return response.data;
  }

  async createKnowledgeMaterial(materialData: {
    title: string;
    description: string;
    content: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: string;
    tags: string[];
    is_published?: boolean;
    created_by: string;
  }): Promise<DatabaseKnowledgeMaterial | null> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      
      const response = await fetch(knowledgeApiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(materialData)
      });
      
      if (!response.ok) {
        console.error('Error creating knowledge material:', await response.text());
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating knowledge material:', error);
      return null;
    }
  }

  async updateKnowledgeMaterial(id: number, updates: Partial<DatabaseKnowledgeMaterial>): Promise<DatabaseKnowledgeMaterial | null> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      
      const response = await fetch(knowledgeApiUrl, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) {
        console.error('Error updating knowledge material:', await response.text());
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating knowledge material:', error);
      return null;
    }
  }

  async deleteKnowledgeMaterial(id: number): Promise<boolean> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      
      const response = await fetch(knowledgeApiUrl, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      return response.ok;
    } catch (error) {
      console.error('Delete knowledge material error:', error);
      return false;
    }
  }

  // ========================
  // МЕТОДЫ ДЛЯ ПОДРАЗДЕЛОВ БАЗЫ ЗНАНИЙ
  // ========================

  async getSubsectionContent(): Promise<Record<string, string>> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      const subsections = [
        'Структура компании',
        'Виды деятельности компании',
        'Скрипты продаж',
        'Торговое оборудование',
        'Программное обеспечение'
      ];
      
      const contentMap: Record<string, string> = {};
      
      for (const subsection of subsections) {
        const response = await fetch(`${knowledgeApiUrl}?action=subsection&name=${encodeURIComponent(subsection)}`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          contentMap[subsection] = data.content || '';
        }
      }
      
      return contentMap;
    } catch (error) {
      console.error('Error fetching subsection content:', error);
      return {};
    }
  }

  async saveSubsectionContent(subsection: string, content: string): Promise<boolean> {
    try {
      const knowledgeApiUrl = 'https://functions.poehali.dev/31a686c1-3ac4-442d-8f8d-fdf80516ccc0';
      
      const response = await fetch(knowledgeApiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'save_subsection',
          subsection_name: subsection,
          content: content
        })
      });

      if (!response.ok) {
        console.error('Error saving subsection content:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving subsection content:', error);
      return false;
    }
  }

  async getDbRequestStats(): Promise<{
    current_month: { month_year: string; request_count: number; updated_at?: string };
    previous_month: { month_year: string; request_count: number; updated_at?: string };
  } | null> {
    try {
      const url = `${this.baseUrl}?action=get_db_stats`;
      console.log('[databaseService] Fetching DB stats from:', url);
      console.log('[databaseService] Base URL:', this.baseUrl);
      
      // Делаем запрос напрямую, минуя makeRequest, т.к. backend возвращает данные в другом формате
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('[databaseService] Response status:', response.status);
      console.log('[databaseService] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[databaseService] Database API error (${response.status}):`, errorText);
        return null;
      }

      const data = await response.json();
      console.log('[databaseService] DB stats response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error('[databaseService] Get DB stats error:', data.error);
        return null;
      }
      
      // Backend возвращает данные напрямую в формате { current_month: {...}, previous_month: {...} }
      if ('current_month' in data && 'previous_month' in data) {
        console.log('[databaseService] ✅ Valid stats structure found');
        console.log('[databaseService] Current month count:', data.current_month.request_count);
        return data;
      }
      
      console.error('[databaseService] ❌ Invalid stats structure:', data);
      return null;
    } catch (error) {
      console.error('[databaseService] ❌ Get DB stats error:', error);
      if (error instanceof TypeError) {
        console.error('[databaseService] This is likely a CORS or network error');
        console.error('[databaseService] Check that the backend URL is correct and accessible');
      }
      return null;
    }
  }

  // Метод для загрузки файлов (временно - конвертирует в Data URL)
  async uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error('Не удалось прочитать файл'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  async getUnreadSupportCount(): Promise<{ count: number } | null> {
    try {
      const response = await this.makeRequest<{ count: number }>('?action=get_unread_support_count', { method: 'GET' });
      
      if (response.error) {
        console.error('Get unread support count error:', response.error);
        return { count: 0 };
      }
      
      if ('count' in response) {
        return response as any;
      } else if (response.data && 'count' in response.data) {
        return response.data;
      }
      
      return { count: 0 };
    } catch (error) {
      console.error('Get unread support count error:', error);
      return { count: 0 };
    }
  }
}

// Создаем единственный экземпляр сервиса
export const databaseService = new DatabaseService();

// Экспортируем методы для удобства использования
export const getEmployeesFromDB = () => databaseService.getEmployees();
export const getCoursesFromDB = () => databaseService.getCourses();
export const getDatabaseStats = () => databaseService.getDatabaseStats();