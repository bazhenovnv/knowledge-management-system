import { API_CONFIG } from '@/config/apiConfig';
import { Employee } from '@/types/database';

const API_BASE_URL = API_CONFIG.AUTH_API;

console.log('[AuthService Module] API_BASE_URL при загрузке:', API_BASE_URL);
console.log('[AuthService Module] Используем XMLHttpRequest для обхода перехвата fetch');

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
    const fullUrl = `${API_BASE_URL}?action=register`;
    
    const result = await new Promise<AuthResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', fullUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || `HTTP ${xhr.status}: Registration failed`));
          } catch (e) {
            reject(new Error(`HTTP ${xhr.status}: Registration failed`));
          }
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error'));
      
      xhr.send(JSON.stringify({
        action: 'register',
        ...data
      }));
    });

    return result;
  }

  // Login employee
  async login(data: LoginData): Promise<AuthResponse> {
    // CRITICAL: Используем XMLHttpRequest вместо fetch, так как poehali.dev скрипты НЕ перехватывают XHR
    const ABSOLUTE_AUTH_URL = 'https://functions.poehali.dev/af05cfe5-2869-458e-8c1b-998684e530d2';
    const fullUrl = `${ABSOLUTE_AUTH_URL}?action=login`;
    
    console.log('[AuthService.login] ========================================');
    console.log('[AuthService.login] Начинаем вход через XMLHttpRequest...', { email: data.email });
    console.log('[AuthService.login] URL:', fullUrl);
    console.log('[AuthService.login] ========================================');
    
    const requestBody = {
      email: data.email,
      password: data.password,
      remember_me: data.remember_me || false
    };
    
    // Используем XMLHttpRequest для обхода перехвата fetch
    const result = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', fullUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        console.log('[AuthService.login] XHR Status:', xhr.status);
        console.log('[AuthService.login] XHR Response:', xhr.responseText.substring(0, 200));
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || 'Invalid credentials'));
          } catch (e) {
            reject(new Error(`HTTP ${xhr.status}: Login failed`));
          }
        }
      };
      
      xhr.onerror = function() {
        console.error('[AuthService.login] XHR Network Error');
        reject(new Error('Network error'));
      };
      
      xhr.send(JSON.stringify(requestBody));
    });

    console.log('[AuthService.login] Результат входа:', result);

    // Store authentication data (backend возвращает token в поле token)
    if (result.success && result.token) {
      this.token = result.token;
      this.employee = result.employee as Employee;
      
      console.log('[AuthService.login] Сохраняем данные в localStorage:', result.employee);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('employee_data', JSON.stringify(result.employee));
      if (result.session?.id) {
        localStorage.setItem('session_id', result.session.id.toString());
      }
      console.log('[AuthService.login] Данные сохранены успешно');
    } else {
      console.error('[AuthService.login] Неожиданный формат ответа от сервера:', result);
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
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${API_BASE_URL}?action=check`, true);
        xhr.setRequestHeader('X-Auth-Token', authToken);
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
      });

      if (result.authenticated && result.employee) {
        this.employee = result.employee as Employee;
        this.token = authToken;
        localStorage.setItem('employee_data', JSON.stringify(result.employee));
        return true;
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
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `${API_BASE_URL}?action=logout`, true);
        xhr.setRequestHeader('X-Auth-Token', authToken);
        
        xhr.onload = () => resolve();
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
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