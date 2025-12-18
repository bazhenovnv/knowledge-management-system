import { API_CONFIG } from '@/config/apiConfig';
import { Employee } from '@/types/database';

const API_BASE_URL = API_CONFIG.AUTH_API;

// CRITICAL: Используем нативный fetch, сохранённый в index.html ДО загрузки скриптов poehali.dev
// Это необходимо, чтобы запросы шли напрямую к Cloud Functions, а не через прокси
const nativeFetch = (window as any).__NATIVE_FETCH__ || window.fetch.bind(window);

console.log('[AuthService Module] API_BASE_URL при загрузке:', API_BASE_URL);
console.log('[AuthService Module] __NATIVE_FETCH__ доступен?', typeof (window as any).__NATIVE_FETCH__);
console.log('[AuthService Module] Используем nativeFetch:', typeof nativeFetch);

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
    const response = await nativeFetch(`${API_BASE_URL}?action=register`, {
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
    // CRITICAL: Используем абсолютный URL напрямую, чтобы избежать подмены прокси
    const ABSOLUTE_AUTH_URL = 'https://functions.poehali.dev/af05cfe5-2869-458e-8c1b-998684e530d2';
    const fullUrl = `${ABSOLUTE_AUTH_URL}?action=login`;
    
    console.log('[AuthService] ========================================');
    console.log('[AuthService] Начинаем вход...', { email: data.email });
    console.log('[AuthService] HARDCODED URL:', ABSOLUTE_AUTH_URL);
    console.log('[AuthService] Полный URL запроса:', fullUrl);
    console.log('[AuthService] window.location.origin:', window.location.origin);
    console.log('[AuthService] nativeFetch === window.fetch?', nativeFetch === window.fetch);
    console.log('[AuthService] Используем __NATIVE_FETCH__?', nativeFetch === (window as any).__NATIVE_FETCH__);
    console.log('[AuthService] ========================================');
    
    const requestBody = {
      email: data.email,
      password: data.password,
      remember_me: data.remember_me || false
    };
    
    const response = await nativeFetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[AuthService] Получен ответ от сервера:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[AuthService] Ошибка входа:', errorData);
      throw new Error(errorData.error || 'Invalid credentials');
    }

    const result = await response.json();
    console.log('[AuthService] Результат входа:', result);

    // Store authentication data (backend возвращает token в поле token)
    if (result.success && result.token) {
      this.token = result.token;
      this.employee = result.employee as Employee;
      
      console.log('[AuthService] Сохраняем данные в localStorage:', result.employee);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('employee_data', JSON.stringify(result.employee));
      if (result.session?.id) {
        localStorage.setItem('session_id', result.session.id.toString());
      }
      console.log('[AuthService] Данные сохранены успешно');
    } else {
      console.error('[AuthService] Неожиданный формат ответа от сервера:', result);
      throw new Error('Login failed: invalid response format');
    }

    return {
      success: true,
      message: 'Login successful',
      employee: this.employee!,
      session: result.session ? {
        token: result.token,
        expires_at: result.session.expires_at,
        session_id: result.session.id
      } : undefined
    };
  }

  // Check if current token is valid
  async checkAuth(): Promise<boolean> {
    const authToken = localStorage.getItem('auth_token') || this.token;
    if (!authToken) {
      return false;
    }

    try {
      const response = await nativeFetch(`${API_BASE_URL}?action=check`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': authToken
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.authenticated && result.employee) {
          this.employee = result.employee as Employee;
          this.token = authToken;
          localStorage.setItem('employee_data', JSON.stringify(result.employee));
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
    const authToken = localStorage.getItem('auth_token') || this.token;
    if (!authToken) {
      return;
    }

    try {
      await nativeFetch(`${API_BASE_URL}?action=logout`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': authToken
        }
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