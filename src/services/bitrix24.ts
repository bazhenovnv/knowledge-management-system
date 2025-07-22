// Сервис для работы с Битрикс24 API
const BITRIX24_API_URL = 'https://clientsupport.bitrix24.ru/rest/35/64kvj0rqh3l5ipwo/';

// Типы данных для Битрикс24
export interface Bitrix24Task {
  ID: string;
  TITLE: string;
  DESCRIPTION?: string;
  STATUS: number;
  PRIORITY: number;
  RESPONSIBLE_ID: string;
  CREATED_DATE: string;
  DEADLINE?: string;
  GROUP_ID?: string;
}

export interface Bitrix24Contact {
  ID: string;
  NAME?: string;
  LAST_NAME?: string;
  COMPANY_TITLE?: string;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  SOURCE_ID?: string;
  ASSIGNED_BY_ID?: string;
  CREATED_TIME?: string;
}

export interface Bitrix24Deal {
  ID: string;
  TITLE: string;
  OPPORTUNITY: string;
  CURRENCY_ID: string;
  STAGE_ID: string;
  CONTACT_ID?: string;
  COMPANY_ID?: string;
  ASSIGNED_BY_ID?: string;
  CREATED_TIME?: string;
}

// Класс для работы с API Битрикс24
class Bitrix24Service {
  private baseUrl = BITRIX24_API_URL;

  // Основной метод для выполнения запросов к API
  private async makeRequest<T>(method: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${method}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params || {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error_description || 'Bitrix24 API Error');
      }

      return data.result;
    } catch (error) {
      console.error('Bitrix24 API Error:', error);
      throw error;
    }
  }

  // Методы для работы с задачами
  async getTasks(params?: { filter?: Record<string, any>; select?: string[] }): Promise<Bitrix24Task[]> {
    return this.makeRequest('tasks.task.list', params);
  }

  async getTask(taskId: string): Promise<Bitrix24Task> {
    return this.makeRequest(`tasks.task.get?taskId=${taskId}`);
  }

  async createTask(taskData: Partial<Bitrix24Task>): Promise<{ task: Bitrix24Task }> {
    return this.makeRequest('tasks.task.add', { fields: taskData });
  }

  async updateTask(taskId: string, taskData: Partial<Bitrix24Task>): Promise<{ task: Bitrix24Task }> {
    return this.makeRequest('tasks.task.update', { 
      taskId, 
      fields: taskData 
    });
  }

  async deleteTask(taskId: string): Promise<{ task: boolean }> {
    return this.makeRequest('tasks.task.delete', { taskId });
  }

  // Методы для работы с контактами
  async getContacts(params?: { filter?: Record<string, any>; select?: string[] }): Promise<Bitrix24Contact[]> {
    return this.makeRequest('crm.contact.list', params);
  }

  async getContact(contactId: string): Promise<Bitrix24Contact> {
    return this.makeRequest(`crm.contact.get?id=${contactId}`);
  }

  async createContact(contactData: Partial<Bitrix24Contact>): Promise<string> {
    const result = await this.makeRequest('crm.contact.add', { fields: contactData });
    return result;
  }

  async updateContact(contactId: string, contactData: Partial<Bitrix24Contact>): Promise<boolean> {
    return this.makeRequest('crm.contact.update', { 
      id: contactId, 
      fields: contactData 
    });
  }

  async deleteContact(contactId: string): Promise<boolean> {
    return this.makeRequest('crm.contact.delete', { id: contactId });
  }

  // Методы для работы со сделками
  async getDeals(params?: { filter?: Record<string, any>; select?: string[] }): Promise<Bitrix24Deal[]> {
    return this.makeRequest('crm.deal.list', params);
  }

  async getDeal(dealId: string): Promise<Bitrix24Deal> {
    return this.makeRequest(`crm.deal.get?id=${dealId}`);
  }

  async createDeal(dealData: Partial<Bitrix24Deal>): Promise<string> {
    const result = await this.makeRequest('crm.deal.add', { fields: dealData });
    return result;
  }

  async updateDeal(dealId: string, dealData: Partial<Bitrix24Deal>): Promise<boolean> {
    return this.makeRequest('crm.deal.update', { 
      id: dealId, 
      fields: dealData 
    });
  }

  // Вспомогательные методы
  async getUsers(): Promise<any[]> {
    return this.makeRequest('user.get');
  }

  async getDepartments(): Promise<any[]> {
    return this.makeRequest('department.get');
  }

  // Метод для проверки соединения с API
  async checkConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.makeRequest('app.info');
      return { success: true, message: 'Соединение с Битрикс24 установлено успешно' };
    } catch (error) {
      return { 
        success: false, 
        message: `Ошибка соединения с Битрикс24: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      };
    }
  }
}

// Экспортируем экземпляр сервиса
export const bitrix24Service = new Bitrix24Service();

// Статусы задач Битрикс24
export const TASK_STATUSES = {
  1: 'Новая',
  2: 'Ждет выполнения', 
  3: 'Выполняется',
  4: 'Ждет контроля',
  5: 'Завершена',
  6: 'Отложена'
} as const;

// Приоритеты задач
export const TASK_PRIORITIES = {
  1: 'Низкий',
  2: 'Обычный',
  3: 'Высокий'
} as const;