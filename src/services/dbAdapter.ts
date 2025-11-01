// Адаптер для обратной совместимости старого API с новым externalDbService
import { externalDb } from './externalDbService';

// Эмулируем старый формат ответа
interface LegacyResponse<T> {
  data?: T;
  count?: number;
  error?: string;
}

// Эмулируем старый API для совместимости со всеми компонентами
export const legacyDbApi = {
  // Базовый URL для совместимости
  baseUrl: 'internal',

  // Обработка старых GET/POST запросов
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    try {
      // Парсим query параметры из URL
      const urlObj = new URL(url, 'http://localhost');
      const params = new URLSearchParams(urlObj.search);
      let action = params.get('action');
      const table = params.get('table');
      const id = params.get('id');

      // Если POST запрос, парсим body
      if (options?.method === 'POST' && options.body) {
        try {
          const bodyData = JSON.parse(options.body as string);
          if (bodyData.action) {
            action = bodyData.action;
          }
        } catch (e) {
          // Если не JSON, игнорируем
        }
      }

      let result: any;

      // Обработка разных actions
      if (action === 'list' && table) {
        const rows = await externalDb.list(table, { limit: 1000 });
        result = { data: rows, count: rows.length };
      } else if (action === 'get' && table && id) {
        const rows = await externalDb.query(
          `SELECT * FROM t_p47619579_knowledge_management.${table} WHERE id = ${parseInt(id)}`
        );
        result = { data: rows[0] || null };
      } else if (action === 'stats') {
        const stats = await externalDb.stats();
        result = { stats };
      } else if (action === 'get_notifications') {
        const employeeId = params.get('employee_id');
        const notifications = await externalDb.getNotifications(
          employeeId ? parseInt(employeeId) : undefined
        );
        result = { data: notifications };
      } else if (action === 'get_unread_count') {
        const employeeId = params.get('employee_id');
        const notifications = await externalDb.getNotifications(
          employeeId ? parseInt(employeeId) : undefined
        );
        const unreadCount = notifications.filter((n: any) => !n.is_read).length;
        result = { data: { count: unreadCount } };
      } else {
        result = { error: `Unsupported action: ${action}` };
      }

      // Возвращаем Response-подобный объект
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Legacy API adapter error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
};