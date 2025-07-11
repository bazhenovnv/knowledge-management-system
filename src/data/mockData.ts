export const employees = [
  {
    name: "Иванов И.И.",
    department: "ИТ",
    position: "Разработчик",
    score: 4.2,
    status: "green",
    tests: 15,
    avgScore: 85,
  },
  {
    name: "Петрова А.С.",
    department: "Бухгалтерия",
    position: "Бухгалтер",
    score: 3.8,
    status: "yellow",
    tests: 12,
    avgScore: 78,
  },
  {
    name: "Сидоров В.М.",
    department: "HR",
    position: "HR-специалист",
    score: 4.5,
    status: "green",
    tests: 18,
    avgScore: 92,
  },
  {
    name: "Козлова Е.А.",
    department: "Маркетинг",
    position: "Маркетолог",
    score: 3.2,
    status: "red",
    tests: 8,
    avgScore: 65,
  },
  {
    name: "Морозов Д.С.",
    department: "ИТ",
    position: "Системный администратор",
    score: 4.0,
    status: "green",
    tests: 14,
    avgScore: 82,
  },
];

export const knowledgeBase = [
  {
    id: 1,
    title: "Основы React",
    description: "Изучение основных концепций React для начинающих",
    category: "Программирование",
    difficulty: "Начинающий",
    duration: "2 часа",
    rating: 4.8,
    enrollments: 234,
  },
  {
    id: 2,
    title: "TypeScript для разработчиков",
    description: "Глубокое изучение TypeScript и его применение",
    category: "Программирование",
    difficulty: "Средний",
    duration: "3 часа",
    rating: 4.9,
    enrollments: 189,
  },
  {
    id: 3,
    title: "Корпоративная культура",
    description: "Основы корпоративной этики и взаимодействия",
    category: "Мягкие навыки",
    difficulty: "Начинающий",
    duration: "1 час",
    rating: 4.3,
    enrollments: 567,
  },
  {
    id: 4,
    title: "Управление проектами",
    description: "Методики эффективного управления проектами",
    category: "Менеджмент",
    difficulty: "Продвинутый",
    duration: "4 часа",
    rating: 4.7,
    enrollments: 123,
  },
  {
    id: 5,
    title: "Информационная безопасность",
    description: "Защита данных и информационная безопасность",
    category: "Безопасность",
    difficulty: "Средний",
    duration: "2.5 часа",
    rating: 4.6,
    enrollments: 345,
  },
  {
    id: 6,
    title: "Дизайн интерфейсов",
    description: "Принципы создания удобных пользовательских интерфейсов",
    category: "Дизайн",
    difficulty: "Средний",
    duration: "3.5 часа",
    rating: 4.5,
    enrollments: 278,
  },
];

export const chartData = [
  { month: "Янв", tests: 120, employees: 85 },
  { month: "Фев", tests: 135, employees: 88 },
  { month: "Мар", tests: 148, employees: 92 },
  { month: "Апр", tests: 162, employees: 95 },
  { month: "Май", tests: 178, employees: 98 },
  { month: "Июн", tests: 195, employees: 102 },
];

export const pieData = [
  { name: "Программирование", value: 35, color: "#3B82F6" },
  { name: "Дизайн", value: 25, color: "#10B981" },
  { name: "Маркетинг", value: 20, color: "#8B5CF6" },
  { name: "Менеджмент", value: 15, color: "#F59E0B" },
  { name: "Другое", value: 5, color: "#EF4444" },
];

export const chartConfig = {
  tests: {
    label: "Тесты",
    color: "#3B82F6",
  },
  employees: {
    label: "Сотрудники",
    color: "#10B981",
  },
};
