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
import { databaseService } from '@/utils/databaseService';

interface NotificationBellProps {
  employeeId: number;
  className?: string;
  isAdmin?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ employeeId, className, isAdmin = false }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [prevSupportCount, setPrevSupportCount] = useState(0);

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(900, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  useEffect(() => {
    loadUnreadCount();
    if (isAdmin) {
      loadSupportCount();
    }
  }, [employeeId, isAdmin]);

  const loadUnreadCount = () => {
    try {
      const unreadNotifications = database.getUnreadNotificationsForUser(employeeId);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const loadSupportCount = async () => {
    try {
      const result = await databaseService.getUnreadSupportCount();
      const newCount = result?.count || 0;
      
      if (newCount > prevSupportCount && prevSupportCount !== 0) {
        playNotificationSound();
      }
      
      setPrevSupportCount(newCount);
      setSupportCount(newCount);
    } catch (error) {
      console.error('Error loading support count:', error);
      setSupportCount(0);
    }
  };

  const handleNotificationsRead = () => {
    // Перезагружаем счётчик после чтения уведомлений
    loadUnreadCount();
  };

  const totalCount = unreadCount + (isAdmin ? supportCount : 0);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <Icon name="Bell" size={20} />
          {totalCount > 0 && (
            <Badge 
              variant="destructive" 
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs",
                isAdmin && supportCount > 0 && "animate-pulse"
              )}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {isAdmin && supportCount > 0 && (
          <div className="bg-red-50 border-b border-red-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <Icon name="MessageCircle" size={16} />
              <span className="text-sm font-medium">
                {supportCount} {supportCount === 1 ? 'новое обращение' : 'новых обращений'} в поддержку
              </span>
            </div>
            <Badge variant="destructive" className="animate-pulse">
              {supportCount}
            </Badge>
          </div>
        )}
        <NotificationList 
          employeeId={employeeId} 
          onNotificationsRead={handleNotificationsRead}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;