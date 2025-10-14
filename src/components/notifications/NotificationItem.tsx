import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Notification } from './NotificationList';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: number | string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { name: 'CheckCircle2', className: 'text-green-500' };
      case 'warning':
      case 'urgent':
        return { name: 'AlertTriangle', className: 'text-yellow-500' };
      case 'error':
        return { name: 'XCircle', className: 'text-red-500' };
      case 'assignment':
        return { name: 'ClipboardList', className: 'text-blue-500' };
      case 'reminder':
        return { name: 'Bell', className: 'text-purple-500' };
      default:
        return { name: 'Info', className: 'text-blue-500' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500';
      case 'high':
        return 'border-l-4 border-l-orange-500';
      case 'low':
        return 'border-l-4 border-l-gray-300';
      default:
        return '';
    }
  };

  const icon = getTypeIcon(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ru,
  });

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      className={cn(
        'p-4 hover:bg-accent/50 transition-colors cursor-pointer',
        !notification.is_read && 'bg-accent/30',
        getPriorityColor(notification.priority)
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          <Icon name={icon.name} size={20} className={icon.className} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn(
              'text-sm font-medium',
              !notification.is_read && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Clock" size={12} />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;