import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import { toast } from "sonner";
import { autoBackupService, AutoBackup } from "@/utils/autoBackup";
import { Badge } from "@/components/ui/badge";
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

export default function DatabaseSettings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [backupHistory, setBackupHistory] = useState<AutoBackup[]>([]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<AutoBackup | null>(null);

  useEffect(() => {
    loadBackupHistory();
  }, []);

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

        // Сохраняем данные в localStorage
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

  return (
    <div className="space-y-6">
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

          {/* Статистика БД */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика базы данных
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Users" size={20} className="text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{stats.employees}</span>
                </div>
                <p className="text-sm text-gray-600">Сотрудников</p>
              </div>

              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="FileText" size={20} className="text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{stats.tests}</span>
                </div>
                <p className="text-sm text-gray-600">Тестов</p>
              </div>

              <div className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="CheckCircle" size={20} className="text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{stats.testResults}</span>
                </div>
                <p className="text-sm text-gray-600">Результатов</p>
              </div>

              <div className="p-4 border rounded-lg bg-orange-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="BookOpen" size={20} className="text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">{stats.materials}</span>
                </div>
                <p className="text-sm text-gray-600">Материалов</p>
              </div>

              <div className="p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="Bell" size={20} className="text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-600">{stats.notifications}</span>
                </div>
                <p className="text-sm text-gray-600">Уведомлений</p>
              </div>

              <div className="p-4 border rounded-lg bg-pink-50">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="ClipboardList" size={20} className="text-pink-600" />
                  <span className="text-2xl font-bold text-pink-600">{stats.assignments}</span>
                </div>
                <p className="text-sm text-gray-600">Заданий</p>
              </div>
            </div>

            <div className="mt-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">Всего записей в БД</p>
                  <p className="text-sm text-blue-700">Общее количество данных</p>
                </div>
                <span className="text-4xl font-bold text-blue-600">{stats.total}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Экспорт */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт базы данных
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Создайте резервную копию всех данных в формате JSON. Файл можно импортировать позже для восстановления.
            </p>
            <Button 
              onClick={exportDatabase} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспортировать базу данных
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Импорт */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Icon name="Upload" size={18} className="mr-2" />
              Импорт базы данных
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Восстановите данные из ранее созданной резервной копии. <strong>Внимание:</strong> это заменит все текущие данные!
            </p>
            <Alert className="mb-3 border-orange-200 bg-orange-50">
              <Icon name="AlertTriangle" size={16} className="text-orange-600" />
              <AlertDescription className="text-orange-800">
                Импорт заменит все текущие данные. Рекомендуется сначала создать экспорт.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={importDatabase} 
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Импорт...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Импортировать базу данных
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Автоматические резервные копии */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Icon name="History" size={18} className="mr-2" />
              Автоматические резервные копии
            </h3>
            <Alert className="mb-3 border-blue-200 bg-blue-50">
              <Icon name="Info" size={16} className="text-blue-600" />
              <AlertDescription className="text-blue-800">
                Система автоматически создаёт резервную копию при каждом входе администратора (не чаще 1 раза в 24 часа). Хранятся последние {backupHistory.length} из 10 копий. Размер: {autoBackupService.getBackupSize()}
              </AlertDescription>
            </Alert>

            {backupHistory.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <Icon name="Database" size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Автоматические резервные копии ещё не создавались</p>
                <p className="text-sm text-gray-500 mt-1">Они будут созданы при следующем входе</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {backupHistory.map((backup, index) => (
                  <div key={backup.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Database" size={16} className="text-blue-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{backup.date} в {backup.time}</span>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">Последняя</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {backup.stats.total} записей: {backup.stats.employees} сотр., {backup.stats.tests} тест., {backup.stats.testResults} рез.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => autoBackupService.downloadBackup(backup.id)}
                        >
                          <Icon name="Download" size={14} className="mr-1" />
                          Скачать
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreDialog(true);
                          }}
                        >
                          <Icon name="RotateCcw" size={14} className="mr-1" />
                          Восстановить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Удалить эту резервную копию?')) {
                              autoBackupService.deleteBackup(backup.id);
                              loadBackupHistory();
                              toast.success('Резервная копия удалена');
                            }
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {backupHistory.length > 0 && (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const backup = autoBackupService.createAutoBackup();
                    if (backup) {
                      loadBackupHistory();
                      toast.success('Резервная копия создана!');
                    } else {
                      toast.info('Резервная копия уже создавалась за последние 24 часа');
                    }
                  }}
                  className="flex-1"
                >
                  <Icon name="Plus" size={14} className="mr-1" />
                  Создать копию сейчас
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Удалить все ${backupHistory.length} автоматических резервных копий?`)) {
                      autoBackupService.clearAllBackups();
                      loadBackupHistory();
                      toast.success('Все автоматические копии удалены');
                    }
                  }}
                  className="flex-1"
                >
                  <Icon name="Trash2" size={14} className="mr-1" />
                  Очистить историю
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Опасная зона */}
          <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-red-700">
              <Icon name="AlertTriangle" size={18} className="mr-2" />
              Опасная зона
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-red-900 mb-2">Очистить базу данных</p>
                <p className="text-sm text-red-700 mb-2">
                  Удалить все данные без возможности восстановления. База данных станет пустой.
                </p>
                <Button 
                  onClick={() => setShowClearDialog(true)}
                  variant="destructive"
                  className="w-full border-[0.25px] border-black"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Очистить базу данных
                </Button>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-red-900 mb-2">Сбросить к демо-данным</p>
                <p className="text-sm text-red-700 mb-2">
                  Удалить все данные и восстановить демо-данные по умолчанию при следующей загрузке.
                </p>
                <Button 
                  onClick={() => setShowResetDialog(true)}
                  variant="destructive"
                  className="w-full border-[0.25px] border-black"
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сбросить к демо-данным
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения очистки */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <Icon name="AlertTriangle" size={20} className="mr-2" />
              Подтвердите очистку базы данных
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все данные будут безвозвратно удалены:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{stats.employees} сотрудников</li>
                <li>{stats.tests} тестов</li>
                <li>{stats.testResults} результатов</li>
                <li>{stats.materials} материалов</li>
                <li>{stats.notifications} уведомлений</li>
                <li>{stats.assignments} заданий</li>
              </ul>
              <p className="mt-3 font-semibold">Вы уверены?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={clearDatabase} className="bg-red-600 hover:bg-red-700">
              Да, очистить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения сброса */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Подтвердите сброс к демо-данным
            </AlertDialogTitle>
            <AlertDialogDescription>
              Все текущие данные будут удалены, и при следующей загрузке система создаст новые демо-данные.
              <p className="mt-3 font-semibold">Это удалит {stats.total} записей. Продолжить?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDemo} className="bg-red-600 hover:bg-red-700">
              Да, сбросить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения восстановления */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-blue-600">
              <Icon name="RotateCcw" size={20} className="mr-2" />
              Восстановить из резервной копии?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedBackup && (
                <>
                  <p>Вы собираетесь восстановить данные из резервной копии:</p>
                  <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold">{selectedBackup.date} в {selectedBackup.time}</p>
                    <p className="text-sm mt-1">
                      {selectedBackup.stats.total} записей ({selectedBackup.stats.employees} сотр., {selectedBackup.stats.tests} тест., {selectedBackup.stats.testResults} рез.)
                    </p>
                  </div>
                  <p className="mt-3 font-semibold text-orange-600">
                    ⚠️ Все текущие данные будут заменены. Продолжить?
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedBackup && autoBackupService.restoreBackup(selectedBackup.id)) {
                  toast.success('Данные восстановлены! Страница будет перезагружена.');
                  setTimeout(() => window.location.reload(), 1500);
                } else {
                  toast.error('Ошибка восстановления данных');
                }
                setShowRestoreDialog(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Да, восстановить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}