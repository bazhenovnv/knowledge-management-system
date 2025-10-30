import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { migrateLocalStorageToPostgres, clearLocalStorageAfterMigration } from '@/utils/migrateToPostgres';

export const MigrationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const handleMigration = async () => {
    setIsMigrating(true);
    setProgress(0);
    
    try {
      toast.info('Начинаем миграцию данных...', {
        description: 'Переносим данные из localStorage в PostgreSQL'
      });

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await migrateLocalStorageToPostgres();
      
      clearInterval(progressInterval);
      setProgress(100);
      setMigrationResult(result);

      if (result.success) {
        toast.success('Миграция завершена успешно!', {
          description: `Перенесено: ${result.migratedEmployees} сотрудников, ${result.migratedTests} тестов`
        });
      } else {
        toast.error('Миграция завершена с ошибками', {
          description: `Ошибок: ${result.errors.length}`
        });
      }
    } catch (error) {
      toast.error('Ошибка миграции', {
        description: String(error)
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClearLocalStorage = () => {
    clearLocalStorageAfterMigration();
    toast.success('localStorage очищен', {
      description: 'Все локальные данные удалены'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={24} className="text-blue-600" />
              Миграция в PostgreSQL
            </CardTitle>
            <CardDescription>
              Перенести данные из localStorage в облачную базу данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Icon name="ArrowRight" size={16} className="mr-2" />
              Начать миграцию
            </Button>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Миграция данных в PostgreSQL</DialogTitle>
          <DialogDescription>
            Перенос данных из локального хранилища браузера в облачную базу данных
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!migrationResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Что будет перенесено:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-blue-600" />
                    <span>Сотрудники (employees)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="FileText" size={16} className="text-green-600" />
                    <span>Тесты (tests)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="BarChart" size={16} className="text-purple-600" />
                    <span>Результаты тестов (test_results)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Bell" size={16} className="text-orange-600" />
                    <span>Уведомления (notifications)</span>
                  </div>
                </CardContent>
              </Card>

              {isMigrating ? (
                <div className="space-y-3">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    Миграция в процессе... {progress}%
                  </p>
                  <div className="flex items-center justify-center">
                    <Icon name="Loader2" size={32} className="animate-spin text-blue-600" />
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleMigration}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
                  size="lg"
                >
                  <Icon name="Database" size={20} className="mr-2" />
                  Начать миграцию
                </Button>
              )}
            </>
          )}

          {migrationResult && (
            <Card className={migrationResult.success ? 'border-green-500' : 'border-orange-500'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {migrationResult.success ? (
                    <>
                      <Icon name="CheckCircle" size={24} className="text-green-600" />
                      Миграция завершена успешно!
                    </>
                  ) : (
                    <>
                      <Icon name="AlertTriangle" size={24} className="text-orange-600" />
                      Миграция завершена с ошибками
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {migrationResult.migratedEmployees}
                    </div>
                    <div className="text-sm text-gray-600">Сотрудников</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {migrationResult.migratedTests}
                    </div>
                    <div className="text-sm text-gray-600">Тестов</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {migrationResult.migratedResults}
                    </div>
                    <div className="text-sm text-gray-600">Результатов</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">
                      {migrationResult.migratedNotifications}
                    </div>
                    <div className="text-sm text-gray-600">Уведомлений</div>
                  </div>
                </div>

                {migrationResult.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-semibold text-red-700 mb-2">
                      Ошибки ({migrationResult.errors.length}):
                    </div>
                    <ul className="text-sm text-red-600 space-y-1 max-h-40 overflow-y-auto">
                      {migrationResult.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setMigrationResult(null);
                      setProgress(0);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Закрыть
                  </Button>
                  <Button 
                    onClick={handleClearLocalStorage}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить localStorage
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MigrationButton;