import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function LimitExceeded() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={40} className="text-red-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Достигнут лимит вызовов функций
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Ошибка 402: Payment Required
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-2">Что происходит?</p>
                <p>
                  Платформа Poehali.dev ограничивает количество вызовов облачных функций. 
                  Вы исчерпали бесплатный лимит запросов к встроенной базе данных.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="CheckCircle2" size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-2">У вас есть решение!</p>
                <p>
                  Вы уже подключили собственную базу данных TimeWeb Cloud. 
                  Перенесите данные в свою БД, чтобы работать без лимитов платформы.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Что делать дальше:</h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Перенесите данные в TimeWeb Cloud</p>
                  <p className="text-sm text-gray-600">
                    Миграция скопирует все 26 таблиц в вашу собственную базу данных
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Работайте без ограничений</p>
                  <p className="text-sm text-gray-600">
                    После миграции приложение будет использовать вашу БД напрямую
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={() => navigate('/migrate-db')}
              className="w-full"
              size="lg"
            >
              <Icon name="Database" size={20} className="mr-2" />
              Перенести данные в TimeWeb Cloud
            </Button>

            <Button 
              onClick={() => navigate('/db-status')}
              variant="outline"
              className="w-full"
            >
              <Icon name="Activity" size={20} className="mr-2" />
              Проверить статус подключения к БД
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              После миграции все запросы будут идти напрямую в вашу базу TimeWeb Cloud
            </p>
            <p className="text-xs text-gray-400 mt-1">
              d83d798a97838911384dbba2.twc1.net:5432/default_db
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
