import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import NotificationItem from './NotificationItem';
import { database } from '@/utils/database';

export interface Notification {
  id: string | number;
  employee_id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'reminder' | 'urgent';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'medium';
  is_read: boolean;
  link?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
}

interface NotificationListProps {
  employeeId: number;
  onNotificationsRead?: () => void;
}

type FilterType = 'all' | 'unread' | 'reminder' | 'assignment' | 'urgent';

const NotificationList: React.FC<NotificationListProps> = ({ 
  employeeId, 
  onNotificationsRead 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadNotifications();
  }, [employeeId]);

  const loadNotifications = () => {
    setIsLoading(true);
    try {
      // Получаем уведомления из локальной БД
      const dbNotifications = database.getNotificationsForUser(employeeId);
      
      // Преобразуем формат уведомлений для совместимости с компонентом
      const formattedNotifications: Notification[] = dbNotifications.map(n => ({
        id: n.id,
        employee_id: employeeId,
        title: n.title,
        message: n.message,
        type: n.type as any,
        priority: n.priority as any,
        is_read: n.readBy.includes(employeeId),
        created_at: n.createdAt.toISOString(),
      }));
      
      // Сортируем по дате (новые сначала)
      formattedNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Ошибка загрузки уведомлений');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = (notificationId: number | string) => {
    try {
      // Отмечаем как прочитанное в БД
      database.markNotificationAsRead(notificationId.toString(), employeeId);
      
      // Обновляем локальный стейт
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      onNotificationsRead?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = () => {
    try {
      notifications.forEach(n => {
        if (!n.is_read) {
          database.markNotificationAsRead(n.id.toString(), employeeId);
        }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onNotificationsRead?.();
      toast.success('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Ошибка при отметке уведомлений');
    }
  };

  const handleDeleteRead = () => {
    try {
      const deletedCount = database.deleteReadNotificationsForUser(employeeId);
      
      if (deletedCount > 0) {
        loadNotifications();
        onNotificationsRead?.();
        toast.success(`Удалено ${deletedCount} ${deletedCount === 1 ? 'уведомление' : deletedCount < 5 ? 'уведомления' : 'уведомлений'}`);
      } else {
        toast.info('Нет прочитанных уведомлений для удаления');
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('Ошибка при удалении уведомлений');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const readCount = notifications.filter(n => n.is_read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.is_read;
    return notification.type === filter;
  });

  const getFilterLabel = (filterType: FilterType) => {
    const counts = {
      all: notifications.length,
      unread: unreadCount,
      reminder: notifications.filter(n => n.type === 'reminder').length,
      assignment: notifications.filter(n => n.type === 'assignment').length,
      urgent: notifications.filter(n => n.type === 'urgent' || n.priority === 'urgent').length,
    };
    return counts[filterType];
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Уведомления</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} непрочитанных
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <Icon name="CheckCheck" size={14} className="mr-1" />
              Отметить все
            </Button>
          )}
          {readCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteRead}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить прочитанные
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs h-7 px-2 flex-shrink-0"
        >
          Все ({getFilterLabel('all')})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
          className="text-xs h-7 px-2 flex-shrink-0"
        >
          <Icon name="Circle" size={10} className="mr-1 fill-current" />
          Непрочитанные ({getFilterLabel('unread')})
        </Button>
        <Button
          variant={filter === 'reminder' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('reminder')}
          className="text-xs h-7 px-2 flex-shrink-0"
        >
          <Icon name="Bell" size={12} className="mr-1" />
          Напоминания ({getFilterLabel('reminder')})
        </Button>
        <Button
          variant={filter === 'assignment' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('assignment')}
          className="text-xs h-7 px-2 flex-shrink-0"
        >
          <Icon name="ClipboardList" size={12} className="mr-1" />
          Задания ({getFilterLabel('assignment')})
        </Button>
        <Button
          variant={filter === 'urgent' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('urgent')}
          className="text-xs h-7 px-2 flex-shrink-0"
        >
          <Icon name="AlertTriangle" size={12} className="mr-1" />
          Срочные ({getFilterLabel('urgent')})
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Icon name="Bell" size={48} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ? 'Нет уведомлений' : `Нет уведомлений в категории "${
                filter === 'unread' ? 'Непрочитанные' :
                filter === 'reminder' ? 'Напоминания' :
                filter === 'assignment' ? 'Задания' :
                filter === 'urgent' ? 'Срочные' : ''
              }"`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationList;