// Утилиты общего назначения

/**
 * Генерирует уникальный строковый идентификатор
 * Использует комбинацию timestamp и случайного числа для обеспечения уникальности
 * @returns Уникальный строковый идентификатор
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${randomStr}`;
};

/**
 * Генерирует числовой идентификатор на основе timestamp
 * @returns Числовой идентификатор
 */
export const generateNumericId = (): number => {
  return Date.now();
};

/**
 * Генерирует короткий уникальный идентификатор
 * @returns Короткий строковый идентификатор (8 символов)
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 8);
};

/**
 * Генерирует UUID v4
 * @returns UUID строка
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};