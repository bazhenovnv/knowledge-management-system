import funcUrls from '../../backend/func2url.json';

const API_URL = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';

export interface CreateNotificationData {
  employee_id: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'assignment';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  link?: string;
  metadata?: any;
}

export const notificationsService = {
  async createNotification(data: CreateNotificationData) {
    const response = await fetch(`${API_URL}?action=create_notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getNotifications(employeeId: number) {
    const response = await fetch(
      `${API_URL}?action=get_notifications&employee_id=${employeeId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.json();
  },

  async getUnreadCount(employeeId: number) {
    const response = await fetch(
      `${API_URL}?action=get_unread_count&employee_id=${employeeId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.json();
  },

  async markAsRead(notificationId: number) {
    const response = await fetch(`${API_URL}?action=mark_read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId })
    });
    return response.json();
  },

  async markAllAsRead(employeeId: number) {
    const response = await fetch(`${API_URL}?action=mark_all_read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId })
    });
    return response.json();
  },

  async createTestNotifications(employeeId: number) {
    const notifications = [
      {
        employee_id: employeeId,
        title: 'Добро пожаловать!',
        message: 'Система уведомлений успешно подключена к базе данных PostgreSQL',
        type: 'success' as const,
        priority: 'normal' as const,
      },
      {
        employee_id: employeeId,
        title: 'Новое задание',
        message: 'Вам назначен тест "Информационная безопасность". Пройдите его до конца недели.',
        type: 'assignment' as const,
        priority: 'high' as const,
        link: '/tests',
      },
      {
        employee_id: employeeId,
        title: 'Обновление системы',
        message: 'Запланировано техническое обслуживание на завтра в 02:00',
        type: 'info' as const,
        priority: 'low' as const,
      },
      {
        employee_id: employeeId,
        title: 'Срочно: Обязательное обучение',
        message: 'Пройдите курс по охране труда до конца месяца. Это обязательное требование.',
        type: 'warning' as const,
        priority: 'urgent' as const,
        link: '/knowledge',
      },
    ];

    const results = [];
    for (const notification of notifications) {
      const result = await this.createNotification(notification);
      results.push(result);
    }
    return results;
  },
};