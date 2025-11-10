import { API_CONFIG } from '@/config/apiConfig';

const API_BASE_URL = API_CONFIG.AUTH_API;

export interface Employee {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  department?: string;
  position?: string;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean;
  avatar_url?: string;
  theme?: string;
  created_at?: string;
}

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
    const response = await fetch(`${API_BASE_URL}?action=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        ...data
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
    }

    const result: AuthResponse = await response.json();

    // Store authentication data
    if (result.success && result.session) {
      this.token = result.session.token;
      this.employee = result.employee;
      localStorage.setItem('auth_token', result.session.token);
      localStorage.setItem('employee_data', JSON.stringify(result.employee));
    }

    return result;
  }

  // Check if current token is valid
  async checkAuth(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}?action=check`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': this.token,
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.authenticated) {
          this.employee = result.employee;
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
    if (!this.token) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}?action=logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': this.token,
        },
        body: JSON.stringify({
          action: 'logout',
          all_sessions: allSessions
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
  }

  // Get current user data
  getCurrentEmployee(): Employee | null {
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