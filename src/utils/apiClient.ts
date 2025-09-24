import { API_URLS } from './apiUrls';

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class ApiClient {
  private baseURL: string = '';
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  private timeout: number = 30000; // 30 seconds
  private retries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Можно добавить перехватчики запросов и ответов
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string, 
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retries = this.retries,
      retryDelay = this.retryDelay
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      body: body ? JSON.stringify(body) : undefined
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        };
      } catch (error) {
        lastError = error as Error;
        
        // Не повторяем для некоторых ошибок
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          // Сетевая ошибка - можно повторить
        } else if (error instanceof Error && error.name === 'AbortError') {
          // Таймаут - можно повторить
        } else {
          // Другие ошибки - не повторяем
          throw error;
        }

        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Экспоненциальная задержка
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError!;
  }

  // GET запрос
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'GET', headers });
    return response.data;
  }

  // POST запрос
  async post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'POST', body, headers });
    return response.data;
  }

  // PUT запрос
  async put<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'PUT', body, headers });
    return response.data;
  }

  // DELETE запрос
  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await this.makeRequest<T>(url, { method: 'DELETE', headers });
    return response.data;
  }

  // Специальные методы для нашего API
  async getDatabaseInfo(level: string, options?: { schema_name?: string; table_name?: string }) {
    return this.post(API_URLS.DATABASE_INFO, { level, ...options });
  }

  async executeQuery(query: string, maxRows: number = 100) {
    return this.post(API_URLS.DATABASE_QUERY, { query, max_rows: maxRows });
  }

  async runMigration(migrationContent: string, migrationName?: string) {
    return this.post(API_URLS.DATABASE_MIGRATE, {
      migration_content: migrationContent,
      migration_name: migrationName
    });
  }

  // Batch запросы
  async batch<T>(requests: Array<{ url: string; config?: ApiRequestConfig }>): Promise<T[]> {
    const promises = requests.map(({ url, config }) => this.makeRequest<T>(url, config));
    const responses = await Promise.allSettled(promises);
    
    return responses.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value.data;
      } else {
        console.error(`Batch request ${index} failed:`, result.reason);
        throw result.reason;
      }
    });
  }

  // Настройка клиента
  setBaseURL(url: string) {
    this.baseURL = url;
    return this;
  }

  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    return this;
  }

  setTimeout(ms: number) {
    this.timeout = ms;
    return this;
  }

  setRetries(count: number) {
    this.retries = count;
    return this;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Хук для использования в компонентах
export const useApiClient = () => {
  return apiClient;
};

export default apiClient;