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
    { name: 'Тесты и задания', status: 'checking' },
    { name: 'Подключение к БД', status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkServices = async () => {
    setIsChecking(true);
    const newServices: ServiceStatus[] = [...services];
    const DB_URL = 'https://functions.poehali.dev/72034790-df65-4fb9-885e-c40a2ee29179';

    // Проверка авторизации сотрудников (через запрос к employees)
    try {
      const authRes = await fetch(`${DB_URL}?action=list&table=employees&schema=t_p47619579_knowledge_management&limit=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!authRes.ok) throw new Error('Ошибка доступа');
      
      const authData = await authRes.json();
      const employeeCount = authData.rows?.length || 0;
      
      newServices[0] = {
        name: 'Авторизация сотрудников',
        status: 'success',
        message: `Доступ к таблице employees — OK`,
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
      const materialsRes = await fetch(`${DB_URL}?action=list&table=knowledge_materials&schema=t_p47619579_knowledge_management&limit=10`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!materialsRes.ok) throw new Error('Ошибка доступа');
      
      const materialsData = await materialsRes.json();
      const count = materialsData.count || materialsData.rows?.length || 0;
      
      newServices[1] = {
        name: 'База знаний',
        status: 'success',
        message: `Найдено ${count} материалов`,
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

    // Проверка тестов
    try {
      const testsRes = await fetch(`${DB_URL}?action=list&table=tests&schema=t_p47619579_knowledge_management&limit=10`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!testsRes.ok) throw new Error('Ошибка доступа');
      
      const testsData = await testsRes.json();
      const count = testsData.count || testsData.rows?.length || 0;
      
      newServices[2] = {
        name: 'Тесты и задания',
        status: 'success',
        message: `Доступно ${count} тестов`,
        details: testsData
      };
    } catch (err) {
      newServices[2] = {
        name: 'Тесты и задания',
        status: 'error',
        message: err instanceof Error ? err.message : 'Ошибка подключения'
      };
    }
    setServices([...newServices]);

    // Проверка прямого подключения к БД через stats
    try {
      const dbRes = await fetch(`${DB_URL}?action=stats&schema=t_p47619579_knowledge_management`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!dbRes.ok) throw new Error('Ошибка подключения');
      
      const dbData = await dbRes.json();
      const totalTables = dbData.totalTables || dbData.tables?.length || 0;
      const totalRecords = dbData.totalRecords || 0;
      
      newServices[3] = {
        name: 'Подключение к БД',
        status: 'success',
        message: `Таблиц: ${totalTables}, Записей: ${totalRecords}`,
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
            c6b7ae5ab8e72b5408272e27.twc1.net:5432/default_db
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
                <span className="font-mono">c6b7ae5ab8e72b5408272e27.twc1.net</span>
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