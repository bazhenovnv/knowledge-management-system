import { API_CONFIG } from '@/config/apiConfig';
import { Employee } from '@/types/database';

const API_BASE_URL = API_CONFIG.AUTH_API;

export interface AuthResponse {
  success: boolean;
  message: string;
  employee: Employee;
  session?: {
    token: string;
    expires_at: string;
    session_id: number;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: 'admin' | 'manager' | 'employee';
}

export interface LoginData {
  email: string;
  password: string;
  remember_me?: boolean;
}

class AuthService {
  private token: string | null = null;
  private employee: Employee | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    const employeeData = localStorage.getItem('employee_data');
    if (employeeData) {
      try {
        this.employee = JSON.parse(employeeData);
      } catch (e) {
        console.warn('Failed to parse stored employee data');
        localStorage.removeItem('employee_data');
      }
    }
  }

  // Register new employee
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}?action=register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        ...data
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Registration failed`);
    }

    const result: AuthResponse = await response.json();
    return result;
  }

  // Login employee
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('[AuthService] Начинаем вход...', { email: data.email });
    
    const response = await fetch(`${API_BASE_URL}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        username: data.email,
        password: data.password
      })
    });

    console.log('[AuthService] Получен ответ от сервера:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AuthService] Ошибка входа:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
    }

    const result = await response.json();
    console.log('[AuthService] Результат входа:', result);

    // Store authentication data (сервер возвращает session_id вместо token)
    if (result.success && result.session_id) {
      this.token = result.session_id;
      // Преобразуем user в employee для совместимости
      const employee = {
        id: result.user.id,
        full_name: result.user.full_name,
        email: result.user.username,
        role: result.user.role
      };
      this.employee = employee as Employee;
      
      console.log('[AuthService] Сохраняем данные в localStorage:', employee);
      localStorage.setItem('auth_token', result.session_id);
      localStorage.setItem('employee_data', JSON.stringify(employee));
      localStorage.setItem('session_id', result.session_id);
      console.log('[AuthService] Данные сохранены успешно');
    } else {
      console.error('[AuthService] Неожиданный формат ответа от сервера');
    }

    return {
      success: result.success,
      message: result.success ? 'Login successful' : 'Login failed',
      employee: this.employee!,
      session: result.session_id ? {
        token: result.session_id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        session_id: result.user.id
      } : undefined
    };
  }

  // Check if current token is valid
  async checkAuth(): Promise<boolean> {
    const sessionId = localStorage.getItem('session_id') || this.token;
    if (!sessionId) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}?action=check&session_id=${sessionId}`, {
        method: 'GET'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.authenticated && result.user) {
          const employee = {
            id: result.user.id,
            full_name: result.user.full_name,
            email: result.user.username,
            role: result.user.role
          };
          this.employee = employee as Employee;
          this.token = sessionId;
          localStorage.setItem('employee_data', JSON.stringify(employee));
          return true;
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }

    // If check failed, clear stored data
    this.clearAuth();
    return false;
  }

  // Logout current session
  async logout(allSessions: boolean = false): Promise<void> {
    const sessionId = localStorage.getItem('session_id') || this.token;
    if (!sessionId) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}?action=logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logout',
          session_id: sessionId
        })
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    // Always clear local auth data regardless of server response
    this.clearAuth();
  }

  // Clear authentication data
  private clearAuth(): void {
    this.token = null;
    this.employee = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('employee_data');
    localStorage.removeItem('session_id');
  }

  // Get current user data
  getCurrentEmployee(): Employee | null {
    console.log('[AuthService.getCurrentEmployee] Запрос текущего пользователя');
    console.log('[AuthService.getCurrentEmployee] employee:', this.employee);
    console.log('[AuthService.getCurrentEmployee] token:', this.token);
    console.log('[AuthService.getCurrentEmployee] localStorage.auth_token:', localStorage.getItem('auth_token'));
    console.log('[AuthService.getCurrentEmployee] localStorage.employee_data:', localStorage.getItem('employee_data'));
    return this.employee;
  }

  // Get current auth token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.token !== null && this.employee !== null;
  }

  // Check if user has specific role
  hasRole(role: string | string[]): boolean {
    if (!this.employee) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.employee.role);
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is manager or higher
  isManager(): boolean {
    return this.hasRole(['admin', 'manager']);
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for easier imports
export default authService;