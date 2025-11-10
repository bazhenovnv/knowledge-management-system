import { API_CONFIG } from '@/config/apiConfig';

const EMAIL_API_URL = API_CONFIG.EMAIL_API;

export interface ScheduledNotification {
  employeeId: number;
  type: string;
  title: string;
  message: string;
  scheduledFor: Date;
  entityType?: string;
  entityId?: number;
  channels?: ('database' | 'push' | 'email')[];
}

export interface DeadlineReminder {
  entityType: 'test' | 'course' | 'task';
  entityId: number;
  deadline: Date;
  intervals?: number[];
}

class ScheduledNotificationService {
  private apiUrl = EMAIL_API_URL;

  async scheduleNotification(notification: ScheduledNotification): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'schedule',
          employeeId: notification.employeeId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          entityType: notification.entityType,
          entityId: notification.entityId,
          scheduledFor: notification.scheduledFor.toISOString(),
          channels: notification.channels || ['database']
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, notificationId: data.notificationId };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Scheduling timeout');
          return { success: false, error: 'Превышено время ожидания. Проверьте соединение.' };
        }
        console.error('Error scheduling notification:', error);
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Неизвестная ошибка при планировании' };
    }
  }

  async setDeadlineReminder(reminder: DeadlineReminder): Promise<{ success: boolean; reminderId?: number; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_deadline_reminder',
          entityType: reminder.entityType,
          entityId: reminder.entityId,
          deadline: reminder.deadline.toISOString(),
          intervals: reminder.intervals || [86400, 3600, 0]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, reminderId: data.reminderId };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Deadline reminder timeout');
          return { success: false, error: 'Превышено время ожидания. Проверьте соединение.' };
        }
        console.error('Error setting deadline reminder:', error);
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Неизвестная ошибка при установке напоминания' };
    }
  }

  async processScheduled(): Promise<{ success: boolean; scheduled?: any; deadlines?: any; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${this.apiUrl}?action=process`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, scheduled: data.scheduled, deadlines: data.deadlines };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Process scheduled timeout');
          return { success: false, error: 'Превышено время ожидания обработки' };
        }
        console.error('Error processing scheduled notifications:', error);
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Неизвестная ошибка при обработке уведомлений' };
    }
  }

  scheduleInMinutes(minutes: number, notification: Omit<ScheduledNotification, 'scheduledFor'>): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    const scheduledFor = new Date(Date.now() + minutes * 60 * 1000);
    return this.scheduleNotification({ ...notification, scheduledFor });
  }

  scheduleInHours(hours: number, notification: Omit<ScheduledNotification, 'scheduledFor'>): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    return this.scheduleInMinutes(hours * 60, notification);
  }

  scheduleInDays(days: number, notification: Omit<ScheduledNotification, 'scheduledFor'>): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    return this.scheduleInHours(days * 24, notification);
  }

  async setTestDeadline(testId: number, deadline: Date, intervals?: number[]): Promise<{ success: boolean; reminderId?: number; error?: string }> {
    return this.setDeadlineReminder({
      entityType: 'test',
      entityId: testId,
      deadline,
      intervals
    });
  }

  async setCourseDeadline(courseId: number, deadline: Date, intervals?: number[]): Promise<{ success: boolean; reminderId?: number; error?: string }> {
    return this.setDeadlineReminder({
      entityType: 'course',
      entityId: courseId,
      deadline,
      intervals
    });
  }

  async setTaskDeadline(taskId: number, deadline: Date, intervals?: number[]): Promise<{ success: boolean; reminderId?: number; error?: string }> {
    return this.setDeadlineReminder({
      entityType: 'task',
      entityId: taskId,
      deadline,
      intervals
    });
  }
}

export const scheduledNotifications = new ScheduledNotificationService();