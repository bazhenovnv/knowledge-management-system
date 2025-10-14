// Примеры использования системы уведомлений

import { notificationsService } from './notificationsService';
import { testsService } from './testsService';
import { coursesService } from './coursesService';
import { assignmentsNotifications } from './assignmentsNotifications';

// Пример 1: Создание теста с автоматическими уведомлениями
export async function createTestWithNotifications() {
  const newTest = await testsService.createTest({
    title: 'Информационная безопасность',
    description: 'Базовые принципы защиты данных',
    creator_id: 1,
    passing_score: 70,
    max_attempts: 3,
    questions: [
      {
        question_text: 'Что такое фишинг?',
        question_type: 'single_choice',
        points: 1,
        answers: [
          { answer_text: 'Вид мошенничества', is_correct: true },
          { answer_text: 'Вид спорта', is_correct: false },
        ],
      },
    ],
    assignedEmployees: [1, 2, 3], // Автоматически отправит уведомления
  });

  return newTest;
}

// Пример 2: Завершение теста с уведомлением о результате
export async function submitTestWithNotification() {
  const result = await testsService.submitTestResults({
    test_id: 1,
    employee_id: 1,
    score: 85,
    max_score: 100,
    test_title: 'Информационная безопасность',
    user_answers: [],
  });
  
  // Автоматически отправит уведомление о результате
  return result;
}

// Пример 3: Назначение курса
export async function assignCourseExample() {
  const course = await coursesService.getCourse(1);
  
  if (course) {
    await coursesService.assignCourseToEmployees(course, [1, 2, 3]);
    // Отправит уведомления всем назначенным сотрудникам
  }
}

// Пример 4: Создание задания с уведомлениями
export async function createAssignmentWithNotifications() {
  await assignmentsNotifications.notifyNewAssignment({
    assignmentId: '123',
    title: 'Пройти курс по React',
    description: 'Изучите основы React и создайте тестовое приложение',
    type: 'course',
    priority: 'high',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Через неделю
    assigneeIds: [1, 2, 3],
    creatorName: 'Иванов И.И.',
  });
}

// Пример 5: Напоминание о приближающемся дедлайне
export async function sendDeadlineReminders() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  await assignmentsNotifications.notifyDeadlineApproaching(
    'Пройти тест по безопасности',
    1,
    tomorrow,
    '456'
  );
}

// Пример 6: Уведомление о завершении задания
export async function notifyTaskCompletion() {
  await assignmentsNotifications.notifyAssignmentCompleted(
    'Пройти курс по React',
    1, // ID сотрудника
    2, // ID руководителя
    '123'
  );
}

// Пример 7: Уведомление об оценке
export async function notifyGrade() {
  await assignmentsNotifications.notifyAssignmentGraded(
    'Тест по JavaScript',
    1,
    92,
    'Отличная работа! Все ответы правильные.',
    '789'
  );
}

// Пример 8: Массовая отправка уведомлений
export async function sendBulkNotifications() {
  const employeeIds = [1, 2, 3, 4, 5];
  
  for (const employeeId of employeeIds) {
    await notificationsService.createNotification({
      employee_id: employeeId,
      title: 'Важное объявление',
      message: 'Завтра в 10:00 состоится общее собрание. Присутствие обязательно.',
      type: 'warning',
      priority: 'urgent',
    });
  }
}

// Пример 9: Уведомление с метаданными и ссылкой
export async function createAdvancedNotification() {
  await notificationsService.createNotification({
    employee_id: 1,
    title: 'Новый материал для изучения',
    message: 'Добавлен новый учебный материал "TypeScript для начинающих"',
    type: 'info',
    priority: 'normal',
    link: '/knowledge',
    metadata: {
      material_id: 42,
      material_type: 'video',
      duration_minutes: 45,
      category: 'programming',
    },
  });
}

// Пример 10: Запланированные уведомления (для будущей реализации)
export async function scheduleNotification() {
  // Этот функционал можно реализовать через CRON или другой планировщик
  const courseStartDate = new Date('2025-11-01');
  
  // За день до начала курса
  const reminderDate = new Date(courseStartDate.getTime() - 24 * 60 * 60 * 1000);
  
  console.log(`Напоминание запланировано на ${reminderDate.toLocaleDateString()}`);
  
  // В реальном приложении здесь был бы вызов планировщика задач
}
