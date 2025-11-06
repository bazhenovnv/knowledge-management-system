import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import { toast } from "sonner";
import { autoBackupService, AutoBackup } from "@/utils/autoBackup";
import { externalDb } from "@/services/externalDbService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DatabaseConnectionCard from "./DatabaseConnectionCard";
import DatabaseStatsSection from "./DatabaseStatsSection";
import DatabaseActionsSection from "./DatabaseActionsSection";
import DatabaseBackupSection from "./DatabaseBackupSection";

export default function DatabaseSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [backupHistory, setBackupHistory] = useState<AutoBackup[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<AutoBackup | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | null>(null);
  const [dbStats, setDbStats] = useState<{ totalTables: number; totalRecords: number } | null>(null);

  useEffect(() => {
    loadBackupHistory();
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    setIsCheckingConnection(true);
    setConnectionStatus('checking');
    try {
      const stats = await externalDb.stats('public');
      setDbStats({
        totalTables: stats.totalTables,
        totalRecords: stats.totalRecords
      });
      setConnectionStatus('connected');
      toast.success('Подключение к базе данных установлено!', {
        description: `Найдено таблиц: ${stats.totalTables}, записей: ${stats.totalRecords}`
      });
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('disconnected');
      toast.error('Не удалось подключиться к базе данных', {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const loadBackupHistory = () => {
    const history = autoBackupService.getBackupHistory();
    setBackupHistory(history);
  };

  const getDbStats = async () => {
    const employees = database.getEmployees();
    const tests = database.getTests();
    const testResults = database.getTestResults();
    const materials = await database.getKnowledgeMaterials();
    const notifications = database.getNotifications();
    const assignments = database.getAssignments();

    return {
      employees: employees.length,
      tests: tests.length,
      testResults: testResults.length,
      materials: materials.length,
      notifications: notifications.length,
      assignments: assignments.length,
      total: employees.length + tests.length + testResults.length + materials.length + notifications.length + assignments.length
    };
  };

  const [stats, setStats] = React.useState({ 
    employees: 0, 
    tests: 0, 
    testResults: 0, 
    materials: 0, 
    notifications: 0, 
    assignments: 0, 
    total: 0 
  });

  React.useEffect(() => {
    getDbStats().then(setStats);
  }, []);

  const exportDatabase = async () => {
    setIsExporting(true);
    try {
      const materials = await database.getKnowledgeMaterials();
      const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          employees: database.getEmployees(),
          tests: database.getTests(),
          testResults: database.getTestResults(),
          materials: materials,
          notifications: database.getNotifications(),
          assignments: database.getAssignments(),
          assignmentProgress: database.getAssignmentProgress()
        }
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('База данных успешно экспортирована!');
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      toast.error('Ошибка при экспорте базы данных');
    } finally {
      setIsExporting(false);
    }
  };

  const importDatabase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const importedData = JSON.parse(text);

        if (!importedData.data || !importedData.version) {
          throw new Error('Неверный формат файла');
        }

        const { data } = importedData;
        
        if (data.employees) localStorage.setItem('employees_db', JSON.stringify(data.employees));
        if (data.tests) localStorage.setItem('tests_db', JSON.stringify(data.tests));
        if (data.testResults) localStorage.setItem('test_results_db', JSON.stringify(data.testResults));
        if (data.materials) localStorage.setItem('materials_db', JSON.stringify(data.materials));
        if (data.notifications) localStorage.setItem('notifications_db', JSON.stringify(data.notifications));
        if (data.assignments) localStorage.setItem('assignments_db', JSON.stringify(data.assignments));
        if (data.assignmentProgress) localStorage.setItem('assignment_progress_db', JSON.stringify(data.assignmentProgress));

        toast.success(`База данных импортирована! Импортировано: ${Object.keys(data).length} таблиц`);
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Ошибка импорта:', error);
        toast.error('Ошибка при импорте базы данных. Проверьте формат файла.');
      } finally {
        setIsImporting(false);
      }
    };

    input.click();
  };

  const clearDatabase = () => {
    try {
      localStorage.removeItem('employees_db');
      localStorage.removeItem('tests_db');
      localStorage.removeItem('test_results_db');
      localStorage.removeItem('materials_db');
      localStorage.removeItem('notifications_db');
      localStorage.removeItem('assignments_db');
      localStorage.removeItem('assignment_progress_db');
      
      toast.success('База данных очищена!');
      setShowClearDialog(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Ошибка очистки:', error);
      toast.error('Ошибка при очистке базы данных');
    }
  };

  const resetToDemo = () => {
    try {
      clearDatabase();
      toast.success('База данных сброшена! Демо-данные будут созданы при следующей загрузке.');
      setShowResetDialog(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Ошибка сброса:', error);
      toast.error('Ошибка при сбросе базы данных');
    }
  };

  const restoreBackup = () => {
    if (!selectedBackup) return;
    
    try {
      autoBackupService.restoreBackup(selectedBackup.id);
      toast.success('Резервная копия восстановлена!');
      setShowRestoreDialog(false);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Ошибка восстановления:', error);
      toast.error('Ошибка при восстановлении резервной копии');
    }
  };

  return (
    <div className="space-y-6">
      <DatabaseConnectionCard
        connectionStatus={connectionStatus}
        isCheckingConnection={isCheckingConnection}
        dbStats={dbStats}
        onCheckConnection={checkDatabaseConnection}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon name="Database" size={20} className="mr-2 text-blue-600" />
            Управление базой данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Icon name="Info" size={16} />
            <AlertDescription>
              Данные системы хранятся локально в браузере (localStorage). Используйте экспорт для создания резервных копий.
            </AlertDescription>
          </Alert>

          <DatabaseStatsSection stats={stats} />

          <Separator />

          <DatabaseActionsSection
            isExporting={isExporting}
            isImporting={isImporting}
            onExport={exportDatabase}
            onImport={importDatabase}
            onShowClearDialog={() => setShowClearDialog(true)}
            onShowResetDialog={() => setShowResetDialog(true)}
          />

          <Separator />

          <DatabaseBackupSection
            backupHistory={backupHistory}
            onLoadBackupHistory={loadBackupHistory}
            onSelectBackup={setSelectedBackup}
            onShowRestoreDialog={() => setShowRestoreDialog(true)}
          />
        </CardContent>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите очистку базы данных</AlertDialogTitle>
            <AlertDialogDescription>
              Все данные будут удалены без возможности восстановления. Рекомендуется создать резервную копию перед очисткой.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={clearDatabase} className="bg-red-600 hover:bg-red-700">
              Очистить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите сброс к демо-данным</AlertDialogTitle>
            <AlertDialogDescription>
              Текущие данные будут удалены и заменены демонстрационными. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDemo} className="bg-orange-600 hover:bg-orange-700">
              Сбросить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Восстановить резервную копию?</AlertDialogTitle>
            <AlertDialogDescription>
              Текущие данные будут заменены данными из резервной копии от {selectedBackup?.date} {selectedBackup?.time}. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={restoreBackup}>
              Восстановить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
