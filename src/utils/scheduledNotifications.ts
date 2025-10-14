import { CONFIG } from '@/config';

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
  private apiUrl = `${CONFIG.API_BASE_URL}/email-notifications`;

  async scheduleNotification(notification: ScheduledNotification): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    try {
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
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule notification');
      }

      const data = await response.json();
      return { success: true, notificationId: data.notificationId };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async setDeadlineReminder(reminder: DeadlineReminder): Promise<{ success: boolean; reminderId?: number; error?: string }> {
    try {
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
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set deadline reminder');
      }

      const data = await response.json();
      return { success: true, reminderId: data.reminderId };
    } catch (error) {
      console.error('Error setting deadline reminder:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async processScheduled(): Promise<{ success: boolean; scheduled?: any; deadlines?: any; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}?action=process`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to process scheduled notifications');
      }

      const data = await response.json();
      return { success: true, scheduled: data.scheduled, deadlines: data.deadlines };
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
