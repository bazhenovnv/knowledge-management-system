// Интегрированная система уведомлений (БД + Push + Email)

import { notificationsService, CreateNotificationData } from './notificationsService';
import { pushNotificationService, pushNotificationHelpers } from './pushNotifications';

const EMAIL_API_URL = 'https://functions.poehali.dev/75306ed7-e91c-4135-84fe-8b519f7dcf17';

interface Employee {
  id: number;
  email: string;
  full_name: string;
}

interface NotificationOptions extends CreateNotificationData {
  sendPush?: boolean;
  sendEmail?: boolean;
  employeeEmail?: string;
  employeeName?: string;
}

class IntegratedNotificationService {
  // Отправить уведомление через все каналы
  async sendNotification(options: NotificationOptions): Promise<void> {
    const {
      employee_id,
      title,
      message,
      type = 'info',
      priority = 'normal',
      link,
      metadata,
      sendPush = true,
      sendEmail = false,
      employeeEmail,
      employeeName,
    } = options;

    // 1. Сохранить в базу данных
    try {
      await notificationsService.createNotification({
        employee_id,
        title,
        message,
        type,
        priority,
        link,
        metadata,
      });
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }

    // 2. Отправить push-уведомление
    if (sendPush && this.isPushEnabled()) {
      try {
        await this.sendPushNotification(title, message, type, link);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    // 3. Отправить email
    if (sendEmail && employeeEmail) {
      try {
        await this.sendEmailNotification(
          employeeEmail,
          title,
          message,
          type,
          employeeName
        );
      } catch (error) {
        console.error('Error sending email notification:', error);
      }
    }
  }

  // Проверить, включены ли push-уведомления
  private isPushEnabled(): boolean {
    return pushNotificationService.getPermission() === 'granted';
  }

  // Отправить push-уведомление
  private async sendPushNotification(
    title: string,
    message: string,
    type: string,
    link?: string
  ): Promise<void> {
    const iconMap: Record<string, string> = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      assignment: '📋',
    };

    await pushNotificationService.sendNotification({
      title: `${iconMap[type] || '🔔'} ${title}`,
      body: message,
      icon: '/logo.png',
      tag: `notification-${Date.now()}`,
      data: { link },
    });
  }

  // Отправить email уведомление
  private async sendEmailNotification(
    toEmail: string,
    subject: string,
    message: string,
    type: string,
    recipientName?: string
  ): Promise<void> {
    const greeting = recipientName ? `Здравствуйте, ${recipientName}!\n\n` : '';
    const fullMessage = `${greeting}${message}`;

    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: toEmail,
        subject,
        message: fullMessage,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  }

  // Получить настройки уведомлений пользователя
  private getNotificationSettings(employeeId: number) {
    const savedSettings = localStorage.getItem(`notification-settings-${employeeId}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      emailEnabled: true,
      categories: {
        tests: true,
        courses: true,
        assignments: true,
        deadlines: true,
        announcements: true,
      },
    };
  }

  // Уведомить о новом тесте
  async notifyNewTest(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    testTitle: string,
    testDescription: string
  ): Promise<void> {
    const settings = this.getNotificationSettings(employeeId);
    if (!settings.categories.tests) return;

    await this.sendNotification({
      employee_id: employeeId,
      title: 'Новый тест',
      message: `Вам назначен тест "${testTitle}". ${testDescription}`,
      type: 'assignment',
      priority: 'high',
      link: '/tests',
      sendPush: true,
      sendEmail: settings.emailEnabled,
      employeeEmail,
      employeeName,
      metadata: { test_title: testTitle },
    });

    // Дополнительно отправить специализированное push
    if (this.isPushEnabled()) {
      await pushNotificationHelpers.notifyNewTest(testTitle, testDescription);
    }
  }

  // Уведомить о результате теста
  async notifyTestResult(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    testTitle: string,
    passed: boolean,
    percentage: number
  ): Promise<void> {
    const settings = this.getNotificationSettings(employeeId);
    if (!settings.categories.tests) return;

    await this.sendNotification({
      employee_id: employeeId,
      title: passed ? 'Тест сдан успешно!' : 'Тест не пройден',
      message: passed
        ? `Поздравляем! Вы успешно прошли тест "${testTitle}" с результатом ${percentage}%.`
        : `Тест "${testTitle}" не пройден. Набрано ${percentage}%. Попробуйте ещё раз.`,
      type: passed ? 'success' : 'warning',
      priority: passed ? 'normal' : 'high',
      link: '/tests',
      sendPush: true,
      sendEmail: settings.emailEnabled,
      employeeEmail,
      employeeName,
      metadata: { test_title: testTitle, percentage, passed },
    });

    if (this.isPushEnabled()) {
      await pushNotificationHelpers.notifyTestResult(testTitle, passed, percentage);
    }
  }

  // Уведомить о новом курсе
  async notifyNewCourse(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    courseTitle: string,
    courseDescription: string,
    startDate?: string
  ): Promise<void> {
    const settings = this.getNotificationSettings(employeeId);
    if (!settings.categories.courses) return;

    const dateText = startDate
      ? ` Начало: ${new Date(startDate).toLocaleDateString('ru-RU')}`
      : '';

    await this.sendNotification({
      employee_id: employeeId,
      title: 'Новый курс',
      message: `Вы записаны на курс "${courseTitle}". ${courseDescription}.${dateText}`,
      type: 'info',
      priority: 'normal',
      link: '/knowledge',
      sendPush: true,
      sendEmail: settings.emailEnabled,
      employeeEmail,
      employeeName,
      metadata: { course_title: courseTitle, start_date: startDate },
    });

    if (this.isPushEnabled()) {
      await pushNotificationHelpers.notifyNewCourse(courseTitle, startDate);
    }
  }

  // Уведомить о срочном дедлайне
  async notifyUrgentDeadline(
    employeeId: number,
    employeeEmail: string,
    employeeName: string,
    assignmentTitle: string,
    hoursLeft: number
  ): Promise<void> {
    const settings = this.getNotificationSettings(employeeId);
    if (!settings.categories.deadlines) return;

    await this.sendNotification({
      employee_id: employeeId,
      title: 'Срочно! Приближается дедлайн',
      message: `До дедлайна задания "${assignmentTitle}" осталось ${hoursLeft} часов! Завершите задание вовремя.`,
      type: 'warning',
      priority: 'urgent',
      link: '/assignments',
      sendPush: true,
      sendEmail: settings.emailEnabled,
      employeeEmail,
      employeeName,
      metadata: { assignment_title: assignmentTitle, hours_left: hoursLeft },
    });

    if (this.isPushEnabled()) {
      await pushNotificationHelpers.notifyUrgentDeadline(assignmentTitle, hoursLeft);
    }
  }

  // Массовая рассылка объявления
  async broadcastAnnouncement(
    employees: Employee[],
    title: string,
    message: string,
    urgent: boolean = false
  ): Promise<void> {
    for (const employee of employees) {
      const settings = this.getNotificationSettings(employee.id);
      if (!settings.categories.announcements) continue;

      await this.sendNotification({
        employee_id: employee.id,
        title,
        message,
        type: urgent ? 'warning' : 'info',
        priority: urgent ? 'urgent' : 'normal',
        sendPush: true,
        sendEmail: settings.emailEnabled,
        employeeEmail: employee.email,
        employeeName: employee.full_name,
      });
    }

    if (this.isPushEnabled()) {
      await pushNotificationHelpers.notifyAnnouncement(title, message, urgent);
    }
  }
}

export const integratedNotifications = new IntegratedNotificationService();
