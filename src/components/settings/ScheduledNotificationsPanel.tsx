import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { scheduledNotifications } from '@/utils/scheduledNotifications';
import { toast } from 'sonner';

interface ScheduledNotificationsPanelProps {
  employeeId: number;
}

export default function ScheduledNotificationsPanel({ employeeId }: ScheduledNotificationsPanelProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('10');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [channels, setChannels] = useState<('database' | 'push' | 'email')[]>(['database', 'push']);
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSchedule = async () => {
    if (!title || !message) {
      toast.error('Заполните все поля');
      return;
    }

    setIsScheduling(true);
    
    const result = await scheduledNotifications.scheduleInMinutes(parseInt(delayMinutes), {
      employeeId,
      type: notificationType,
      title,
      message,
      channels
    });

    setIsScheduling(false);

    if (result.success) {
      toast.success(`Уведомление запланировано через ${delayMinutes} минут`);
      setTitle('');
      setMessage('');
    } else {
      toast.error('Ошибка планирования уведомления');
    }
  };

  const toggleChannel = (channel: 'database' | 'push' | 'email') => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const quickScheduleExamples = [
    {
      label: 'Напоминание через 5 минут',
      minutes: 5,
      title: 'Напоминание',
      message: 'Это тестовое напоминание',
      type: 'info' as const
    },
    {
      label: 'Важное через час',
      minutes: 60,
      title: 'Важное уведомление',
      message: 'Не забудьте проверить задачи',
      type: 'warning' as const
    },
    {
      label: 'Завтра в это время',
      minutes: 1440,
      title: 'Ежедневное напоминание',
      message: 'Проверьте прогресс по проектам',
      type: 'info' as const
    }
  ];

  const handleQuickSchedule = async (example: typeof quickScheduleExamples[0]) => {
    setIsScheduling(true);
    
    const result = await scheduledNotifications.scheduleInMinutes(example.minutes, {
      employeeId,
      type: example.type,
      title: example.title,
      message: example.message,
      channels: ['database', 'push']
    });

    setIsScheduling(false);

    if (result.success) {
      toast.success(`Уведомление запланировано через ${example.minutes} минут`);
    } else {
      toast.error('Ошибка планирования');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Clock" size={20} />
            Отложенные уведомления
          </CardTitle>
          <CardDescription>
            Запланируйте уведомление на будущее время
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Заголовок</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Напоминание о встрече"
            />
          </div>

          <div>
            <Label>Сообщение</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Встреча начнется через 15 минут"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Через сколько минут</Label>
              <Input
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                min="1"
                placeholder="10"
              />
            </div>

            <div>
              <Label>Тип уведомления</Label>
              <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Информация</SelectItem>
                  <SelectItem value="success">Успех</SelectItem>
                  <SelectItem value="warning">Предупреждение</SelectItem>
                  <SelectItem value="error">Ошибка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Каналы отправки</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={channels.includes('database') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleChannel('database')}
              >
                <Icon name="Database" size={16} className="mr-2" />
                БД
              </Button>
              <Button
                type="button"
                variant={channels.includes('push') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleChannel('push')}
              >
                <Icon name="Bell" size={16} className="mr-2" />
                Push
              </Button>
              <Button
                type="button"
                variant={channels.includes('email') ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleChannel('email')}
              >
                <Icon name="Mail" size={16} className="mr-2" />
                Email
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={isScheduling}
            className="w-full"
          >
            {isScheduling ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Планирование...
              </>
            ) : (
              <>
                <Icon name="Clock" size={16} className="mr-2" />
                Запланировать уведомление
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Zap" size={20} />
            Быстрое планирование
          </CardTitle>
          <CardDescription>
            Готовые шаблоны для быстрого создания
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickScheduleExamples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickSchedule(example)}
              disabled={isScheduling}
            >
              <Icon name="Clock" size={16} className="mr-2" />
              <div className="text-left">
                <div className="font-medium">{example.label}</div>
                <div className="text-xs text-gray-500">{example.title}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
