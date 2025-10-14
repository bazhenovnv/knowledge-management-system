import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import NotificationItem from './NotificationItem';

export interface Notification {
  id: number;
  employee_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment';
  priority: 'low' | 'normal' | 'high' | 'urgent';
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

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=get_notifications&employee_id=${employeeId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const data = await response.json();
      if (data.data) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Ошибка загрузки уведомлений');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=mark_read',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notification_id: notificationId })
        }
      );
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        onNotificationsRead?.();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=mark_all_read',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employee_id: employeeId })
        }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        onNotificationsRead?.();
        toast.success('Все уведомления отмечены как прочитанные');
      }
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
