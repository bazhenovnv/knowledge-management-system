import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { NotificationData } from './notificationFormTypes';

interface NotificationBasicInfoProps {
  formData: NotificationData;
  setFormData: React.Dispatch<React.SetStateAction<NotificationData>>;
}

const NotificationBasicInfo: React.FC<NotificationBasicInfoProps> = ({
  formData,
  setFormData
}) => {
  // Получение цвета приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-2">
        <Label htmlFor="title">Заголовок уведомления *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Введите заголовок уведомления..."
          required
        />
      </div>

      {/* Сообщение */}
      <div className="space-y-2">
        <Label htmlFor="message">Текст уведомления *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Введите текст уведомления..."
          rows={4}
          required
        />
      </div>

      {/* Приоритет и тип */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Приоритет</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: 'low' | 'medium' | 'high') => 
              setFormData(prev => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor('low')}`}></div>
                  <span>Низкий</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor('medium')}`}></div>
                  <span>Средний</span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor('high')}`}></div>
                  <span>Высокий</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Тип уведомления</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'info' | 'warning' | 'urgent' | 'reminder') => 
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">
                <div className="flex items-center space-x-2">
                  <Icon name="Info" size={16} />
                  <span>Информация</span>
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertTriangle" size={16} />
                  <span>Предупреждение</span>
                </div>
              </SelectItem>
              <SelectItem value="urgent">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} />
                  <span>Срочно</span>
                </div>
              </SelectItem>
              <SelectItem value="reminder">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={16} />
                  <span>Напоминание</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Отложенная отправка */}
      <div className="space-y-2">
        <Label htmlFor="scheduledFor">Отложенная отправка (необязательно)</Label>
        <Input
          id="scheduledFor"
          type="datetime-local"
          value={formData.scheduledFor}
          onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>
    </div>
  );
};

export default NotificationBasicInfo;