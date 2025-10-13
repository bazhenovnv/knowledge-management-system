export const DEFAULT_DEPARTMENTS = [
  "1С",
  "Партнерка",
  "ЦТО",
  "Сервис",
  "Крупные клиенты",
  "Отдел заявок",
  "Отдел сопровождения",
  "HoReCa",
  "Отдел Тинькофф",
  "Отдел ФН",
  "Логистика",
  "Тех. поддержка",
  "Отдел маркетинга",
  "Отдел маркетплейсы"
];

export const DEFAULT_POSITIONS = [
  "Разработчик",
  "Системный администратор",
  "Аналитик",
  "Менеджер",
  "Специалист",
  "Консультант",
  "Инженер",
  "Бухгалтер",
  "HR-специалист",
  "Маркетолог",
  "Менеджер по продажам",
  "Логист",
  "Охранник",
  "Юрист",
  "Директор",
  "Заместитель директора",
  "Руководитель отдела"
];

export const getDepartments = (): string[] => {
  const saved = localStorage.getItem('custom_departments');
  return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
};

export const getPositions = (): string[] => {
  const saved = localStorage.getItem('custom_positions');
  return saved ? JSON.parse(saved) : DEFAULT_POSITIONS;
};

export const DEPARTMENTS = getDepartments();
export const POSITIONS = getPositions();

export type Department = string;
export type Position = string;