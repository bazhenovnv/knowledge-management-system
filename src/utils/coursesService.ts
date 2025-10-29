// Сервис для работы с курсами
import funcUrls from '../../backend/func2url.json';

export interface Course {
  id: number;
  title: string;
  description?: string;
  instructor_id?: number;
  instructor_name?: string;
  start_date?: string;
  end_date?: string;
  duration_hours?: number;
  max_participants?: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface DatabaseResponse<T> {
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

class CoursesService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<DatabaseResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Courses API request error:', error);
      return { error: `Ошибка запроса к API курсов: ${error}` };
    }
  }

  // Получить список курсов
  async getCourses(): Promise<Course[]> {
    const response = await this.makeRequest<Course[]>('?action=list&table=courses');

    if (response.error) {
      console.error('Error fetching courses:', response.error);
      return [];
    }

    return response.data || [];
  }

  // Получить курс по ID
  async getCourse(courseId: number): Promise<Course | null> {
    const response = await this.makeRequest<Course>(`?action=get&table=courses&id=${courseId}`);

    if (response.error || !response.data) {
      console.error('Error fetching course:', response.error);
      return null;
    }

    return response.data;
  }

  // Создать курс
  async createCourse(courseData: {
    title: string;
    description?: string;
    instructor_id?: number;
    start_date?: string;
    end_date?: string;
    duration_hours?: number;
    max_participants?: number;
  }): Promise<Course | null> {
    const response = await this.makeRequest<Course>('?action=create&table=courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });

    if (response.error || !response.data) {
      console.error('Error creating course:', response.error);
      return null;
    }

    return response.data;
  }

  // Назначить курс сотрудникам
  async assignCourseToEmployees(
    course: Course,
    employeeIds: number[]
  ): Promise<void> {
    try {
      const { notificationsService } = await import('./notificationsService');

      for (const employeeId of employeeIds) {
        await notificationsService.createNotification({
          employee_id: employeeId,
          title: 'Новый курс',
          message: `Вы записаны на курс "${course.title}". ${course.description || ''} ${course.start_date ? `Начало: ${new Date(course.start_date).toLocaleDateString('ru-RU')}` : ''}`,
          type: 'info',
          priority: 'normal',
          link: '/knowledge',
          metadata: {
            course_id: course.id,
            course_title: course.title,
            start_date: course.start_date,
          },
        });
      }
    } catch (error) {
      console.error('Error sending course assignment notifications:', error);
    }
  }

  // Уведомить о начале курса
  async notifyCourseStart(course: Course, employeeIds: number[]): Promise<void> {
    try {
      const { notificationsService } = await import('./notificationsService');

      for (const employeeId of employeeIds) {
        await notificationsService.createNotification({
          employee_id: employeeId,
          title: 'Курс начинается',
          message: `Напоминание: курс "${course.title}" начинается сегодня! Не пропустите занятия.`,
          type: 'info',
          priority: 'high',
          link: '/knowledge',
          metadata: {
            course_id: course.id,
            course_title: course.title,
          },
        });
      }
    } catch (error) {
      console.error('Error sending course start notifications:', error);
    }
  }

  // Уведомить о завершении курса
  async notifyCourseCompletion(
    course: Course,
    employeeId: number,
    hasCertificate: boolean = false
  ): Promise<void> {
    try {
      const { notificationsService } = await import('./notificationsService');

      await notificationsService.createNotification({
        employee_id: employeeId,
        title: 'Курс завершён',
        message: hasCertificate
          ? `Поздравляем! Вы успешно завершили курс "${course.title}". ${hasCertificate ? 'Сертификат доступен в вашем профиле.' : ''}`
          : `Вы завершили курс "${course.title}".`,
        type: 'success',
        priority: 'normal',
        link: '/knowledge',
        metadata: {
          course_id: course.id,
          course_title: course.title,
          has_certificate: hasCertificate,
        },
      });
    } catch (error) {
      console.error('Error sending course completion notification:', error);
    }
  }
}

export const coursesService = new CoursesService();