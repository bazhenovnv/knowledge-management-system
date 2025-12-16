import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import funcUrls from "../../backend/func2url.json";

interface MigrationResult {
  success: boolean;
  migrated?: Array<{ table: string; rows: number; status: string }>;
  errors?: Array<{ table: string; error: string }>;
  totalTables?: number;
  totalRows?: number;
  error?: string;
}

export default function DatabaseMigration() {
  const navigate = useNavigate();
  const [isMigrating, setIsMigrating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const testExternalConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const testUrl = funcUrls["test-db-connection"] || funcUrls["external-db"];
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          connection_string: 'EXTERNAL_DATABASE_URL'
        })
      });

      const data = await response.json();
      setTestResult(data);

      if (data.success) {
        toast.success("Внешняя БД доступна!");
      } else {
        toast.error("Ошибка подключения к внешней БД");
      }
    } catch (error) {
      toast.error("Ошибка тестирования");
      setTestResult({ success: false, error: String(error) });
    } finally {
      setIsTesting(false);
    }
  };

  const startMigration = async () => {
    if (!confirm("Начать перенос всех данных во внешнюю базу данных TimeWeb Cloud?")) {
      return;
    }

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const migrateUrl = funcUrls["migrate-to-external"] || funcUrls["external-db"];
      const response = await fetch(migrateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      setMigrationResult(data);

      if (data.success) {
        toast.success(`Перенесено ${data.totalTables} таблиц, ${data.totalRows} записей`);
      } else {
        toast.error("Ошибка миграции");
      }
    } catch (error) {
      toast.error("Ошибка выполнения миграции");
      setMigrationResult({ 
        success: false, 
        error: String(error) 
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/external-db')}
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={24} />
              Миграция данных в TimeWeb Cloud PostgreSQL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium">Перенос данных из внутренней БД во внешнюю TimeWeb Cloud</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                    <li>Создаются таблицы во внешней БД (если отсутствуют)</li>
                    <li>Копируются все данные из 26 таблиц</li>
                    <li>Сотрудники, тесты, материалы, инструкции</li>
                    <li>Настройки, уведомления, статистика</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={testExternalConnection}
                disabled={isTesting || isMigrating}
                variant="outline"
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="TestTube2" size={20} className="mr-2" />
                    Проверить внешнюю БД
                  </>
                )}
              </Button>

              <Button
                onClick={startMigration}
                disabled={isTesting || isMigrating}
                size="lg"
                className="flex-1"
              >
                {isMigrating ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Миграция в процессе...
                  </>
                ) : (
                  <>
                    <Icon name="Database" size={20} className="mr-2" />
                    Начать перенос данных
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={() => navigate('/health-check')}
              variant="outline"
              className="w-full"
            >
              <Icon name="Activity" size={16} className="mr-2" />
              Проверить работу всех сервисов
            </Button>

            {isMigrating && (
              <div className="space-y-2">
                <Progress value={50} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Переносим данные...
                </p>
              </div>
            )}

            {testResult && (
              <Card className={testResult.success ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon 
                      name={testResult.success ? "CheckCircle2" : "XCircle"} 
                      size={20} 
                      className={testResult.success ? "text-green-600" : "text-red-600"}
                    />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">
                        {testResult.success ? "Внешняя БД работает" : "Ошибка подключения"}
                      </h3>
                      {testResult.success && testResult.connection && (
                        <div className="text-sm space-y-1">
                          <p>База: <code className="font-mono">{testResult.connection.database}</code></p>
                          <p>Таблиц: {testResult.tablesCount}</p>
                        </div>
                      )}
                      {!testResult.success && (
                        <p className="text-sm text-red-700">{testResult.error}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {migrationResult && (
              <Card className={migrationResult.success ? "border-green-500" : "border-red-500"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon 
                      name={migrationResult.success ? "CheckCircle2" : "XCircle"} 
                      size={20}
                      className={migrationResult.success ? "text-green-600" : "text-red-600"}
                    />
                    {migrationResult.success ? "Миграция завершена" : "Ошибка миграции"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {migrationResult.success && migrationResult.migrated && (
                    <>
                      <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Всего таблиц</p>
                          <p className="text-2xl font-bold text-green-600">{migrationResult.totalTables}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Всего записей</p>
                          <p className="text-2xl font-bold text-green-600">{migrationResult.totalRows}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Перенесенные таблицы:</h4>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {migrationResult.migrated.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded">
                              <div className="flex items-center gap-2">
                                <Icon name="CheckCircle2" size={16} className="text-green-600" />
                                <code className="font-mono">{item.table}</code>
                              </div>
                              <span className="text-muted-foreground">{item.rows} записей</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {migrationResult.errors && migrationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-red-600">Ошибки:</h4>
                      {migrationResult.errors.map((err, idx) => (
                        <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded text-sm">
                          <p className="font-mono font-semibold">{err.table}</p>
                          <p className="text-red-700 dark:text-red-300 text-xs mt-1">{err.error}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!migrationResult.success && migrationResult.error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded">
                      <p className="text-sm text-red-700 dark:text-red-300">{migrationResult.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Что будет перенесено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                'employees', 'tests', 'test_questions', 'test_answers',
                'test_results', 'knowledge_materials', 'instructions',
                'instruction_categories', 'courses', 'notifications',
                'scheduled_notifications', 'user_sessions', 'domains',
                'attendance', 'support_messages', 'video_conferences'
              ].map(table => (
                <div key={table} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <Icon name="Table" size={16} className="text-blue-600" />
                  <code className="text-xs">{table}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}