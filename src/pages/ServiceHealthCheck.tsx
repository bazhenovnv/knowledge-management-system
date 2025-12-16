import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import funcUrls from "../../backend/func2url.json";

interface ServiceStatus {
  name: string;
  status: 'checking' | 'success' | 'error';
  message?: string;
  details?: any;
}

export default function ServiceHealthCheck() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkServices = async () => {
    setIsChecking(true);
    const serviceList: ServiceStatus[] = [
      { name: 'Внешняя БД (TimeWeb Cloud)', status: 'checking' },
      { name: 'Авторизация', status: 'checking' },
      { name: 'База данных (внутренняя)', status: 'checking' },
      { name: 'Материалы знаний', status: 'checking' },
      { name: 'Управление доменами', status: 'checking' },
    ];
    setServices(serviceList);

    const updatedServices: ServiceStatus[] = [];

    try {
      const testUrl = funcUrls["test-db-connection"] || funcUrls["external-db"];
      const externalDbResponse = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: 'EXTERNAL_DATABASE_URL' })
      });
      const externalDbData = await externalDbResponse.json();
      
      updatedServices.push({
        name: 'Внешняя БД (TimeWeb Cloud)',
        status: externalDbData.success ? 'success' : 'error',
        message: externalDbData.success 
          ? `${externalDbData.connection.database} (${externalDbData.tablesCount} таблиц)`
          : externalDbData.error,
        details: externalDbData
      });
    } catch (error) {
      updatedServices.push({
        name: 'Внешняя БД (TimeWeb Cloud)',
        status: 'error',
        message: String(error)
      });
    }

    try {
      const authResponse = await fetch(funcUrls["auth"], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: 'admin@ab-onlinekassa.ru',
          password: 'admin123'
        })
      });
      const authData = await authResponse.json();
      
      updatedServices.push({
        name: 'Авторизация',
        status: authData.token ? 'success' : 'error',
        message: authData.token ? 'Вход успешен' : authData.error,
        details: authData
      });
    } catch (error) {
      updatedServices.push({
        name: 'Авторизация',
        status: 'error',
        message: String(error)
      });
    }

    try {
      const dbUrl = funcUrls["external-db"];
      const dbResponse = await fetch(dbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_employees'
        })
      });
      const dbData = await dbResponse.json();
      
      updatedServices.push({
        name: 'База данных (внутренняя)',
        status: dbData.employees ? 'success' : 'error',
        message: dbData.employees ? `${dbData.employees.length} сотрудников` : dbData.error,
        details: dbData
      });
    } catch (error) {
      updatedServices.push({
        name: 'База данных (внутренняя)',
        status: 'error',
        message: String(error)
      });
    }

    try {
      const materialsUrl = funcUrls["knowledge-materials"] || funcUrls["external-db"];
      const materialsResponse = await fetch(materialsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list'
        })
      });
      const materialsData = await materialsResponse.json();
      
      updatedServices.push({
        name: 'Материалы знаний',
        status: materialsData.materials ? 'success' : 'error',
        message: materialsData.materials ? `${materialsData.materials.length} материалов` : materialsData.error,
        details: materialsData
      });
    } catch (error) {
      updatedServices.push({
        name: 'Материалы знаний',
        status: 'error',
        message: String(error)
      });
    }

    try {
      const domainUrl = funcUrls["domain"] || funcUrls["external-db"];
      const domainResponse = await fetch(domainUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list'
        })
      });
      const domainData = await domainResponse.json();
      
      updatedServices.push({
        name: 'Управление доменами',
        status: domainData.domains ? 'success' : 'error',
        message: domainData.domains ? `${domainData.domains.length} доменов` : domainData.error,
        details: domainData
      });
    } catch (error) {
      updatedServices.push({
        name: 'Управление доменами',
        status: 'error',
        message: String(error)
      });
    }

    setServices(updatedServices);
    setIsChecking(false);

    const allSuccess = updatedServices.every(s => s.status === 'success');
    if (allSuccess) {
      toast.success("Все сервисы работают нормально!");
    } else {
      toast.error("Некоторые сервисы недоступны");
    }
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Icon name="CheckCircle2" size={20} className="text-green-600" />;
      case 'error':
        return <Icon name="XCircle" size={20} className="text-red-600" />;
      default:
        return <Icon name="Loader2" size={20} className="text-blue-600 animate-spin" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/migrate-db')}
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={24} />
                Проверка работы сервисов
              </CardTitle>
              <Button onClick={checkServices} disabled={isChecking} variant="outline">
                <Icon name={isChecking ? "Loader2" : "RefreshCw"} size={16} className={isChecking ? "animate-spin mr-2" : "mr-2"} />
                Обновить
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {services.map((service, idx) => (
              <Card key={idx} className={`border ${getStatusBg(service.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(service.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.message && (
                        <p className={`text-sm mt-1 ${service.status === 'error' ? 'text-red-700 dark:text-red-300' : 'text-muted-foreground'}`}>
                          {service.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Loader2" size={32} className="mx-auto mb-4 animate-spin" />
                <p>Проверка сервисов...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Тестовые учетные записи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="font-semibold text-sm">Администратор</p>
                <code className="text-xs">admin@ab-onlinekassa.ru / admin123</code>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="font-semibold text-sm">Преподаватель</p>
                <code className="text-xs">teacher@ab-onlinekassa.ru / teacher123</code>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="font-semibold text-sm">Сотрудник</p>
                <code className="text-xs">employee@ab-onlinekassa.ru / employee123</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}