import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ExternalDatabaseModal } from "@/components/database/ExternalDatabaseModal";
import { toast } from "sonner";

export default function ExternalDatabaseTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedConnections, setSavedConnections] = useState<string[]>([]);

  const handleSaveConnection = async (connectionString: string) => {
    // Симуляция сохранения в секреты
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Маскируем строку подключения для отображения
    const masked = connectionString.replace(
      /(postgresql:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1***$3'
    );
    
    setSavedConnections(prev => [...prev, masked]);
    
    // Здесь должен быть реальный вызов API для сохранения в секреты
    console.log("Saved connection string:", connectionString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={24} />
              Тест подключения внешней базы данных
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Эта страница демонстрирует форму подключения внешней PostgreSQL базы данных TimeWeb Cloud
            </p>

            <Button onClick={() => setIsModalOpen(true)} size="lg" className="w-full">
              <Icon name="Plus" size={20} className="mr-2" />
              Подключить внешнюю базу данных
            </Button>

            {savedConnections.length > 0 && (
              <div className="space-y-2 mt-6">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Подключенные базы данных:
                </h3>
                {savedConnections.map((conn, idx) => (
                  <Card key={idx} className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">
                            База данных подключена
                          </p>
                          <code className="text-xs text-green-700 dark:text-green-300 block mt-1 break-all">
                            {conn}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Пример строки подключения</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
              <code className="text-xs break-all">
                postgresql://gen_user:Nikita230282@d83d798a9783891138...@localhost:5432/default_db?sslmode=verify-full
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              Формат: <code className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                postgresql://username:password@host:port/database?sslmode=verify-full
              </code>
            </p>
          </CardContent>
        </Card>
      </div>

      <ExternalDatabaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveConnection}
      />
    </div>
  );
}
