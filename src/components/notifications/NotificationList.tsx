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

const NotificationList: React.FC<NotificationListProps> = ({ 
  employeeId, 
  onNotificationsRead 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Отмечаем все уведомления как прочитанные
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Icon name="Bell" size={48} className="text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Нет уведомлений</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
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