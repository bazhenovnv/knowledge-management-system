import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import NotificationList from './NotificationList';
import { database } from '@/utils/database';

interface NotificationBellProps {
  employeeId: number;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ employeeId, className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, [employeeId]);

  const loadUnreadCount = () => {
    try {
      // Получаем непрочитанные уведомления из локальной БД
      const unreadNotifications = database.getUnreadNotificationsForUser(employeeId);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleNotificationsRead = () => {
    // Перезагружаем счётчик после чтения уведомлений
    loadUnreadCount();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <NotificationList 
          employeeId={employeeId} 
          onNotificationsRead={handleNotificationsRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;