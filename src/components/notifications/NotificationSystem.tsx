import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipient: string;
  isRead: boolean;
  createdAt: Date;
  source: 'system' | 'manual' | 'task' | 'test';
}

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  taskNotifications: boolean;
  testNotifications: boolean;
  systemNotifications: boolean;
}

export const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Новое задание',
      message: 'Вам назначена новая задача: "Пройти курс по безопасности"',
      type: 'info',
      recipient: 'Иван Иванов',
      isRead: false,
      createdAt: new Date(2024, 7, 15, 10, 30),
      source: 'task',
    },
    {
      id: '2',
      title: 'Тест завершен',
      message: 'Вы успешно завершили тест "Основы безопасности"',
      type: 'success',
      recipient: 'Мария Петрова',
      isRead: true,
      createdAt: new Date(2024, 7, 14, 14, 20),
      source: 'test',
    },
    {
      id: '3',
      title: 'Срок выполнения',
      message: 'Приближается срок выполнения задачи "Подготовить отчет"',
      type: 'warning',
      recipient: 'Мария Петрова',
      isRead: false,
      createdAt: new Date(2024, 7, 13, 9, 15),
      source: 'system',
    },
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: true,
    taskNotifications: true,
    testNotifications: true,
    systemNotifications: true,
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipient: '',
  });

  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [filter, setFilter] = useState('all');

  const employees = [
    'Иван Иванов',
    'Мария Петрова',
    'Алексей Сидоров',
    'Елена Кузнецова',
    'Все сотрудники',
  ];

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  const handleCreateNotification = () => {
    if (newNotification.title && newNotification.message && newNotification.recipient) {
      const notification: Notification = {
        id: Date.now().toString(),
        ...newNotification,
        isRead: false,
        createdAt: new Date(),
        source: 'manual',
      };
      
      setNotifications([notification, ...notifications]);
      setNewNotification({ title: '', message: '', type: 'info', recipient: '' });
      setIsCreatingNotification(false);
    }
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'Информация';
      case 'success': return 'Успех';
      case 'warning': return 'Предупреждение';
      case 'error': return 'Ошибка';
      default: return type;
    }
  };

  const getSourceText = (source: Notification['source']) => {
    switch (source) {
      case 'system': return 'Система';
      case 'manual': return 'Ручная';
      case 'task': return 'Задача';
      case 'test': return 'Тест';
      default: return source;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Уведомления</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount} новых
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <Icon name="Check" size={16} className="mr-2" />
            Отметить все как прочитанные
          </Button>
          <Dialog open={isCreatingNotification} onOpenChange={setIsCreatingNotification}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать уведомление
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Создать уведомление</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    placeholder="Введите заголовок уведомления"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Сообщение</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Введите текст уведомления"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Тип</Label>
                  <Select value={newNotification.type} onValueChange={(value: Notification['type']) => setNewNotification({...newNotification, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Информация</SelectItem>
                      <SelectItem value="success">Успех</SelectItem>
                      <SelectItem value="warning">Предупреждение</SelectItem>
                      <SelectItem value="error">Ошибка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Получатель</Label>
                  <Select value={newNotification.recipient} onValueChange={(value) => setNewNotification({...newNotification, recipient: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите получателя" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNotification} className="flex-1">
                    Отправить уведомление
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingNotification(false)} className="flex-1">
                    Отмена
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Фильтры</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="unread">Непрочитанные</SelectItem>
                    <SelectItem value="read">Прочитанные</SelectItem>
                    <SelectItem value="info">Информация</SelectItem>
                    <SelectItem value="success">Успех</SelectItem>
                    <SelectItem value="warning">Предупреждение</SelectItem>
                    <SelectItem value="error">Ошибка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Список уведомлений ({filteredNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Заголовок</TableHead>
                    <TableHead>Получатель</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id} className={!notification.isRead ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div className="flex items-center">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          )}
                          <span className="text-sm">
                            {notification.isRead ? 'Прочитано' : 'Новое'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-500 mt-1">{notification.message}</div>
                        </div>
                      </TableCell>
                      <TableCell>{notification.recipient}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeText(notification.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getSourceText(notification.source)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(notification.createdAt, "dd.MM.yyyy HH:mm", { locale: ru })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Icon name="Check" size={16} />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Каналы доставки</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email уведомления</Label>
                      <p className="text-sm text-gray-500">Получать уведомления на email</p>
                    </div>
                    <Switch
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('emailEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push уведомления</Label>
                      <p className="text-sm text-gray-500">Получать уведомления в браузере</p>
                    </div>
                    <Switch
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => handleSettingsChange('pushEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Типы уведомлений</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления о задачах</Label>
                      <p className="text-sm text-gray-500">Новые задачи и изменения статуса</p>
                    </div>
                    <Switch
                      checked={settings.taskNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('taskNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления о тестах</Label>
                      <p className="text-sm text-gray-500">Новые тесты и результаты</p>
                    </div>
                    <Switch
                      checked={settings.testNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('testNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Системные уведомления</Label>
                      <p className="text-sm text-gray-500">Системные сообщения и обновления</p>
                    </div>
                    <Switch
                      checked={settings.systemNotifications}
                      onCheckedChange={(checked) => handleSettingsChange('systemNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button>Сохранить настройки</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};