import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import funcUrls from "../../../backend/func2url.json";

interface ExternalDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connectionString: string) => Promise<void>;
}

export const ExternalDatabaseModal = ({
  isOpen,
  onClose,
  onSave,
}: ExternalDatabaseModalProps) => {
  const [connectionString, setConnectionString] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    if (!connectionString.trim()) {
      toast.error("Введите строку подключения");
      return;
    }

    if (!connectionString.includes("postgresql://") && !connectionString.includes("postgres://")) {
      toast.error("Неверный формат строки подключения PostgreSQL");
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);

      const response = await fetch(funcUrls["test-db-connection"], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: connectionString })
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(data);
        toast.success("Подключение успешно!");
      } else {
        setTestResult({ success: false, error: data.error });
        toast.error("Ошибка подключения");
      }
    } catch (error) {
      setTestResult({ success: false, error: String(error) });
      toast.error("Ошибка тестирования подключения");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!connectionString.trim()) {
      toast.error("Введите строку подключения");
      return;
    }

    if (!connectionString.includes("postgresql://") && !connectionString.includes("postgres://")) {
      toast.error("Неверный формат строки подключения PostgreSQL");
      return;
    }

    try {
      setIsSaving(true);
      await testConnection();
      await onSave(connectionString);
      toast.success("База данных подключена");
      setConnectionString("");
      setTestResult(null);
      onClose();
    } catch (error) {
      toast.error("Ошибка подключения к базе данных");
      console.error("Database connection error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setConnectionString("");
    setTestResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Database" size={24} />
            Подключить внешнюю базу данных
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium">Внешняя PostgreSQL база данных TimeWeb Cloud с полной SSL верификацией</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Вставьте строку подключения в формате:<br />
                  <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mt-1 inline-block">
                    postgresql://user:password@host:port/database?sslmode=verify-full
                  </code>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="connection-string" className="text-base font-semibold">
              Строка подключения (EXTERNAL_DATABASE_URL)
            </Label>
            <Textarea
              id="connection-string"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://gen_user:Nikita230282@d83d798a9783891138...@localhost:5432/default_db?sslmode=verify-full"
              className="font-mono text-sm min-h-[120px] resize-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Строка подключения будет сохранена в секретах проекта
            </p>
          </div>

          {testResult && (
            <Card className={testResult.success ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon 
                    name={testResult.success ? "CheckCircle2" : "XCircle"} 
                    size={20} 
                    className={testResult.success ? "text-green-600" : "text-red-600"}
                  />
                  <h3 className="font-semibold">
                    {testResult.success ? "Подключение успешно!" : "Ошибка подключения"}
                  </h3>
                </div>
                {testResult.success ? (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">База данных:</span>
                        <p className="font-mono font-medium">{testResult.connection.database}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Пользователь:</span>
                        <p className="font-mono font-medium">{testResult.connection.user}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Версия PostgreSQL:</span>
                      <p className="text-xs font-mono mt-1">{testResult.connection.version}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Таблицы: {testResult.tablesCount}</span>
                      {testResult.tables.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          {testResult.tables.slice(0, 10).map((table: any, idx: number) => (
                            <div key={idx} className="text-xs font-mono text-muted-foreground">
                              {table.schema}.{table.name}
                            </div>
                          ))}
                          {testResult.tables.length > 10 && (
                            <p className="text-xs text-muted-foreground mt-1">...и еще {testResult.tables.length - 10}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-mono text-xs">{testResult.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={testConnection}
              disabled={isTesting || isSaving || !connectionString.trim()}
              variant="outline"
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Тестирование...
                </>
              ) : (
                <>
                  <Icon name="TestTube2" size={16} className="mr-2" />
                  Проверить подключение
                </>
              )}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isTesting || !connectionString.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Database" size={16} className="mr-2" />
                  Сохранить
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSaving || isTesting}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};