import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { Navigation } from '@/components/layout/Navigation';
import TaskList from '@/components/bitrix24/TaskList';
import ContactList from '@/components/bitrix24/ContactList';
import { bitrix24Service, Bitrix24Task, Bitrix24Contact } from '@/services/bitrix24';
import { Footer } from '@/components/layout/Footer';

export default function Bitrix24() {
  const [activeTab, setActiveTab] = useState('overview');
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedTask, setSelectedTask] = useState<Bitrix24Task | null>(null);
  const [selectedContact, setSelectedContact] = useState<Bitrix24Contact | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      const status = await bitrix24Service.checkConnection();
      setConnectionStatus(status);
      
      if (status.success) {
        toast({
          title: 'Успех',
          description: status.message,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Ошибка подключения',
          description: status.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setConnectionStatus({ success: false, message: errorMessage });
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Интеграция с Битрикс24</h1>
              <p className="text-gray-600">Управление задачами, контактами и сделками</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={checkConnection} variant="outline">
              <Icon name="Wifi" size={16} className="mr-2" />
              Проверить соединение
            </Button>
            
            {connectionStatus && (
              <Badge variant={connectionStatus.success ? 'default' : 'destructive'}>
                {connectionStatus.success ? 'Подключено' : 'Ошибка подключения'}
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="contacts">Контакты</TabsTrigger>
            <TabsTrigger value="deals">Сделки</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные задачи</CardTitle>
                  <Icon name="CheckSquare" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Загрузка данных...
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Контакты</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Загрузка данных...
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Открытые сделки</CardTitle>
                  <Icon name="TrendingUp" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Загрузка данных...
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Настройка интеграции</CardTitle>
                <CardDescription>
                  Информация о подключении к Битрикс24
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Globe" size={16} className="text-blue-500" />
                  <span className="text-sm font-medium">URL API:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    https://clientsupport.bitrix24.ru/rest/35/64kvj0rqh3l5ipwo/
                  </code>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Shield" size={16} className="text-green-500" />
                  <span className="text-sm">
                    Безопасное соединение через REST API
                  </span>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Возможности интеграции:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Просмотр и управление задачами</li>
                        <li>Работа с контактами и компаниями</li>
                        <li>Управление сделками и воронками</li>
                        <li>Синхронизация данных в реальном времени</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskList 
              refreshTrigger={refreshTrigger}
              onTaskSelect={setSelectedTask}
            />
            
            {selectedTask && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Детали задачи</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {selectedTask.ID}</p>
                    <p><strong>Название:</strong> {selectedTask.TITLE}</p>
                    {selectedTask.DESCRIPTION && (
                      <p><strong>Описание:</strong> {selectedTask.DESCRIPTION}</p>
                    )}
                    <p><strong>Статус:</strong> {selectedTask.STATUS}</p>
                    <p><strong>Приоритет:</strong> {selectedTask.PRIORITY}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts">
            <ContactList 
              refreshTrigger={refreshTrigger}
              onContactSelect={setSelectedContact}
            />
            
            {selectedContact && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Детали контакта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {selectedContact.ID}</p>
                    {selectedContact.NAME && (
                      <p><strong>Имя:</strong> {selectedContact.NAME}</p>
                    )}
                    {selectedContact.LAST_NAME && (
                      <p><strong>Фамилия:</strong> {selectedContact.LAST_NAME}</p>
                    )}
                    {selectedContact.COMPANY_TITLE && (
                      <p><strong>Компания:</strong> {selectedContact.COMPANY_TITLE}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon name="TrendingUp" size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Компонент для работы со сделками</p>
                  <p className="text-sm text-gray-500">В разработке...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}