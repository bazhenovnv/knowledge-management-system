import { useState, useEffect } from "react";
import { notificationsService } from "@/utils/notificationsService";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  isRead: boolean;
  category: "test" | "course" | "system" | "achievement";
  actionUrl?: string;
  actionText?: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Получаем employeeId из localStorage
      const employeeData = localStorage.getItem('employee_data');
      const employee = employeeData ? JSON.parse(employeeData) : null;
      
      if (!employee?.id) {
        console.warn('No employee ID found, using empty notifications');
        setNotifications([]);
        return;
      }
      
      const data = await notificationsService.getNotifications(employee.id);
      
      // Проверяем что data это массив или объект с data
      const notificationsArray = Array.isArray(data) ? data : (data?.data || []);
      
      setNotifications(notificationsArray.map((n: any) => ({
        id: n.id.toString(),
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        timestamp: new Date(n.created_at),
        isRead: n.is_read || false,
        category: n.category || 'system',
        actionUrl: n.action_url,
        actionText: n.action_text,
      })));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(parseInt(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => notificationsService.markAsRead(parseInt(n.id)))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(parseInt(id));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    try {
      await Promise.all(
        notifications.map(n => notificationsService.deleteNotification(parseInt(n.id)))
      );
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const addNotification = async (
    notification: Omit<Notification, "id" | "timestamp">,
  ) => {
    try {
      const employeeData = localStorage.getItem('employee_data');
      const employee = employeeData ? JSON.parse(employeeData) : null;
      
      if (!employee) {
        console.error('No employee data found');
        return;
      }

      const newNotification = await notificationsService.createNotification({
        employee_id: employee.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        action_url: notification.actionUrl,
        action_text: notification.actionText,
      });

      await loadNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const getNotificationsByCategory = (category: string) => {
    return notifications.filter((n) => n.category === category);
  };

  const getRecentNotifications = (limit: number = 5) => {
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    getNotificationsByCategory,
    getRecentNotifications,
    loadNotifications,
  };
};