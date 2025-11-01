import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ServiceStatus {
  name: string;
  status: 'checking' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function ExternalDbStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Авторизация сотрудников', status: 'checking' },
    { name: 'База знаний', status: 'checking' },
    { name: 'Управление доменами', status: 'checking' },
    { name: 'Подключение к БД', status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkServices = async () => {
    setIsChecking(true);
    const newServices: ServiceStatus[] = [...services];

    // Проверка авторизации
    try {
      const authRes = await fetch('/api/auth?action=check', {
        method: 'GET',
        headers: { 'X-Auth-Token': 'test-token' }
      });
      const authData = await authRes.json();
      
      newServices[0] = {
        name: 'Авторизация сотрудников',
        status: authRes.ok ? 'success' : 'error',
        message: authRes.ok ? 'Работает на внешней БД' : authData.error,
        details: authData
      };
    } catch (err) {
      newServices[0] = {
        name: 'Авторизация сотрудников',
        status: 'error',
        message: err instanceof Error ? err.message : 'Ошибка подключения'
      };
    }
    setServices([...newServices]);

    // Проверка базы знаний
    try {
      const materialsRes = await fetch('/api/knowledge-materials?action=list');
      const materialsData = await materialsRes.json();
      
      newServices[1] = {
        name: 'База знаний',
        status: materialsRes.ok ? 'success' : 'error',
        message: materialsRes.ok 
          ? `Найдено ${materialsData.materials?.length || 0} материалов` 
          : materialsData.error,
        details: materialsData
      };
    } catch (err) {
      newServices[1] = {
        name: 'База знаний',
        status: 'error',
        message: err instanceof Error ? err.message : 'Ошибка подключения'
      };
    }
    setServices([...newServices]);

    // Проверка доменов
    try {
      const domainRes = await fetch('/api/domain');
      const domainData = await domainRes.json();
      
      newServices[2] = {
        name: 'Управление доменами',
        status: domainRes.ok ? 'success' : 'error',
        message: domainRes.ok 
          ? domainData.domain ? `Домен: ${domainData.domain}` : 'Домен не подключен'
          : domainData.error,
        details: domainData
      };
    } catch (err) {
      newServices[2] = {
        name: 'Управление доменами',
        status: 'error',
        message: err instanceof Error ? err.message : 'Ошибка подключения'
      };
    }
    setServices([...newServices]);

    // Проверка прямого подключения к БД
    try {
      const dbRes = await fetch('/api/database?action=stats');
      const dbData = await dbRes.json();
      
      newServices[3] = {
        name: 'Подключение к БД',
        status: dbRes.ok ? 'success' : 'error',
        message: dbRes.ok 
          ? `Таблиц: ${dbData.stats?.totalTables || 0}, Записей: ${dbData.stats?.totalRecords || 0}`
          : dbData.error,
        details: dbData
      };
    } catch (err) {
      newServices[3] = {
        name: 'Подключение к БД',
        status: 'error',
        message: err instanceof Error ? err.message : 'Ошибка подключения'
      };
    }
    setServices([...newServices]);
    setIsChecking(false);
  };

  useEffect(() => {
    checkServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Статус внешней БД TimeWeb Cloud
          </h1>
          <p className="text-gray-600">
            Проверка подключения к вашей PostgreSQL базе данных
          </p>
          <p className="text-sm text-gray-500 mt-2 font-mono">
            d83d798a97838911384dbba2.twc1.net:5432/default_db
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Статус сервисов</span>
              <Button 
                onClick={checkServices} 
                disabled={isChecking}
                size="sm"
              >
                {isChecking ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Проверяем...
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Перепроверить
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
                >
                  <div className="mt-1">
                    {service.status === 'checking' && (
                      <Icon name="Loader2" size={20} className="text-blue-500 animate-spin" />
                    )}
                    {service.status === 'success' && (
                      <Icon name="CheckCircle2" size={20} className="text-green-500" />
                    )}
                    {service.status === 'error' && (
                      <Icon name="XCircle" size={20} className="text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {service.message && (
                      <p className={`text-sm mt-1 ${
                        service.status === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {service.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация о подключении
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Хост:</span>
                <span className="font-mono">d83d798a97838911384dbba2.twc1.net</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Порт:</span>
                <span className="font-mono">5432</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">База данных:</span>
                <span className="font-mono">default_db</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Пользователь:</span>
                <span className="font-mono">gen_user</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">SSL режим:</span>
                <span className="font-mono text-green-600">verify-full ✓</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Провайдер:</span>
                <span className="font-semibold">TimeWeb Cloud</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Все функции работают с вашей внешней БД без лимитов платформы</p>
        </div>
      </div>
    </div>
  );
}
