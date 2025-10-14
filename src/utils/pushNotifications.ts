// Система браузерных push-уведомлений

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

class PushNotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  // Проверить поддержку браузером
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Получить текущий статус разрешения
  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Запросить разрешение на уведомления
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Отправить push-уведомление
  async sendNotification(options: PushNotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo.png',
        badge: options.badge || '/logo-small.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      });

      // Обработчик клика по уведомлению
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Перейти по ссылке, если есть
        if (options.data?.link) {
          window.location.href = options.data.link;
        }
        
        notification.close();
      };

      // Автоматически закрыть через 10 секунд
      setTimeout(() => {
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Отправить уведомление с звуком
  async sendSoundNotification(options: PushNotificationOptions): Promise<void> {
    await this.sendNotification({
      ...options,
      silent: false,
      requireInteraction: true,
    });

    // Воспроизвести звук
    this.playNotificationSound();
  }

  // Воспроизвести звук уведомления
  private playNotificationSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLTgjMGHm7A7+OZUQ0PVKni7q9aGAU9k9n0xnMmBSp+y/PVgTQHImS96+eUSwwMT6fk8LllHgU2jdXxxXMnBSh6yPHZhzgHHWu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8LVjHQU1i9XyxnUoBSh4x/HbizQHHmu47+WVUgwOUqfj8A==');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Игнорируем ошибки воспроизведения
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Отправить срочное уведомление (требует взаимодействия)
  async sendUrgentNotification(options: PushNotificationOptions): Promise<void> {
    await this.sendNotification({
      ...options,
      requireInteraction: true,
      silent: false,
    });

    this.playNotificationSound();
  }

  // Закрыть все уведомления с определённым тегом
  closeNotificationsByTag(tag: string): void {
    // Эта функция работает только в Service Worker
    console.log(`Closing notifications with tag: ${tag}`);
  }
}

export const pushNotificationService = new PushNotificationService();

// Хелперы для разных типов уведомлений
export const pushNotificationHelpers = {
  // Уведомление о новом тесте
  async notifyNewTest(testTitle: string, description: string): Promise<void> {
    await pushNotificationService.sendNotification({
      title: '📝 Новый тест',
      body: `Вам назначен тест "${testTitle}". ${description}`,
      icon: '/icons/test-icon.png',
      tag: 'new-test',
      data: { link: '/tests' },
    });
  },

  // Уведомление о результате теста
  async notifyTestResult(testTitle: string, passed: boolean, percentage: number): Promise<void> {
    await pushNotificationService.sendNotification({
      title: passed ? '✅ Тест сдан!' : '❌ Тест не пройден',
      body: `${testTitle}: ${percentage}%`,
      icon: passed ? '/icons/success.png' : '/icons/warning.png',
      tag: 'test-result',
      data: { link: '/tests' },
    });
  },

  // Уведомление о новом задании
  async notifyNewAssignment(title: string, deadline?: Date): Promise<void> {
    const deadlineText = deadline 
      ? ` Срок: ${deadline.toLocaleDateString('ru-RU')}`
      : '';
    
    await pushNotificationService.sendNotification({
      title: '📋 Новое задание',
      body: `${title}${deadlineText}`,
      icon: '/icons/assignment.png',
      tag: 'new-assignment',
      data: { link: '/assignments' },
    });
  },

  // Срочное напоминание о дедлайне
  async notifyUrgentDeadline(title: string, hoursLeft: number): Promise<void> {
    await pushNotificationService.sendUrgentNotification({
      title: '⚠️ Срочно! Приближается дедлайн',
      body: `${title}. Осталось ${hoursLeft} часов!`,
      icon: '/icons/urgent.png',
      tag: 'urgent-deadline',
      data: { link: '/assignments' },
      requireInteraction: true,
    });
  },

  // Уведомление о новом курсе
  async notifyNewCourse(courseTitle: string, startDate?: string): Promise<void> {
    const dateText = startDate 
      ? ` Начало: ${new Date(startDate).toLocaleDateString('ru-RU')}`
      : '';
    
    await pushNotificationService.sendNotification({
      title: '🎓 Новый курс',
      body: `Вы записаны на курс "${courseTitle}".${dateText}`,
      icon: '/icons/course.png',
      tag: 'new-course',
      data: { link: '/knowledge' },
    });
  },

  // Уведомление об общем объявлении
  async notifyAnnouncement(title: string, message: string, urgent: boolean = false): Promise<void> {
    if (urgent) {
      await pushNotificationService.sendUrgentNotification({
        title: `🔔 ${title}`,
        body: message,
        icon: '/icons/announcement.png',
        tag: 'announcement',
        requireInteraction: true,
      });
    } else {
      await pushNotificationService.sendNotification({
        title: `🔔 ${title}`,
        body: message,
        icon: '/icons/announcement.png',
        tag: 'announcement',
      });
    }
  },
};
