# Система уведомлений

## Обзор

Система уведомлений интегрирована с PostgreSQL и автоматически отправляет уведомления сотрудникам о важных событиях.

## Автоматические уведомления

### 1. Уведомления о тестах

#### При создании теста
- **Кто получает:** Назначенные сотрудники
- **Тип:** `assignment`
- **Приоритет:** `high`
- **Содержание:** Название теста, описание, ссылка на прохождение

```typescript
testsService.createTest({
  title: 'Название теста',
  assignedEmployees: [1, 2, 3] // IDs сотрудников
});
```

#### При завершении теста
- **Кто получает:** Сотрудник, прошедший тест
- **Тип:** `success` (если сдан) или `warning` (если не сдан)
- **Приоритет:** `normal` (сдан) или `high` (не сдан)
- **Содержание:** Результат теста, процент правильных ответов

```typescript
testsService.submitTestResults({
  test_id: 1,
  employee_id: 1,
  test_title: 'Название теста'
});
```

### 2. Уведомления о курсах

#### При назначении курса
- **Кто получает:** Записанные сотрудники
- **Тип:** `info`
- **Приоритет:** `normal`
- **Содержание:** Название курса, описание, дата начала

```typescript
coursesService.assignCourseToEmployees(course, [1, 2, 3]);
```

#### При начале курса
- **Кто получает:** Записанные сотрудники
- **Тип:** `info`
- **Приоритет:** `high`
- **Содержание:** Напоминание о начале курса

```typescript
coursesService.notifyCourseStart(course, [1, 2, 3]);
```

#### При завершении курса
- **Кто получает:** Сотрудник
- **Тип:** `success`
- **Приоритет:** `normal`
- **Содержание:** Поздравление, информация о сертификате

```typescript
coursesService.notifyCourseCompletion(course, employeeId, hasCertificate);
```

### 3. Уведомления о заданиях

#### При создании задания
- **Кто получает:** Назначенные сотрудники
- **Тип:** `assignment`
- **Приоритет:** Зависит от приоритета задания
- **Содержание:** Название, описание, дедлайн

```typescript
assignmentsNotifications.notifyNewAssignment({
  assignmentId: '123',
  title: 'Название задания',
  description: 'Описание',
  type: 'test',
  priority: 'high',
  deadline: new Date(),
  assigneeIds: [1, 2, 3]
});
```

#### Напоминание о дедлайне
- **Когда:** За 1-3 дня до дедлайна
- **Тип:** `warning`
- **Приоритет:** `urgent` (1 день) или `high` (2-3 дня)

```typescript
assignmentsNotifications.notifyDeadlineApproaching(
  'Название задания',
  employeeId,
  deadline,
  assignmentId
);
```

#### При пропуске дедлайна
- **Тип:** `error`
- **Приоритет:** `urgent`

```typescript
assignmentsNotifications.notifyDeadlineMissed(
  'Название задания',
  employeeId,
  assignmentId
);
```

#### При завершении задания
- **Кто получает:** Сотрудник + руководитель
- **Тип:** `success` (сотрудник), `info` (руководитель)

```typescript
assignmentsNotifications.notifyAssignmentCompleted(
  'Название задания',
  employeeId,
  supervisorId,
  assignmentId
);
```

#### При оценке задания
- **Кто получает:** Сотрудник
- **Тип:** `success` (сдано) или `warning` (доработка)

```typescript
assignmentsNotifications.notifyAssignmentGraded(
  'Название задания',
  employeeId,
  grade,
  feedback,
  assignmentId
);
```

## Компоненты

### NotificationBell
Колокольчик с счётчиком непрочитанных уведомлений

```tsx
<NotificationBell employeeId={1} />
```

### NotificationList
Список уведомлений с возможностью отметить как прочитанное

```tsx
<NotificationList 
  employeeId={1} 
  onNotificationsRead={() => {}}
/>
```

## API методы

### Получить уведомления
```typescript
GET /database?action=get_notifications&employee_id=1
```

### Получить количество непрочитанных
```typescript
GET /database?action=get_unread_count&employee_id=1
```

### Создать уведомление
```typescript
POST /database?action=create_notification
{
  employee_id: 1,
  title: 'Заголовок',
  message: 'Сообщение',
  type: 'info',
  priority: 'normal',
  link: '/tests'
}
```

### Отметить как прочитанное
```typescript
POST /database?action=mark_read
{
  notification_id: 123
}
```

### Отметить все как прочитанные
```typescript
POST /database?action=mark_all_read
{
  employee_id: 1
}
```

## Типы уведомлений

- `info` - Информационное (синий)
- `success` - Успех (зелёный)
- `warning` - Предупреждение (жёлтый)
- `error` - Ошибка (красный)
- `assignment` - Задание (синий)

## Приоритеты

- `low` - Низкий (обычный текст)
- `normal` - Обычный (обычный текст)
- `high` - Высокий (оранжевая полоска)
- `urgent` - Срочный (красная полоска)

## База данных

Таблица `notifications`:
- `id` - ID уведомления
- `employee_id` - ID сотрудника (foreign key)
- `title` - Заголовок
- `message` - Текст сообщения
- `type` - Тип уведомления
- `priority` - Приоритет
- `is_read` - Прочитано (boolean)
- `link` - Ссылка для перехода
- `metadata` - JSON с дополнительными данными
- `created_at` - Дата создания
- `read_at` - Дата прочтения
