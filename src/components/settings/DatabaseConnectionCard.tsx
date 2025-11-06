import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Icon from "@/components/ui/icon";

interface DatabaseConnectionCardProps {
  connectionStatus: 'checking' | 'connected' | 'disconnected' | null;
  isCheckingConnection: boolean;
  dbStats: { totalTables: number; totalRecords: number } | null;
  onCheckConnection: () => void;
}

export default function DatabaseConnectionCard({
  connectionStatus,
  isCheckingConnection,
  dbStats,
  onCheckConnection
}: DatabaseConnectionCardProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Icon name="Cloud" size={20} className="mr-2 text-blue-600" />
          Подключение к базе данных TimeWeb Cloud
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            connectionStatus === 'connected' ? 'bg-green-100' :
            connectionStatus === 'checking' ? 'bg-yellow-100' :
            connectionStatus === 'disconnected' ? 'bg-red-100' :
            'bg-gray-100'
          }`}>
            {connectionStatus === 'connected' && <Icon name="CheckCircle2" size={20} className="text-green-600" />}
            {connectionStatus === 'checking' && <Icon name="Loader2" size={20} className="text-yellow-600 animate-spin" />}
            {connectionStatus === 'disconnected' && <Icon name="XCircle" size={20} className="text-red-600" />}
            {!connectionStatus && <Icon name="Database" size={20} className="text-gray-600" />}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Статус подключения</h4>
            <p className="text-sm text-gray-700 mb-2">
              {connectionStatus === 'connected' && 'Приложение подключено к внешней базе данных TimeWeb Cloud через функцию '}
              {connectionStatus === 'checking' && 'Проверяем подключение к базе данных TimeWeb Cloud...'}
              {connectionStatus === 'disconnected' && 'Не удалось подключиться к базе данных TimeWeb Cloud'}
              {!connectionStatus && 'Ожидание проверки подключения'}
              {connectionStatus === 'connected' && <code className="px-1.5 py-0.5 bg-white rounded text-xs">external-db</code>}
            </p>
            {dbStats && connectionStatus === 'connected' && (
              <div className="flex gap-4 text-xs text-gray-600">
                <span>📊 Таблиц: <strong>{dbStats.totalTables}</strong></span>
                <span>📝 Записей: <strong>{dbStats.totalRecords}</strong></span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={onCheckConnection}
              disabled={isCheckingConnection}
            >
              {isCheckingConnection ? (
                <><Icon name="Loader2" size={14} className="mr-1 animate-spin" /> Проверка...</>
              ) : (
                <><Icon name="RefreshCw" size={14} className="mr-1" /> Проверить соединение</>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Icon name="Database" size={18} className="mr-2 text-blue-600" />
            Используемые таблицы
          </h4>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">employees</span>
              <span className="text-gray-600">— данные сотрудников</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">tests</span>
              <span className="text-gray-600">— тесты и задания</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">test_results</span>
              <span className="text-gray-600">— результаты тестирования</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">materials</span>
              <span className="text-gray-600">— обучающие материалы</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">notifications</span>
              <span className="text-gray-600">— уведомления системы</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">assignments</span>
              <span className="text-gray-600">— назначенные задачи</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Table" size={14} className="text-gray-500" />
              <span className="font-mono text-xs bg-white px-2 py-1 rounded">subsection_content</span>
              <span className="text-gray-600">— контент разделов</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon name="Zap" size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">Преимущества</h4>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Данные хранятся надёжно в облаке TimeWeb</li>
              <li>Нет ограничений локального хранилища браузера</li>
              <li>Доступ к данным из любого устройства</li>
              <li>Автоматическое резервное копирование</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
