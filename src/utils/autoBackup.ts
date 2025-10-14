import { database } from "./database";

const BACKUP_KEY = 'auto_backup_history';
const MAX_BACKUPS = 10;
const BACKUP_INTERVAL_HOURS = 24;

export interface AutoBackup {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  stats: {
    employees: number;
    tests: number;
    testResults: number;
    materials: number;
    notifications: number;
    assignments: number;
    total: number;
  };
  data: {
    employees: any[];
    tests: any[];
    testResults: any[];
    materials: any[];
    notifications: any[];
    assignments: any[];
    assignmentProgress: any[];
  };
}

export const autoBackupService = {
  getBackupHistory(): AutoBackup[] {
    try {
      const history = localStorage.getItem(BACKUP_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Ошибка чтения истории бэкапов:', error);
      return [];
    }
  },

  saveBackupHistory(backups: AutoBackup[]) {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Ошибка сохранения истории бэкапов:', error);
    }
  },

  shouldCreateBackup(): boolean {
    const history = this.getBackupHistory();
    if (history.length === 0) return true;

    const lastBackup = history[0];
    const lastBackupTime = new Date(lastBackup.timestamp).getTime();
    const now = Date.now();
    const hoursSinceLastBackup = (now - lastBackupTime) / (1000 * 60 * 60);

    return hoursSinceLastBackup >= BACKUP_INTERVAL_HOURS;
  },

  createAutoBackup(): AutoBackup | null {
    try {
      if (!this.shouldCreateBackup()) {
        console.log('Резервная копия уже создана за последние 24 часа');
        return null;
      }

      const employees = database.getEmployees();
      const tests = database.getTests();
      const testResults = database.getTestResults();
      const materials = database.getMaterials();
      const notifications = database.getNotifications();
      const assignments = database.getAssignments();
      const assignmentProgress = database.getAssignmentProgress();

      const now = new Date();
      const backup: AutoBackup = {
        id: `auto_${now.getTime()}`,
        timestamp: now.toISOString(),
        date: now.toLocaleDateString('ru-RU'),
        time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        stats: {
          employees: employees.length,
          tests: tests.length,
          testResults: testResults.length,
          materials: materials.length,
          notifications: notifications.length,
          assignments: assignments.length,
          total: employees.length + tests.length + testResults.length + materials.length + notifications.length + assignments.length
        },
        data: {
          employees,
          tests,
          testResults,
          materials,
          notifications,
          assignments,
          assignmentProgress
        }
      };

      const history = this.getBackupHistory();
      history.unshift(backup);

      if (history.length > MAX_BACKUPS) {
        history.splice(MAX_BACKUPS);
      }

      this.saveBackupHistory(history);
      
      console.log(`✅ Автоматическая резервная копия создана: ${backup.date} ${backup.time}`);
      return backup;
    } catch (error) {
      console.error('Ошибка создания автобэкапа:', error);
      return null;
    }
  },

  restoreBackup(backupId: string): boolean {
    try {
      const history = this.getBackupHistory();
      const backup = history.find(b => b.id === backupId);
      
      if (!backup) {
        console.error('Резервная копия не найдена');
        return false;
      }

      const { data } = backup;
      
      if (data.employees) localStorage.setItem('employees_db', JSON.stringify(data.employees));
      if (data.tests) localStorage.setItem('tests_db', JSON.stringify(data.tests));
      if (data.testResults) localStorage.setItem('test_results_db', JSON.stringify(data.testResults));
      if (data.materials) localStorage.setItem('materials_db', JSON.stringify(data.materials));
      if (data.notifications) localStorage.setItem('notifications_db', JSON.stringify(data.notifications));
      if (data.assignments) localStorage.setItem('assignments_db', JSON.stringify(data.assignments));
      if (data.assignmentProgress) localStorage.setItem('assignment_progress_db', JSON.stringify(data.assignmentProgress));

      console.log(`✅ Восстановлено из резервной копии: ${backup.date} ${backup.time}`);
      return true;
    } catch (error) {
      console.error('Ошибка восстановления из бэкапа:', error);
      return false;
    }
  },

  deleteBackup(backupId: string): boolean {
    try {
      const history = this.getBackupHistory();
      const filteredHistory = history.filter(b => b.id !== backupId);
      this.saveBackupHistory(filteredHistory);
      return true;
    } catch (error) {
      console.error('Ошибка удаления бэкапа:', error);
      return false;
    }
  },

  downloadBackup(backupId: string) {
    try {
      const history = this.getBackupHistory();
      const backup = history.find(b => b.id === backupId);
      
      if (!backup) {
        console.error('Резервная копия не найдена');
        return;
      }

      const exportData = {
        version: '1.0',
        exportDate: backup.timestamp,
        type: 'auto_backup',
        data: backup.data
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `auto_backup_${backup.date.replace(/\./g, '-')}_${backup.time.replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания бэкапа:', error);
    }
  },

  clearAllBackups() {
    try {
      localStorage.removeItem(BACKUP_KEY);
      console.log('✅ Все автоматические резервные копии удалены');
    } catch (error) {
      console.error('Ошибка очистки бэкапов:', error);
    }
  },

  getBackupSize(): string {
    try {
      const history = this.getBackupHistory();
      const historyStr = JSON.stringify(history);
      const bytes = new Blob([historyStr]).size;
      
      if (bytes < 1024) return `${bytes} Б`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
    } catch (error) {
      return '0 Б';
    }
  }
};

export const initializeAutoBackup = (userRole: string) => {
  if (userRole === 'admin') {
    const backup = autoBackupService.createAutoBackup();
    if (backup) {
      console.log('🔄 Автоматическая резервная копия создана при входе администратора');
    }
  }
};
