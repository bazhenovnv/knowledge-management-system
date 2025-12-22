import { externalDb } from './externalDbService';

interface ChangeCheckResult {
  hasChanges: boolean;
  lastUpdateTime: string;
  changedTables: string[];
}

interface RefreshListener {
  id: string;
  callback: () => void | Promise<void>;
}

class AutoRefreshService {
  private checkInterval = 30000; // 30 секунд
  private timerId: number | null = null;
  private isRunning = false;
  private listeners: RefreshListener[] = [];
  private lastKnownUpdates: Record<string, string> = {};
  private tables = ['employees', 'tests', 'test_results', 'courses', 'notifications', 'knowledge_materials'];

  start() {
    if (this.isRunning) {
      console.log('AutoRefreshService уже запущен');
      return;
    }

    console.log('AutoRefreshService запущен, проверка каждые 30 секунд');
    this.isRunning = true;
    this.checkForUpdates();
    this.timerId = window.setInterval(() => this.checkForUpdates(), this.checkInterval);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    console.log('AutoRefreshService остановлен');
  }

  subscribe(id: string, callback: () => void | Promise<void>) {
    this.listeners.push({ id, callback });
    console.log(`Подписчик ${id} зарегистрирован`);
  }

  unsubscribe(id: string) {
    this.listeners = this.listeners.filter(l => l.id !== id);
    console.log(`Подписчик ${id} отписан`);
  }

  private async checkForUpdates() {
    try {
      const result = await this.detectChanges();
      
      if (result.hasChanges) {
        console.log('🔄 Обнаружены изменения в таблицах:', result.changedTables);
        await this.notifyListeners();
      } else {
        console.log('✓ Изменений не обнаружено');
      }
    } catch (error) {
      console.error('Ошибка проверки обновлений:', error);
    }
  }

  private async detectChanges(): Promise<ChangeCheckResult> {
    try {
      const changedTables: string[] = [];
      
      // Фиксированные запросы с проверкой на NULL (версия 2.2)
      const tableQueries: Record<string, string> = {
        'employees': 'SELECT MAX(updated_at) as last_update FROM t_p47619579_knowledge_management.employees WHERE updated_at IS NOT NULL',
        'tests': 'SELECT MAX(updated_at) as last_update FROM t_p47619579_knowledge_management.tests WHERE updated_at IS NOT NULL',
        'test_results': 'SELECT MAX(completed_at) as last_update FROM t_p47619579_knowledge_management.test_results WHERE completed_at IS NOT NULL',
        'courses': 'SELECT MAX(updated_at) as last_update FROM t_p47619579_knowledge_management.courses WHERE updated_at IS NOT NULL',
        'notifications': 'SELECT MAX(created_at) as last_update FROM t_p47619579_knowledge_management.notifications WHERE created_at IS NOT NULL',
        'knowledge_materials': 'SELECT MAX(updated_at) as last_update FROM t_p47619579_knowledge_management.knowledge_materials WHERE updated_at IS NOT NULL'
      };
      
      for (const table of this.tables) {
        try {
          const query = tableQueries[table];
          if (!query) continue;
          
          const rows = await externalDb.query(query);
          
          if (rows && rows.length > 0 && rows[0].last_update) {
            const lastUpdate = rows[0].last_update;
            const lastUpdateStr = new Date(lastUpdate).toISOString();
            
            if (!this.lastKnownUpdates[table] || this.lastKnownUpdates[table] !== lastUpdateStr) {
              changedTables.push(table);
              this.lastKnownUpdates[table] = lastUpdateStr;
            }
          }
        } catch (tableError) {
          // Игнорируем ошибки для недоступных таблиц
        }
      }

      return {
        hasChanges: changedTables.length > 0,
        lastUpdateTime: new Date().toISOString(),
        changedTables
      };
    } catch (error) {
      console.error('Ошибка проверки изменений:', error);
      return {
        hasChanges: false,
        lastUpdateTime: new Date().toISOString(),
        changedTables: []
      };
    }
  }

  private async notifyListeners() {
    console.log(`Уведомляем ${this.listeners.length} подписчиков об обновлении`);
    
    for (const listener of this.listeners) {
      try {
        await listener.callback();
      } catch (error) {
        console.error(`Ошибка у подписчика ${listener.id}:`, error);
      }
    }
  }

  async triggerManualRefresh() {
    console.log('🔄 Запущено ручное обновление всех служб');
    await this.notifyListeners();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      listenersCount: this.listeners.length,
      checkInterval: this.checkInterval,
      lastKnownUpdates: { ...this.lastKnownUpdates }
    };
  }
}

export const autoRefreshService = new AutoRefreshService();