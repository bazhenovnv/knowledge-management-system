// Простые данные для восстановления работоспособности
export interface SimpleEmployee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  position: string;
  role: 'admin' | 'teacher' | 'employee';
  is_active: boolean;
}

export const getDefaultEmployees = (): SimpleEmployee[] => [
  {
    id: 1,
    full_name: 'Администратор Системы',
    email: 'admin@company.com',
    department: 'IT',
    position: 'Администратор',
    role: 'admin',
    is_active: true
  },
  {
    id: 2,
    full_name: 'Преподаватель Курсов',
    email: 'teacher@company.com',
    department: 'Обучение',
    position: 'Преподаватель',
    role: 'teacher',
    is_active: true
  },
  {
    id: 3,
    full_name: 'Иванов Иван Иванович',
    email: 'ivanov@company.com',
    department: 'Отдел разработки',
    position: 'Разработчик',
    role: 'employee',
    is_active: true
  }
];

export const getCurrentUser = (): SimpleEmployee => ({
  id: 1,
  full_name: 'Администратор Системы',
  email: 'admin@company.com',
  department: 'IT',
  position: 'Администратор',
  role: 'admin',
  is_active: true
});