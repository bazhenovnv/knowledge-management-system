import { notificationsService } from './notificationsService';

export interface AssignmentNotificationData {
  assignmentId: string;
  title: string;
  description: string;
  type: 'test' | 'material' | 'course';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  assigneeIds: number[];
  creatorName?: string;
}

export const assignmentsNotifications = {
  // Уведомить о новом задании
  async notifyNewAssignment(data: AssignmentNotificationData): Promise<void> {
    try {
      const priorityMap = {
        low: 'normal' as const,
        medium: 'high' as const,
        high: 'urgent' as const,
      };

      const typeLabel = {
        test: 'тест',
        material: 'материал для изучения',
        course: 'курс',
      };

      const deadlineText = data.deadline
        ? ` Срок выполнения: ${new Date(data.deadline).toLocaleDateString('ru-RU')}`
        : '';

      for (const employeeId of data.assigneeIds) {
        await notificationsService.createNotification({
          employee_id: employeeId,
          title: `Новое задание: ${typeLabel[data.type]}`,
          message: `${data.creatorName ? `${data.creatorName} назначил вам` : 'Вам назначено'} задание "${data.title}". ${data.description}.${deadlineText}`,
          type: 'assignment',
          priority: priorityMap[data.priority],
          link: '/assignments',
          metadata: {
            assignment_id: data.assignmentId,
            assignment_type: data.type,
            deadline: data.deadline?.toISOString(),
          },
        });
      }
    } catch (error) {
      console.error('Error sending assignment notifications:', error);
    }
  },

  // Напоминание о приближающемся дедлайне
  async notifyDeadlineApproaching(
    assignmentTitle: string,
    employeeId: number,
    deadline: Date,
    assignmentId: string
  ): Promise<void> {
    try {
      const daysLeft = Math.ceil(
        (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await notificationsService.createNotification({
        employee_id: employeeId,
        title: 'Приближается срок сдачи',
        message: `До дедлайна задания "${assignmentTitle}" осталось ${daysLeft} ${daysLeft === 1 ? 'день' : 'дней'}. Завершите задание вовремя!`,
        type: 'warning',
        priority: daysLeft <= 1 ? 'urgent' : 'high',
        link: '/assignments',
        metadata: {
          assignment_id: assignmentId,
          deadline: deadline.toISOString(),
          days_left: daysLeft,
        },
      });
    } catch (error) {
      console.error('Error sending deadline notification:', error);
    }
  },

  // Уведомление о просроченном задании
  async notifyDeadlineMissed(
    assignmentTitle: string,
    employeeId: number,
    assignmentId: string
  ): Promise<void> {
    try {
      await notificationsService.createNotification({
        employee_id: employeeId,
        title: 'Срок выполнения пропущен',
        message: `Вы пропустили срок выполнения задания "${assignmentTitle}". Свяжитесь с руководителем для уточнения дальнейших действий.`,
        type: 'error',
        priority: 'urgent',
        link: '/assignments',
        metadata: {
          assignment_id: assignmentId,
          status: 'overdue',
        },
      });
    } catch (error) {
      console.error('Error sending missed deadline notification:', error);
    }
  },

  // Уведомление о завершении задания
  async notifyAssignmentCompleted(
    assignmentTitle: string,
    employeeId: number,
    supervisorId: number,
    assignmentId: string
  ): Promise<void> {
    try {
      // Уведомление сотруднику
      await notificationsService.createNotification({
        employee_id: employeeId,
        title: 'Задание выполнено',
        message: `Вы завершили задание "${assignmentTitle}". Ожидайте проверки результатов.`,
        type: 'success',
        priority: 'normal',
        link: '/assignments',
        metadata: {
          assignment_id: assignmentId,
          status: 'completed',
        },
      });

      // Уведомление руководителю
      await notificationsService.createNotification({
        employee_id: supervisorId,
        title: 'Задание выполнено сотрудником',
        message: `Сотрудник выполнил задание "${assignmentTitle}". Проверьте результаты.`,
        type: 'info',
        priority: 'normal',
        link: '/assignments',
        metadata: {
          assignment_id: assignmentId,
          completed_by: employeeId,
        },
      });
    } catch (error) {
      console.error('Error sending completion notifications:', error);
    }
  },

  // Уведомление об оценке задания
  async notifyAssignmentGraded(
    assignmentTitle: string,
    employeeId: number,
    grade: number,
    feedback: string,
    assignmentId: string
  ): Promise<void> {
    try {
      const passed = grade >= 70;

      await notificationsService.createNotification({
        employee_id: employeeId,
        title: passed ? 'Задание проверено' : 'Требуется доработка',
        message: passed
          ? `Ваше задание "${assignmentTitle}" проверено. Оценка: ${grade}%. ${feedback}`
          : `Задание "${assignmentTitle}" требует доработки. Оценка: ${grade}%. ${feedback}`,
        type: passed ? 'success' : 'warning',
        priority: passed ? 'normal' : 'high',
        link: '/assignments',
        metadata: {
          assignment_id: assignmentId,
          grade,
          feedback,
        },
      });
    } catch (error) {
      console.error('Error sending grading notification:', error);
    }
  },
};
