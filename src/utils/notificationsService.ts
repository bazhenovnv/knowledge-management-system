import { externalDb } from '@/services/externalDb';

const SCHEMA = 't_p47619579_knowledge_management';

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
    return await externalDb.create('notifications', {
      employee_id: data.employee_id,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      priority: data.priority || 'normal',
      link: data.link,
      metadata: data.metadata,
      is_read: false,
      created_at: new Date().toISOString(),
    }, SCHEMA);
  },

  async getNotifications(employeeId: number) {
    const result = await externalDb.list('notifications', {
      filters: { employee_id: employeeId },
      orderBy: 'created_at',
      orderDir: 'desc',
    }, SCHEMA);
    return result;
  },

  async getUnreadCount(employeeId: number) {
    const result = await externalDb.list('notifications', {
      filters: { employee_id: employeeId, is_read: false },
    }, SCHEMA);
    return { count: result.count };
  },

  async markAsRead(notificationId: number) {
    return await externalDb.update('notifications', notificationId, {
      is_read: true,
    }, SCHEMA);
  },

  async markAllAsRead(employeeId: number) {
    const notifications = await this.getNotifications(employeeId);
    const unread = notifications.data.filter((n: any) => !n.is_read);
    
    for (const notification of unread) {
      await this.markAsRead(notification.id);
    }
    
    return { success: true };
  },

  async deleteNotification(notificationId: number) {
    return await externalDb.delete('notifications', notificationId, SCHEMA);
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