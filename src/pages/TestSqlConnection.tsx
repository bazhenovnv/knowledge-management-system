import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const TestSqlConnection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://functions.poehali.dev/76973564-4ea6-4a98-9582-8f19bc9a6bb6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'SELECT @@VERSION as version, DB_NAME() as database_name, GETDATE() as current_time'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast({
          title: 'Подключение успешно!',
          description: 'SQL Server подключен и работает',
        });
      } else {
        setResult(data);
        toast({
          title: 'Ошибка подключения',
          description: data.error || 'Не удалось подключиться к SQL Server',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setResult({ error: error.message });
      toast({
        title: 'Ошибка запроса',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Тест подключения SQL Server
          </h1>
          <p className="text-gray-600">Проверка подключения к базе данных через XTunnel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" size={24} />
              Проверка подключения
            </CardTitle>
            <CardDescription>
              Нажмите кнопку для тестирования подключения к SQL Server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Подключение...
                </>
              ) : (
                <>
                  <Icon name="Play" size={20} className="mr-2" />
                  Тестировать подключение
                </>
              )}
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {result.error ? (
                    <Icon name="XCircle" size={20} className="text-red-500" />
                  ) : (
                    <Icon name="CheckCircle" size={20} className="text-green-500" />
                  )}
                  Результат:
                </h3>
                <pre className="text-sm overflow-auto max-h-96 bg-white p-3 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация о подключении
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p><strong>Сервер:</strong> xtunnel.ru:19379</p>
            <p><strong>База данных:</strong> master</p>
            <p><strong>Пользователь:</strong> cloud_user</p>
            <p><strong>Тестовый запрос:</strong> SELECT @@VERSION, DB_NAME(), GETDATE()</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestSqlConnection;
